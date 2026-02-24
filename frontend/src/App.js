import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, Link } from "react-router-dom";
import { Menu, X, Globe, Phone, MapPin, Clock, ChevronRight, ExternalLink, Users, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import translations from "./lib/translations";
import ReservationSystem from "./components/ReservationSystem";
import AdminPanel from "./components/AdminPanel";
import MenuSection from "./components/MenuSection";

// Language Context
const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('kaiso_lang') || 'es');
  
  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('kaiso_lang', newLang);
  };
  
  const t = translations[lang];
  
  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Language Selector Component
const LanguageSelector = () => {
  const { lang, changeLang } = useLanguage();
  const [open, setOpen] = useState(false);
  
  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];
  
  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-kaiso-muted hover:text-kaiso-gold transition-colors"
        data-testid="language-selector"
      >
        <Globe size={18} />
        <span className="text-sm uppercase">{lang}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-kaiso-card border border-kaiso-border p-2 min-w-[150px] z-50">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-kaiso-gold/10 transition-colors ${lang === l.code ? 'text-kaiso-gold' : 'text-kaiso-text'}`}
            >
              <span>{l.flag}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Navigation Component
const Navigation = ({ onReserve }) => {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navItems = [
    { key: 'inicio', href: '#hero' },
    { key: 'carta', href: '#carta' },
    { key: 'reservas', href: '#reservas', action: onReserve },
    { key: 'ubicacion', href: '#ubicacion' },
    { key: 'entrega', href: '#entrega' },
    { key: 'contacto', href: '#contacto' },
    { key: 'franquicias', href: 'https://kaiso-group.com/', external: true }
  ];
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-kaiso-bg/95 backdrop-blur-md border-b border-kaiso-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="font-serif text-2xl text-kaiso-gold">Kaisō</a>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map(item => (
            item.external ? (
              <a 
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-kaiso-muted hover:text-kaiso-gold transition-colors flex items-center gap-1"
              >
                {t.nav[item.key]}
                <ExternalLink size={12} />
              </a>
            ) : item.action ? (
              <button
                key={item.key}
                onClick={item.action}
                className="text-sm text-kaiso-muted hover:text-kaiso-gold transition-colors"
              >
                {t.nav[item.key]}
              </button>
            ) : (
              <a 
                key={item.key}
                href={item.href}
                className="text-sm text-kaiso-muted hover:text-kaiso-gold transition-colors"
              >
                {t.nav[item.key]}
              </a>
            )
          ))}
        </div>
        
        {/* Right side */}
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <button 
            onClick={onReserve}
            className="hidden md:block bg-kaiso-gold text-black px-6 py-2 text-xs uppercase tracking-widest font-bold hover:bg-kaiso-gold-light transition-colors"
            data-testid="nav-reserve-button"
          >
            {t.nav.reservas}
          </button>
          <button 
            className="lg:hidden text-kaiso-text"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-kaiso-bg border-t border-kaiso-border">
          <div className="px-6 py-4 space-y-4">
            {navItems.map(item => (
              item.external ? (
                <a 
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-kaiso-text hover:text-kaiso-gold transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t.nav[item.key]}
                </a>
              ) : item.action ? (
                <button
                  key={item.key}
                  onClick={() => { item.action(); setMobileOpen(false); }}
                  className="block w-full text-left text-kaiso-text hover:text-kaiso-gold transition-colors"
                >
                  {t.nav[item.key]}
                </button>
              ) : (
                <a 
                  key={item.key}
                  href={item.href}
                  className="block text-kaiso-text hover:text-kaiso-gold transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {t.nav[item.key]}
                </a>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// Hero Section
const HeroSection = ({ onReserve }) => {
  const { t } = useLanguage();
  
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
      {/* Background - Placeholder para imagem real */}
      <div className="absolute inset-0 bg-kaiso-bg">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url('/assets/hero-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-kaiso-bg via-transparent to-kaiso-bg" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-block mb-8">
          <div className="border border-kaiso-gold/50 px-6 py-2 backdrop-blur-sm">
            <span className="text-kaiso-gold text-[10px] uppercase tracking-[0.3em] font-medium">
              {t.hero.badge}
            </span>
          </div>
        </div>
        
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-kaiso-text mb-6 leading-tight">
          {t.hero.headline}
        </h1>
        
        <p className="text-kaiso-muted text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          {t.hero.subheadline}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onReserve}
            className="bg-kaiso-gold text-black px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-kaiso-gold-light transition-all"
            data-testid="hero-reserve-button"
          >
            {t.hero.cta_reservar}
          </button>
          <a
            href="#carta"
            className="border border-kaiso-gold text-kaiso-gold px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-kaiso-gold hover:text-black transition-all"
          >
            {t.hero.cta_carta}
          </a>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-[1px] h-20 bg-gradient-to-b from-kaiso-gold to-transparent animate-pulse" />
      </div>
    </section>
  );
};

// About/History Section - Grupo Kaisō
const AboutSection = () => {
  const { lang } = useLanguage();
  
  return (
    <section className="py-24 md:py-32 px-6" data-testid="about-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">
              {lang === 'es' ? 'Nuestra Historia' : lang === 'pt' ? 'Nossa História' : 'Our Story'}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-4 mb-8">
              {lang === 'es' ? 'Sushi Sofisticado' : lang === 'pt' ? 'Sushi Sofisticado' : 'Sophisticated Sushi'}
            </h2>
            <p className="text-kaiso-muted leading-relaxed mb-6">
              {lang === 'es' && 'Fundado por Leandro, el Grupo Kaisō nació de la pasión por elevar la gastronomía japonesa a nuevos estándares de excelencia. Cada pieza de sushi es una obra de arte, preparada con técnica rigurosa y los ingredientes más frescos.'}
              {lang === 'pt' && 'Fundado por Leandro, o Grupo Kaisō nasceu da paixão por elevar a gastronomia japonesa a novos padrões de excelência. Cada peça de sushi é uma obra de arte, preparada com técnica rigorosa e os ingredientes mais frescos.'}
              {lang === 'en' && 'Founded by Leandro, Grupo Kaisō was born from the passion to elevate Japanese cuisine to new standards of excellence. Each piece of sushi is a work of art, prepared with rigorous technique and the freshest ingredients.'}
            </p>
            <p className="text-kaiso-muted leading-relaxed">
              {lang === 'es' && 'En nuestro restaurante de Córdoba, ofrecemos una experiencia gastronómica única donde la tradición japonesa se fusiona con la innovación culinaria. El sello Kaisō garantiza calidad premium en cada bocado.'}
              {lang === 'pt' && 'Em nosso restaurante em Córdoba, oferecemos uma experiência gastronômica única onde a tradição japonesa se funde com a inovação culinária. O selo Kaisō garante qualidade premium em cada mordida.'}
              {lang === 'en' && 'In our Córdoba restaurant, we offer a unique gastronomic experience where Japanese tradition merges with culinary innovation. The Kaisō seal guarantees premium quality in every bite.'}
            </p>
          </div>
          <div className="relative">
            {/* Placeholder para imagem real do restaurante */}
            <div 
              className="w-full h-[500px] bg-cover bg-center"
              style={{ backgroundImage: `url('/assets/restaurant-interior.jpg')` }}
            />
            <div className="absolute -bottom-8 -left-8 bg-kaiso-gold p-8">
              <p className="text-black text-xs uppercase tracking-widest">Grupo Kaisō</p>
              <p className="text-black font-serif text-3xl">España</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Menu/Carta Section - Using real data
const CartaSection = () => {
  return <MenuSection />;
};

// Delivery Section
const DeliverySection = () => {
  const { t } = useLanguage();
  
  return (
    <section id="entrega" className="py-24 md:py-32 px-6" data-testid="delivery-section">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.delivery.title}</span>
        <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-4 mb-6">{t.delivery.headline}</h2>
        <p className="text-kaiso-muted text-lg mb-8 max-w-2xl mx-auto">{t.delivery.description}</p>
        
        <a
          href="https://wa.me/34673036835"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-[#128C7E] transition-colors"
        >
          <Phone size={18} />
          {t.delivery.cta}
        </a>
      </div>
    </section>
  );
};

// Franchise Section
const FranchiseSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 md:py-32 px-6 bg-kaiso-card" data-testid="franchise-section">
      <div className="max-w-4xl mx-auto">
        <div className="border border-kaiso-gold/30 p-12 text-center">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.franchise.title}</span>
          <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-4 mb-6">{t.franchise.headline}</h2>
          <p className="text-kaiso-muted text-lg mb-8">{t.franchise.description}</p>
          
          <a
            href="https://kaiso-group.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-kaiso-gold text-kaiso-gold px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold hover:text-black transition-all"
          >
            {t.franchise.cta}
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer id="contacto" className="bg-kaiso-bg border-t border-kaiso-border py-16 px-6" data-testid="footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-3xl text-kaiso-gold mb-4">Kaisō</h3>
            <p className="text-kaiso-muted text-sm">Sushi & Japanese Cuisine</p>
            <p className="text-kaiso-muted text-sm mt-2">Córdoba, España</p>
          </div>
          
          {/* Hours */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-kaiso-text mb-4">{t.footer.hours_title}</h4>
            <div className="space-y-2 text-sm text-kaiso-muted">
              <p><span className="text-kaiso-gold">{t.footer.lunch_label}:</span></p>
              <p>{t.footer.tue_thu}: 12:30–14:30</p>
              <p>{t.footer.fri_sun}: 12:30–15:00</p>
              <p className="mt-3"><span className="text-kaiso-gold">{t.footer.dinner_label}:</span></p>
              <p>{t.footer.tue_thu} / {t.footer.fri_sun}: 19:30–22:00</p>
              <p className="text-kaiso-red mt-3">{t.footer.closed}</p>
            </div>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-kaiso-text mb-4">{t.footer.contact}</h4>
            <div className="space-y-3">
              <a href="tel:+34673036835" className="flex items-center gap-3 text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm">
                <Phone size={14} />
                +34 673 036 835
              </a>
              <a href="mailto:companykaiso@gmail.com" className="flex items-center gap-3 text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm">
                companykaiso@gmail.com
              </a>
            </div>
          </div>
          
          {/* Location */}
          <div id="ubicacion">
            <h4 className="text-xs uppercase tracking-widest text-kaiso-text mb-4">{t.footer.location}</h4>
            <div className="flex items-start gap-3 text-kaiso-muted text-sm">
              <MapPin size={14} className="mt-1 text-kaiso-gold flex-shrink-0" />
              <span>Av. de Barcelona, 19<br />14010 Córdoba, España</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-kaiso-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-kaiso-muted/50 text-xs">
            © 2024 Kaisō Sushi. Todos los derechos reservados.
          </p>
          <Link
            to="/admin"
            className="mt-4 md:mt-0 text-kaiso-muted/30 hover:text-kaiso-gold transition-colors text-xs"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

// Main Home Page
const HomePage = () => {
  const [showReservation, setShowReservation] = useState(false);
  
  return (
    <div className="min-h-screen bg-kaiso-bg text-kaiso-text">
      <Navigation onReserve={() => setShowReservation(true)} />
      <HeroSection onReserve={() => setShowReservation(true)} />
      <CartaSection />
      <DeliverySection />
      <FranchiseSection />
      <Footer />
      
      {showReservation && (
        <ReservationSystem onClose={() => setShowReservation(false)} />
      )}
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
