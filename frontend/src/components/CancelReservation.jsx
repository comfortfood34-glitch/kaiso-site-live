import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, X } from 'lucide-react';
import { getReservationByToken, cancelReservation } from '../lib/api';

export default function CancelReservation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReservation();
  }, [token]);

  const loadReservation = async () => {
    try {
      const data = await getReservationByToken(token);
      setReservation(data);
      if (data.status === 'cancelled') {
        setCancelled(true);
      }
    } catch (err) {
      setError('Reserva no encontrada o enlace inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelReservation(token);
      setCancelled(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cancelar la reserva');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#888]">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[#121212] border border-[#2A2A2A] p-8 max-w-md text-center" data-testid="cancel-error">
          <X size={48} className="mx-auto text-[#7F1D1D] mb-4" />
          <h2 className="font-serif text-2xl text-[#E5E5E5] mb-4">Error</h2>
          <p className="text-[#888] mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#C9A24A] text-black px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#D4AF5F] transition-colors"
            data-testid="go-home-button"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[#121212] border border-[#2A2A2A] p-8 max-w-md text-center" data-testid="cancel-success">
          <Check size={48} className="mx-auto text-[#C9A24A] mb-4" />
          <h2 className="font-serif text-2xl text-[#C9A24A] mb-4">Reserva Cancelada</h2>
          <p className="text-[#888] mb-6">
            Su reserva ha sido cancelada exitosamente. 
            Hemos enviado un email de confirmación.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#C9A24A] text-black px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#D4AF5F] transition-colors"
            data-testid="go-home-button"
          >
            Hacer Nueva Reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#2A2A2A] p-8 max-w-md" data-testid="cancel-confirmation">
        <div className="text-center mb-6">
          <AlertTriangle size={48} className="mx-auto text-[#C9A24A] mb-4" />
          <h2 className="font-serif text-2xl text-[#E5E5E5]">Cancelar Reserva</h2>
        </div>

        <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-4 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#888] text-sm">Nombre:</span>
              <span className="text-[#E5E5E5]">{reservation.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888] text-sm">Fecha:</span>
              <span className="text-[#E5E5E5]">{reservation.reservation_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888] text-sm">Hora:</span>
              <span className="text-[#C9A24A] font-medium">{reservation.reservation_time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888] text-sm">Personas:</span>
              <span className="text-[#E5E5E5]">{reservation.guests}</span>
            </div>
          </div>
        </div>

        <p className="text-[#888] text-sm text-center mb-6">
          ¿Está seguro de que desea cancelar esta reserva? Esta acción no se puede deshacer.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 border border-[#2A2A2A] text-[#888] px-6 py-4 uppercase tracking-widest text-xs font-bold hover:border-[#C9A24A] hover:text-[#C9A24A] transition-colors"
            data-testid="keep-reservation-button"
          >
            Mantener
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 bg-[#7F1D1D] text-white px-6 py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#991B1B] transition-colors disabled:opacity-50"
            data-testid="confirm-cancel-button"
          >
            {cancelling ? 'Cancelando...' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}
