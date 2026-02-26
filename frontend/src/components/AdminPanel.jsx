import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, Download, Plus, Trash2, RefreshCw, LogOut, Settings, BarChart3, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminGetReservations, adminUpdateReservation, adminGetStats, adminUpdateConfig, adminAddBlackout, adminRemoveBlackout, adminGetBlackouts, adminExportCSV, adminCreateReservation } from '../lib/api';

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
          {['reservations', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 text-sm uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-kaiso-gold border-b-2 border-kaiso-gold' : 'text-kaiso-muted hover:text-kaiso-text'}`}
            >
              {tab === 'reservations' ? 'Reservas' : 'Configuración'}
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
            </div>

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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
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
