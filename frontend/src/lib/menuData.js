// Menu data - Kaisō Sushi España
// Dados extraídos do sistema oficial: https://www.kaisosushi.es/

export const menuCategories = [
  {
    id: 'elite',
    name: { es: 'Kaisō Elite · Trufa Negra & Caviar', pt: 'Kaisō Elite · Trufa Negra & Caviar', en: 'Kaisō Elite · Black Truffle & Caviar' },
    description: { 
      es: 'Selección exclusiva elaborada con ingredientes de alta gama.',
      pt: 'Seleção exclusiva elaborada com ingredientes de alta qualidade.',
      en: 'Exclusive selection crafted with premium ingredients.'
    },
    items: [
      {
        id: 'obsidian-22',
        name: 'Kaisō Obsidian 22',
        description: { 
          es: '22 piezas premium con salmón y atún, trufa negra y caviar.',
          pt: '22 peças premium com salmão e atum, trufa negra e caviar.',
          en: '22 premium pieces with salmon and tuna, black truffle and caviar.'
        },
        price: 44.90,
        image: '/assets/menu/obsidian-22.jpg',
        allergens: ['pescado', 'soja', 'sesamo']
      }
    ]
  },
  {
    id: 'handhelds',
    name: { es: 'Kaisō Handhelds & Fusion', pt: 'Kaisō Handhelds & Fusion', en: 'Kaisō Handhelds & Fusion' },
    description: { 
      es: 'Creaciones de fusión para disfrutarse con las manos.',
      pt: 'Criações de fusão para serem apreciadas com as mãos.',
      en: 'Fusion creations designed to be enjoyed with your hands.'
    },
    items: [
      {
        id: 'tapas-salmon',
        name: 'Tapas de Salmão Kaisō',
        description: { es: 'Bases de arroz empanadas con mix de queso y salmón. 4 unidades.', pt: 'Bases de arroz empanadas com mix de queijo e salmão. 4 unidades.', en: 'Breaded rice bases with cheese and salmon mix. 4 pieces.' },
        price: 8.90,
        image: '/assets/menu/tapas-salmon.jpg',
        allergens: ['pescado', 'gluten', 'lacteos']
      },
      {
        id: 'carpaccio-salmon',
        name: 'Carpaccio de Salmón',
        description: { es: 'Finas láminas de salmón con aceite de oliva y limón.', pt: 'Finas fatias de salmão com azeite de oliva e limão.', en: 'Thin salmon slices with olive oil and lemon.' },
        price: 12.99,
        image: '/assets/menu/carpaccio.jpg',
        allergens: ['pescado']
      },
      {
        id: 'sushi-burger',
        name: 'Kaisō Sushi Burger',
        description: { es: 'Arroz crujiente, salmón, aguacate y queso crema.', pt: 'Arroz crocante, salmão, abacate e cream cheese.', en: 'Crispy rice, salmon, avocado and cream cheese.' },
        price: 12.99,
        originalPrice: 19.99,
        discount: 35,
        image: '/assets/menu/sushi-burger.jpg',
        allergens: ['pescado', 'gluten', 'soja', 'lacteos', 'sesamo']
      },
      {
        id: 'bocadillo-salmon',
        name: 'Bocadillo de Salmão – Dog Roll',
        description: { es: 'Hot dog de sushi con salmón, cream cheese y salsa tarê.', pt: 'Hot dog de sushi com salmão, cream cheese e molho tarê.', en: 'Sushi hot dog with salmon, cream cheese and tarê sauce.' },
        price: 13.90,
        image: '/assets/menu/bocadillo-salmon.jpg',
        allergens: ['pescado', 'gluten', 'soja', 'lacteos']
      },
      {
        id: 'tataki-atun',
        name: 'Tataki de Atún Kaisō',
        description: { es: 'Atún sellado al sésamo con ponzu y cebollino.', pt: 'Atum selado ao sésamo com ponzu e cebolinha.', en: 'Sesame-seared tuna with ponzu and chives.' },
        price: 13.99,
        image: '/assets/menu/tataki.jpg',
        allergens: ['pescado', 'soja', 'sesamo']
      },
      {
        id: 'gunkan-luxury',
        name: 'Bocadillo Gunkan – Salmon Luxury',
        description: { es: '4 gunkans de salmón sobre arroz empanado con mayonesa trufada.', pt: '4 gunkans de salmão sobre arroz empanado com maionese trufada.', en: '4 salmon gunkans on breaded rice with truffle mayo.' },
        price: 19.99,
        image: '/assets/menu/gunkan-luxury.jpg',
        allergens: ['pescado', 'gluten', 'soja', 'lacteos', 'sesamo']
      }
    ]
  },
  {
    id: 'entradas',
    name: { es: 'Entradas', pt: 'Entradas', en: 'Starters' },
    description: { es: 'Pequeñas delicadezas para despertar el paladar.', pt: 'Pequenas delícias para despertar o paladar.', en: 'Small delicacies to awaken your palate.' },
    items: [
      { id: 'gyoza-verduras', name: 'Gyozas de Verduras', description: { es: '2 unidades', pt: '2 unidades', en: '2 pieces' }, price: 2.90, image: '/assets/menu/gyoza-verduras.jpg', allergens: ['gluten', 'soja'] },
      { id: 'gyoza-pollo', name: 'Gyozas de Pollo', description: { es: '2 unidades', pt: '2 unidades', en: '2 pieces' }, price: 3.90, image: '/assets/menu/gyoza-pollo.jpg', allergens: ['gluten', 'soja'] },
      { id: 'gyoza-camaron', name: 'Gyozas de Camarón Premium', description: { es: '2 unidades', pt: '2 unidades', en: '2 pieces' }, price: 4.50, image: '/assets/menu/gyoza-camaron.jpg', allergens: ['crustaceos', 'gluten', 'soja'] },
      { id: 'harumaki', name: 'Harumakis Premium', description: { es: '2 unidades', pt: '2 unidades', en: '2 pieces' }, price: 4.50, image: '/assets/menu/harumaki.jpg', allergens: ['gluten', 'soja'] },
      { id: 'chicken-sweet', name: 'Chicken Sweet Chili 300g', description: { es: 'Alitas en salsa agridulce', pt: 'Asinhas em molho agridoce', en: 'Wings in sweet chili sauce' }, price: 6.99, image: '/assets/menu/chicken-sweet.jpg', allergens: ['gluten', 'soja'] },
      { id: 'tempura', name: 'Tempura de Verduras y Camarón', description: { es: 'Mix de verduras y camarón', pt: 'Mix de legumes e camarão', en: 'Vegetable and shrimp mix' }, price: 8.99, image: '/assets/menu/tempura.jpg', allergens: ['crustaceos', 'gluten'] },
      { id: 'karaage', name: 'Karaage de Pollo', description: { es: 'Pollo marinado y frito', pt: 'Frango marinado e frito', en: 'Marinated fried chicken' }, price: 9.99, originalPrice: 12.90, discount: 23, image: '/assets/menu/karaage.jpg', allergens: ['gluten', 'soja'] },
      { id: 'camaron-panado', name: 'Camarão Panado Premium', description: { es: '8 unidades', pt: '8 unidades', en: '8 pieces' }, price: 10.90, image: '/assets/menu/camaron-panado.jpg', allergens: ['crustaceos', 'gluten'] },
      { id: 'ebi-furay', name: 'Ebi Furay Special', description: { es: '8 camarones con salmón y cream cheese', pt: '8 camarões com salmão e cream cheese', en: '8 shrimp with salmon and cream cheese' }, price: 13.99, image: '/assets/menu/ebi-furay.jpg', allergens: ['pescado', 'crustaceos', 'gluten', 'lacteos'] }
    ]
  },
  {
    id: 'favoritos',
    name: { es: 'Los Favoritos Kaisō', pt: 'Os Favoritos Kaisō', en: 'Kaisō Favorites' },
    description: { es: 'Best-sellers que han conquistado a nuestros clientes.', pt: 'Best-sellers que conquistaram nossos clientes.', en: 'Best-sellers that have won over our customers.' },
    items: [
      { id: 'combo-18', name: 'Combinado 1 Persona', description: { es: '18 piezas variadas', pt: '18 peças variadas', en: '18 assorted pieces' }, price: 19.99, originalPrice: 29.90, discount: 33, image: '/assets/menu/combo-18.jpg', allergens: ['pescado', 'gluten', 'soja', 'sesamo'] },
      { id: 'combo-25', name: 'Combinado Premium 25 Piezas', description: { es: '25 piezas seleccionadas', pt: '25 peças selecionadas', en: '25 selected pieces' }, price: 27.00, originalPrice: 30.90, discount: 13, image: '/assets/menu/combo-25.jpg', allergens: ['pescado', 'gluten', 'soja', 'sesamo'] },
      { id: 'combo-35', name: 'Combinado Premium 35 Piezas', description: { es: 'Nigiris, gunkans, uramakis y hot rolls', pt: 'Nigiris, gunkans, uramakis e hot rolls', en: 'Nigiris, gunkans, uramakis and hot rolls' }, price: 38.90, image: '/assets/menu/combo-35.jpg', allergens: ['pescado', 'gluten', 'soja', 'lacteos', 'sesamo'] },
      { id: 'combo-36', name: 'Combo 2 Personas', description: { es: '36 piezas + 4 gyozas GRATIS', pt: '36 peças + 4 gyozas GRÁTIS', en: '36 pieces + 4 FREE gyozas' }, price: 44.90, originalPrice: 54.90, discount: 18, image: '/assets/menu/combo-36.jpg', allergens: ['pescado', 'crustaceos', 'gluten', 'soja', 'lacteos', 'sesamo'] },
      { id: 'combo-50', name: 'Combo Grand Premium 50 Piezas', description: { es: 'Salmón & Atún Bluefin', pt: 'Salmão & Atum Bluefin', en: 'Salmon & Bluefin Tuna' }, price: 54.90, originalPrice: 69.90, discount: 21, image: '/assets/menu/combo-50.jpg', allergens: ['pescado', 'crustaceos', 'gluten', 'soja', 'lacteos', 'sesamo'] },
      { id: 'combo-100', name: 'Kaisō Royal Banquet 100 Piezas', description: { es: 'Salmón, Atún & Camarón', pt: 'Salmão, Atum & Camarão', en: 'Salmon, Tuna & Shrimp' }, price: 99.99, originalPrice: 119.00, discount: 16, image: '/assets/menu/combo-100.jpg', allergens: ['pescado', 'crustaceos', 'gluten', 'soja', 'lacteos', 'sesamo'] }
    ]
  },
  {
    id: 'calientes',
    name: { es: 'Platos Calientes', pt: 'Pratos Quentes', en: 'Hot Dishes' },
    description: { es: 'Platos preparados al momento con técnica japonesa.', pt: 'Pratos preparados na hora com técnica japonesa.', en: 'Dishes prepared fresh with Japanese technique.' },
    items: [
      { id: 'fideos-champinones', name: 'Fideos con Champiñones', description: { es: 'Con mantequilla y soja', pt: 'Com manteiga e soja', en: 'With butter and soy' }, price: 7.99, originalPrice: 10.99, discount: 27, image: '/assets/menu/fideos-champinones.jpg', allergens: ['gluten', 'soja', 'lacteos'] },
      { id: 'fideos-pollo', name: 'Fideos con Pollo Empanado', description: { es: 'Fideos salteados con pollo crispy', pt: 'Macarrão salteado com frango crispy', en: 'Stir-fried noodles with crispy chicken' }, price: 10.90, image: '/assets/menu/fideos-pollo.jpg', allergens: ['gluten', 'soja'] },
      { id: 'fideos-camaron', name: 'Fideos con Camarón', description: { es: 'Con brócoli y pimientos', pt: 'Com brócolis e pimentões', en: 'With broccoli and peppers' }, price: 14.99, image: '/assets/menu/fideos-camaron.jpg', allergens: ['crustaceos', 'gluten', 'soja'] }
    ]
  },
  {
    id: 'bebidas',
    name: { es: 'Bebidas', pt: 'Bebidas', en: 'Beverages' },
    description: { es: 'Refrescos, zumos y agua.', pt: 'Refrigerantes, sucos e água.', en: 'Soft drinks, juices and water.' },
    items: [
      { id: 'agua-gas', name: 'Agua Mineral con Gas', price: 1.30, image: '/assets/menu/agua-gas.jpg', allergens: [] },
      { id: 'coca-cola', name: 'Coca-Cola 33cl', price: 2.00, image: '/assets/menu/coca-cola.jpg', allergens: [] },
      { id: 'coca-zero', name: 'Coca-Cola Zero 33cl', price: 2.00, image: '/assets/menu/coca-zero.jpg', allergens: [] },
      { id: 'fanta', name: 'Fanta 33cl', price: 2.00, image: '/assets/menu/fanta.jpg', allergens: [] },
      { id: 'nestea', name: 'Nestea Maracuyá', price: 2.00, image: '/assets/menu/nestea.jpg', allergens: [] },
      { id: 'zumo-melocoton', name: 'Zumo de Melocotón', price: 2.20, image: '/assets/menu/zumo-melocoton.jpg', allergens: [] },
      { id: 'zumo-naranja', name: 'Zumo de Naranja', price: 2.20, image: '/assets/menu/zumo-naranja.jpg', allergens: [] },
      { id: 'agua-sin-gas', name: 'Agua Cabreiroá 50cl', price: 2.50, image: '/assets/menu/agua-sin-gas.jpg', allergens: [] }
    ]
  },
  {
    id: 'cervezas',
    name: { es: 'Cervezas', pt: 'Cervejas', en: 'Beers' },
    description: { es: 'Selección de cervezas premium.', pt: 'Seleção de cervejas premium.', en: 'Selection of premium beers.' },
    items: [
      { id: 'estrella-00', name: 'Estrella Galicia 0,0%', price: 2.30, image: '/assets/menu/estrella-00.jpg', allergens: ['gluten'] },
      { id: '1906-reserva', name: '1906 Reserva Especial', price: 2.50, image: '/assets/menu/1906.jpg', allergens: ['gluten'] },
      { id: 'estrella-lemon', name: 'Estrella Galicia B-Lemon', price: 2.50, image: '/assets/menu/estrella-lemon.jpg', allergens: ['gluten'] },
      { id: 'reserva-especial', name: 'Reserva Especial 33cl', price: 2.50, image: '/assets/menu/reserva.jpg', allergens: ['gluten'] }
    ]
  },
  {
    id: 'vinos',
    name: { es: 'Vinos', pt: 'Vinhos', en: 'Wines' },
    description: { es: 'Vinos selectos para acompañar.', pt: 'Vinhos selecionados para acompanhar.', en: 'Selected wines to accompany.' },
    items: [
      { id: 'copa-rioja', name: 'Copa Rioja', price: 3.50, image: '/assets/menu/copa-rioja.jpg', allergens: ['sulfitos'] },
      { id: 'copa-blanco', name: 'Copa Vino Blanco', price: 3.50, image: '/assets/menu/copa-blanco.jpg', allergens: ['sulfitos'] },
      { id: 'verdejo', name: 'Señorío Real Verdejo', price: 8.99, originalPrice: 16.99, discount: 47, image: '/assets/menu/verdejo.jpg', allergens: ['sulfitos'] },
      { id: 'vallobera', name: 'Vallobera Crianza Rioja', price: 15.90, originalPrice: 21.99, discount: 28, image: '/assets/menu/vallobera.jpg', allergens: ['sulfitos'] }
    ]
  },
  {
    id: 'postres',
    name: { es: 'Postres', pt: 'Sobremesas', en: 'Desserts' },
    description: { es: 'Dulces momentos para finalizar.', pt: 'Doces momentos para finalizar.', en: 'Sweet moments to finish.' },
    items: [
      { id: 'harumaki-dulce', name: 'Harumakis Dulces', description: { es: 'Dulce de leche, chocolate o Nutella', pt: 'Doce de leite, chocolate ou Nutella', en: 'Dulce de leche, chocolate or Nutella' }, price: 3.90, image: '/assets/menu/harumaki-dulce.jpg', allergens: ['gluten', 'lacteos', 'frutos_secos'] },
      { id: 'esfera-dorada', name: 'Esfera Dorada', description: { es: 'Helado de vainilla con caramelo y frutos secos', pt: 'Sorvete de baunilha com caramelo e nozes', en: 'Vanilla ice cream with caramel and nuts' }, price: 4.99, originalPrice: 7.90, discount: 37, image: '/assets/menu/esfera-dorada.jpg', allergens: ['lacteos', 'frutos_secos'] },
      { id: 'coulant', name: 'Coulant de Chocolate', description: { es: 'Con helado de vainilla', pt: 'Com sorvete de baunilha', en: 'With vanilla ice cream' }, price: 7.90, originalPrice: 10.90, discount: 28, image: '/assets/menu/coulant.jpg', allergens: ['gluten', 'lacteos', 'huevos'] }
    ]
  }
];

// Allergen icons and translations
export const allergenInfo = {
  pescado: { icon: '🐟', es: 'Pescado', pt: 'Peixe', en: 'Fish' },
  crustaceos: { icon: '🦐', es: 'Crustáceos', pt: 'Crustáceos', en: 'Crustaceans' },
  gluten: { icon: '🌾', es: 'Gluten', pt: 'Glúten', en: 'Gluten' },
  soja: { icon: '🫘', es: 'Soja', pt: 'Soja', en: 'Soy' },
  lacteos: { icon: '🥛', es: 'Lácteos', pt: 'Laticínios', en: 'Dairy' },
  sesamo: { icon: '⚪', es: 'Sésamo', pt: 'Sésamo', en: 'Sesame' },
  huevos: { icon: '🥚', es: 'Huevos', pt: 'Ovos', en: 'Eggs' },
  frutos_secos: { icon: '🥜', es: 'Frutos Secos', pt: 'Frutos Secos', en: 'Nuts' },
  sulfitos: { icon: '🍷', es: 'Sulfitos', pt: 'Sulfitos', en: 'Sulfites' }
};

export default menuCategories;
