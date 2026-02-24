import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useNavigate, Link } from "react-router-dom";
import { Menu, X, Globe, MapPin, Clock, ChevronRight, ExternalLink, Users, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import translations from "./lib/translations";
import ReservationSystem from "./components/ReservationSystem";
import AdminPanel from "./components/AdminPanel";
import MenuSection from "./components/MenuSection";

// WhatsApp SVG Icon component
const WhatsAppIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
        <a href="#hero" className="flex items-center">
          <img src="/assets/logo-kaiso.png" alt="Kaisō Sushi" className="h-10 w-auto" />
        </a>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map(item => (
            item.external ? (
              <a 
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-kaiso-gold/80 hover:text-kaiso-gold transition-colors flex items-center gap-1"
              >
                {t.nav[item.key]}
                <ExternalLink size={12} />
              </a>
            ) : item.action ? (
              <button
                key={item.key}
                onClick={item.action}
                className="text-sm text-kaiso-gold/80 hover:text-kaiso-gold transition-colors"
              >
                {t.nav[item.key]}
              </button>
            ) : (
              <a 
                key={item.key}
                href={item.href}
                className="text-sm text-kaiso-gold/80 hover:text-kaiso-gold transition-colors"
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
      {/* Background - Foto real do salão do restaurante */}
      <div className="absolute inset-0 bg-kaiso-bg">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-[2px]"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1756027914396-de5b664b6f02?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHxqYXBhbmVzZSUyMHN1c2hpJTIwcmVzdGF1cmFudCUyMGludGVyaW9yJTIwZGFyayUyMGFtYmllbnR8ZW58MHx8fHwxNzcxOTQ1NjgxfDA&ixlib=rb-4.1.0&q=85')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-kaiso-bg via-kaiso-bg/60 to-kaiso-bg" />
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
        
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-kaiso-text mb-4 leading-tight">
          {t.hero.headline}
        </h1>
        <p className="text-kaiso-gold/60 text-sm tracking-[0.4em] uppercase mb-6">精密と味の出会い</p>
        
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
    <section className="relative py-24 md:py-32 px-6" data-testid="about-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">
              {lang === 'es' ? 'Nuestra Historia' : lang === 'pt' ? 'Nossa História' : 'Our Story'}
            </span>
            <p className="text-kaiso-gold/50 text-xs tracking-[0.3em] mt-1">私たちの物語</p>
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
            {/* Foto real do salão do restaurante - com blur leve */}
            <div 
              className="w-full h-[500px] bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.pexels.com/photos/32722834/pexels-photo-32722834.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')` }}
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
        <p className="text-kaiso-gold/50 text-xs tracking-[0.3em] mt-1">デリバリー</p>
        <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-4 mb-6">{t.delivery.headline}</h2>
        <p className="text-kaiso-muted text-lg mb-8 max-w-2xl mx-auto">{t.delivery.description}</p>
        
        <a
          href="https://wa.me/34673036835"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-kaiso-gold text-black px-8 py-4 uppercase tracking-widest text-xs font-bold hover:bg-kaiso-gold-light transition-colors"
        >
          <WhatsAppIcon size={18} />
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
          <p className="text-kaiso-gold/50 text-xs tracking-[0.3em] mt-1">フランチャイズ</p>
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
            <img src="/assets/logo-kaiso.png" alt="Kaisō Sushi" className="h-12 w-auto mb-4" />
            <p className="text-kaiso-muted text-sm">Sushi & Japanese Cuisine</p>
            <p className="text-kaiso-gold/50 text-xs mt-1">寿司と日本料理</p>
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
              <a href="https://wa.me/34673036835" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm">
                <WhatsAppIcon size={14} />
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
            © {new Date().getFullYear()} Kaisō Sushi España. Todos los derechos reservados.
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
