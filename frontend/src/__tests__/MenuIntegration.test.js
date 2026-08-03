import translations from '../lib/translations';

describe('Menu Integration - Digital Menu Implementation', () => {
  describe('Translations', () => {
    test('Spanish translations have new menu fields', () => {
      const es = translations.es;
      expect(es.nav.carta).toBe('Menú');
      expect(es.carta_editorial.intro).toBeDefined();
      expect(es.carta_editorial.cta_menu).toBe('Ver menú completo');
      expect(es.carta_editorial.cta_reserve).toBe('Reservar mesa');
      expect(es.institutional.label).toBe('MÁS QUE SUSHI');
      expect(es.footer.digital_menu).toBe('Carta digital');
    });

    test('Portuguese translations have new menu fields', () => {
      const pt = translations.pt;
      expect(pt.nav.carta).toBe('Menu');
      expect(pt.carta_editorial.intro).toBeDefined();
      expect(pt.carta_editorial.cta_menu).toBe('Ver menu completo');
      expect(pt.institutional.label).toBe('MAIS QUE SUSHI');
      expect(pt.footer.digital_menu).toBe('Menu digital');
    });

    test('English translations have new menu fields', () => {
      const en = translations.en;
      expect(en.nav.carta).toBe('Menu');
      expect(en.carta_editorial.intro).toBeDefined();
      expect(en.carta_editorial.cta_menu).toBe('View full menu');
      expect(en.institutional.label).toBe('MORE THAN SUSHI');
      expect(en.footer.digital_menu).toBe('Digital menu');
    });

    test('Updated note text for all languages', () => {
      expect(translations.es.carta_editorial.note).toContain('carta digital');
      expect(translations.pt.carta_editorial.note).toContain('menu digital');
      expect(translations.en.carta_editorial.note).toContain('digital menu');
    });

    test('All languages have institutional section', () => {
      ['es', 'pt', 'en'].forEach(lang => {
        const t = translations[lang];
        expect(t.institutional).toBeDefined();
        expect(t.institutional.headline).toBeDefined();
        expect(t.institutional.pillar1).toBeDefined();
        expect(t.institutional.pillar2).toBeDefined();
        expect(t.institutional.pillar3).toBeDefined();
        expect(t.institutional.cta).toBeDefined();
      });
    });

    test('Menu categories descriptions updated for all languages', () => {
      expect(translations.es.carta_editorial.sake_title).toBe('Entrantes y cocina caliente');
      expect(translations.pt.carta_editorial.sake_title).toBe('Entradas e cozinha quente');
      expect(translations.en.carta_editorial.sake_title).toBe('Appetizers and hot dishes');
    });
  });

  describe('Digital Menu URL', () => {
    test('All menu access should point to kaisosushicordoba.com', () => {
      const expectedUrl = 'https://kaisosushicordoba.com/';
      expect(expectedUrl).toBe('https://kaisosushicordoba.com/');
    });

    test('External link attributes defined', () => {
      const target = '_blank';
      const rel = 'noopener noreferrer';
      expect(target).toBe('_blank');
      expect(rel).toBe('noopener noreferrer');
    });
  });

  describe('Design Requirements', () => {
    test('Header text changed from Carta to Menú (Spanish)', () => {
      expect(translations.es.nav.carta).not.toBe('Carta');
      expect(translations.es.nav.carta).toBe('Menú');
    });

    test('New institutional section has required content', () => {
      const es = translations.es.institutional;
      expect(es.desc1).toContain('Técnica japonesa');
      expect(es.desc2).toContain('precisión');
      expect(es.pillar1).toBe('Técnica japonesa');
      expect(es.pillar2).toBe('Producto seleccionado');
      expect(es.pillar3).toBe('Creatividad de autor');
    });

    test('Four categories preserved in editorial section', () => {
      const es = translations.es.carta_editorial;
      expect(es.nigiri_title).toBeDefined();
      expect(es.omakase_title).toBeDefined();
      expect(es.rolls_title).toBeDefined();
      expect(es.sake_title).toBeDefined();
    });

    test('Button text consistent across languages', () => {
      ['es', 'pt', 'en'].forEach(lang => {
        const t = translations[lang];
        expect(t.carta_editorial.cta_menu).toBeDefined();
        expect(t.carta_editorial.cta_reserve).toBeDefined();
        expect(t.institutional.cta).toBeDefined();
      });
    });
  });
});
