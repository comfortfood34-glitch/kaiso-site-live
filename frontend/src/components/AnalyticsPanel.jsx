import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { Lock, RefreshCw, LogOut, TrendingUp, Eye, Users, MousePointerClick, Globe, Monitor, Smartphone, Clock } from 'lucide-react';
import { getAnalyticsStats } from '../lib/api';

const COLORS = ['#C9A24A', '#D11B2A', '#888888', '#4A90C9', '#7BC94A'];
const LANG_NAMES = { es: 'Español', pt: 'Português', en: 'English' };

export default function AnalyticsPanel() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('7d');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await getAnalyticsStats('7d', credentials.username, credentials.password);
      setIsLoggedIn(true);
      localStorage.setItem('kaiso_admin', JSON.stringify(credentials));
    } catch (err) {
      setLoginError('Credenciais inválidas');
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
    if (isLoggedIn) loadStats();
  }, [isLoggedIn, period]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getAnalyticsStats(period, credentials.username, credentials.password);
      setStats(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('kaiso_admin');
    setIsLoggedIn(false);
    setCredentials({ username: '', password: '' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-kaiso-bg flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-kaiso-gold">Kaisō Analytics</h1>
            <p className="text-kaiso-muted text-sm mt-2">Painel de Visitantes</p>
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
                data-testid="analytics-username"
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
                data-testid="analytics-password"
              />
            </div>
            {loginError ? <p className="text-kaiso-red text-sm text-center">{loginError}</p> : null}
            <button
              type="submit"
              className="w-full bg-kaiso-gold text-black py-4 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold-light transition-colors flex items-center justify-center gap-2"
              data-testid="analytics-login-btn"
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

  const totalDevices = stats?.devices?.reduce((a, d) => a + d.count, 0) || 1;

  return (
    <div className="min-h-screen bg-kaiso-bg text-kaiso-text">
      {/* Header */}
      <header className="bg-kaiso-card border-b border-kaiso-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-serif text-xl text-kaiso-gold">Kaisō Analytics</h1>
          <div className="flex items-center gap-4">
            {/* Period selector */}
            <div className="flex gap-1">
              {['7d', '30d', '90d'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs uppercase tracking-wider transition-colors ${period === p ? 'bg-kaiso-gold text-black' : 'border border-kaiso-border text-kaiso-muted hover:border-kaiso-gold'}`}
                  data-testid={`period-${p}`}
                >
                  {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : '90 Dias'}
                </button>
              ))}
            </div>
            <button onClick={loadStats} className="p-2 text-kaiso-muted hover:text-kaiso-gold transition-colors">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => navigate('/admin')} className="text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm">
              Reservas
            </button>
            <button onClick={() => navigate('/')} className="text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm">
              Sitio
            </button>
            <button onClick={logout} className="p-2 text-kaiso-muted hover:text-kaiso-red transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {stats ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-kaiso-card border border-kaiso-border p-5" data-testid="kpi-views-today">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={14} className="text-kaiso-gold" />
                <p className="text-kaiso-muted text-xs uppercase tracking-wider">Hoje</p>
              </div>
              <p className="text-3xl font-serif text-kaiso-gold">{stats.today_views}</p>
              <p className="text-xs text-kaiso-muted mt-1">visitas</p>
            </div>
            <div className="bg-kaiso-card border border-kaiso-border p-5" data-testid="kpi-views-total">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-kaiso-gold" />
                <p className="text-kaiso-muted text-xs uppercase tracking-wider">Total</p>
              </div>
              <p className="text-3xl font-serif text-kaiso-gold">{stats.total_views}</p>
              <p className="text-xs text-kaiso-muted mt-1">visitas ({period})</p>
            </div>
            <div className="bg-kaiso-card border border-kaiso-border p-5" data-testid="kpi-reservations-opened">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick size={14} className="text-kaiso-gold" />
                <p className="text-kaiso-muted text-xs uppercase tracking-wider">Abriram Reserva</p>
              </div>
              <p className="text-3xl font-serif text-kaiso-gold">{stats.total_reservations_opened}</p>
              <p className="text-xs text-kaiso-muted mt-1">formulários abertos</p>
            </div>
            <div className="bg-kaiso-card border border-kaiso-border p-5" data-testid="kpi-reservations-completed">
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} className="text-kaiso-gold" />
                <p className="text-kaiso-muted text-xs uppercase tracking-wider">Reservas</p>
              </div>
              <p className="text-3xl font-serif text-kaiso-gold">{stats.total_reservations_completed}</p>
              <p className="text-xs text-kaiso-muted mt-1">completadas</p>
            </div>
            <div className="bg-kaiso-card border border-kaiso-border p-5" data-testid="kpi-conversion">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-kaiso-gold" />
                <p className="text-kaiso-muted text-xs uppercase tracking-wider">Conversão</p>
              </div>
              <p className="text-3xl font-serif text-kaiso-gold">{stats.conversion_rate}%</p>
              <p className="text-xs text-kaiso-muted mt-1">abriram → reservaram</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Daily Views Chart */}
            <div className="md:col-span-2 bg-kaiso-card border border-kaiso-border p-6">
              <h3 className="text-kaiso-gold font-serif text-lg mb-4">Visitas por Dia</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.daily_chart}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A24A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C9A24A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis tick={{ fill: '#888', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0B0D', border: '1px solid #1A1A1A', color: '#fff' }}
                    labelFormatter={(d) => d}
                  />
                  <Area type="monotone" dataKey="views" stroke="#C9A24A" fill="url(#goldGrad)" name="Visitas" />
                  <Line type="monotone" dataKey="reservations" stroke="#D11B2A" strokeWidth={2} dot={false} name="Reservas" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Language Distribution */}
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <h3 className="text-kaiso-gold font-serif text-lg mb-4 flex items-center gap-2">
                <Globe size={16} />
                Idiomas
              </h3>
              {stats.languages.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={stats.languages}
                        dataKey="count"
                        nameKey="lang"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={35}
                      >
                        {stats.languages.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0A0B0D', border: '1px solid #1A1A1A', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {stats.languages.map((l, i) => (
                      <div key={l.lang} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-kaiso-muted">{LANG_NAMES[l.lang] || l.lang}</span>
                        </div>
                        <span className="text-kaiso-text">{l.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-kaiso-muted text-sm text-center py-8">Sem dados ainda</p>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Hourly Distribution */}
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <h3 className="text-kaiso-gold font-serif text-lg mb-4 flex items-center gap-2">
                <Clock size={16} />
                Horário de Acesso
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.hourly}>
                  <XAxis dataKey="hour" tick={{ fill: '#888', fontSize: 9 }} tickFormatter={(h) => `${h}h`} />
                  <YAxis tick={{ fill: '#888', fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0A0B0D', border: '1px solid #1A1A1A', color: '#fff' }} />
                  <Bar dataKey="count" fill="#C9A24A" radius={[2, 2, 0, 0]} name="Acessos" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Device Distribution */}
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <h3 className="text-kaiso-gold font-serif text-lg mb-4">Dispositivos</h3>
              <div className="space-y-4 mt-6">
                {stats.devices.map(d => (
                  <div key={d.device}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 text-sm text-kaiso-muted">
                        {d.device === 'mobile' ? <Smartphone size={14} className="text-kaiso-gold" /> : <Monitor size={14} className="text-kaiso-gold" />}
                        <span>{d.device === 'mobile' ? 'Mobile' : 'Desktop'}</span>
                      </div>
                      <span className="text-kaiso-text text-sm">{Math.round(d.count / totalDevices * 100)}%</span>
                    </div>
                    <div className="w-full bg-kaiso-border h-2">
                      <div className="bg-kaiso-gold h-2 transition-all" style={{ width: `${d.count / totalDevices * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-kaiso-card border border-kaiso-border p-6">
              <h3 className="text-kaiso-gold font-serif text-lg mb-4">Páginas Mais Visitadas</h3>
              <div className="space-y-3">
                {stats.top_pages.length > 0 ? stats.top_pages.map((p, i) => (
                  <div key={p.page} className="flex items-center justify-between">
                    <span className="text-kaiso-muted text-sm truncate max-w-[180px]">{p.page}</span>
                    <span className="text-kaiso-gold text-sm font-medium">{p.views}</span>
                  </div>
                )) : (
                  <p className="text-kaiso-muted text-sm text-center py-4">Sem dados ainda</p>
                )}
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-kaiso-card border border-kaiso-border p-6">
            <h3 className="text-kaiso-gold font-serif text-lg mb-6">Funil de Conversão</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-kaiso-gold/10 border border-kaiso-gold/30 p-6 mb-2">
                  <p className="text-3xl font-serif text-kaiso-gold">{stats.funnel.page_view}</p>
                </div>
                <p className="text-kaiso-muted text-xs uppercase tracking-wider">Visitaram o Site</p>
              </div>
              <div className="text-center">
                <div className="bg-kaiso-gold/10 border border-kaiso-gold/30 p-6 mb-2">
                  <p className="text-3xl font-serif text-kaiso-gold">{stats.funnel.reservation_open}</p>
                </div>
                <p className="text-kaiso-muted text-xs uppercase tracking-wider">Abriram Reserva</p>
                {stats.funnel.page_view > 0 ? (
                  <p className="text-kaiso-gold text-xs mt-1">{Math.round(stats.funnel.reservation_open / stats.funnel.page_view * 100)}%</p>
                ) : null}
              </div>
              <div className="text-center">
                <div className="bg-kaiso-gold/10 border border-kaiso-gold/30 p-6 mb-2">
                  <p className="text-3xl font-serif text-kaiso-red">{stats.funnel.reservation_complete}</p>
                </div>
                <p className="text-kaiso-muted text-xs uppercase tracking-wider">Reservaram</p>
                {stats.funnel.reservation_open > 0 ? (
                  <p className="text-kaiso-gold text-xs mt-1">{stats.conversion_rate}%</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-kaiso-muted">
          {loading ? 'Carregando...' : 'Sem dados disponíveis'}
        </div>
      )}
    </div>
  );
}
