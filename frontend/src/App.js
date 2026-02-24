import React, { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Calendar, MapPin, Phone, Mail, Instagram, Clock, Settings } from "lucide-react";
import ReservationWizard from "./components/ReservationWizard";
import AdminPanel from "./components/AdminPanel";
import CancelReservation from "./components/CancelReservation";

const Home = () => {
  const [showReservation, setShowReservation] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5]">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070')`,
          }}
        >
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C9A24A] mb-6 animate-fade-in">
            Sushi & Japanese Cuisine
          </p>
          <h1 className="font-serif text-6xl md:text-8xl text-[#E5E5E5] mb-4 animate-fade-in-up">
            Kaisō
          </h1>
          <div className="w-24 h-[1px] bg-[#C9A24A] mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-[#888] mb-12 font-light tracking-wide max-w-xl mx-auto animate-fade-in-up delay-200">
            Una experiencia gastronómica japonesa de alta cocina en el corazón de España
          </p>
          <button
            onClick={() => setShowReservation(true)}
            className="bg-[#C9A24A] text-black px-12 py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#D4AF5F] transition-all duration-300 animate-fade-in-up delay-300"
            data-testid="reserve-button"
          >
            Reservar Mesa
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[1px] h-16 bg-gradient-to-b from-[#C9A24A] to-transparent"></div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 md:py-32 px-6" data-testid="about-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C9A24A] mb-4">Nuestra Filosofía</p>
              <h2 className="font-serif text-4xl md:text-5xl text-[#E5E5E5] mb-8">
                El Arte del<br />Sushi Tradicional
              </h2>
              <p className="text-[#888] leading-relaxed mb-6">
                En Kaisō, cada pieza de sushi es una obra maestra. Nuestros maestros itamae 
                combinan técnicas ancestrales japonesas con los mejores ingredientes frescos, 
                creando una experiencia sensorial única.
              </p>
              <p className="text-[#888] leading-relaxed">
                Desde el arroz perfectamente sazonado hasta el pescado más fresco del día, 
                cada detalle está cuidadosamente orquestado para deleitar su paladar.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=1974"
                alt="Sushi preparation"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-8 -left-8 bg-[#C9A24A] p-8">
                <p className="text-black text-xs uppercase tracking-widest">Desde</p>
                <p className="text-black font-serif text-3xl">2018</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hours & Location */}
      <section className="py-24 md:py-32 px-6 bg-[#121212]" data-testid="info-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C9A24A] mb-4">Visítenos</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#E5E5E5]">
              Horarios & Ubicación
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Lunch */}
            <div className="border border-[#2A2A2A] p-8 text-center hover:border-[#C9A24A]/50 transition-colors" data-testid="lunch-hours">
              <Clock className="mx-auto mb-4 text-[#C9A24A]" size={32} />
              <h3 className="font-serif text-xl text-[#E5E5E5] mb-4">Almuerzo</h3>
              <p className="text-[#888]">Martes - Domingo</p>
              <p className="text-[#C9A24A] font-medium mt-2">12:30 - 15:00</p>
            </div>

            {/* Dinner */}
            <div className="border border-[#2A2A2A] p-8 text-center hover:border-[#C9A24A]/50 transition-colors" data-testid="dinner-hours">
              <Clock className="mx-auto mb-4 text-[#C9A24A]" size={32} />
              <h3 className="font-serif text-xl text-[#E5E5E5] mb-4">Cena</h3>
              <p className="text-[#888]">Martes - Domingo</p>
              <p className="text-[#C9A24A] font-medium mt-2">20:00 - 23:00</p>
            </div>

            {/* Location */}
            <div className="border border-[#2A2A2A] p-8 text-center hover:border-[#C9A24A]/50 transition-colors" data-testid="location-info">
              <MapPin className="mx-auto mb-4 text-[#C9A24A]" size={32} />
              <h3 className="font-serif text-xl text-[#E5E5E5] mb-4">Ubicación</h3>
              <p className="text-[#888]">Calle Principal, 123</p>
              <p className="text-[#888]">28001 Madrid, España</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setShowReservation(true)}
              className="border border-[#C9A24A] text-[#C9A24A] px-12 py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#C9A24A] hover:text-black transition-all duration-300"
              data-testid="reserve-button-secondary"
            >
              Reservar Ahora
            </button>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 md:py-32 px-6" data-testid="gallery-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C9A24A] mb-4">Galería</p>
            <h2 className="font-serif text-4xl md:text-5xl text-[#E5E5E5]">
              Nuestras Creaciones
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1925"
              alt="Sushi roll"
              className="w-full h-64 object-cover hover:opacity-80 transition-opacity"
            />
            <img 
              src="https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?q=80&w=2070"
              alt="Nigiri"
              className="w-full h-64 object-cover hover:opacity-80 transition-opacity"
            />
            <img 
              src="https://images.unsplash.com/photo-1582450871972-ab5ca641643d?q=80&w=1974"
              alt="Sashimi"
              className="w-full h-64 object-cover hover:opacity-80 transition-opacity"
            />
            <img 
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974"
              alt="Japanese dish"
              className="w-full h-64 object-cover hover:opacity-80 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#121212] border-t border-[#2A2A2A] py-16 px-6" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div>
              <h3 className="font-serif text-3xl text-[#C9A24A] mb-4">Kaisō</h3>
              <p className="text-[#888] text-sm">
                Sushi & Japanese Cuisine<br />
                Una experiencia única en Madrid
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#E5E5E5] mb-4">Contacto</h4>
              <div className="space-y-3">
                <a href="tel:+34600000000" className="flex items-center gap-3 text-[#888] hover:text-[#C9A24A] transition-colors text-sm">
                  <Phone size={14} />
                  +34 600 000 000
                </a>
                <a href="mailto:grupokaiso@kaisosushiespanha.com" className="flex items-center gap-3 text-[#888] hover:text-[#C9A24A] transition-colors text-sm">
                  <Mail size={14} />
                  grupokaiso@kaisosushiespanha.com
                </a>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#E5E5E5] mb-4">Horario</h4>
              <div className="space-y-2 text-[#888] text-sm">
                <p>Almuerzo: 12:30 - 15:00</p>
                <p>Cena: 20:00 - 23:00</p>
                <p className="text-[#C9A24A]">Cerrado los Lunes</p>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#E5E5E5] mb-4">Síguenos</h4>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[#888] hover:text-[#C9A24A] transition-colors text-sm">
                <Instagram size={14} />
                @kaisosushi
              </a>
            </div>
          </div>

          <div className="border-t border-[#2A2A2A] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#555] text-xs">
              © 2024 Kaisō Sushi España. Todos los derechos reservados.
            </p>
            <button
              onClick={() => setShowAdmin(true)}
              className="mt-4 md:mt-0 flex items-center gap-2 text-[#555] hover:text-[#C9A24A] transition-colors text-xs"
              data-testid="admin-button"
            >
              <Settings size={14} />
              Admin
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showReservation && (
        <ReservationWizard onClose={() => setShowReservation(false)} />
      )}
      
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cancel/:token" element={<CancelReservation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
