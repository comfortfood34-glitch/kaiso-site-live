import React, { useState } from 'react';
import { Info, Sparkles, ExternalLink } from 'lucide-react';
import { useLanguage } from '../App';
import { menuCategories, allergenInfo } from '../lib/menuData';

// WhatsApp SVG Icon
const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function MenuSection() {
  const { t, lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('handhelds');
  const [selectedItem, setSelectedItem] = useState(null);

  const activeItems = menuCategories.find(c => c.id === activeCategory)?.items || [];

  const getText = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.es || '';
  };

  const handleWhatsAppOrder = (item) => {
    const message = `Hola Kaisō! Me gustaría pedir:\n\n🍣 ${item.name}\n💰 €${item.price.toFixed(2)}\n\n¿Está disponible para delivery?`;
    window.open(`https://wa.me/34673036835?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section id="carta" className="relative py-24 md:py-32 px-6 bg-kaiso-card" data-testid="menu-section">
      {/* Faint restaurant background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-[3px]"
          style={{ backgroundImage: `url('/assets/salon-kaiso.png')` }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.nav.carta}</span>
          <p className="text-kaiso-gold/50 text-xs tracking-[0.3em] mt-1">お品書き</p>
          <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-4">
            {lang === 'es' ? 'Nuestra Carta' : lang === 'pt' ? 'Nosso Cardápio' : 'Our Menu'}
          </h2>
          <p className="text-kaiso-muted mt-4 max-w-2xl mx-auto">
            {lang === 'es' ? 'Alta cocina japonesa con precios actualizados en tiempo real'
            : lang === 'pt' ? 'Alta cozinha japonesa com preços atualizados em tempo real'
            : 'Japanese haute cuisine with real-time updated prices'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-4 scrollbar-hide">
          {menuCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              data-testid={`menu-tab-${cat.id}`}
              className={`px-4 py-2 whitespace-nowrap text-sm transition-all ${
                activeCategory === cat.id 
                  ? 'bg-kaiso-gold text-black' 
                  : 'border border-kaiso-border text-kaiso-muted hover:border-kaiso-gold'
              }`}
            >
              {getText(cat.name)}
            </button>
          ))}
        </div>

        {/* Category Description */}
        {menuCategories.find(c => c.id === activeCategory)?.description && (
          <p className="text-kaiso-muted text-center mb-8 max-w-2xl mx-auto">
            {getText(menuCategories.find(c => c.id === activeCategory).description)}
          </p>
        )}

        {/* Menu Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeItems.map(item => (
            <div 
              key={item.id}
              data-testid={`menu-item-${item.id}`}
              className="bg-kaiso-bg border border-kaiso-border hover:border-kaiso-gold/50 transition-all group cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${item.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-kaiso-bg via-transparent to-transparent" />
                
                {/* Discount Badge */}
                {item.discount && (
                  <div className="absolute top-3 right-3 bg-kaiso-red text-white text-xs px-2 py-1 font-bold">
                    -{item.discount}%
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-serif text-lg text-kaiso-text mb-1">{item.name}</h3>
                {item.description && (
                  <p className="text-kaiso-muted text-sm mb-3 line-clamp-2">{getText(item.description)}</p>
                )}
                
                {/* Allergens */}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.allergens.map(a => (
                      <span 
                        key={a} 
                        className="text-xs bg-kaiso-card px-2 py-1 text-kaiso-muted"
                        title={allergenInfo[a]?.[lang] || a}
                      >
                        {allergenInfo[a]?.icon || '⚠️'} {allergenInfo[a]?.[lang] || a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-kaiso-gold font-serif text-xl">€{item.price.toFixed(2)}</span>
                    {item.originalPrice && (
                      <span className="text-kaiso-muted text-sm line-through">€{item.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  
                  {/* Two buttons: WhatsApp + Website */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleWhatsAppOrder(item); }}
                      className="bg-kaiso-gold text-black px-3 py-2 text-xs hover:bg-kaiso-gold-light transition-colors flex items-center gap-1"
                      data-testid={`whatsapp-btn-${item.id}`}
                      title="Pedir por WhatsApp"
                    >
                      <WhatsAppIcon size={14} />
                    </button>
                    <a
                      href="https://www.kaisosushi.es/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="border border-kaiso-gold text-kaiso-gold px-3 py-2 text-xs hover:bg-kaiso-gold hover:text-black transition-colors flex items-center gap-1"
                      data-testid={`website-btn-${item.id}`}
                      title="Ver en kaisosushi.es"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Allergen Legend */}
        <div className="mt-12 pt-8 border-t border-kaiso-border">
          <div className="flex items-center gap-2 mb-4">
            <Info size={16} className="text-kaiso-gold" />
            <span className="text-kaiso-muted text-sm uppercase tracking-wider">
              {lang === 'es' ? 'Alérgenos' : lang === 'pt' ? 'Alérgenos' : 'Allergens'}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(allergenInfo).map(([key, value]) => (
              <span key={key} className="text-xs text-kaiso-muted">
                {value.icon} {value[lang]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-kaiso-bg border border-kaiso-border max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            <div 
              className="h-64 bg-cover bg-center"
              style={{ backgroundImage: `url('${selectedItem.image}')` }}
            />
            
            <div className="p-6">
              <h3 className="font-serif text-2xl text-kaiso-gold mb-2">{selectedItem.name}</h3>
              {selectedItem.description && (
                <p className="text-kaiso-muted mb-4">{getText(selectedItem.description)}</p>
              )}
              
              {/* Allergens */}
              {selectedItem.allergens && selectedItem.allergens.length > 0 && (
                <div className="mb-4">
                  <p className="text-kaiso-muted text-xs uppercase tracking-wider mb-2">
                    {lang === 'es' ? 'Alérgenos' : lang === 'pt' ? 'Alérgenos' : 'Allergens'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.allergens.map(a => (
                      <span key={a} className="text-sm bg-kaiso-card px-3 py-1 text-kaiso-text">
                        {allergenInfo[a]?.icon} {allergenInfo[a]?.[lang]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & CTAs */}
              <div className="pt-4 border-t border-kaiso-border">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-kaiso-gold font-serif text-3xl">€{selectedItem.price.toFixed(2)}</span>
                  {selectedItem.originalPrice && (
                    <span className="text-kaiso-muted line-through">€{selectedItem.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleWhatsAppOrder(selectedItem)}
                    className="flex-1 bg-kaiso-gold text-black py-3 hover:bg-kaiso-gold-light transition-colors flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider"
                    data-testid="modal-whatsapp-btn"
                  >
                    <WhatsAppIcon size={16} />
                    {lang === 'es' ? 'Pedir por WhatsApp' : lang === 'pt' ? 'Pedir por WhatsApp' : 'Order via WhatsApp'}
                  </button>
                  <a
                    href="https://www.kaisosushi.es/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-kaiso-gold text-kaiso-gold py-3 px-6 hover:bg-kaiso-gold hover:text-black transition-colors flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider"
                    data-testid="modal-website-btn"
                  >
                    <ExternalLink size={16} />
                    Web
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
