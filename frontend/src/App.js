import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Menu, X, Globe, MapPin, Clock } from "lucide-react";
import translations from "./lib/translations";
import ReservationSystem from "./components/ReservationSystem";
import AdminPanel from "./components/AdminPanel";
import AnalyticsPanel from "./components/AnalyticsPanel";
import { trackEvent } from "./lib/api";

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

// Language Selector
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
        <Globe size={16} />
        <span className="text-xs uppercase tracking-wider">{lang}</span>
      </button>
      {open ? (
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
      ) : null}
    </div>
  );
};

// Navigation
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
    { key: 'filosofia', href: '#filosofia' },
    { key: 'experiencia', href: '#experiencia' },
    { key: 'carta', href: '#carta' },
    { key: 'ubicacion', href: '#ubicacion' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'bg-kaiso-bg/95 backdrop-blur-md border-b border-kaiso-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <a href="#hero" className="flex items-center">
          <img src="/assets/logo-kaiso.png" alt="Kaisō Sushi" className="h-9 md:h-11 w-auto object-contain" />
        </a>

        <div className="hidden lg:flex items-center gap-10">
          {navItems.map(item => (
            <a
              key={item.key}
              href={item.href}
              className="text-xs uppercase tracking-[0.2em] text-kaiso-muted hover:text-kaiso-gold transition-colors duration-300"
            >
              {t.nav[item.key]}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <LanguageSelector />
          <button
            onClick={onReserve}
            className="hidden md:block border border-kaiso-gold text-kaiso-gold px-6 py-2 text-xs uppercase tracking-[0.2em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
            data-testid="nav-reserve-button"
          >
            {t.nav.reservas}
          </button>
          <button
            className="lg:hidden text-kaiso-muted hover:text-kaiso-text transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="lg:hidden bg-kaiso-bg/98 border-t border-kaiso-border backdrop-blur-md">
          <div className="px-6 py-6 space-y-6">
            {navItems.map(item => (
              <a
                key={item.key}
                href={item.href}
                className="block text-sm uppercase tracking-[0.2em] text-kaiso-muted hover:text-kaiso-gold transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {t.nav[item.key]}
              </a>
            ))}
            <button
              onClick={() => { onReserve(); setMobileOpen(false); }}
              className="block w-full text-left text-sm uppercase tracking-[0.2em] text-kaiso-gold"
            >
              {t.nav.reservas}
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
};

// Hero Section
const HeroSection = ({ onReserve }) => {
  const { t } = useLanguage();
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSubtitleVisible(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
      <div className="absolute inset-0 bg-kaiso-bg">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/assets/salon-kaiso.png')`, opacity: 0.06 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-kaiso-bg/80 via-transparent to-kaiso-bg" />
      </div>

      <div className="relative z-10 text-center px-6 animate-fade-in">
        <img
          src="/assets/logo-kaiso.png"
          alt="Kaisō"
          className="h-20 md:h-28 lg:h-32 w-auto mx-auto mb-10 opacity-95"
        />

        <p className={`text-kaiso-muted text-xs md:text-sm tracking-[0.5em] uppercase mb-14 transition-opacity duration-1000 ${subtitleVisible ? 'opacity-100' : 'opacity-0'}`}>
          {t.hero.subtitle}
        </p>

        <button
          onClick={onReserve}
          className="border border-kaiso-gold text-kaiso-gold px-12 py-4 text-xs uppercase tracking-[0.3em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
          data-testid="hero-reserve-button"
        >
          {t.hero.cta_reservar}
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-[1px] h-16 bg-gradient-to-b from-kaiso-gold/30 to-transparent animate-pulse" />
      </div>
    </section>
  );
};

// Filosofia Section
const FilosofiaSection = () => {
  const { t } = useLanguage();

  return (
    <section id="filosofia" className="py-28 md:py-40 px-6" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-xl mx-auto text-center">
        <p className="text-5xl mb-20" style={{ color: 'rgba(10,10,10,0.10)', fontFamily: 'serif' }}>融</p>

        <div className="space-y-5 mb-14">
          <p className="font-serif text-2xl md:text-3xl leading-snug" style={{ color: '#0A0A0A' }}>
            {t.filosofia.line1}
          </p>
          <p className="font-serif text-2xl md:text-3xl leading-snug" style={{ color: '#0A0A0A' }}>
            {t.filosofia.line2}
          </p>
        </div>

        <div className="w-8 h-[1px] mx-auto mb-14" style={{ backgroundColor: '#C9A24A' }} />

        <div className="space-y-5 text-base leading-relaxed" style={{ color: 'rgba(10,10,10,0.55)' }}>
          <p>{t.filosofia.text1}</p>
          <p>{t.filosofia.text2}</p>
        </div>
      </div>
    </section>
  );
};

// Chef Section
const ChefSection = () => {
  const { t } = useLanguage();

  return (
    <section id="experiencia" className="py-28 md:py-40 px-6 bg-kaiso-bg">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', maxWidth: '440px', margin: '0 auto' }}>
            <img
              src="/assets/chef-kaiso.png"
              alt="Leandro Crispim"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-kaiso-bg/70 to-transparent" />
          </div>

          <div className="md:pl-8">
            <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.chef.label}</span>
            <p className="text-kaiso-gold/30 text-xs tracking-[0.3em] mt-1">料理長</p>
            <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-5 mb-10">
              Leandro Crispim
            </h2>
            <p className="text-kaiso-muted text-lg leading-relaxed mb-5 font-serif italic">
              {t.chef.text1}
            </p>
            <p className="text-kaiso-muted leading-relaxed mb-10">
              {t.chef.text2}
            </p>
            <div className="space-y-4 border-t border-kaiso-border pt-8">
              {t.chef.details.map((detail, i) => (
                <p key={i} className="text-sm text-kaiso-muted flex items-start gap-3">
                  <span className="text-kaiso-gold/50 mt-[2px] shrink-0">—</span>
                  {detail}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Tecnica Section
const TecnicaSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-28 md:py-40 px-6 bg-kaiso-card">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.tecnica.label}</span>
          <p className="text-kaiso-gold/30 text-xs tracking-[0.3em] mt-1">技術</p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-16">
          <div className="md:col-span-2 overflow-hidden relative" style={{ height: '420px' }}>
            <img
              src="/assets/salon-kaiso.png"
              alt="Kaisō"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-kaiso-bg via-kaiso-bg/40 to-transparent">
              <p className="text-kaiso-gold text-[10px] uppercase tracking-[0.3em]">{t.tecnica.caption1}</p>
            </div>
          </div>
          <div className="overflow-hidden relative" style={{ height: '420px' }}>
            <img
              src="/assets/art-kaiso.png"
              alt="Kaisō Craft"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-kaiso-bg via-kaiso-bg/40 to-transparent">
              <p className="text-kaiso-gold text-[10px] uppercase tracking-[0.3em]">{t.tecnica.caption2}</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl">
          <p className="font-serif text-2xl md:text-3xl text-kaiso-text mb-4 leading-snug">
            {t.tecnica.headline}
          </p>
          <p className="text-kaiso-muted">{t.tecnica.subtext}</p>
        </div>
      </div>
    </section>
  );
};

// Editorial Carta Section
const EditorialCartaSection = ({ onReserve }) => {
  const { t } = useLanguage();

  const categories = [
    { key: 'nigiri' },
    { key: 'omakase' },
    { key: 'rolls' },
    { key: 'sake' },
  ];

  return (
    <section id="carta" className="py-28 md:py-40 px-6 bg-kaiso-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.carta_editorial.label}</span>
          <p className="text-kaiso-gold/30 text-xs tracking-[0.3em] mt-1">お品書き</p>
          <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-5">
            {t.carta_editorial.headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 max-w-3xl mx-auto" style={{ gap: '1px', backgroundColor: '#1A1A1A' }}>
          {categories.map((cat) => (
            <div key={cat.key} className="bg-kaiso-bg p-10 md:p-12">
              <p className="text-kaiso-gold/30 text-xl mb-4">〇</p>
              <h3 className="font-serif text-xl text-kaiso-text mb-3">
                {t.carta_editorial[cat.key + '_title']}
              </h3>
              <p className="text-kaiso-muted text-sm leading-relaxed">
                {t.carta_editorial[cat.key + '_desc']}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-kaiso-muted/50 text-sm italic mb-10">
            {t.carta_editorial.note}
          </p>
          <button
            onClick={onReserve}
            className="border border-kaiso-gold text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
          >
            {t.hero.cta_reservar}
          </button>
        </div>
      </div>
    </section>
  );
};

// Location Section
const LocationSection = () => {
  const { lang, t } = useLanguage();

  const hours = {
    es: {
      tue: 'Mar · 20:00–23:30',
      wed_sun_lunch: 'Mié–Dom · 13:30–15:30',
      wed_sun_dinner: 'Mié–Dom · 20:00–23:30',
      closed: 'Lun · Cerrado',
      tagline: 'La mesa no espera. Reserve antes.'
    },
    pt: {
      tue: 'Ter · 20:00–23:30',
      wed_sun_lunch: 'Qua–Dom · 13:30–15:30',
      wed_sun_dinner: 'Qua–Dom · 20:00–23:30',
      closed: 'Seg · Fechado',
      tagline: 'A mesa não espera. Reserve antes.'
    },
    en: {
      tue: 'Tue · 20:00–23:30',
      wed_sun_lunch: 'Wed–Sun · 13:30–15:30',
      wed_sun_dinner: 'Wed–Sun · 20:00–23:30',
      closed: 'Mon · Closed',
      tagline: 'The table does not wait. Reserve ahead.'
    }
  };

  const h = hours[lang] || hours.es;

  const locationLabel = lang === 'pt' ? 'Encontre-nos' : lang === 'en' ? 'Find Us' : 'Encuéntrenos';

  return (
    <section id="ubicacion" className="py-28 md:py-40 px-6 bg-kaiso-card" data-testid="location-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">
            {lang === 'pt' ? 'Localização' : lang === 'en' ? 'Location' : 'Ubicación'}
          </span>
          <p className="text-kaiso-gold/30 text-xs tracking-[0.3em] mt-1">場所</p>
          <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-5">{locationLabel}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="bg-kaiso-bg border border-kaiso-border p-10 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-kaiso-gold/40 to-transparent" />

            <h3 className="font-serif text-2xl text-kaiso-gold mb-8">Kaisō Sushi</h3>

            <div className="space-y-6 text-kaiso-muted">
              <p className="flex items-start gap-3">
                <MapPin size={16} className="text-kaiso-gold mt-1 shrink-0" />
                <span>
                  Av. de Barcelona, 19<br />
                  14010 Córdoba, España
                </span>
              </p>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-kaiso-gold mt-1 shrink-0" />
                <div className="text-sm space-y-2 leading-relaxed">
                  <p>{h.tue}</p>
                  <p>{h.wed_sun_lunch}</p>
                  <p>{h.wed_sun_dinner}</p>
                  <p className="text-kaiso-red mt-2">{h.closed}</p>
                </div>
              </div>

              <a
                href="https://wa.me/34673036835"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-kaiso-gold transition-colors"
              >
                <WhatsAppIcon size={16} className="text-kaiso-gold shrink-0" />
                +34 673 036 835
              </a>
            </div>

            <p className="mt-10 text-kaiso-gold/50 text-xs italic">{h.tagline}</p>
          </div>

          <div className="border border-kaiso-gold/15 overflow-hidden relative" style={{ minHeight: '320px' }}>
            <iframe
              title="Kaisō Sushi Location"
              src="https://maps.google.com/maps?q=Kaiso+Sushi+Av+de+Barcelona+19+Cordoba+Espa%C3%B1a&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '320px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale opacity-75"
            />
            <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-kaiso-gold/40 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-kaiso-gold/40 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-kaiso-bg border-t border-kaiso-border py-16 px-6" data-testid="footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <img src="/assets/logo-kaiso.png" alt="Kaisō" className="h-10 w-auto mb-4 opacity-80 object-contain" />
            <p className="text-kaiso-muted/30 text-xs tracking-[0.3em] mt-3">海藻</p>
            <p className="text-kaiso-muted/50 text-xs mt-4">Córdoba, España</p>
          </div>

          <div>
            <h4 className="text-kaiso-text/60 text-[10px] uppercase tracking-[0.3em] mb-6">{t.footer.contact}</h4>
            <div className="space-y-4">
              <a
                href="https://wa.me/34673036835"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm"
              >
                <WhatsAppIcon size={13} />
                +34 673 036 835
              </a>
              <a
                href="mailto:grupokaiso@yahoo.com"
                className="text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm"
              >
                grupokaiso@yahoo.com
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-kaiso-text/60 text-[10px] uppercase tracking-[0.3em] mb-6">{t.footer.hours_title}</h4>
            <div className="space-y-2 text-sm text-kaiso-muted">
              <p>{t.footer.tue} · 20:00–23:30</p>
              <p>{t.footer.wed_sun} · 13:30–15:30</p>
              <p className="text-kaiso-muted/60">
                {t.footer.wed_sun} · 20:00–23:30
              </p>
              <p className="text-kaiso-red mt-4">{t.footer.closed}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-kaiso-border pt-8 flex justify-between items-center">
          <p className="text-kaiso-muted/25 text-xs">
            © {new Date().getFullYear()} Kaisō Sushi · Córdoba
          </p>
          <Link
            to="/admin"
            className="text-kaiso-muted/15 hover:text-kaiso-gold/40 transition-colors text-xs"
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
  const { lang } = useLanguage();

  useEffect(() => {
    trackEvent({
      event_type: 'page_view',
      page: window.location.pathname,
      referrer: document.referrer || '',
      language: lang,
      screen_width: window.innerWidth
    });
  }, []);

  const handleOpenReservation = () => {
    trackEvent({ event_type: 'reservation_open', page: '/', language: lang, screen_width: window.innerWidth });
    setShowReservation(true);
  };

  return (
    <div className="min-h-screen bg-kaiso-bg text-kaiso-text">
      <Navigation onReserve={handleOpenReservation} />
      <HeroSection onReserve={handleOpenReservation} />
      <FilosofiaSection />
      <ChefSection />
      <TecnicaSection />
      <EditorialCartaSection onReserve={handleOpenReservation} />
      <LocationSection />
      <Footer />

      {showReservation ? (
        <ReservationSystem onClose={() => setShowReservation(false)} />
      ) : null}
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
          <Route path="/analytics" element={<AnalyticsPanel />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
