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
          <img src="/assets/logo-kaiso.png" alt="Kaisō Sushi" className="h-10 md:h-12 w-auto object-contain" />
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
      {/* Background - Foto real do chef Kaisō */}
      <div className="absolute inset-0 bg-kaiso-bg">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-[2px]"
          style={{ backgroundImage: `url('/assets/chef-kaiso.png')` }}
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
  
  const content = {
    es: {
      title: 'Nuestra Historia',
      headline: 'Grupo Kaisō',
      text1: 'El Grupo Kaisō nació en 2011 en Brasil, con una propuesta clara: construir una marca de sushi con identidad fuerte, proceso estructurado y estándar elevado de calidad.',
      text2: 'El crecimiento se consolidó en Portugal, donde el grupo se expandió y validó su modelo de negocio. Tras años de construcción estratégica, la marca fue vendida en 2025.',
      text3: 'La nueva fase comienza en España, bajo el liderazgo de Leandro Crispim, con un proyecto más técnico y autoral. Nuestro concepto se inspira en el estilo tradicional japonés Edomae, con referencia a casas clásicas como Sukiyabashi Jiro.',
      details: ['Sushi madurado por 48 horas', 'Arroz preparado según técnicas tradicionales con hangiri y vinagre rojo (akazu)', 'Control riguroso de temperatura, acidez y textura', 'Proceso refinado lote a lote'],
      slogan: 'Más que servir sushi, entregamos técnica, identidad y experiencia.'
    },
    pt: {
      title: 'Nossa História',
      headline: 'Grupo Kaisō',
      text1: 'O Grupo Kaisō nasceu em 2011, no Brasil, com uma proposta clara: construir uma marca de sushi com identidade forte, processo estruturado e padrão elevado de qualidade.',
      text2: 'O crescimento e consolidação aconteceram em Portugal, onde o grupo expandiu e validou seu modelo de negócio. Após anos de construção estratégica, a marca foi vendida em 2025.',
      text3: 'A nova fase começa na Espanha, sob a liderança de Leandro Crispim, com um projeto mais técnico e autoral. Nosso conceito é inspirado no estilo tradicional japonês Edomae, com referência a casas clássicas como Sukiyabashi Jiro.',
      details: ['Sushi maturado por 48 horas', 'Arroz preparado segundo técnicas tradicionais com hangiri e vinagre vermelho (akazu)', 'Controle rigoroso de temperatura, acidez e textura', 'Processo refinado lote a lote'],
      slogan: 'Mais do que servir sushi, entregamos técnica, identidade e experiência.'
    },
    en: {
      title: 'Our Story',
      headline: 'Grupo Kaisō',
      text1: 'Grupo Kaisō was born in 2011 in Brazil, with a clear mission: building a sushi brand with a strong identity, structured process, and elevated quality standard.',
      text2: 'Growth and consolidation happened in Portugal, where the group expanded and validated its business model. After years of strategic construction, the brand was sold in 2025.',
      text3: 'The new phase begins in Spain, led by Leandro Crispim, with a more technical and authorial project. Our concept is inspired by the traditional Japanese Edomae style, referencing classic establishments like Sukiyabashi Jiro.',
      details: ['Sushi aged for 48 hours', 'Rice prepared with traditional techniques using hangiri and red vinegar (akazu)', 'Rigorous control of temperature, acidity and texture', 'Process refined batch by batch'],
      slogan: 'More than serving sushi, we deliver technique, identity and experience.'
    }
  };
  
  const c = content[lang] || content.es;
  
  return (
    <section className="relative py-24 md:py-32 px-6" data-testid="about-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{c.title}</span>
            <p className="text-kaiso-gold/50 text-xs tracking-[0.3em] mt-1">私たちの物語</p>
            <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-4 mb-8">{c.headline}</h2>
            <p className="text-kaiso-muted leading-relaxed mb-4">{c.text1}</p>
            <p className="text-kaiso-muted leading-relaxed mb-4">{c.text2}</p>
            <p className="text-kaiso-muted leading-relaxed mb-6">{c.text3}</p>
            <ul className="space-y-2 mb-6">
              {c.details.map((d, i) => (
                <li key={i} className="text-kaiso-muted text-sm flex items-start gap-2">
                  <span className="text-kaiso-gold mt-1">&#8212;</span> {d}
                </li>
              ))}
            </ul>
            <p className="text-kaiso-gold font-serif text-lg italic">{c.slogan}</p>
          </div>
          <div className="space-y-4">
            <div className="relative h-[300px] overflow-hidden">
              <img src="/assets/salon-kaiso.png" alt="Kaisō Restaurant" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[200px] overflow-hidden">
                <img src="/assets/chef-kaiso.png" alt="Chef Kaisō" className="w-full h-full object-cover" />
              </div>
              <div className="h-[200px] overflow-hidden">
                <img src="/assets/art-kaiso.png" alt="Kaisō Art" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Location / Map Section
const LocationSection = () => {
  const { lang } = useLanguage();
  
  return (
    <section id="ubicacion" className="py-24 md:py-32 px-6 bg-kaiso-card" data-testid="location-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">
            {lang === 'es' ? 'Ubicación' : lang === 'pt' ? 'Localização' : 'Location'}
          </span>
          <p className="text-kaiso-gold/50 text-xs tracking-[0.3em] mt-1">場所</p>
          <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-4">
            {lang === 'es' ? 'Encuéntrenos' : lang === 'pt' ? 'Encontre-nos' : 'Find Us'}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="bg-kaiso-bg border border-kaiso-border p-8 flex flex-col justify-center">
            <h3 className="font-serif text-2xl text-kaiso-gold mb-6">Kaisō Sushi</h3>
            <div className="space-y-4 text-kaiso-muted">
              <p className="flex items-start gap-3">
                <MapPin size={18} className="text-kaiso-gold mt-1 shrink-0" />
                Av. de Barcelona, 19, 14010 Córdoba, España
              </p>
              <p className="flex items-start gap-3">
                <Clock size={18} className="text-kaiso-gold mt-1 shrink-0" />
                <span>
                  {lang === 'es' ? 'Mar–Jue: 12:30–14:30, 19:30–22:00' : lang === 'pt' ? 'Ter–Qui: 12:30–14:30, 19:30–22:00' : 'Tue–Thu: 12:30–14:30, 19:30–22:00'}<br/>
                  {lang === 'es' ? 'Vie–Dom: 12:30–15:00, 19:30–22:00' : lang === 'pt' ? 'Sex–Dom: 12:30–15:00, 19:30–22:00' : 'Fri–Sun: 12:30–15:00, 19:30–22:00'}<br/>
                  <span className="text-kaiso-red">{lang === 'es' ? 'Lunes cerrado' : lang === 'pt' ? 'Segunda fechado' : 'Monday closed'}</span>
                </span>
              </p>
              <p className="flex items-center gap-3">
                <Calendar size={18} className="text-kaiso-gold shrink-0" />
                +34 673 036 835
              </p>
            </div>
          </div>
          <div className="h-[350px] md:h-auto min-h-[300px]">
            <iframe
              title="Kaisō Sushi Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3149.5!2d-4.7885!3d37.8882!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDUzJzE3LjUiTiA0wrA0NyczMS4wIlc!5e0!3m2!1ses!2ses!4v1!5m2!1ses!2ses&q=Av.+de+Barcelona,+19,+14010+Córdoba,+España"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale"
            />
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
            <img src="/assets/logo-kaiso.png" alt="Kaisō Sushi" className="h-14 w-auto mb-4 object-contain" />
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
              <a href="mailto:grupokaiso@yahoo.com" className="flex items-center gap-3 text-kaiso-muted hover:text-kaiso-gold transition-colors text-sm">
                grupokaiso@yahoo.com
              </a>
            </div>
          </div>
          
          {/* Location */}
          <div>
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
      <AboutSection />
      <CartaSection />
      <DeliverySection />
      <FranchiseSection />
      <LocationSection />
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
