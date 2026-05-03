import React from 'react';

export default function BuffetPromoSection({ onReserve }) {
  return (
    <section id="buffet-promo" className="relative py-20 md:py-28 px-6 bg-kaiso-bg overflow-hidden">
      {/* Faint art background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/art-kaiso.png')" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── TEXT SIDE ── */}
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="border border-kaiso-gold text-kaiso-gold text-[10px] uppercase tracking-[0.25em] px-3 py-1">
                MIÉRCOLES
              </span>
              <span className="bg-kaiso-gold text-black text-[10px] uppercase tracking-[0.25em] px-3 py-1 font-bold">
                BUFFET LIBRE
              </span>
            </div>

            {/* Japanese overline */}
            <p className="text-kaiso-gold/40 text-xs tracking-[0.3em] mb-3">ビュッフェ体験</p>

            {/* Title */}
            <h2 className="font-serif text-4xl md:text-5xl text-kaiso-text leading-tight mb-3">
              Buffet Libre Premium
              <br />
              <span className="text-kaiso-gold">Kaisō</span>
            </h2>

            {/* Subtitle */}
            <p className="text-kaiso-muted text-sm uppercase tracking-[0.2em] mb-8">
              Todos los miércoles
            </p>

            {/* Price block */}
            <div className="mb-8 border-l-2 border-kaiso-gold pl-6">
              <div className="flex items-baseline gap-4 mb-1">
                <span className="text-kaiso-muted text-base line-through">44,90 €</span>
                <span className="font-serif text-5xl md:text-6xl text-kaiso-gold leading-none">
                  19,99 €
                </span>
              </div>
              <p className="text-kaiso-muted/60 text-xs uppercase tracking-[0.15em]">por persona</p>
            </div>

            {/* Description */}
            <p className="text-kaiso-muted leading-relaxed mb-4">
              Disfruta una experiencia japonesa premium con variedad de sushi, piezas especiales
              y sabores exclusivos de Kaisō.
            </p>

            {/* Fine print */}
            <p className="text-kaiso-muted/50 text-xs mb-8 leading-relaxed">
              Oferta válida solo los miércoles. Plazas limitadas.
              Recomendamos reservar con antelación.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onReserve}
                className="bg-kaiso-gold text-black px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-kaiso-gold-light transition-all"
              >
                Reservar mesa
              </button>
              <a
                href="#carta"
                className="border border-kaiso-gold text-kaiso-gold px-8 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-kaiso-gold hover:text-black transition-all text-center"
              >
                Ver carta
              </a>
            </div>
          </div>

          {/* ── IMAGE SIDE ── */}
          <div className="relative">
            {/* Corner accents */}
            <div className="absolute -top-3 -right-3 w-12 h-12 border-t border-r border-kaiso-gold/40 pointer-events-none z-10" />
            <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b border-l border-kaiso-gold/40 pointer-events-none z-10" />

            {/* Image */}
            {/* NOTE: using salon-kaiso.png — replace with a dedicated buffet/rodizio image when available */}
            <div className="relative overflow-hidden">
              <img
                src="/assets/salon-kaiso.png"
                alt="Buffet Libre Premium Kaisō — ambiente do salão"
                className="w-full h-[400px] md:h-[520px] object-cover"
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-kaiso-bg/60 via-transparent to-transparent" />

              {/* Price overlay card on image */}
              <div className="absolute bottom-6 left-6 bg-kaiso-bg/90 border border-kaiso-gold/25 backdrop-blur-sm p-4">
                <p className="text-kaiso-gold/60 text-[10px] uppercase tracking-[0.2em] mb-1">
                  Todos los miércoles
                </p>
                <p className="font-serif text-3xl text-kaiso-gold leading-none mb-1">19,99 €</p>
                <p className="text-kaiso-muted text-xs">por persona · Buffet Libre</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
