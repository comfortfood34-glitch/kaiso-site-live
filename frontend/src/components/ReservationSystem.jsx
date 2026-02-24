import React, { useState, useEffect } from 'react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { es, pt, enUS } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import { Calendar, Clock, Users, X, ArrowLeft, ArrowRight, Check, Info, Sparkles } from 'lucide-react';
import { useLanguage } from '../App';
import { getAvailability, createReservation, getWhatsAppMessage } from '../lib/api';
import 'react-day-picker/style.css';

// WhatsApp SVG Icon
const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const STEPS = ['date', 'time', 'details', 'confirm', 'success'];

export default function ReservationSystem({ onClose }) {
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservation, setReservation] = useState(null);
  
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    guests: 2,
    observations: '',
    has_tasting_menu: false,
    tasting_allergies: ''
  });

  const dateLocale = { es, pt, en: enUS }[lang] || es;

  useEffect(() => {
    if (selectedDate) {
      loadAvailability(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const loadAvailability = async (dateStr) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAvailability(dateStr);
      setAvailability(data);
      if (!data.available) {
        setError(data.reason);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null);
      setStep(1);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    // Check if tasting is available for this time
    if (form.has_tasting_menu && availability) {
      const isTastingTime = availability.tasting_slots?.includes(time);
      if (!isTastingTime) {
        setForm(prev => ({ ...prev, has_tasting_menu: false }));
      }
    }
    setStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStep(3); // Go to confirmation
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const reservationData = {
        ...form,
        guests: parseInt(form.guests),
        reservation_date: format(selectedDate, 'yyyy-MM-dd'),
        reservation_time: selectedTime
      };
      
      const result = await createReservation(reservationData);
      setReservation(result);
      setStep(4); // Success - show QR code page
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hola Kaisō! Reserva confirmada:\n\nNombre: ${form.customer_name}\nFecha: ${selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}\nHora: ${selectedTime}\nPersonas: ${form.guests}${form.has_tasting_menu ? '\nMenú Degustación Premium' : ''}${form.observations ? `\nObs: ${form.observations}` : ''}`;
    window.open(`https://wa.me/34673036835?text=${encodeURIComponent(message)}`, '_blank');
  };

  const goBack = () => step > 0 && setStep(step - 1);
  
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 60);
  
  // Check if tasting is available for selected date/time
  const canSelectTasting = availability?.tasting_available && 
    (!selectedTime || availability?.tasting_slots?.includes(selectedTime));

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-start justify-center overflow-y-auto" onClick={(e) => e.target === e.currentTarget && step < 4 && onClose()}>
      <div className="bg-kaiso-bg border border-kaiso-border w-full max-w-2xl my-4 sm:my-8 min-h-0" onClick={(e) => e.stopPropagation()} data-testid="reservation-system">
        {/* Header */}
        <div className="border-b border-kaiso-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {(step > 0 && step < 4) ? (
              <button onClick={goBack} className="text-kaiso-muted hover:text-kaiso-gold transition-colors" data-testid="back-button">
                <ArrowLeft size={20} />
              </button>
            ) : null}
            <div>
              <h2 className="font-serif text-2xl text-kaiso-gold">{t.reservation.title}</h2>
              <p className="text-xs text-kaiso-muted uppercase tracking-widest mt-1">
                {STEPS[step] === 'date' ? t.reservation.select_date
                : STEPS[step] === 'time' ? t.reservation.select_time
                : STEPS[step] === 'details' ? t.reservation.your_details
                : STEPS[step] === 'confirm' ? 'Confirmar'
                : STEPS[step] === 'success' ? t.reservation.success_title
                : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-kaiso-muted hover:text-kaiso-text text-2xl p-2" data-testid="close-button">×</button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 p-4 border-b border-kaiso-border">
          {STEPS.slice(0, 4).map((_, idx) => (
            <div key={idx} className={`h-1 flex-1 transition-all ${idx <= step ? 'bg-kaiso-gold' : 'bg-kaiso-border'}`} />
          ))}
        </div>

        {/* Hours Notice */}
        <div className="bg-kaiso-card/50 p-4 border-b border-kaiso-border">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-kaiso-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-kaiso-muted leading-relaxed">{t.reservation.hours_notice}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {error ? (
            <div className="bg-kaiso-red/10 border border-kaiso-red/30 text-kaiso-text p-4 mb-6 flex items-center gap-3">
              <Info size={18} className="text-kaiso-red" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Step 1: Date Selection */}
          {STEPS[step] === 'date' ? (
            <div className="flex flex-col items-center" data-testid="step-date">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={dateLocale}
                disabled={[{ before: today }, { after: maxDate }, { dayOfWeek: [1] }]}
                modifiers={{ discount: (date) => [2, 3, 4].includes(date.getDay()) }}
                modifiersClassNames={{ discount: 'discount-day' }}
                className="kaiso-calendar"
              />
              {/* Discount Notice */}
              <div className="mt-6 p-4 border border-kaiso-gold/30 max-w-md">
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="text-kaiso-gold flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-kaiso-muted leading-relaxed">{t.reservation.discount_notice}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Step 2: Time Selection */}
          {(STEPS[step] === 'time' && availability) ? (
            <div data-testid="step-time">
              <div className="text-center mb-8">
                <p className="text-kaiso-gold font-serif text-lg">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: dateLocale })}
                </p>
                {availability.has_discount ? (
                  <span className="inline-block mt-2 text-xs text-kaiso-gold bg-kaiso-gold/10 px-3 py-1">
                    {t.reservation.discount_applied}
                  </span>
                ) : null}
                <p className="text-kaiso-muted text-sm mt-2">{availability.remaining_capacity} {t.reservation.remaining}</p>
              </div>

              {/* Lunch Slots */}
              {(availability.lunch_slots?.length > 0) ? (
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-widest text-kaiso-muted mb-4">{t.reservation.lunch}</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {availability.lunch_slots.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`p-3 border text-center text-sm transition-all ${selectedTime === time ? 'bg-kaiso-gold text-black border-kaiso-gold' : 'border-kaiso-border hover:border-kaiso-gold text-kaiso-text'}`}
                        data-testid={`time-${time.replace(':', '')}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Dinner Slots */}
              {(availability.dinner_slots?.length > 0) ? (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-kaiso-muted mb-4">{t.reservation.dinner}</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {availability.dinner_slots.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeSelect(time)}
                        className={`p-3 border text-center text-sm transition-all ${selectedTime === time ? 'bg-kaiso-gold text-black border-kaiso-gold' : 'border-kaiso-border hover:border-kaiso-gold text-kaiso-text'} ${availability.tasting_slots?.includes(time) ? 'ring-1 ring-kaiso-gold/30' : ''}`}
                        data-testid={`time-${time.replace(':', '')}`}
                      >
                        <span>{time}</span>
                        {availability.tasting_slots?.includes(time) ? <Sparkles size={10} className="inline ml-1 text-kaiso-gold" /> : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Step 3: Details Form */}
          {STEPS[step] === 'details' ? (
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="step-details">
              {/* Summary */}
              <div className="bg-kaiso-card p-4 border border-kaiso-border mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-kaiso-muted">{t.reservation.date}:</span>
                  <span className="text-kaiso-gold">{format(selectedDate, 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-kaiso-muted">{t.reservation.time}:</span>
                  <span className="text-kaiso-gold">{selectedTime}</span>
                </div>
                {availability?.has_discount ? (
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-kaiso-muted">Descuento:</span>
                    <span className="text-kaiso-gold">-10%</span>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-2 block">{t.reservation.guests} *</label>
                  <select
                    name="guests"
                    value={form.guests}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-kaiso-bg border border-kaiso-border p-3 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                    data-testid="input-guests"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-2 block">{t.reservation.phone} *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={form.customer_phone}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-b border-kaiso-border p-3 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                    placeholder="+34 600 000 000"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-2 block">{t.reservation.name} *</label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-transparent border-b border-kaiso-border p-3 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                  data-testid="input-name"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-2 block">{t.reservation.email} *</label>
                <input
                  type="email"
                  name="customer_email"
                  value={form.customer_email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-transparent border-b border-kaiso-border p-3 text-kaiso-text focus:border-kaiso-gold focus:outline-none"
                  data-testid="input-email"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-2 block">{t.reservation.observations}</label>
                <textarea
                  name="observations"
                  value={form.observations}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full bg-transparent border border-kaiso-border p-3 text-kaiso-text focus:border-kaiso-gold focus:outline-none resize-none"
                  data-testid="input-observations"
                />
              </div>

              {/* Tasting Menu Option */}
              {canSelectTasting ? (
                <div className="border border-kaiso-gold/30 p-4 mt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="has_tasting_menu"
                      checked={form.has_tasting_menu}
                      onChange={handleInputChange}
                      className="mt-1 accent-kaiso-gold"
                      data-testid="input-tasting"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-kaiso-gold" />
                        <span className="text-kaiso-gold font-medium">{t.reservation.tasting_title}</span>
                      </div>
                      <p className="text-xs text-kaiso-muted mt-1">{t.reservation.tasting_desc}</p>
                      <p className="text-kaiso-gold text-sm mt-1">{t.reservation.tasting_price}</p>
                      <p className="text-xs text-kaiso-muted mt-1">{t.reservation.tasting_availability}</p>
                    </div>
                  </label>
                  
                  {form.has_tasting_menu ? (
                    <div className="mt-3 pt-3 border-t border-kaiso-border">
                      <label className="text-xs uppercase tracking-widest text-kaiso-muted mb-2 block">{t.reservation.tasting_allergies}</label>
                      <input
                        type="text"
                        name="tasting_allergies"
                        value={form.tasting_allergies}
                        onChange={handleInputChange}
                        className="w-full bg-transparent border-b border-kaiso-border p-2 text-kaiso-text focus:border-kaiso-gold focus:outline-none text-sm"
                        data-testid="input-allergies"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full bg-kaiso-gold text-black py-4 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold-light transition-colors flex items-center justify-center gap-2 mt-6"
                data-testid="continue-button"
              >
                Continuar
                <ArrowRight size={16} />
              </button>
            </form>
          ) : null}

          {/* Step 4: Confirmation */}
          {STEPS[step] === 'confirm' ? (
            <div data-testid="step-confirm">
              <h3 className="font-serif text-xl text-kaiso-gold text-center mb-6">Confirmar Reserva</h3>
              
              <div className="bg-kaiso-card border border-kaiso-border p-6 space-y-4">
                <div className="flex justify-between border-b border-kaiso-border pb-3">
                  <span className="text-kaiso-muted">{t.reservation.name}</span>
                  <span className="text-kaiso-text">{form.customer_name}</span>
                </div>
                <div className="flex justify-between border-b border-kaiso-border pb-3">
                  <span className="text-kaiso-muted">{t.reservation.phone}</span>
                  <span className="text-kaiso-text">{form.customer_phone}</span>
                </div>
                <div className="flex justify-between border-b border-kaiso-border pb-3">
                  <span className="text-kaiso-muted">{t.reservation.date}</span>
                  <span className="text-kaiso-gold">{format(selectedDate, 'dd/MM/yyyy')}</span>
                </div>
                <div className="flex justify-between border-b border-kaiso-border pb-3">
                  <span className="text-kaiso-muted">{t.reservation.time}</span>
                  <span className="text-kaiso-gold">{selectedTime}</span>
                </div>
                <div className="flex justify-between border-b border-kaiso-border pb-3">
                  <span className="text-kaiso-muted">{t.reservation.guests}</span>
                  <span className="text-kaiso-text">{form.guests}</span>
                </div>
                {form.has_tasting_menu ? (
                  <div className="flex justify-between border-b border-kaiso-border pb-3">
                    <span className="text-kaiso-muted">{t.reservation.tasting_title}</span>
                    <span className="text-kaiso-gold">€{(Math.max(1, Math.ceil(form.guests / 2)) * 65.90).toFixed(2)}</span>
                  </div>
                ) : null}
                {availability?.has_discount ? (
                  <div className="flex justify-between">
                    <span className="text-kaiso-muted">Descuento</span>
                    <span className="text-kaiso-gold">{t.reservation.discount_applied}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full bg-kaiso-gold text-black py-4 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="confirm-button"
                >
                  {loading ? 'Procesando...' : (
                    <>
                      <Check size={16} />
                      {t.reservation.confirm}
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {/* Step 5: Success */}
          {(STEPS[step] === 'success' && reservation) ? (
            <div className="text-center" data-testid="step-success">
              <div className="w-16 h-16 border-2 border-kaiso-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-kaiso-gold" />
              </div>
              
              <h3 className="font-serif text-2xl text-kaiso-gold mb-1">{t.reservation.success_title}</h3>
              <p className="text-kaiso-muted text-sm mb-4">{t.reservation.success_message}</p>

              {/* Reservation summary - compact */}
              <div className="bg-kaiso-card border border-kaiso-border p-4 text-left max-w-sm mx-auto mb-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-kaiso-muted text-xs">{t.reservation.date}</p>
                    <p className="text-kaiso-gold text-sm font-bold">{reservation.reservation_date}</p>
                  </div>
                  <div>
                    <p className="text-kaiso-muted text-xs">{t.reservation.time}</p>
                    <p className="text-kaiso-gold text-sm font-bold">{reservation.reservation_time}</p>
                  </div>
                  <div>
                    <p className="text-kaiso-muted text-xs">{t.reservation.guests}</p>
                    <p className="text-kaiso-text text-sm font-bold">{reservation.guests}</p>
                  </div>
                </div>
                <p className="text-kaiso-gold text-xs uppercase tracking-wider text-center mt-3 pt-3 border-t border-kaiso-border">Reserva Confirmada</p>
              </div>

              {/* QR Code - prominent */}
              <div className="bg-kaiso-card border border-kaiso-gold/30 p-4 max-w-sm mx-auto mb-4">
                <p className="text-kaiso-gold font-serif text-base mb-3">10% Descuento Delivery</p>
                <div className="bg-white p-3 mx-auto w-32 h-32 flex items-center justify-center mb-3">
                  <img 
                    src="/assets/qr-delivery.png" 
                    alt="QR Code Delivery"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-kaiso-muted text-xs">
                  {lang === 'es' ? 'Escanea para 10% de descuento en delivery'
                  : lang === 'pt' ? 'Escaneie para 10% de desconto no delivery'
                  : 'Scan for 10% off delivery'}
                </p>
              </div>

              {/* WhatsApp button */}
              <button
                onClick={handleWhatsApp}
                className="bg-kaiso-gold text-black px-6 py-3 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold-light transition-colors inline-flex items-center gap-2 mb-3"
              >
                <WhatsAppIcon size={16} />
                {t.reservation.confirm_whatsapp}
              </button>

              <button
                onClick={onClose}
                className="block mx-auto text-kaiso-muted hover:text-kaiso-gold transition-colors text-xs"
              >
                Cerrar
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
