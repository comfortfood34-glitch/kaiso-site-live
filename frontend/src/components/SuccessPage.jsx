import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, Calendar, Clock, Users, Home, Utensils, Mail } from 'lucide-react';

export default function SuccessPage({ reservation, onClose }) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto"
      data-testid="success-page"
    >
      {/* Hero Background */}
      <div className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=2127')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
          {/* Success Icon */}
          <div className="mb-8 animate-scale-in">
            <div className="w-24 h-24 border-2 border-[#C9A24A] rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Check size={48} className="text-[#C9A24A]" strokeWidth={2} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-12 animate-fade-in-up">
            <p className="text-xs uppercase tracking-[0.3em] text-[#C9A24A] mb-4">Kaisō Sushi España</p>
            <h1 className="font-serif text-4xl md:text-6xl text-[#E5E5E5] mb-4">
              ¡Reserva Confirmada!
            </h1>
            <div className="w-24 h-[1px] bg-[#C9A24A] mx-auto"></div>
          </div>

          {/* Email Notification */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Mail size={18} className="text-[#C9A24A]" />
            <p className="text-[#888] text-sm">
              Hemos enviado una confirmación a <span className="text-[#C9A24A]">{reservation.customer_email}</span>
            </p>
          </div>

          {/* Reservation Details Card */}
          <div 
            className="w-full max-w-md bg-black/60 backdrop-blur-md border border-[#C9A24A]/30 p-8 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
            data-testid="reservation-details-card"
          >
            <h2 className="font-serif text-xl text-[#C9A24A] text-center mb-6">Detalles de su Reserva</h2>
            
            <div className="space-y-6">
              {/* Date */}
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-[#C9A24A]" />
                  <span className="text-[#888] text-sm uppercase tracking-wider">Fecha</span>
                </div>
                <span className="text-[#C9A24A] font-serif text-lg" data-testid="success-date">
                  {reservation.reservation_date}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-[#C9A24A]" />
                  <span className="text-[#888] text-sm uppercase tracking-wider">Hora</span>
                </div>
                <span className="text-[#C9A24A] font-serif text-lg" data-testid="success-time">
                  {reservation.reservation_time}
                </span>
              </div>

              {/* Guests */}
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-[#C9A24A]" />
                  <span className="text-[#888] text-sm uppercase tracking-wider">Personas</span>
                </div>
                <span className="text-[#C9A24A] font-serif text-lg" data-testid="success-guests">
                  {reservation.guests}
                </span>
              </div>

              {/* Name */}
              <div className="flex items-center justify-between">
                <span className="text-[#888] text-sm uppercase tracking-wider">A nombre de</span>
                <span className="text-[#E5E5E5] font-medium" data-testid="success-name">
                  {reservation.customer_name}
                </span>
              </div>
            </div>

            {/* Reservation ID */}
            <div className="mt-6 pt-4 border-t border-[#2A2A2A] text-center">
              <p className="text-[#555] text-xs uppercase tracking-wider">ID de Reserva</p>
              <p className="text-[#888] text-sm mt-1 font-mono">{reservation.id}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 mt-12 animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-3 bg-[#C9A24A] text-black px-10 py-5 uppercase tracking-[0.15em] text-xs font-bold hover:bg-[#D4AF5F] transition-all duration-300"
              data-testid="back-home-button"
            >
              <Home size={16} />
              Volver al Inicio
            </button>
            
            <a
              href="#menu"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                // Scroll to menu section after closing
                setTimeout(() => {
                  const menuSection = document.querySelector('[data-testid="gallery-section"]');
                  if (menuSection) {
                    menuSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              className="flex items-center justify-center gap-3 bg-transparent border border-[#C9A24A] text-[#C9A24A] px-10 py-5 uppercase tracking-[0.15em] text-xs font-bold hover:bg-[#C9A24A] hover:text-black transition-all duration-300"
              data-testid="view-menu-button"
            >
              <Utensils size={16} />
              Ver Nuestro Menú
            </a>
          </div>

          {/* Footer Message */}
          <div 
            className="mt-16 text-center animate-fade-in-up"
            style={{ animationDelay: '0.7s' }}
          >
            <p className="text-[#888] text-sm mb-2">¿Necesita modificar su reserva?</p>
            <p className="text-[#555] text-xs">
              Revise el email de confirmación o contáctenos al{' '}
              <a href="tel:+34600000000" className="text-[#C9A24A] hover:underline">+34 600 000 000</a>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"></div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
