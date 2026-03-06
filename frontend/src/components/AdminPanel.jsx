import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Download, Plus, Trash2, RefreshCw, LogOut, Settings, BarChart3, Lock, ChevronLeft, ChevronRight, MessageCircle, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { adminGetReservations, adminUpdateReservation, adminGetStats, adminUpdateConfig, adminAddBlackout, adminRemoveBlackout, adminGetBlackouts, adminExportCSV, adminCreateReservation, getWhatsAppStatus, resetWhatsApp, reconnectWhatsApp } from '../lib/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [blackouts, setBlackouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('reservations');
  
  const [newBlackout, setNewBlackout] = useState({ date: '', reason: '' });
  const [dailyCapacity, setDailyCapacity] = useState(30);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [newRes, setNewRes] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    guests: 2, reservation_date: format(new Date(), 'yyyy-MM-dd'),
    reservation_time: '19:00', observations: ''
  });
  const [creatingRes, setCreatingRes] = useState(false);
  const [waStatus, setWaStatus] = useState({ status: 'offline', qr: null, phone: null });
  const [waLoading, setWaLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await adminGetStats(credentials.username, credentials.password);
      setIsLoggedIn(true);
      localStorage.setItem('kaiso_admin', JSON.stringify(credentials));
    } catch (err) {
      setLoginError('Credenciales inválidas');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('kaiso_admin');
    if (saved) {
      const creds = JSON.parse(saved);
      setCredentials(creds);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, filterDate, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reservationsData, statsData, blackoutsData] = await Promise.all([
        adminGetReservations({ date_from: filterDate, date_to: filterDate, status: filterStatus || undefined }, credentials.username, credentials.password),
        adminGetStats(credentials.username, credentials.password),
        adminGetBlackouts(credentials.username, credentials.password)
      ]);
      setReservations(reservationsData);
      setStats(statsData);
      setBlackouts(blackoutsData);
      setDailyCapacity(statsData.today_capacity);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminUpdateReservation(id, { status: newStatus }, credentials.username, credentials.password);
      loadData();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const handleAddBlackout = async (e) => {
    e.preventDefault();
    if (!newBlackout.date) return;
    try {
      await adminAddBlackout(newBlackout, credentials.username, credentials.password);
      setNewBlackout({ date: '', reason: '' });
      loadData();
    } catch (err) {
      alert('Error al bloquear fecha');
    }
  };

  const handleRemoveBlackout = async (date) => {
    try {
      await adminRemoveBlackout(date, credentials.username, credentials.password);
      loadData();
    } catch (err) {
      alert('Error al desbloquear fecha');
    }
  };

  const handleExport = async () => {
    try {
      const endDate = format(addDays(new Date(filterDate), 30), 'yyyy-MM-dd');
      const blob = await adminExportCSV(filterDate, endDate, credentials.username, credentials.password);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reservas_${filterDate}.csv`;
      a.click();
    } catch (err) {
      alert('Error al exportar');
    }
  };

  const handleUpdateCapacity = async () => {
    try {
      await adminUpdateConfig({ daily_capacity: dailyCapacity }, credentials.username, credentials.password);
      alert('Capacidad actualizada');
      loadData();
    } catch (err) {
      alert('Error al actualizar capacidad');
    }
  };

  const logout = () => {
    localStorage.removeItem('kaiso_admin');
    setIsLoggedIn(false);
    setCredentials({ username: '', password: '' });
  };

  const navigateDate = (days) => {
    const newDate = addDays(new Date(filterDate), days);
    setFilterDate(format(newDate, 'yyyy-MM-dd'));
  };

  // WhatsApp polling
  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'whatsapp') return;
    const loadWaStatus = async () => {
      try {
        const data = await getWhatsAppStatus(credentials.username, credentials.password);
        setWaStatus(data);
      } catch (e) { setWaStatus({ status: 'offline', qr: null, phone: null }); }
    };
    loadWaStatus();
    const interval = setInterval(loadWaStatus, 3000);
    return () => clearInterval(interval);
  }, [isLoggedIn, activeTab, credentials]);

  const handleWaReset = async () => {
    setWaLoading(true);
    try {
      await resetWhatsApp(credentials.username, credentials.password);
    } catch (e) { alert('Error al resetear WhatsApp'); }
    finally { setWaLoading(false); }
  };

  const handleWaReconnect = async () => {
    setWaLoading(true);
    try {
      await reconnectWhatsApp(credentials.username, credentials.password);
    } catch (e) { alert('Error al reconectar'); }
    finally { setWaLoading(false); }
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setCreatingRes(true);
    try {
      const payload = { ...newRes };
      if (!payload.customer_email) delete payload.customer_email;
      if (!payload.observations) delete payload.observations;
      await adminCreateReservation(payload, credentials.username, credentials.password);
      setShowNewReservation(false);
      setNewRes({
        customer_name: '', customer_phone: '', customer_email: '',
        guests: 2, reservation_date: format(new Date(), 'yyyy-MM-dd'),
        reservation_time: '19:00', observations: ''
      });
      loadData();
    } catch (err) {
      alert('Error al crear reserva: ' + (err.response?.data?.detail || err.message));
    } finally {
      setCreatingRes(false);
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-kaiso-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-kaiso-gold">Kaisō Admin</h1>
            <p className="text-kaiso-muted text-sm mt-2">Panel de Administración</p>
          </div>
          
          <form onSubmit={handleLogin} className="bg-kaiso-card border border-kaiso-border p-8 space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-2 block">Usuario</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full bg-transparent border-b border-kaiso-border p-3 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-2 block">Contraseña</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full bg-transparent border-b border-kaiso-border p-3 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                required
              />
            </div>
            
            {loginError ? (
              <p className="text-kaiso-red text-sm text-center">{loginError}</p>
            ) : null}
            
            <button
              type="submit"
              className="w-full bg-kaiso-gold text-black py-4 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold-light transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              Entrar
            </button>
          </form>
          
          <button
            onClick={() => navigate('/')}
            className="block mx-auto mt-6 text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm"
          >
            ← Volver al sitio
          </button>
        </div>
      </div>
    );
  }

  const statusColors = {
    pendente: 'bg-yellow-500/20 text-yellow-400',
    confirmada: 'bg-green-500/20 text-green-400',
    cancelada: 'bg-red-500/20 text-red-400',
    'no-show': 'bg-gray-500/20 text-gray-400'
  };

  return (
    <div className="min-h-screen bg-kaiso-bg text-kaiso-text">
      {/* Header */}
      <header className="bg-kaiso-card border-b border-kaiso-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-xl text-kaiso-gold">Kaisō Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={loadData} className="p-2 text-kaiso-muted hover:text-kaiso-gold transition-colors">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => navigate('/')} className="text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm">
              Ver sitio
            </button>
            <button onClick={logout} className="p-2 text-kaiso-muted hover:text-kaiso-red transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <p className="text-kaiso-muted text-xs uppercase tracking-wider mb-2">Hoy</p>
              <p className="text-3xl font-serif text-kaiso-gold">{stats.today_reservations}</p>
              <p className="text-sm text-kaiso-muted mt-1">reservas</p>
            </div>
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <p className="text-kaiso-muted text-xs uppercase tracking-wider mb-2">Comensales Hoy</p>
              <p className="text-3xl font-serif text-kaiso-gold">{stats.today_guests}</p>
              <p className="text-sm text-kaiso-muted mt-1">de {stats.today_capacity}</p>
            </div>
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <p className="text-kaiso-muted text-xs uppercase tracking-wider mb-2">Pendientes</p>
              <p className="text-3xl font-serif text-yellow-400">{stats.total_pending}</p>
              <p className="text-sm text-kaiso-muted mt-1">por confirmar</p>
            </div>
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <p className="text-kaiso-muted text-xs uppercase tracking-wider mb-2">Confirmadas</p>
              <p className="text-3xl font-serif text-green-400">{stats.total_confirmed}</p>
              <p className="text-sm text-kaiso-muted mt-1">total</p>
            </div>
          </div>
        ) : null}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-kaiso-border">
          {['reservations', 'whatsapp', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 text-sm uppercase tracking-wider transition-colors flex items-center gap-2 ${activeTab === tab ? 'text-kaiso-gold border-b-2 border-kaiso-gold' : 'text-kaiso-muted hover:text-kaiso-text'}`}
            >
              {tab === 'whatsapp' ? <MessageCircle size={16} /> : null}
              {tab === 'reservations' ? 'Reservas' : tab === 'whatsapp' ? 'WhatsApp' : 'Configuración'}
              {tab === 'whatsapp' ? (
                <span className={`w-2 h-2 rounded-full ${waStatus.status === 'connected' ? 'bg-green-400' : waStatus.status === 'qr_ready' ? 'bg-yellow-400' : 'bg-red-400'}`} />
              ) : null}
            </button>
          ))}
        </div>

        {/* Reservations Tab */}
        {activeTab === 'reservations' ? (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button onClick={() => navigateDate(-1)} className="p-2 border border-kaiso-border hover:border-kaiso-gold transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-kaiso-bg border border-kaiso-border px-4 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                />
                <button onClick={() => navigateDate(1)} className="p-2 border border-kaiso-border hover:border-kaiso-gold transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-kaiso-bg border border-kaiso-border px-4 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="pendente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="cancelada">Cancelada</option>
                <option value="no-show">No-show</option>
              </select>

              <button onClick={handleExport} className="ml-auto flex items-center gap-2 bg-kaiso-gold text-black px-4 py-2 text-xs uppercase tracking-wider font-bold hover:bg-kaiso-gold-light transition-colors">
                <Download size={14} />
                Exportar CSV
              </button>

              <button
                onClick={() => setShowNewReservation(!showNewReservation)}
                data-testid="toggle-new-reservation-form"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 text-xs uppercase tracking-wider font-bold hover:bg-green-500 transition-colors"
              >
                <Plus size={14} />
                Nueva Reserva
              </button>
            </div>

            {/* Manual Reservation Form */}
            {showNewReservation ? (
              <form
                onSubmit={handleCreateReservation}
                data-testid="manual-reservation-form"
                className="bg-kaiso-card border border-kaiso-gold/30 p-6 mb-6 space-y-4"
              >
                <h3 className="text-kaiso-gold font-serif text-lg mb-2 flex items-center gap-2">
                  <Plus size={18} />
                  Crear Reserva Manual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-1 block">Nombre *</label>
                    <input
                      type="text"
                      data-testid="manual-res-name"
                      value={newRes.customer_name}
                      onChange={(e) => setNewRes(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="w-full bg-kaiso-bg border border-kaiso-border px-3 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                      required
                      minLength={2}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-1 block">Teléfono *</label>
                    <input
                      type="tel"
                      data-testid="manual-res-phone"
                      value={newRes.customer_phone}
                      onChange={(e) => setNewRes(prev => ({ ...prev, customer_phone: e.target.value }))}
                      className="w-full bg-kaiso-bg border border-kaiso-border px-3 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                      required
                      minLength={9}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-1 block">Email (opcional)</label>
                    <input
                      type="email"
                      data-testid="manual-res-email"
                      value={newRes.customer_email}
                      onChange={(e) => setNewRes(prev => ({ ...prev, customer_email: e.target.value }))}
                      className="w-full bg-kaiso-bg border border-kaiso-border px-3 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-1 block">Fecha *</label>
                    <input
                      type="date"
                      data-testid="manual-res-date"
                      value={newRes.reservation_date}
                      onChange={(e) => setNewRes(prev => ({ ...prev, reservation_date: e.target.value }))}
                      className="w-full bg-kaiso-bg border border-kaiso-border px-3 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-1 block">Hora *</label>
                    <input
                      type="time"
                      data-testid="manual-res-time"
                      value={newRes.reservation_time}
                      onChange={(e) => setNewRes(prev => ({ ...prev, reservation_time: e.target.value }))}
                      className="w-full bg-kaiso-bg border border-kaiso-border px-3 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-1 block">Personas *</label>
                    <input
                      type="number"
                      data-testid="manual-res-guests"
                      value={newRes.guests}
                      onChange={(e) => setNewRes(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                      min={1}
                      max={12}
                      className="w-full bg-kaiso-bg border border-kaiso-border px-3 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-1 block">Observaciones</label>
                  <input
                    type="text"
                    data-testid="manual-res-observations"
                    value={newRes.observations}
                    onChange={(e) => setNewRes(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Alergias, preferencias, etc."
                    className="w-full bg-kaiso-bg border border-kaiso-border px-3 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    data-testid="submit-manual-reservation"
                    disabled={creatingRes}
                    className="bg-kaiso-gold text-black px-6 py-3 text-xs uppercase tracking-wider font-bold hover:bg-kaiso-gold-light transition-colors disabled:opacity-50"
                  >
                    {creatingRes ? 'Creando...' : 'Crear Reserva'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewReservation(false)}
                    className="border border-kaiso-border px-6 py-3 text-xs uppercase tracking-wider text-kaiso-muted hover:text-kaiso-text transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : null}

            {/* Reservations Table */}
            {loading ? (
              <div className="text-center py-20 text-kaiso-muted">Cargando...</div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-20 bg-kaiso-card border border-kaiso-border">
                <Calendar size={48} className="mx-auto text-kaiso-border mb-4" />
                <p className="text-kaiso-muted">No hay reservas para esta fecha</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-kaiso-border">
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-kaiso-muted font-normal">Hora</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-kaiso-muted font-normal">Cliente</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-kaiso-muted font-normal">Teléfono</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-kaiso-muted font-normal">Personas</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-kaiso-muted font-normal">Degustación</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-kaiso-muted font-normal">Valor</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-kaiso-muted font-normal">Estado</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-kaiso-muted font-normal">Obs.</th>
                      <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-kaiso-muted font-normal">Origen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((res) => (
                      <tr key={res.id} className="border-b border-kaiso-border hover:bg-kaiso-card/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-kaiso-gold" />
                            <span className="text-kaiso-text font-medium">{res.reservation_time}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-kaiso-text">{res.customer_name}</td>
                        <td className="py-4 px-4">
                          <a href={`tel:${res.customer_phone}`} className="text-kaiso-muted hover:text-kaiso-gold transition-colors">
                            {res.customer_phone}
                          </a>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-kaiso-gold" />
                            <span>{res.guests}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {res.has_tasting_menu ? (
                            <span className="text-kaiso-gold text-xs">✓ Premium</span>
                          ) : (
                            <span className="text-kaiso-muted text-xs">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-kaiso-gold">
                          {res.estimated_value > 0 ? `€${res.estimated_value.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={res.status}
                            onChange={(e) => handleStatusChange(res.id, e.target.value)}
                            className={`px-3 py-1 text-xs uppercase tracking-wider border-0 cursor-pointer ${statusColors[res.status] || ''}`}
                          >
                            <option value="pendente">Pendiente</option>
                            <option value="confirmada">Confirmada</option>
                            <option value="cancelada">Cancelada</option>
                            <option value="no-show">No-show</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-kaiso-muted text-sm max-w-[150px] truncate" title={res.observations}>
                          {res.observations || '-'}
                        </td>
                        <td className="py-4 px-4">
                          {res.source === 'manual' ? (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 uppercase tracking-wider">Manual</span>
                          ) : (
                            <span className="text-xs text-kaiso-muted">Online</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}

        {/* WhatsApp Tab */}
        {activeTab === 'whatsapp' ? (
          <div className="max-w-lg mx-auto">
            <div className="bg-kaiso-card border border-kaiso-border p-8 text-center">
              <h3 className="text-kaiso-gold font-serif text-xl mb-2 flex items-center justify-center gap-2">
                <MessageCircle size={22} />
                WhatsApp Notificaciones
              </h3>
              <p className="text-kaiso-muted text-sm mb-6">
                Conecte seu WhatsApp para enviar confirmações automáticas aos clientes
              </p>

              {/* Status */}
              <div className="mb-6">
                {waStatus.status === 'connected' ? (
                  <div className="bg-green-500/10 border border-green-500/30 p-4" data-testid="wa-connected">
                    <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                      <Wifi size={20} />
                      <span className="text-sm uppercase tracking-wider font-bold">Conectado</span>
                    </div>
                    {waStatus.phone ? (
                      <p className="text-kaiso-muted text-xs">Numero: {waStatus.phone}</p>
                    ) : null}
                    <p className="text-green-400/70 text-xs mt-2">Notificações WhatsApp ativas</p>
                  </div>
                ) : waStatus.status === 'qr_ready' && waStatus.qr ? (
                  <div data-testid="wa-qr-code">
                    <p className="text-yellow-400 text-sm mb-4 flex items-center justify-center gap-2">
                      <Clock size={16} />
                      Escanee o QR Code com seu WhatsApp
                    </p>
                    <div className="bg-white p-2 inline-block mb-4">
                      <img src={waStatus.qr} alt="WhatsApp QR Code" className="w-64 h-64" />
                    </div>
                    <p className="text-kaiso-muted text-xs">
                      WhatsApp &gt; Dispositivos conectados &gt; Conectar dispositivo
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 p-4" data-testid="wa-disconnected">
                    <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
                      <WifiOff size={20} />
                      <span className="text-sm uppercase tracking-wider font-bold">
                        {waStatus.status === 'connecting' ? 'Conectando...' : 'Desconectado'}
                      </span>
                    </div>
                    {waStatus.error ? (
                      <p className="text-kaiso-muted text-xs mb-2">Serviço iniciando... aguarde alguns segundos</p>
                    ) : (
                      <p className="text-kaiso-muted text-xs">Clique em reconectar para gerar novo QR Code</p>
                    )}
                    {waStatus.node_available === false ? (
                      <p className="text-red-400 text-xs mt-2">Node.js não disponível no servidor</p>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                {waStatus.status !== 'connected' ? (
                  <button
                    onClick={handleWaReconnect}
                    disabled={waLoading}
                    data-testid="wa-reconnect-btn"
                    className="flex items-center gap-2 bg-kaiso-gold text-black px-6 py-3 text-xs uppercase tracking-wider font-bold hover:bg-kaiso-gold-light transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={waLoading ? 'animate-spin' : ''} />
                    Reconectar
                  </button>
                ) : null}
                <button
                  onClick={handleWaReset}
                  disabled={waLoading}
                  data-testid="wa-reset-btn"
                  className="flex items-center gap-2 border border-kaiso-red text-kaiso-red px-6 py-3 text-xs uppercase tracking-wider font-bold hover:bg-kaiso-red/10 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>

              {/* Info */}
              <div className="mt-8 pt-6 border-t border-kaiso-border text-left">
                <p className="text-kaiso-muted text-xs leading-relaxed">
                  <strong className="text-kaiso-text">Como funciona:</strong> Ao conectar, cada reserva nova (online ou manual) envia automaticamente uma mensagem WhatsApp de confirmação ao cliente. Se a conexão cair, clique em "Reconectar". Se persistir, clique "Reset" para gerar novo QR Code.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Settings Tab */}
        {activeTab === 'settings' ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Capacity */}
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <h3 className="text-kaiso-gold font-serif text-lg mb-4 flex items-center gap-2">
                <Settings size={18} />
                Capacidad Diaria
              </h3>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(parseInt(e.target.value))}
                  min={1}
                  max={100}
                  className="flex-1 bg-kaiso-bg border border-kaiso-border px-4 py-3 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                />
                <button
                  onClick={handleUpdateCapacity}
                  className="bg-kaiso-gold text-black px-6 py-3 text-xs uppercase tracking-wider font-bold hover:bg-kaiso-gold-light transition-colors"
                >
                  Guardar
                </button>
              </div>
              <p className="text-kaiso-muted text-xs mt-2">Máximo de comensales permitidos por día</p>
            </div>

            {/* Blackout Dates */}
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <h3 className="text-kaiso-gold font-serif text-lg mb-4 flex items-center gap-2">
                <Calendar size={18} />
                Días Bloqueados
              </h3>
              
              <form onSubmit={handleAddBlackout} className="flex gap-2 mb-4">
                <input
                  type="date"
                  value={newBlackout.date}
                  onChange={(e) => setNewBlackout(prev => ({ ...prev, date: e.target.value }))}
                  className="flex-1 bg-kaiso-bg border border-kaiso-border px-3 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Motivo"
                  value={newBlackout.reason}
                  onChange={(e) => setNewBlackout(prev => ({ ...prev, reason: e.target.value }))}
                  className="flex-1 bg-kaiso-bg border border-kaiso-border px-3 py-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none text-sm"
                />
                <button type="submit" className="bg-kaiso-gold text-black p-2 hover:bg-kaiso-gold-light transition-colors">
                  <Plus size={18} />
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {blackouts.length === 0 ? (
                  <p className="text-kaiso-muted text-sm">No hay días bloqueados</p>
                ) : (
                  blackouts.map((b) => (
                    <div key={b.date} className="flex items-center justify-between bg-kaiso-bg p-3 border border-kaiso-border">
                      <div>
                        <span className="text-kaiso-text text-sm">{b.date}</span>
                        {b.reason ? <span className="text-kaiso-muted text-xs ml-2">({b.reason})</span> : null}
                      </div>
                      <button
                        onClick={() => handleRemoveBlackout(b.date)}
                        className="text-kaiso-red hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
