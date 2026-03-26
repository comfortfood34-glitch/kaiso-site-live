// Menu data - Kaisō Sushi España
// Fotos reais do kaisosushiespanha.com

export const menuCategories = [
  {
    id: 'handhelds',
    name: { es: 'Bocadillos & Hamburguesas Kaisō', pt: 'Bocadillos & Hambúrgueres Kaisō', en: 'Kaisō Sandwiches & Burgers' },
    description: { es: 'Creaciones de fusión estrella para disfrutarse con las manos.', pt: 'Criações de fusão estrela para serem apreciadas com as mãos.', en: 'Star fusion creations to enjoy with your hands.' },
    items: [
      { id: 'sushi-burger', name: 'Kaisō Sushi Burger', description: { es: 'Arroz crujiente, salmón, aguacate y queso crema', pt: 'Arroz crocante, salmão, abacate e cream cheese', en: 'Crispy rice, salmon, avocado and cream cheese' }, price: 12.99, originalPrice: 19.99, discount: 35, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTQ5MTksInB1ciI6ImJsb2JfaWQifX0=--5ba3462ee58061171f2222ec40043c77b7b72acb/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520340.png', allergens: ['pescado', 'gluten', 'soja', 'lacteos', 'sesamo'] },
      { id: 'bocadillo-salmon', name: 'Bocadillo de Salmão – Dog Roll', description: { es: 'Hot dog de sushi con salmón, cream cheese y tarê', pt: 'Hot dog de sushi com salmão, cream cheese e tarê', en: 'Sushi hot dog with salmon, cream cheese and tarê' }, price: 13.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTQ2ODYsInB1ciI6ImJsb2JfaWQifX0=--c4c98844f44bb3d9c39509bfc6d78cf5534975b5/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520326.png', allergens: ['pescado', 'gluten', 'soja', 'lacteos'] },
      { id: 'gunkan-luxury', name: 'Bocadillo Gunkan – Salmon Luxury', description: { es: '4 gunkans de salmón con mayonesa trufada', pt: '4 gunkans de salmão com maionese trufada', en: '4 salmon gunkans with truffle mayo' }, price: 19.99, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTQ5MzYsInB1ciI6ImJsb2JfaWQifX0=--3b8bb6aa8ef149d0b11706b8bbc67e541acd0bd2/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520336.png', allergens: ['pescado', 'gluten', 'soja', 'lacteos', 'sesamo'] },
      { id: 'tapas-salmon', name: 'Tapas de Salmão Kaisō (4 uni.)', description: { es: 'Bases de arroz empanadas con mix de queso y salmón', pt: 'Bases de arroz empanadas com mix de queijo e salmão', en: 'Breaded rice bases with cheese and salmon mix' }, price: 8.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk1NDUyMDAsInB1ciI6ImJsb2JfaWQifX0=--e28c704cc5c17fb028c76c2225163dba2d3bbf65/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000521303.jpg', allergens: ['pescado', 'gluten', 'lacteos'] },
      { id: 'carpaccio-salmon', name: 'Carpaccio de Salmón', description: { es: 'Finas láminas de salmón con aceite de oliva y limón', pt: 'Finas fatias de salmão com azeite de oliva e limão', en: 'Thin salmon slices with olive oil and lemon' }, price: 12.99, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTQ1MTcsInB1ciI6ImJsb2JfaWQifX0=--e903c440b8061e1f594722cdac46e854f777689a/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520316.jpg', allergens: ['pescado'] },
      { id: 'tataki-atun', name: 'Tataki de Atún Kaisō', description: { es: 'Atún sellado al sésamo con ponzu y cebollino', pt: 'Atum selado ao sésamo com ponzu e cebolinha', en: 'Sesame-seared tuna with ponzu and chives' }, price: 13.99, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTUyMzUsInB1ciI6ImJsb2JfaWQifX0=--104ab52fe3a83073f1c7abc8b51c248dadcd74e2/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520354.jpg', allergens: ['pescado', 'soja', 'sesamo'] }
    ]
  },
  {
    id: 'favoritos',
    name: { es: 'Los Favoritos Kaisō', pt: 'Os Favoritos Kaisō', en: 'Kaisō Favorites' },
    description: { es: 'Best-sellers que han conquistado a nuestros clientes.', pt: 'Best-sellers que conquistaram nossos clientes.', en: 'Best-sellers loved by our customers.' },
    items: [
      { id: 'combo-18', name: 'Combinado 1 Persona (18 piezas)', description: { es: '5 uramakis, 4 nigiris, 4 gunkans y 5 hossomakis', pt: '5 uramakis, 4 nigiris, 4 gunkans e 5 hossomakis', en: '5 uramakis, 4 nigiris, 4 gunkans and 5 hossomakis' }, price: 19.99, originalPrice: 29.90, discount: 33, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTMwMTMsInB1ciI6ImJsb2JfaWQifX0=--6e9a685b267201c283e2904d01534a3b437a1720/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520225.png', allergens: ['pescado', 'gluten', 'soja', 'sesamo'] },
      { id: 'combo-25', name: 'Combinado Premium 25 Piezas', description: { es: 'Variedad superior de texturas con salmón fresco', pt: 'Variedade superior de texturas com salmão fresco', en: 'Superior variety of textures with fresh salmon' }, price: 27.00, originalPrice: 30.90, discount: 13, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTMwMTcsInB1ciI6ImJsb2JfaWQifX0=--1bccee3174f6f629fb7ebd146298b38e4dfb0611/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520234.png', allergens: ['pescado', 'gluten', 'soja', 'sesamo'] },
      { id: 'combo-35', name: 'Combinado Premium 35 Piezas', description: { es: 'Nigiris, Gunkans, Uramakis, Hossomakis y Hot Rolls', pt: 'Nigiris, Gunkans, Uramakis, Hossomakis e Hot Rolls', en: 'Nigiris, Gunkans, Uramakis, Hossomakis and Hot Rolls' }, price: 38.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTMwMjIsInB1ciI6ImJsb2JfaWQifX0=--100bce934dbe1348e1a56ed2a22e2da145ede244/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520235.png', allergens: ['pescado', 'gluten', 'soja', 'lacteos', 'sesamo'] },
      { id: 'combo-36', name: 'Combo 2 Personas – 36 piezas + 4 gyozas GRATIS', description: { es: 'El favorito absoluto. Salmón fresco, aburi y gyozas de regalo', pt: 'O favorito absoluto. Salmão fresco, aburi e gyozas de presente', en: 'The absolute favorite. Fresh salmon, aburi and free gyozas' }, price: 44.90, originalPrice: 54.90, discount: 18, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTMwMjcsInB1ciI6ImJsb2JfaWQifX0=--c222c59fab1972f818d0497e2d2e4cdd26a2ca73/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520239.png', allergens: ['pescado', 'crustaceos', 'gluten', 'soja', 'lacteos', 'sesamo'] },
      { id: 'combo-50', name: 'Combo Grand Premium 50 Piezas', description: { es: 'Salmón & Atún Bluefin - La máxima expresión', pt: 'Salmão & Atum Bluefin - A máxima expressão', en: 'Salmon & Bluefin Tuna - The ultimate expression' }, price: 54.90, originalPrice: 69.90, discount: 21, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTMwMzEsInB1ciI6ImJsb2JfaWQifX0=--2ab22718ca9cfa996d410660f15dde6c9bbbae26/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520241.png', allergens: ['pescado', 'crustaceos', 'gluten', 'soja', 'lacteos', 'sesamo'] },
      { id: 'combo-100', name: 'Kaisō Royal Banquet 100 Piezas', description: { es: 'Salmón, Atún & Camarón - Banquete monumental', pt: 'Salmão, Atum & Camarão - Banquete monumental', en: 'Salmon, Tuna & Shrimp - Monumental banquet' }, price: 99.99, originalPrice: 119.00, discount: 16, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTMwMzQsInB1ciI6ImJsb2JfaWQifX0=--eb8889f1b86b65cfca6a1d14e049dfbe972fceca/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520250.jpg', allergens: ['pescado', 'crustaceos', 'gluten', 'soja', 'lacteos', 'sesamo'] }
    ]
  },
  {
    id: 'elite',
    name: { es: 'Kaisō Elite · Trufa Negra & Caviar', pt: 'Kaisō Elite · Trufa Negra & Caviar', en: 'Kaisō Elite · Black Truffle & Caviar' },
    description: { es: 'Selección exclusiva con ingredientes de alta gama.', pt: 'Seleção exclusiva com ingredientes de alta qualidade.', en: 'Exclusive selection with premium ingredients.' },
    items: [
      { id: 'obsidian-22', name: 'Kaisō Obsidian 22', description: { es: '22 piezas premium con salmón, atún, trufa negra y caviar', pt: '22 peças premium com salmão, atum, trufa negra e caviar', en: '22 premium pieces with salmon, tuna, black truffle and caviar' }, price: 44.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk3NTYzNjYsInB1ciI6ImJsb2JfaWQifX0=--ef0a3ae1516f63bc439de4075ee8365ce02e0c39/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000525795.png', allergens: ['pescado', 'soja', 'sesamo'] }
    ]
  },
  {
    id: 'entradas',
    name: { es: 'Entradas', pt: 'Entradas', en: 'Starters' },
    description: { es: 'Pequeñas delicadezas para despertar el paladar.', pt: 'Pequenas delícias para despertar o paladar.', en: 'Small delicacies to awaken your palate.' },
    items: [
      { id: 'gyoza-verduras', name: 'Gyozas de Verduras (2 uni.)', description: { es: 'Empanadillas con verduras frescas', pt: 'Empanadillas com legumes frescos', en: 'Dumplings with fresh vegetables' }, price: 2.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTA5MDIsInB1ciI6ImJsb2JfaWQifX0=--9371923874c2a3c85972a44242f2f717294e812c/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520119.jpg', allergens: ['gluten', 'soja'] },
      { id: 'gyoza-pollo', name: 'Gyozas de Pollo (2 uni.)', description: { es: 'Empanadillas con pollo y especias', pt: 'Empanadillas com frango e especiarias', en: 'Chicken dumplings with spices' }, price: 3.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTA4NjksInB1ciI6ImJsb2JfaWQifX0=--1e2383e17c4f33a2880b4fe76a256a9127663b33/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520116.jpg', allergens: ['gluten', 'soja'] },
      { id: 'gyoza-camaron', name: 'Gyozas de Camarón Premium (2 uni.)', description: { es: 'Empanadillas con camarones frescos', pt: 'Empanadillas com camarões frescos', en: 'Premium shrimp dumplings' }, price: 4.50, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTA5NzIsInB1ciI6ImJsb2JfaWQifX0=--9108fa99e293afea932621b07b3afc8c8a0deb28/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520122.jpg', allergens: ['crustaceos', 'gluten', 'soja'] },
      { id: 'harumaki', name: 'Harumakis Premium (2 uni.)', description: { es: 'Rollitos primavera crujientes', pt: 'Rolinhos primavera crocantes', en: 'Crispy spring rolls' }, price: 4.50, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTEyNDQsInB1ciI6ImJsb2JfaWQifX0=--c5e30addd710cbe20ec57d2fbf05eec7b1235d84/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520127.jpg', allergens: ['gluten', 'soja'] },
      { id: 'chicken-sweet', name: 'Chicken Sweet Chili 300g', description: { es: 'Alitas en salsa agridulce', pt: 'Asinhas em molho agridoce', en: 'Wings in sweet chili sauce' }, price: 6.99, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTE2NDEsInB1ciI6ImJsb2JfaWQifX0=--9e3a0bd66b59fa56d200ec92e79de9e2e68f4745/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520145.jpg', allergens: ['gluten', 'soja'] },
      { id: 'tempura', name: 'Tempura de Verduras y Camarón', description: { es: 'Mix de verduras y camarón rebozados', pt: 'Mix de legumes e camarão empanados', en: 'Vegetable and shrimp tempura' }, price: 8.99, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTEzOTEsInB1ciI6ImJsb2JfaWQifX0=--3f4908d8d3b77d02e9f5050986510a7a0acbe973/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520132.jpg', allergens: ['crustaceos', 'gluten'] },
      { id: 'karaage', name: 'Karaage de Pollo', description: { es: 'Pollo marinado y frito al estilo japonés', pt: 'Frango marinado e frito ao estilo japonês', en: 'Japanese-style fried chicken' }, price: 9.99, originalPrice: 12.90, discount: 23, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTI5OTgsInB1ciI6ImJsb2JfaWQifX0=--ba6039ff6c93211201cdd1eda6a1bf05ac305269/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520212.jpg', allergens: ['gluten', 'soja'] },
      { id: 'camaron-panado', name: 'Camarão Panado Premium (8 uni.)', description: { es: '8 camarones empanados con panko', pt: '8 camarões empanados com panko', en: '8 panko-breaded shrimp' }, price: 10.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTMwMDMsInB1ciI6ImJsb2JfaWQifX0=--24aa8af5824fafdfe7598aa21594ba7649f6cc59/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520213.jpg', allergens: ['crustaceos', 'gluten'] },
      { id: 'ebi-furay', name: 'Ebi Furay Special (8 uni.)', description: { es: '8 camarones con salmón y cream cheese', pt: '8 camarões com salmão e cream cheese', en: '8 shrimp with salmon and cream cheese' }, price: 13.99, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTMwMDcsInB1ciI6ImJsb2JfaWQifX0=--9f6c1337783baebd07fa79b993c98652d125ad83/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520214.jpg', allergens: ['pescado', 'crustaceos', 'gluten', 'lacteos'] }
    ]
  },
  {
    id: 'uramakis',
    name: { es: 'Uramakis Kaisō', pt: 'Uramakis Kaisō', en: 'Kaisō Uramakis' },
    description: { es: 'El arte del sushi invertido. 10 unidades por roll.', pt: 'A arte do sushi invertido. 10 unidades por roll.', en: 'The art of inside-out rolls. 10 pieces per roll.' },
    items: [
      { id: 'uramakis', name: 'URAMAKIS', description: { es: 'Variedad de uramakis premium', pt: 'Variedade de uramakis premium', en: 'Variety of premium uramakis' }, price: 12.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTQyMjQsInB1ciI6ImJsb2JfaWQifX0=--a5901b2397d05470f629b8c588bf4253c6768555/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520300.jpg', allergens: ['pescado', 'gluten', 'soja', 'sesamo'] }
    ]
  },
  {
    id: 'hot',
    name: { es: 'Kaisō Hot Selection', pt: 'Kaisō Hot Selection', en: 'Kaisō Hot Selection' },
    description: { es: 'Rolls empanados y fritos hasta la perfección.', pt: 'Rolls empanados e fritos até a perfeição.', en: 'Breaded and fried rolls to perfection.' },
    items: [
      { id: 'hot-rolls', name: 'Kaisō Hot', description: { es: 'Hot rolls crujientes y cremosos', pt: 'Hot rolls crocantes e cremosos', en: 'Crispy and creamy hot rolls' }, price: 9.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTQxMzcsInB1ciI6ImJsb2JfaWQifX0=--3402260fc03f9d9a0865c66e9ca7b19c989b0c6f/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520288.jpg', allergens: ['pescado', 'gluten', 'soja', 'lacteos', 'sesamo'] }
    ]
  },
  {
    id: 'calientes',
    name: { es: 'Platos Calientes', pt: 'Pratos Quentes', en: 'Hot Dishes' },
    description: { es: 'Platos preparados al momento con técnica japonesa.', pt: 'Pratos preparados na hora com técnica japonesa.', en: 'Freshly prepared dishes with Japanese technique.' },
    items: [
      { id: 'fideos-champinones', name: 'Fideos con Champiñones', description: { es: 'Con mantequilla y soja', pt: 'Com manteiga e soja', en: 'With butter and soy' }, price: 7.99, originalPrice: 10.99, discount: 27, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTM0MTUsInB1ciI6ImJsb2JfaWQifX0=--6380b8499195e12af971e3b2dc9b6a19c0c2962c/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520273.jpg', allergens: ['gluten', 'soja', 'lacteos'] },
      { id: 'fideos-pollo', name: 'Fideos con Pollo Empanado', description: { es: 'Fideos salteados con pollo crispy', pt: 'Macarrão salteado com frango crispy', en: 'Stir-fried noodles with crispy chicken' }, price: 10.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTM1MDUsInB1ciI6ImJsb2JfaWQifX0=--ce5b21e58b022f75b41ff6c495a8daa8ad70537c/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520279.jpg', allergens: ['gluten', 'soja'] },
      { id: 'fideos-camaron', name: 'Fideos con Camarón', description: { es: 'Con brócoli y pimientos', pt: 'Com brócolis e pimentões', en: 'With broccoli and peppers' }, price: 14.99, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTczODQ2MTEsInB1ciI6ImJsb2JfaWQifX0=--59ee26ef4c4c80145a69c0691443931e8f9828c9/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--d0a1b17ef2602c76529f2014cc78f2e1b42e5f2c/1000454774.jpg', allergens: ['crustaceos', 'gluten', 'soja'] }
    ]
  },
  {
    id: 'poke',
    name: { es: 'Poke Bowls', pt: 'Poke Bowls', en: 'Poke Bowls' },
    description: { es: 'Frescura hawaiana con técnica japonesa.', pt: 'Frescura havaiana com técnica japonesa.', en: 'Hawaiian freshness with Japanese technique.' },
    items: [
      { id: 'poke-bowls', name: 'Poke Bowls', description: { es: 'Base de arroz con proteína fresca', pt: 'Base de arroz com proteína fresca', en: 'Rice base with fresh protein' }, price: 12.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTQxMTgsInB1ciI6ImJsb2JfaWQifX0=--824abda297f2f327a8b489b95bcdeeff6452a98e/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520281.jpg', allergens: ['pescado', 'soja', 'sesamo'] }
    ]
  },
  {
    id: 'temakis',
    name: { es: 'Temakis Kaisō', pt: 'Temakis Kaisō', en: 'Kaisō Temakis' },
    description: { es: 'Conos artesanales premium con alga nori crujiente.', pt: 'Cones artesanais premium com alga nori crocante.', en: 'Premium handmade cones with crispy nori.' },
    items: [
      { id: 'temakis', name: 'TEMAKIS', description: { es: 'Conos generosos de sushi', pt: 'Cones generosos de sushi', en: 'Generous sushi cones' }, price: 12.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk0OTQyNzEsInB1ciI6ImJsb2JfaWQifX0=--5be3d868fc1d9fe26727adc4167ad0488bd0ea73/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000520301.jpg', allergens: ['pescado', 'gluten', 'soja'] }
    ]
  },
  {
    id: 'bebidas',
    name: { es: 'Bebidas', pt: 'Bebidas', en: 'Beverages' },
    description: { es: 'Refrescos, zumos y agua.', pt: 'Refrigerantes, sucos e água.', en: 'Soft drinks, juices and water.' },
    items: [
      { id: 'agua-gas', name: 'Agua Mineral con Gas', price: 1.30, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTcxMTE4NTIsInB1ciI6ImJsb2JfaWQifX0=--cfbe785e5854890a774721c3d787999a419cff41/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--d0a1b17ef2602c76529f2014cc78f2e1b42e5f2c/1000449421.jpg', allergens: [] },
      { id: 'coca-cola', name: 'Coca-Cola 33cl', price: 2.00, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTcwNzM4OTgsInB1ciI6ImJsb2JfaWQifX0=--88990244458b2e5ee25f03b06f462fd61dce24f9/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGVnIiwicmVzaXplX3RvX2ZpbGwiOls0MDAsNDAwXX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--2a1faf943e202820e5097e5e375b8164061e12db/images%20(9).jpeg', allergens: [] },
      { id: 'coca-zero', name: 'Coca-Cola Zero 33cl', price: 2.00, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTcwNzM3OTQsInB1ciI6ImJsb2JfaWQifX0=--04eff969ef338854341947c73751229bae513e52/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGVnIiwicmVzaXplX3RvX2ZpbGwiOls0MDAsNDAwXX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--2a1faf943e202820e5097e5e375b8164061e12db/images%20(6).jpeg', allergens: [] },
      { id: 'agua-sin-gas', name: 'Agua Cabreiroá 50cl', price: 2.50, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTcxMTE4NjgsInB1ciI6ImJsb2JfaWQifX0=--f49e835e4ae68b82c3fae115cd0155876ca9ebb0/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000449422.jpg', allergens: [] }
    ]
  },
  {
    id: 'vinos',
    name: { es: 'Vinos', pt: 'Vinhos', en: 'Wines' },
    description: { es: 'Vinos selectos para acompañar.', pt: 'Vinhos selecionados para acompanhar.', en: 'Selected wines to accompany.' },
    items: [
      { id: 'copa-rioja', name: 'Copa Rioja', price: 3.50, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTgxMjcwMDMsInB1ciI6ImJsb2JfaWQifX0=--bf6ffc5c3b7833183dc99f779a69ae1f0dd6a904/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--d0a1b17ef2602c76529f2014cc78f2e1b42e5f2c/1000478074.jpg', allergens: ['sulfitos'] },
      { id: 'verdejo', name: 'Señorío Real Verdejo', price: 8.99, originalPrice: 16.99, discount: 47, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTgxMjY5NzIsInB1ciI6ImJsb2JfaWQifX0=--61c1f04f3d1943740ee834a0d7deeaee836dde0b/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000478070.png', allergens: ['sulfitos'] },
      { id: 'vallobera', name: 'Vallobera Crianza Rioja', price: 15.90, originalPrice: 21.99, discount: 28, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTc4NDgwMTksInB1ciI6ImJsb2JfaWQifX0=--e15c757bdceaa5cf5c031ce2522429d95a04bc64/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000466079.jpg', allergens: ['sulfitos'] }
    ]
  },
  {
    id: 'postres',
    name: { es: 'Postres', pt: 'Sobremesas', en: 'Desserts' },
    description: { es: 'Dulces momentos para finalizar.', pt: 'Doces momentos para finalizar.', en: 'Sweet moments to finish.' },
    items: [
      { id: 'harumaki-dulce', name: 'Harumakis Dulces', description: { es: 'Dulce de leche, chocolate o Nutella', pt: 'Doce de leite, chocolate ou Nutella', en: 'Dulce de leche, chocolate or Nutella' }, price: 3.90, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTcxNTI5ODQsInB1ciI6ImJsb2JfaWQifX0=--8de3cb7bd692b5d25d8b4995168a0b0bc34027bb/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--d0a1b17ef2602c76529f2014cc78f2e1b42e5f2c/1000450608.jpg', allergens: ['gluten', 'lacteos', 'frutos_secos'] },
      { id: 'esfera-dorada', name: 'Esfera Dorada', description: { es: 'Helado de vainilla con caramelo y frutos secos', pt: 'Sorvete de baunilha com caramelo e nozes', en: 'Vanilla ice cream with caramel and nuts' }, price: 4.99, originalPrice: 7.90, discount: 37, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk5NTQyNzMsInB1ciI6ImJsb2JfaWQifX0=--a07022ca208e669a7c49d7c79a1f1807d50c39be/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000531783.png', allergens: ['lacteos', 'frutos_secos'] },
      { id: 'coulant', name: 'Coulant de Chocolate', description: { es: 'Con helado de vainilla', pt: 'Com sorvete de baunilha', en: 'With vanilla ice cream' }, price: 7.90, originalPrice: 10.90, discount: 28, image: 'https://assets.menuintegrado.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTk5NTQxOTMsInB1ciI6ImJsb2JfaWQifX0=--9b4da3cecadaced4d7ef160f2a4e3992f4eeb905/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJwbmciLCJyZXNpemVfdG9fZmlsbCI6WzQwMCw0MDBdfSwicHVyIjoidmFyaWF0aW9uIn19--7a65fc83eee3e79efe10338333afbca592ee75b4/1000531218.png', allergens: ['gluten', 'lacteos'] }
    ]
  }
];

// Alérgenos - SEM OVOS
export const allergenInfo = {
  pescado: { icon: '🐟', es: 'Pescado', pt: 'Peixe', en: 'Fish' },
  crustaceos: { icon: '🦐', es: 'Crustáceos', pt: 'Crustáceos', en: 'Crustaceans' },
  gluten: { icon: '🌾', es: 'Gluten', pt: 'Glúten', en: 'Gluten' },
  soja: { icon: '🫘', es: 'Soja', pt: 'Soja', en: 'Soy' },
  lacteos: { icon: '🥛', es: 'Lácteos', pt: 'Laticínios', en: 'Dairy' },
  sesamo: { icon: '⚪', es: 'Sésamo', pt: 'Sésamo', en: 'Sesame' },
  frutos_secos: { icon: '🥜', es: 'Frutos Secos', pt: 'Frutos Secos', en: 'Nuts' },
  sulfitos: { icon: '🍷', es: 'Sulfitos', pt: 'Sulfitos', en: 'Sulfites' }
};

export default menuCategories;
