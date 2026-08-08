import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Menu, X, Globe, MapPin, Clock } from "lucide-react";
import translations from "./lib/translations";
import ReservationSystem from "./components/ReservationSystem";
import AdminPanel from "./components/AdminPanel";
import AnalyticsPanel from "./components/AnalyticsPanel";
import ErrorBoundary from "./components/ErrorBoundary";
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
const HeroSection = ({ onReserve, onMenuClick }) => {
  const { t } = useLanguage();
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSubtitleVisible(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsApp = () => {
    window.open('https://wa.me/34673036835', '_blank', 'noopener,noreferrer');
  };

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

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-kaiso-text mb-6 leading-tight">
          {t.hero.headline}
        </h1>

        <p className={`text-kaiso-muted text-sm md:text-base leading-relaxed mb-8 max-w-2xl mx-auto transition-opacity duration-1000 ${subtitleVisible ? 'opacity-100' : 'opacity-0'}`}>
          {t.hero.subtitle}
        </p>

        <p className="text-kaiso-gold/70 text-xs md:text-sm tracking-[0.2em] uppercase mb-12">
          {t.hero.location}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={onReserve}
            className="border border-kaiso-gold text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
            data-testid="hero-reserve-button"
          >
            {t.hero.cta_reservar}
          </button>
          <button
            onClick={onMenuClick}
            className="border border-kaiso-gold/50 text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:border-kaiso-gold hover:bg-kaiso-gold/10 transition-all duration-300"
          >
            {t.hero.cta_menu}
          </button>
          <button
            onClick={handleWhatsApp}
            className="border border-kaiso-gold/50 text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:border-kaiso-gold hover:bg-kaiso-gold/10 transition-all duration-300"
          >
            {t.hero.cta_whatsapp}
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="w-[1px] h-16 bg-gradient-to-b from-kaiso-gold/30 to-transparent animate-pulse" />
      </div>
    </section>
  );
};

// Presentación Kaiso Section
const PresentacionKaisoSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-28 md:py-40 px-6 bg-kaiso-bg">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">Kaisō Sushi Córdoba</span>
        <h2 className="font-serif text-3xl md:text-4xl text-kaiso-text mt-5 mb-8">
          Presentación
        </h2>
        <p className="text-kaiso-muted text-base leading-relaxed">
          Bienvenido a Kaisō Sushi Córdoba. Un espacio donde la técnica japonesa, la creatividad y la pasión por la gastronomía se reúnen en cada pieza preparada al momento.
        </p>
      </div>
    </section>
  );
};

// Historia Section
const HistoriaSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-28 md:py-40 px-6" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.historia.label}</span>
        <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mt-5 mb-10">
          {t.historia.headline}
        </h2>
        <p className="text-gray-700 text-base leading-relaxed mb-8 whitespace-pre-wrap">
          {t.historia.text}
        </p>
        <div className="w-8 h-[1px] mx-auto mb-8" style={{ backgroundColor: '#C9A24A' }} />
        <p className="text-kaiso-gold text-sm uppercase tracking-[0.2em]">
          {t.historia.countries}
        </p>
      </div>
    </section>
  );
};

// Aniversario Section
const AniversarioSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-28 md:py-40 px-6 bg-kaiso-bg">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">Agosto 2026</span>
        <h2 className="font-serif text-3xl md:text-4xl text-kaiso-text mt-5 mb-8">
          {t.aniversario.headline}
        </h2>
        <p className="text-kaiso-muted text-base leading-relaxed mb-10">
          {t.aniversario.text}
        </p>
        <p className="text-kaiso-gold/70 text-sm italic">
          {t.aniversario.tagline}
        </p>
      </div>
    </section>
  );
};

