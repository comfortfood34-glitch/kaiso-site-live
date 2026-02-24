import React, { useState } from 'react';
import { Phone, Info, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '../App';
import { menuCategories, allergenInfo } from '../lib/menuData';

export default function MenuSection() {
  const { t, lang } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('favoritos');
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
    <section id="carta" className="py-24 md:py-32 px-6 bg-kaiso-card" data-testid="menu-section">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-kaiso-gold text-xs uppercase tracking-[0.3em]">{t.nav.carta}</span>
          <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text mt-4">
            {lang === 'es' ? 'Nuestra Carta' : lang === 'pt' ? 'Nosso Cardápio' : 'Our Menu'}
          </h2>
          <p className="text-kaiso-muted mt-4 max-w-2xl mx-auto">
            {lang === 'es' && 'Alta cocina japonesa con precios actualizados en tiempo real'}
            {lang === 'pt' && 'Alta cozinha japonesa com preços atualizados em tempo real'}
            {lang === 'en' && 'Japanese haute cuisine with real-time updated prices'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-4 scrollbar-hide">
          {menuCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
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
                  <button
                    onClick={(e) => { e.stopPropagation(); handleWhatsAppOrder(item); }}
                    className="bg-[#25D366] text-white px-3 py-2 text-xs hover:bg-[#128C7E] transition-colors flex items-center gap-1"
                  >
                    <Phone size={12} />
                    Pedir
                  </button>
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

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-kaiso-border">
                <div className="flex items-baseline gap-2">
                  <span className="text-kaiso-gold font-serif text-3xl">€{selectedItem.price.toFixed(2)}</span>
                  {selectedItem.originalPrice && (
                    <span className="text-kaiso-muted line-through">€{selectedItem.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleWhatsAppOrder(selectedItem)}
                  className="bg-[#25D366] text-white px-6 py-3 hover:bg-[#128C7E] transition-colors flex items-center gap-2"
                >
                  <Phone size={16} />
                  {lang === 'es' ? 'Pedir por WhatsApp' : lang === 'pt' ? 'Pedir por WhatsApp' : 'Order via WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
