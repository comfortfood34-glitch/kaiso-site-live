import React, { useState, useEffect } from 'react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { Calendar, Clock, Users, ChevronRight, Check, Sun, Moon, ArrowLeft } from 'lucide-react';
import { getAvailability, createReservation, getConfig } from '../lib/api';
import 'react-day-picker/style.css';

const STEPS = ['date', 'period', 'time', 'details', 'confirmation'];

export default function ReservationWizard({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null); // 'lunch' or 'dinner'
  const [selectedTime, setSelectedTime] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservationResult, setReservationResult] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    guests: 2,
    observations: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const loadConfig = async () => {
    try {
      const data = await getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Error loading config:', err);
    }
  };

  const loadAvailability = async (dateStr) => {
    setLoading(true);
    try {
      const data = await getAvailability(dateStr);
      setAvailability(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar disponibilidad');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedPeriod(null);
    setSelectedTime(null);
    setCurrentStep(1);
  };

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    setSelectedTime(null);
    setCurrentStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setCurrentStep(3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const reservationData = {
        ...formData,
        guests: parseInt(formData.guests),
        reservation_date: format(selectedDate, 'yyyy-MM-dd'),
        reservation_time: selectedTime
      };

      const result = await createReservation(reservationData);
      setReservationResult(result);
      setCurrentStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la reserva');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getAvailableSlots = () => {
    if (!availability) return [];
    return selectedPeriod === 'lunch' ? availability.lunch_slots : availability.dinner_slots;
  };

  const hasAvailableSlots = (period) => {
    if (!availability) return false;
    const slots = period === 'lunch' ? availability.lunch_slots : availability.dinner_slots;
    return slots.some(slot => slot.is_available);
  };

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 60);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] w-full max-w-2xl my-8 relative" data-testid="reservation-wizard">
        {/* Header */}
        <div className="border-b border-[#2A2A2A] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStep > 0 && currentStep < 4 && (
              <button 
                onClick={goBack}
                className="text-[#888] hover:text-[#C9A24A] transition-colors"
                data-testid="back-button"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="font-serif text-2xl text-[#C9A24A]">Reservar Mesa</h2>
              <p className="text-xs text-[#888] uppercase tracking-widest mt-1">
                {STEPS[currentStep] === 'date' && 'Seleccione fecha'}
                {STEPS[currentStep] === 'period' && 'Seleccione turno'}
                {STEPS[currentStep] === 'time' && 'Seleccione hora'}
                {STEPS[currentStep] === 'details' && 'Sus datos'}
                {STEPS[currentStep] === 'confirmation' && 'Confirmación'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#888] hover:text-[#E5E5E5] text-2xl"
            data-testid="close-wizard-button"
          >
            ×
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 p-4 border-b border-[#2A2A2A]">
          {STEPS.map((step, idx) => (
            <div 
              key={step}
              className={`h-1 flex-1 transition-all ${
                idx <= currentStep ? 'bg-[#C9A24A]' : 'bg-[#2A2A2A]'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {error && (
            <div className="bg-[#7F1D1D]/20 border border-[#7F1D1D] text-[#E5E5E5] p-4 mb-6" data-testid="error-message">
              {error}
            </div>
          )}

          {/* Step 1: Date Selection */}
          {STEPS[currentStep] === 'date' && (
            <div className="flex justify-center" data-testid="date-step">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={es}
                disabled={[
                  { before: today },
                  { after: maxDate }
                ]}
                className="kaiso-calendar"
                classNames={{
                  root: 'bg-transparent',
                  month: 'space-y-4',
                  caption: 'flex justify-center relative items-center h-10',
                  caption_label: 'font-serif text-xl text-[#C9A24A]',
                  nav: 'flex items-center gap-1',
                  nav_button: 'h-8 w-8 bg-transparent border border-[#2A2A2A] hover:border-[#C9A24A] hover:text-[#C9A24A] flex items-center justify-center transition-colors',
                  table: 'w-full border-collapse',
                  head_row: 'flex',
                  head_cell: 'text-[#888] w-10 font-normal text-xs uppercase',
                  row: 'flex w-full mt-2',
                  cell: 'text-center text-sm relative p-0 focus-within:relative',
                  day: 'h-10 w-10 p-0 font-normal hover:bg-[#C9A24A] hover:text-black transition-colors',
                  day_selected: 'bg-[#C9A24A] text-black',
                  day_today: 'text-[#C9A24A] font-bold',
                  day_disabled: 'text-[#444] cursor-not-allowed hover:bg-transparent hover:text-[#444]',
                }}
              />
            </div>
          )}

          {/* Step 2: Period Selection */}
          {STEPS[currentStep] === 'period' && (
            <div className="space-y-4" data-testid="period-step">
              <div className="text-center mb-8">
                <p className="text-[#888] text-sm">
                  {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePeriodSelect('lunch')}
                  disabled={!hasAvailableSlots('lunch')}
                  className={`p-8 border transition-all ${
                    hasAvailableSlots('lunch')
                      ? 'border-[#2A2A2A] hover:border-[#C9A24A] cursor-pointer'
                      : 'border-[#1A1A1A] cursor-not-allowed opacity-50'
                  }`}
                  data-testid="lunch-button"
                >
                  <Sun className="mx-auto mb-4 text-[#C9A24A]" size={40} />
                  <h3 className="font-serif text-xl text-[#E5E5E5]">Almuerzo</h3>
                  <p className="text-[#888] text-sm mt-2">12:30 - 15:00</p>
                  {!hasAvailableSlots('lunch') && (
                    <p className="text-[#7F1D1D] text-xs mt-2">Sin disponibilidad</p>
                  )}
                </button>

                <button
                  onClick={() => handlePeriodSelect('dinner')}
                  disabled={!hasAvailableSlots('dinner')}
                  className={`p-8 border transition-all ${
                    hasAvailableSlots('dinner')
                      ? 'border-[#2A2A2A] hover:border-[#C9A24A] cursor-pointer'
                      : 'border-[#1A1A1A] cursor-not-allowed opacity-50'
                  }`}
                  data-testid="dinner-button"
                >
                  <Moon className="mx-auto mb-4 text-[#C9A24A]" size={40} />
                  <h3 className="font-serif text-xl text-[#E5E5E5]">Cena</h3>
                  <p className="text-[#888] text-sm mt-2">20:00 - 23:00</p>
                  {!hasAvailableSlots('dinner') && (
                    <p className="text-[#7F1D1D] text-xs mt-2">Sin disponibilidad</p>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Time Selection */}
          {STEPS[currentStep] === 'time' && (
            <div data-testid="time-step">
              <div className="text-center mb-8">
                <p className="text-[#888] text-sm">
                  {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })} - {selectedPeriod === 'lunch' ? 'Almuerzo' : 'Cena'}
                </p>
              </div>

              {loading ? (
                <div className="text-center text-[#888]">Cargando horarios...</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {getAvailableSlots().map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.is_available && handleTimeSelect(slot.time)}
                      disabled={!slot.is_available}
                      className={`p-4 border text-center transition-all ${
                        slot.is_available
                          ? 'border-[#2A2A2A] hover:border-[#C9A24A] hover:bg-[#C9A24A] hover:text-black cursor-pointer'
                          : 'border-[#1A1A1A] text-[#444] cursor-not-allowed'
                      } ${selectedTime === slot.time ? 'bg-[#C9A24A] text-black border-[#C9A24A]' : ''}`}
                      data-testid={`time-slot-${slot.time.replace(':', '')}`}
                    >
                      <Clock size={16} className="mx-auto mb-2" />
                      <span className="font-medium">{slot.time}</span>
                      {slot.is_available && (
                        <p className="text-xs mt-1 opacity-70">{slot.available_capacity} plazas</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Details Form */}
          {STEPS[currentStep] === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-6" data-testid="details-step">
              <div className="bg-[#121212] border border-[#2A2A2A] p-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">Fecha:</span>
                  <span className="text-[#E5E5E5]">{selectedDate && format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-[#888]">Hora:</span>
                  <span className="text-[#C9A24A] font-medium">{selectedTime}</span>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#888] mb-2 block">Nombre completo *</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-transparent border-b border-[#2A2A2A] px-0 py-4 focus:border-[#C9A24A] focus:outline-none transition-colors text-[#E5E5E5] placeholder:text-[#555]"
                  placeholder="Su nombre"
                  data-testid="input-name"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#888] mb-2 block">Email *</label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-transparent border-b border-[#2A2A2A] px-0 py-4 focus:border-[#C9A24A] focus:outline-none transition-colors text-[#E5E5E5] placeholder:text-[#555]"
                  placeholder="email@ejemplo.com"
                  data-testid="input-email"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#888] mb-2 block">Teléfono *</label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-transparent border-b border-[#2A2A2A] px-0 py-4 focus:border-[#C9A24A] focus:outline-none transition-colors text-[#E5E5E5] placeholder:text-[#555]"
                  placeholder="+34 600 000 000"
                  data-testid="input-phone"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#888] mb-2 block">Número de personas *</label>
                <select
                  name="guests"
                  value={formData.guests}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#0A0A0A] border-b border-[#2A2A2A] px-0 py-4 focus:border-[#C9A24A] focus:outline-none transition-colors text-[#E5E5E5]"
                  data-testid="input-guests"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-[#888] mb-2 block">Observaciones</label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-transparent border border-[#2A2A2A] p-4 focus:border-[#C9A24A] focus:outline-none transition-colors text-[#E5E5E5] placeholder:text-[#555] resize-none"
                  placeholder="Alergias, celebraciones especiales, preferencias..."
                  data-testid="input-observations"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C9A24A] text-black py-6 uppercase tracking-widest text-xs font-bold hover:bg-[#D4AF5F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="submit-reservation-button"
              >
                {loading ? (
                  'Procesando...'
                ) : (
                  <>
                    Confirmar Reserva
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 5: Confirmation */}
          {STEPS[currentStep] === 'confirmation' && reservationResult && (
            <div className="text-center" data-testid="confirmation-step">
              <div className="w-20 h-20 bg-[#C9A24A] rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-black" />
              </div>
              
              <h3 className="font-serif text-3xl text-[#C9A24A] mb-2">¡Reserva Confirmada!</h3>
              <p className="text-[#888] mb-8">Hemos enviado un email de confirmación a {reservationResult.customer_email}</p>

              <div className="bg-[#121212] border border-[#2A2A2A] p-6 text-left max-w-md mx-auto">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[#2A2A2A] pb-3">
                    <span className="text-[#888] text-sm uppercase tracking-wider">Fecha</span>
                    <span className="text-[#E5E5E5]">{reservationResult.reservation_date}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2A2A2A] pb-3">
                    <span className="text-[#888] text-sm uppercase tracking-wider">Hora</span>
                    <span className="text-[#C9A24A] font-medium">{reservationResult.reservation_time}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2A2A2A] pb-3">
                    <span className="text-[#888] text-sm uppercase tracking-wider">Personas</span>
                    <span className="text-[#E5E5E5]">{reservationResult.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888] text-sm uppercase tracking-wider">ID Reserva</span>
                    <span className="text-[#E5E5E5] text-sm">{reservationResult.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-8 bg-transparent border border-[#C9A24A] text-[#C9A24A] px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#C9A24A] hover:text-black transition-colors"
                data-testid="close-confirmation-button"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
