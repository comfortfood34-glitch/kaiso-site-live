import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Users, Clock, Trash2, Filter, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getReservations, adminCancelReservation, getReservationStats } from '../lib/api';

export default function AdminPanel({ onClose }) {
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterStatus, setFilterStatus] = useState('confirmed');
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'week'

  useEffect(() => {
    loadData();
  }, [filterDate, filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      let filters = { status: filterStatus || undefined };
      
      if (viewMode === 'day') {
        filters.date_from = filterDate;
        filters.date_to = filterDate;
      } else {
        const start = startOfWeek(new Date(filterDate), { weekStartsOn: 1 });
        const end = endOfWeek(new Date(filterDate), { weekStartsOn: 1 });
        filters.date_from = format(start, 'yyyy-MM-dd');
        filters.date_to = format(end, 'yyyy-MM-dd');
      }

      const [reservationsData, statsData] = await Promise.all([
        getReservations(filters),
        getReservationStats()
      ]);
      
      setReservations(reservationsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta reserva?')) return;
    
    try {
      await adminCancelReservation(reservationId);
      loadData();
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert('Error al cancelar la reserva');
    }
  };

  const navigateDate = (direction) => {
    const current = new Date(filterDate);
    const newDate = addDays(current, direction === 'next' ? (viewMode === 'week' ? 7 : 1) : (viewMode === 'week' ? -7 : -1));
    setFilterDate(format(newDate, 'yyyy-MM-dd'));
  };

  const getTotalGuests = () => {
    return reservations.reduce((sum, r) => sum + r.guests, 0);
  };

  const groupByTime = () => {
    const groups = {};
    reservations.forEach(r => {
      const key = r.reservation_time;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-auto" data-testid="admin-panel">
      {/* Header */}
      <div className="sticky top-0 bg-[#0A0A0A] border-b border-[#2A2A2A] z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl text-[#C9A24A]">Panel de Administración</h1>
              <p className="text-xs text-[#888] uppercase tracking-widest mt-1">Gestión de Reservas</p>
            </div>
            <button 
              onClick={onClose}
              className="text-[#888] hover:text-[#E5E5E5] p-2"
              data-testid="close-admin-button"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#121212] border border-[#2A2A2A] p-6" data-testid="stat-today-reservations">
              <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Hoy</p>
              <p className="text-3xl font-serif text-[#C9A24A]">{stats.today_reservations}</p>
              <p className="text-sm text-[#888] mt-1">reservas</p>
            </div>
            <div className="bg-[#121212] border border-[#2A2A2A] p-6" data-testid="stat-today-guests">
              <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Comensales Hoy</p>
              <p className="text-3xl font-serif text-[#C9A24A]">{stats.today_guests}</p>
              <p className="text-sm text-[#888] mt-1">personas</p>
            </div>
            <div className="bg-[#121212] border border-[#2A2A2A] p-6" data-testid="stat-week-reservations">
              <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Esta Semana</p>
              <p className="text-3xl font-serif text-[#C9A24A]">{stats.week_reservations}</p>
              <p className="text-sm text-[#888] mt-1">reservas</p>
            </div>
            <div className="bg-[#121212] border border-[#2A2A2A] p-6" data-testid="stat-total">
              <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Total Confirmadas</p>
              <p className="text-3xl font-serif text-[#C9A24A]">{stats.total_confirmed}</p>
              <p className="text-sm text-[#888] mt-1">reservas</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#121212] border border-[#2A2A2A] p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 border border-[#2A2A2A] hover:border-[#C9A24A] transition-colors"
                data-testid="prev-date-button"
              >
                <ChevronLeft size={18} className="text-[#888]" />
              </button>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-[#0A0A0A] border border-[#2A2A2A] px-4 py-2 text-[#E5E5E5] focus:border-[#C9A24A] focus:outline-none"
                data-testid="date-filter"
              />
              <button
                onClick={() => navigateDate('next')}
                className="p-2 border border-[#2A2A2A] hover:border-[#C9A24A] transition-colors"
                data-testid="next-date-button"
              >
                <ChevronRight size={18} className="text-[#888]" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  viewMode === 'day' 
                    ? 'bg-[#C9A24A] text-black' 
                    : 'border border-[#2A2A2A] text-[#888] hover:border-[#C9A24A]'
                }`}
                data-testid="view-day-button"
              >
                Día
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-[#C9A24A] text-black' 
                    : 'border border-[#2A2A2A] text-[#888] hover:border-[#C9A24A]'
                }`}
                data-testid="view-week-button"
              >
                Semana
              </button>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#0A0A0A] border border-[#2A2A2A] px-4 py-2 text-[#E5E5E5] focus:border-[#C9A24A] focus:outline-none"
              data-testid="status-filter"
            >
              <option value="">Todos</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 border border-[#2A2A2A] hover:border-[#C9A24A] transition-colors ml-auto"
              data-testid="refresh-button"
            >
              <RefreshCw size={18} className={`text-[#888] ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[#888]">
            {reservations.length} reserva{reservations.length !== 1 ? 's' : ''} · {getTotalGuests()} comensal{getTotalGuests() !== 1 ? 'es' : ''}
          </p>
          <p className="text-xs text-[#888] uppercase tracking-wider">
            {format(new Date(filterDate), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>

        {/* Reservations Table */}
        {loading ? (
          <div className="text-center py-20 text-[#888]">Cargando...</div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 border border-[#2A2A2A] bg-[#121212]">
            <Calendar size={48} className="mx-auto text-[#2A2A2A] mb-4" />
            <p className="text-[#888]">No hay reservas para esta fecha</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="reservations-table">
              <thead>
                <tr className="border-b border-[#2A2A2A]">
                  <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-[#888] font-normal">Hora</th>
                  <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-[#888] font-normal">Cliente</th>
                  <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-[#888] font-normal">Contacto</th>
                  <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-[#888] font-normal">Personas</th>
                  <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-[#888] font-normal">Estado</th>
                  <th className="text-left py-4 px-4 text-xs uppercase tracking-wider text-[#888] font-normal">Observaciones</th>
                  <th className="text-right py-4 px-4 text-xs uppercase tracking-wider text-[#888] font-normal">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr 
                    key={reservation.id} 
                    className={`border-b border-[#2A2A2A] hover:bg-[#121212] transition-colors ${
                      reservation.status === 'cancelled' ? 'opacity-50' : ''
                    }`}
                    data-testid={`reservation-row-${reservation.id}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#C9A24A]" />
                        <span className="text-[#E5E5E5] font-medium">{reservation.reservation_time}</span>
                      </div>
                      {viewMode === 'week' && (
                        <p className="text-xs text-[#888] mt-1">{reservation.reservation_date}</p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[#E5E5E5] font-medium">{reservation.customer_name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[#888] text-sm">{reservation.customer_email}</p>
                      <p className="text-[#888] text-sm">{reservation.customer_phone}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#C9A24A]" />
                        <span className="text-[#E5E5E5]">{reservation.guests}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs uppercase tracking-wider ${
                        reservation.status === 'confirmed' 
                          ? 'bg-[#C9A24A]/20 text-[#C9A24A]' 
                          : 'bg-[#7F1D1D]/20 text-[#E5E5E5]'
                      }`}>
                        {reservation.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[#888] text-sm max-w-xs truncate">{reservation.observations || '-'}</p>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          className="p-2 text-[#7F1D1D] hover:bg-[#7F1D1D] hover:text-white transition-colors"
                          title="Cancelar reserva"
                          data-testid={`cancel-button-${reservation.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