// Chef Section
const ChefSection = () => {
  const { t } = useLanguage();

  return (
    <section id="experiencia" className="py-28 md:py-40 px-6" style={{ backgroundColor: '#F5F0E8' }}>
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
            <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mt-5 mb-8">
              Leandro Crispim
            </h2>
            <p className="text-gray-700 text-base leading-relaxed mb-6">
              {t.chef.text1}
            </p>
            <p className="text-gray-700 text-base leading-relaxed mb-10">
              {t.chef.text2}
            </p>
            <div className="space-y-4 border-t border-kaiso-border pt-8">
              {t.chef.details.map((detail, i) => (
                <p key={i} className="text-sm text-gray-700 flex items-start gap-3">
                  <span className="text-kaiso-gold/50 mt-[2px] shrink-0">—</span>
                  {detail}
                </p>
              ))}
            </div>
            <p className="text-kaiso-gold text-xs uppercase tracking-[0.2em] mt-8">
              {t.chef.complement}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Tecnica Section
const TecnicaSection = ({ onMenuClick }) => {
  const { t } = useLanguage();

  return (
    <section className="py-28 md:py-40 px-6 bg-kaiso-bg">
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

        <div className="max-w-3xl mb-10">
          <p className="text-base leading-relaxed text-kaiso-muted mb-6">
            {t.tecnica.headline}
          </p>
          <p className="text-kaiso-muted/70 text-sm">{t.tecnica.subtext}</p>
        </div>

        <button
          onClick={onMenuClick}
          className="border border-kaiso-gold text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
        >
          {t.tecnica.cta_menu}
        </button>
      </div>
    </section>
  );
};

// Diferenciales Section
const DiferencialesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-28 md:py-40 px-6" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.diferenciales.label}</span>
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mt-5 mb-4">
            {t.diferenciales.headline}
          </h2>
          <p className="text-gray-700 text-sm italic">
            {t.diferenciales.tagline}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {t.diferenciales.items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <span className="text-kaiso-gold text-lg shrink-0">◆</span>
              <p className="text-gray-700 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Buffet Section
const BuffetSection = ({ onReserve, onMenuClick }) => {
  const { t } = useLanguage();

  return (
    <section className="py-28 md:py-40 px-6 bg-kaiso-bg">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.buffet.label}</span>
        <h2 className="font-serif text-3xl md:text-4xl text-kaiso-text mt-5 mb-8">
          {t.buffet.headline}
        </h2>
        <p className="text-kaiso-muted text-base leading-relaxed mb-6">
          {t.buffet.text}
        </p>
        <p className="text-kaiso-muted/70 text-sm italic mb-10">
          {t.buffet.availability}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onMenuClick}
            className="border border-kaiso-gold text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
          >
            {t.buffet.cta_menu}
          </button>
          <button
            onClick={onReserve}
            className="border border-kaiso-gold text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
          >
            {t.buffet.cta_reserve}
          </button>
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

  const handleMenuClick = () => {
    window.open('https://kaisosushicordoba.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="carta" className="py-28 md:py-40 px-6 bg-kaiso-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.carta_editorial.label}</span>
          <p className="text-kaiso-gold/30 text-xs tracking-[0.3em] mt-1">お品書き</p>
          <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-5 mb-6">
            {t.carta_editorial.headline}
          </h2>
          <p className="text-kaiso-muted text-base leading-relaxed max-w-2xl mx-auto">
            {t.carta_editorial.intro}
          </p>
        </div>

        <div className="grid md:grid-cols-2 max-w-3xl mx-auto mb-16" style={{ gap: '1px', backgroundColor: '#1A1A1A' }}>
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

        <div className="text-center">
          <p className="text-kaiso-muted/50 text-sm italic mb-10">
            {t.carta_editorial.note}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleMenuClick}
              className="border border-kaiso-gold text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
              aria-label={t.carta_editorial.cta_menu}
            >
              {t.carta_editorial.cta_menu}
            </button>
            <button
              onClick={onReserve}
              className="border border-kaiso-gold text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
              aria-label={t.carta_editorial.cta_reserve}
            >
              {t.carta_editorial.cta_reserve}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Institutional Section
const InstitutionalSection = ({ onMenuClick }) => {
  const { t } = useLanguage();

  const pillars = [
    { key: 'pillar1' },
    { key: 'pillar2' },
    { key: 'pillar3' },
  ];

  return (
    <section className="py-28 md:py-40 px-6 bg-kaiso-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.institutional.label}</span>
          <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-5 mb-10">
            {t.institutional.headline}
          </h2>
          <p className="text-kaiso-muted text-base leading-relaxed max-w-2xl mx-auto mb-4">
            {t.institutional.desc1}
          </p>
          <p className="text-kaiso-muted text-base leading-relaxed max-w-2xl mx-auto">
            {t.institutional.desc2}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="text-center">
              <p className="text-kaiso-gold/30 text-2xl mb-4">◆</p>
              <h3 className="font-serif text-lg text-kaiso-text">
                {t.institutional[pillar.key]}
              </h3>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onMenuClick}
            className="border border-kaiso-gold text-kaiso-gold px-10 py-3 text-xs uppercase tracking-[0.3em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
            aria-label={t.institutional.cta}
          >
            {t.institutional.cta}
          </button>
        </div>
      </div>
    </section>
  );
};

// Reviews Section

// Location Section
const LocationSection = () => {
  const { lang, t } = useLanguage();

  const hours = {
    es: {
      monday: 'Lun · Cerrado',
      tuesday: 'Mar · 20:00–23:00',
      wed_sun_lunch: 'Mié–Dom · 13:30–15:00',
      wed_sun_dinner: 'Mié–Dom · 20:00–23:00',
      closed: 'Lun · Cerrado',
      tagline: 'La mesa no espera. Reserve antes.'
    },
    pt: {
      monday: 'Seg · Fechado',
      tuesday: 'Ter · 20:00–23:00',
      wed_sun_lunch: 'Qua–Dom · 13:30–15:00',
      wed_sun_dinner: 'Qua–Dom · 20:00–23:00',
      closed: 'Seg · Fechado',
      tagline: 'A mesa não espera. Reserve antes.'
    },
    en: {
      monday: 'Mon · Closed',
      tuesday: 'Tue · 20:00–23:00',
      wed_sun_lunch: 'Wed–Sun · 13:30–15:00',
      wed_sun_dinner: 'Wed–Sun · 20:00–23:00',
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
                  <p>{h.monday}</p>
                  <p>{h.tuesday}</p>
                  <p>{h.wed_sun_lunch}</p>
                  <p>{h.wed_sun_dinner}</p>
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

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=37.887392,-4.763649"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 px-4 py-3 bg-kaiso-gold/10 border border-kaiso-gold/30 hover:bg-kaiso-gold/20 transition-colors text-kaiso-gold text-sm font-medium rounded"
              >
                <MapPin size={16} />
                {lang === 'pt' ? 'Como chegar' : lang === 'en' ? 'Get directions' : 'Cómo llegar'}
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
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <img src="/assets/logo-kaiso.png" alt="Kaisō" className="h-10 w-auto mb-4 opacity-80 object-contain" />
            <p className="text-kaiso-muted/30 text-xs tracking-[0.3em] mt-3">海藻</p>
            <p className="text-kaiso-muted/50 text-xs mt-4">
              Kaisō Sushi Córdoba<br/>
              Av. de Barcelona, 19<br/>
              14010 Córdoba, España
            </p>
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
              <p>{t.footer.closed}</p>
              <p>{t.footer.tue} · {t.footer.hours_tuesday}</p>
              <p>{t.footer.wed_sun} · {t.footer.hours_wed_sun_lunch}</p>
              <p className="text-kaiso-muted/60">
                {t.footer.wed_sun} · {t.footer.hours_wed_sun_dinner}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-kaiso-text/60 text-[10px] uppercase tracking-[0.3em] mb-6">{t.footer.location}</h4>
            <div className="space-y-3 text-sm text-kaiso-muted">
              <a
                href="https://kaisosushicordoba.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-kaiso-gold transition-colors"
                aria-label={t.footer.digital_menu}
              >
                {t.footer.digital_menu}
              </a>
              <a
                href="https://reservas.kaisosushi.es/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-kaiso-gold transition-colors"
              >
                Reservas
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-kaiso-border pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 text-sm text-kaiso-muted">
            <div>
              <h5 className="text-kaiso-text/60 text-[10px] uppercase tracking-[0.3em] mb-3">{t.footer.company_info}</h5>
              <div className="space-y-2 text-xs text-kaiso-muted/70">
                <p>Kaisō Sushi Córdoba</p>
                <p>Av. de Barcelona, 19, 14010 Córdoba</p>
                <p>+34 673 036 835</p>
              </div>
            </div>
            <div>
              <h5 className="text-kaiso-text/60 text-[10px] uppercase tracking-[0.3em] mb-3">Políticas</h5>
              <div className="space-y-2 text-xs">
                <a href="#" className="text-kaiso-muted/70 hover:text-kaiso-gold transition-colors">{t.footer.privacy_policy}</a>
                <br/>
                <a href="#" className="text-kaiso-muted/70 hover:text-kaiso-gold transition-colors">{t.footer.cookies_policy}</a>
                <br/>
                <a href="#" className="text-kaiso-muted/70 hover:text-kaiso-gold transition-colors">{t.footer.terms}</a>
                <br/>
                <a href="#" className="text-kaiso-muted/70 hover:text-kaiso-gold transition-colors">{t.footer.cancellation_policy}</a>
              </div>
            </div>
            <div>
              <h5 className="text-kaiso-text/60 text-[10px] uppercase tracking-[0.3em] mb-3">{t.footer.followus}</h5>
              <div className="space-y-2 text-xs">
                <a href="#" className="text-kaiso-muted/70 hover:text-kaiso-gold transition-colors">Instagram</a>
                <br/>
                <a href="#" className="text-kaiso-muted/70 hover:text-kaiso-gold transition-colors">Facebook</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-kaiso-border pt-8 flex justify-between items-center">
          <p className="text-kaiso-muted/25 text-xs">
            {t.footer.copyright}
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

// Bottom Menu Bar (Mobile)
const BottomMenuBar = ({ onMenuClick, onReserve, showReservation }) => {
  const { t } = useLanguage();

  if (showReservation) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 lg:hidden bg-kaiso-bg border-t border-kaiso-border py-4 px-6 flex gap-3"
      style={{
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        zIndex: 30,
      }}
    >
      <button
        onClick={onMenuClick}
        className="flex-1 border border-kaiso-gold/50 text-kaiso-gold px-4 py-3 text-xs uppercase tracking-[0.2em] hover:bg-kaiso-gold/10 transition-all duration-300"
        aria-label={t.carta_editorial.cta_menu}
      >
        {t.carta_editorial.cta_menu}
      </button>
      <button
        onClick={onReserve}
        className="flex-1 border border-kaiso-gold text-kaiso-gold px-4 py-3 text-xs uppercase tracking-[0.2em] hover:bg-kaiso-gold hover:text-black transition-all duration-300"
        aria-label={t.carta_editorial.cta_reserve}
      >
        {t.carta_editorial.cta_reserve}
      </button>
    </div>
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
  }, [lang]);

  const handleOpenReservation = () => {
    trackEvent({ event_type: 'reservation_open', page: '/', language: lang, screen_width: window.innerWidth });
    setShowReservation(true);
  };

  const handleMenuClick = () => {
    window.open('https://kaisosushicordoba.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-kaiso-bg text-kaiso-text pb-20 lg:pb-0">
      <Navigation onReserve={handleOpenReservation} />
      <HeroSection onReserve={handleOpenReservation} onMenuClick={handleMenuClick} />
      <PresentacionKaisoSection />
      <HistoriaSection />
      <AniversarioSection />
      <DiferencialesSection />
      <BuffetSection onReserve={handleOpenReservation} onMenuClick={handleMenuClick} />
      <ChefSection />
      <TecnicaSection onMenuClick={handleMenuClick} />
      <EditorialCartaSection onReserve={handleOpenReservation} />
      <InstitutionalSection onMenuClick={handleMenuClick} />
      <LocationSection />
      <Footer />

      <BottomMenuBar
        onMenuClick={handleMenuClick}
        onReserve={handleOpenReservation}
        showReservation={showReservation}
      />

      {showReservation ? (
        <ReservationSystem onClose={() => setShowReservation(false)} />
      ) : null}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/analytics" element={<AnalyticsPanel />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
