// Kaisō Sushi - Sistema de Traduções ES/PT/EN
const translations = {
  es: {
    nav: {
      inicio: "Inicio",
      carta: "Menú",
      reservas: "Reservas",
      ubicacion: "Ubicación",
      entrega: "Entrega",
      contacto: "Contacto",
      franquicias: "Franquicias",
      filosofia: "Filosofía",
      experiencia: "Experiencia"
    },
    hero: {
      badge: "KAISŌ SUSHI",
      headline: "Sushi fresco, creativo y preparado al momento en Córdoba",
      subtitle: "20 años de historia llevando la experiencia Kaisō desde Brasil hasta Portugal y España.",
      subheadline: "Experiencia gastronómica japonesa contemporánea en el corazón de Córdoba",
      location: "Av. de Barcelona, 19 · Córdoba",
      cta_reservar: "Reservar mesa",
      cta_menu: "Ver menú",
      cta_whatsapp: "Hablar por WhatsApp",
      cta_carta: "Ver Carta"
    },
    reservation: {
      title: "Reservar Mesa",
      subtitle: "Una experiencia gastronómica única",
      select_date: "Seleccione fecha",
      select_time: "Seleccione horario",
      your_details: "Sus datos",
      guests: "Personas",
      date: "Fecha",
      time: "Horario",
      name: "Nombre completo",
      phone: "Teléfono (WhatsApp)",
      email: "Email",
      observations: "Nota al chef",
      lunch: "Almuerzo",
      dinner: "Cena",
      closed_monday: "Cerrado los lunes",
      capacity_full: "Capacidad agotada para esta fecha",
      remaining: "plazas disponibles",
      confirm: "Confirmar Reserva",
      confirm_whatsapp: "Confirmar por WhatsApp",
      success_title: "¡Reserva Recibida!",
      success_message: "Hemos recibido su solicitud. Le confirmaremos a la brevedad.",
      hours_notice: "Reservas atendidas de 20:00 a 22:30. Fuera de este horario, confirmaremos en el siguiente tramo disponible.",
      discount_notice: "",
      discount_applied: "",
      tasting_title: "¿Desea añadir experiencia Omakase Premium?",
      tasting_desc: "",
      tasting_price: "",
      tasting_availability: "",
      tasting_allergies: "Alergias / restricciones alimentarias"
    },
    delivery: {
      title: "Entrega a Domicilio",
      headline: "Servicio Propio de Entrega",
      description: "Entrega con estafeta propia. No utilizamos Uber Eats ni Glovo. Calidad garantizada hasta tu puerta.",
      cta: "Pedir por WhatsApp"
    },
    franchise: {
      title: "Franquicias",
      headline: "Únete a la Familia Kaisō",
      description: "Descubre las oportunidades de franquicia con Grupo Kaisō España.",
      cta: "Más Información"
    },
    footer: {
      hours_title: "Horarios",
      lunch_label: "Almuerzo",
      dinner_label: "Cena",
      tue_thu: "Mar–Jue",
      fri_sat: "Vie–Sáb",
      fri_sun: "Vie–Dom",
      sun: "Dom",
      tue: "Mar",
      wed_sun: "Mié–Dom",
      closed: "Lun · Cerrado",
      contact: "Contacto",
      location: "Ubicación",
      digital_menu: "Carta digital",
      company_info: "Información Legal",
      privacy_policy: "Política de Privacidad",
      cookies_policy: "Política de Cookies",
      terms: "Términos y Condiciones",
      cancellation_policy: "Política de Cancelación",
      followus: "Síguenos",
      copyright: "© Kaisō Sushi Córdoba. Todos los derechos reservados.",
      hours_monday: "Cerrado",
      hours_tue_thu: "12:00–14:00 / 19:00–23:00",
      hours_fri_sun_lunch: "12:00–15:30",
      hours_fri_sun_dinner: "19:00–23:30"
    },
    historia: {
      label: "NUESTRA HISTORIA",
      headline: "20 años de historia",
      text: "Kaisō Sushi nació en Brasil hace 20 años, impulsado por una pasión por la gastronomía japonesa, la creatividad y el cuidado de cada pieza.\n\nA lo largo de nuestra historia, el concepto Kaisō ha crecido y ha formado parte de proyectos y operaciones en Brasil, Portugal y España.\n\nEl 12 de agosto de 2025 abrimos las puertas de Kaisō Sushi Córdoba, en la Avenida de Barcelona, 19. En agosto de 2026 celebramos nuestro primer aniversario en la ciudad, manteniendo la esencia construida durante dos décadas: sushi preparado al momento, sabor, creatividad y cercanía con nuestros clientes.",
      countries: "Brasil · Portugal · España"
    },
    aniversario: {
      headline: "Primer aniversario en Córdoba",
      text: "El 12 de agosto celebramos nuestro primer año en Córdoba. Un año de nuevos clientes, experiencias, aprendizajes y mucho sushi preparado con dedicación.",
      tagline: "Gracias, Córdoba, por formar parte de nuestra historia."
    },
    filosofia: {
      line1: "No seguimos tradición.",
      line2: "Creamos experiencias.",
      text1: "En Kaisō respetamos la técnica japonesa. Pero creemos que la innovación forma parte de la evolución gastronómica.",
      text2: "Cada pieza nace de la precisión. Cada sabor rompe expectativas. Eso es lo que servimos."
    },
    chef: {
      label: "El fundador detrás de Kaisō",
      text1: "Leandro Crispim inició la historia de Kaisō Sushi en Brasil hace 20 años. Su experiencia en gastronomía japonesa, creación de marcas y desarrollo de operaciones llevó el concepto Kaisō desde Brasil hasta Portugal y España.",
      text2: "En Córdoba, combina técnica, creatividad y experiencia para ofrecer un sushi preparado al momento, con identidad propia y una excelente relación calidad-precio.",
      complement: "20 años de experiencia · Brasil · Portugal · España",
      details: [
        "Técnica japonesa, respeto por la tradición",
        "Producto seleccionado con cuidado",
        "Creatividad en cada pieza",
        "Relación calidad-precio excelente"
      ]
    },
    tecnica: {
      label: "La Técnica",
      caption1: "Precisión de corte",
      caption2: "Materia prima",
      headline: "Descubre nuestra carta, combinados, piezas de autor, platos calientes, buffet y opciones para compartir en nuestro menú digital.",
      subtext: "La técnica sostiene la experiencia. La creatividad la define.",
      cta_menu: "Ver menú completo"
    },
    diferenciales: {
      label: "¿POR QUÉ ELEGIR KAISŌ?",
      headline: "¿Por qué elegir Kaisō?",
      tagline: "Tradición, experiencia y creatividad reunidas en cada pieza.",
      items: [
        "20 años de historia",
        "Sushi preparado al momento",
        "Creaciones con identidad propia",
        "Experiencia internacional",
        "Restaurante, delivery y recogida",
        "Reserva y pedido digital"
      ]
    },
    buffet: {
      label: "RÓDIZIO PREMIUM",
      headline: "Ródizio Premium Kaisō",
      text: "Disfruta una experiencia completa con sushi, entrantes, platos calientes y especialidades servidas en tu mesa.",
      availability: "Disponible en días seleccionados y con reserva anticipada.",
      cta_menu: "Consultar en el menú",
      cta_reserve: "Reservar mesa"
    },
    carta_editorial: {
      label: "LA CARTA",
      headline: "Una selección que cambia con nuestra creatividad",
      intro: "Descubre nigiris de temporada, makis de autor, entrantes, platos calientes y experiencias creadas para compartir.",
      nigiri_title: "Nigiris de temporada",
      nigiri_desc: "Lo que el mar trajo. Interpretado.",
      omakase_title: "Experiencia Omakase",
      omakase_desc: "Deja que el chef cree. Disponible bajo reserva previa.",
      rolls_title: "Makis de autor",
      rolls_desc: "Equilibrio entre Japón y el Mediterráneo. Nuestra firma.",
      sake_title: "Entrantes y cocina caliente",
      sake_desc: "Selección pequeña. Curada.",
      note: "Consulta platos, precios y promociones en nuestra carta digital.",
      cta_menu: "Ver menú completo",
      cta_reserve: "Reservar mesa"
    },
    opiniones: {
      label: "LO QUE DICEN NUESTROS CLIENTES",
      headline: "Lo que dicen nuestros clientes",
      cta_google: "Ver opiniones en Google",
      cta_review: "Dejar una opinión"
    },
    institutional: {
      label: "MÁS QUE SUSHI",
      headline: "Una experiencia Kaisō",
      desc1: "Técnica japonesa, producto fresco y creatividad sin límites.",
      desc2: "Cada pieza se prepara con precisión para transformar una comida en una experiencia.",
      pillar1: "Técnica japonesa",
      pillar2: "Producto seleccionado",
      pillar3: "Creatividad de autor",
      cta: "Descubrir el menú"
    },
    admin: {
      title: "Panel de Administración",
      reservations: "Reservas",
      stats: "Estadísticas",
      settings: "Configuración",
      export: "Exportar CSV",
      blackout: "Días Bloqueados",
      status: {
        pendente: "Pendiente",
        confirmada: "Confirmada",
        cancelada: "Cancelada",
        "no-show": "No-show"
      }
    }
  },

  pt: {
    nav: {
      inicio: "Início",
      carta: "Menu",
      reservas: "Reservas",
      ubicacion: "Localização",
      entrega: "Delivery",
      contacto: "Contato",
      franquicias: "Franquias",
      filosofia: "Filosofia",
      experiencia: "Experiência"
    },
    hero: {
      badge: "KAISŌ SUSHI",
      headline: "Sushi fresco, criativo e preparado na hora em Córdoba",
      subtitle: "20 anos de história levando a experiência Kaisō desde o Brasil até Portugal e Espanha.",
      subheadline: "Experiência gastronômica japonesa contemporânea no coração de Córdoba",
      location: "Av. de Barcelona, 19 · Córdoba",
      cta_reservar: "Reservar mesa",
      cta_menu: "Ver menu",
      cta_whatsapp: "Falar no WhatsApp",
      cta_carta: "Ver Cardápio"
    },
    reservation: {
      title: "Reservar Mesa",
      subtitle: "Uma experiência gastronômica única",
      select_date: "Selecione a data",
      select_time: "Selecione o horário",
      your_details: "Seus dados",
      guests: "Pessoas",
      date: "Data",
      time: "Horário",
      name: "Nome completo",
      phone: "Telefone (WhatsApp)",
      email: "Email",
      observations: "Nota ao chef",
      lunch: "Almoço",
      dinner: "Jantar",
      closed_monday: "Fechado às segundas",
      capacity_full: "Capacidade esgotada para esta data",
      remaining: "vagas disponíveis",
      confirm: "Confirmar Reserva",
      confirm_whatsapp: "Confirmar por WhatsApp",
      success_title: "Reserva Recebida!",
      success_message: "Recebemos sua solicitação. Confirmaremos em breve.",
      hours_notice: "Reservas atendidas das 20:00 às 22:30. Fora desse horário, confirmaremos no próximo período disponível.",
      discount_notice: "",
      discount_applied: "",
      tasting_title: "Deseja adicionar experiência Omakase Premium?",
      tasting_desc: "",
      tasting_price: "",
      tasting_availability: "",
      tasting_allergies: "Alergias / restrições alimentares"
    },
    delivery: {
      title: "Delivery",
      headline: "Serviço de Entrega Próprio",
      description: "Entrega com motoboy próprio. Não utilizamos Uber Eats nem Glovo. Qualidade garantida até sua porta.",
      cta: "Pedir por WhatsApp"
    },
    franchise: {
      title: "Franquias",
      headline: "Junte-se à Família Kaisō",
      description: "Descubra as oportunidades de franquia com o Grupo Kaisō España.",
      cta: "Mais Informações"
    },
    footer: {
      hours_title: "Horários",
      lunch_label: "Almoço",
      dinner_label: "Jantar",
      tue_thu: "Ter–Qui",
      fri_sat: "Sex–Sáb",
      fri_sun: "Sex–Dom",
      sun: "Dom",
      tue: "Ter",
      wed_sun: "Qua–Dom",
      closed: "Seg · Fechado",
      contact: "Contato",
      location: "Localização",
      digital_menu: "Menu digital",
      company_info: "Informações Legais",
      privacy_policy: "Política de Privacidade",
      cookies_policy: "Política de Cookies",
      terms: "Termos e Condições",
      cancellation_policy: "Política de Cancelamento",
      followus: "Siga-nos",
      copyright: "© Kaisō Sushi Córdoba. Todos os direitos reservados.",
      hours_monday: "Fechado",
      hours_tue_thu: "12:00–14:00 / 19:00–23:00",
      hours_fri_sun_lunch: "12:00–15:30",
      hours_fri_sun_dinner: "19:00–23:30"
    },
    historia: {
      label: "NOSSA HISTÓRIA",
      headline: "20 anos de história",
      text: "Kaisō Sushi nasceu no Brasil há 20 anos, impulsionado por uma paixão pela gastronomia japonesa, criatividade e cuidado com cada peça.\n\nAo longo de nossa história, o conceito Kaisō cresceu e fez parte de projetos e operações no Brasil, Portugal e Espanha.\n\nEm 12 de agosto de 2025 abrimos as portas de Kaisō Sushi Córdoba, na Avenida de Barcelona, 19. Em agosto de 2026 celebramos nosso primeiro aniversário na cidade, mantendo a essência construída em duas décadas: sushi preparado na hora, sabor, criatividade e proximidade com nossos clientes.",
      countries: "Brasil · Portugal · Espanha"
    },
    aniversario: {
      headline: "Primeiro aniversário em Córdoba",
      text: "Em 12 de agosto celebramos nosso primeiro ano em Córdoba. Um ano de novos clientes, experiências, aprendizados e muito sushi preparado com dedicação.",
      tagline: "Obrigado, Córdoba, por fazer parte de nossa história."
    },
    filosofia: {
      line1: "Não seguimos tradição.",
      line2: "Criamos experiências.",
      text1: "No Kaisō respeitamos a técnica japonesa. Mas acreditamos que a inovação faz parte da evolução gastronômica.",
      text2: "Cada peça nasce da precisão. Cada sabor quebra expectativas. É isso que servimos."
    },
    chef: {
      label: "O fundador por trás de Kaisō",
      text1: "Leandro Crispim iniciou a história de Kaisō Sushi no Brasil há 20 anos. Sua experiência em gastronomia japonesa, criação de marcas e desenvolvimento de operações levou o conceito Kaisō desde o Brasil até Portugal e Espanha.",
      text2: "Em Córdoba, combina técnica, criatividade e experiência para oferecer um sushi preparado na hora, com identidade própria e uma excelente relação custo-benefício.",
      complement: "20 anos de experiência · Brasil · Portugal · Espanha",
      details: [
        "Técnica japonesa, respeito pela tradição",
        "Produto selecionado com cuidado",
        "Criatividade em cada peça",
        "Excelente relação custo-benefício"
      ]
    },
    tecnica: {
      label: "A Técnica",
      caption1: "Precisão de corte",
      caption2: "Matéria-prima",
      headline: "Descubra nosso cardápio, combinados, peças autorais, pratos quentes, rodízio e opções para compartilhar em nosso menu digital.",
      subtext: "A técnica sustenta a experiência. A criatividade a define.",
      cta_menu: "Ver menu completo"
    },
    diferenciales: {
      label: "POR QUE ESCOLHER KAISŌ?",
      headline: "Por que escolher Kaisō?",
      tagline: "Tradição, experiência e criatividade reunidas em cada peça.",
      items: [
        "20 anos de história",
        "Sushi preparado na hora",
        "Criações com identidade própria",
        "Experiência internacional",
        "Restaurante, delivery e retirada",
        "Reserva e pedido digital"
      ]
    },
    buffet: {
      label: "RODÍZIO PREMIUM",
      headline: "Rodízio Premium Kaisō",
      text: "Aproveite uma experiência completa com sushi, entradas, pratos quentes e especialidades servidas à sua mesa.",
      availability: "Disponível em dias selecionados e com reserva antecipada.",
      cta_menu: "Consulte no menu",
      cta_reserve: "Reservar mesa"
    },
    carta_editorial: {
      label: "O MENU",
      headline: "Uma seleção que muda com nossa criatividade",
      intro: "Descubra nigiris de temporada, makis de autor, entradas, pratos quentes e experiências criadas para compartilhar.",
      nigiri_title: "Nigiris de temporada",
      nigiri_desc: "O que o mar trouxe. Interpretado.",
      omakase_title: "Experiência Omakase",
      omakase_desc: "Deixe o chef criar. Disponível com reserva prévia.",
      rolls_title: "Makis de autor",
      rolls_desc: "Equilíbrio entre o Japão e o Mediterrâneo. Nossa assinatura.",
      sake_title: "Entradas e cozinha quente",
      sake_desc: "Seleção pequena. Curada.",
      note: "Consulte pratos, preços e promoções em nosso menu digital.",
      cta_menu: "Ver menu completo",
      cta_reserve: "Reservar mesa"
    },
    opiniones: {
      label: "O QUE DIZEM NOSSOS CLIENTES",
      headline: "O que dizem nossos clientes",
      cta_google: "Ver opiniões no Google",
      cta_review: "Deixar uma opinião"
    },
    institutional: {
      label: "MAIS QUE SUSHI",
      headline: "Uma experiência Kaisō",
      desc1: "Técnica japonesa, produto fresco e criatividade sem limites.",
      desc2: "Cada peça é preparada com precisão para transformar uma refeição em uma experiência.",
      pillar1: "Técnica japonesa",
      pillar2: "Produto selecionado",
      pillar3: "Criatividade de autor",
      cta: "Descobrir o menu"
    },
    admin: {
      title: "Painel de Administração",
      reservations: "Reservas",
      stats: "Estatísticas",
      settings: "Configurações",
      export: "Exportar CSV",
      blackout: "Dias Bloqueados",
      status: {
        pendente: "Pendente",
        confirmada: "Confirmada",
        cancelada: "Cancelada",
        "no-show": "No-show"
      }
    }
  },

  en: {
    nav: {
      inicio: "Home",
      carta: "Menu",
      reservas: "Reservations",
      ubicacion: "Location",
      entrega: "Delivery",
      contacto: "Contact",
      franquicias: "Franchises",
      filosofia: "Philosophy",
      experiencia: "Experience"
    },
    hero: {
      badge: "KAISŌ SUSHI",
      headline: "Fresh, creative sushi prepared right now in Córdoba",
      subtitle: "20 years of history bringing the Kaisō experience from Brazil to Portugal and Spain.",
      subheadline: "Contemporary Japanese fusion dining in the heart of Córdoba",
      location: "Av. de Barcelona, 19 · Córdoba",
      cta_reservar: "Reserve a table",
      cta_menu: "View menu",
      cta_whatsapp: "Chat on WhatsApp",
      cta_carta: "View Menu"
    },
    reservation: {
      title: "Book a Table",
      subtitle: "A unique gastronomic experience",
      select_date: "Select date",
      select_time: "Select time",
      your_details: "Your details",
      guests: "Guests",
      date: "Date",
      time: "Time",
      name: "Full name",
      phone: "Phone (WhatsApp)",
      email: "Email",
      observations: "Note to the chef",
      lunch: "Lunch",
      dinner: "Dinner",
      closed_monday: "Closed on Mondays",
      capacity_full: "Fully booked for this date",
      remaining: "spots available",
      confirm: "Confirm Reservation",
      confirm_whatsapp: "Confirm via WhatsApp",
      success_title: "Reservation Received!",
      success_message: "We have received your request. We will confirm shortly.",
      hours_notice: "Reservations are handled from 20:00 to 22:30. Outside these hours, we will confirm during the next available window.",
      discount_notice: "",
      discount_applied: "",
      tasting_title: "Would you like to add the Omakase Premium experience?",
      tasting_desc: "",
      tasting_price: "",
      tasting_availability: "",
      tasting_allergies: "Allergies / dietary restrictions"
    },
    delivery: {
      title: "Delivery",
      headline: "In-House Delivery Service",
      description: "Delivered by our own courier. We do not use Uber Eats or Glovo. Quality guaranteed to your door.",
      cta: "Order via WhatsApp"
    },
    franchise: {
      title: "Franchises",
      headline: "Join the Kaisō Family",
      description: "Discover franchise opportunities with Grupo Kaisō España.",
      cta: "Learn More"
    },
    footer: {
      hours_title: "Hours",
      lunch_label: "Lunch",
      dinner_label: "Dinner",
      tue_thu: "Tue–Thu",
      fri_sat: "Fri–Sat",
      fri_sun: "Fri–Sun",
      sun: "Sun",
      tue: "Tue",
      wed_sun: "Wed–Sun",
      closed: "Mon · Closed",
      contact: "Contact",
      location: "Location",
      digital_menu: "Digital menu",
      company_info: "Legal Information",
      privacy_policy: "Privacy Policy",
      cookies_policy: "Cookies Policy",
      terms: "Terms and Conditions",
      cancellation_policy: "Cancellation Policy",
      followus: "Follow us",
      copyright: "© Kaisō Sushi Córdoba. All rights reserved.",
      hours_monday: "Closed",
      hours_tue_thu: "12:00–14:00 / 19:00–23:00",
      hours_fri_sun_lunch: "12:00–15:30",
      hours_fri_sun_dinner: "19:00–23:30"
    },
    historia: {
      label: "OUR STORY",
      headline: "20 years of history",
      text: "Kaisō Sushi was born in Brazil 20 years ago, driven by a passion for Japanese gastronomy, creativity and care for each piece.\n\nThroughout our history, the Kaisō concept has grown and been part of projects and operations in Brazil, Portugal and Spain.\n\nOn August 12, 2025 we opened the doors of Kaisō Sushi Córdoba, on Avenida de Barcelona, 19. In August 2026 we celebrate our first anniversary in the city, maintaining the essence built over two decades: sushi prepared fresh, flavor, creativity and closeness with our customers.",
      countries: "Brazil · Portugal · Spain"
    },
    aniversario: {
      headline: "First anniversary in Córdoba",
      text: "On August 12 we celebrate our first year in Córdoba. A year of new customers, experiences, learning and lots of sushi prepared with dedication.",
      tagline: "Thank you, Córdoba, for being part of our story."
    },
    filosofia: {
      line1: "We don't follow tradition.",
      line2: "We create experiences.",
      text1: "At Kaisō we respect Japanese technique. But we believe innovation is part of gastronomic evolution.",
      text2: "Each piece is born from precision. Each flavor breaks expectations. That is what we serve."
    },
    chef: {
      label: "The founder behind Kaisō",
      text1: "Leandro Crispim started the history of Kaisō Sushi in Brazil 20 years ago. His experience in Japanese gastronomy, brand creation and operations development brought the Kaisō concept from Brazil to Portugal and Spain.",
      text2: "In Córdoba, he combines technique, creativity and experience to offer sushi prepared fresh, with its own identity and excellent value for money.",
      complement: "20 years of experience · Brazil · Portugal · Spain",
      details: [
        "Japanese technique, respect for tradition",
        "Carefully selected product",
        "Creativity in every piece",
        "Excellent value for money"
      ]
    },
    tecnica: {
      label: "The Craft",
      caption1: "Cutting precision",
      caption2: "Raw material",
      headline: "Discover our menu, signature combinations, author-created pieces, hot dishes, buffet and sharing options in our digital menu.",
      subtext: "Technique sustains the experience. Creativity defines it.",
      cta_menu: "View full menu"
    },
    diferenciales: {
      label: "WHY CHOOSE KAISŌ?",
      headline: "Why choose Kaisō?",
      tagline: "Tradition, experience and creativity united in every piece.",
      items: [
        "20 years of history",
        "Fresh sushi prepared right now",
        "Creations with their own identity",
        "International experience",
        "Restaurant, delivery and takeout",
        "Digital reservations and orders"
      ]
    },
    buffet: {
      label: "PREMIUM RODIZIO",
      headline: "Kaisō Premium Rodizio",
      text: "Enjoy a complete experience with sushi, appetizers, hot dishes and specialties served at your table.",
      availability: "Available on selected days and with advance reservation.",
      cta_menu: "Check the menu",
      cta_reserve: "Reserve a table"
    },
    carta_editorial: {
      label: "THE MENU",
      headline: "A selection that changes with our creativity",
      intro: "Discover seasonal nigiris, signature rolls, appetizers, hot dishes and experiences created to share.",
      nigiri_title: "Seasonal nigiris",
      nigiri_desc: "What the sea brought. Interpreted.",
      omakase_title: "Omakase Experience",
      omakase_desc: "Let the chef create. Available with prior reservation.",
      rolls_title: "Signature rolls",
      rolls_desc: "Balance between Japan and the Mediterranean. Our signature.",
      sake_title: "Appetizers and hot dishes",
      sake_desc: "Small selection. Curated.",
      note: "Check out dishes, prices and promotions in our digital menu.",
      cta_menu: "View full menu",
      cta_reserve: "Reserve a table"
    },
    opiniones: {
      label: "WHAT OUR CUSTOMERS SAY",
      headline: "What our customers say",
      cta_google: "View reviews on Google",
      cta_review: "Leave a review"
    },
    institutional: {
      label: "MORE THAN SUSHI",
      headline: "A Kaisō Experience",
      desc1: "Japanese technique, fresh product and unlimited creativity.",
      desc2: "Each piece is prepared with precision to transform a meal into an experience.",
      pillar1: "Japanese technique",
      pillar2: "Selected product",
      pillar3: "Author's creativity",
      cta: "Discover the menu"
    },
    admin: {
      title: "Admin Panel",
      reservations: "Reservations",
      stats: "Statistics",
      settings: "Settings",
      export: "Export CSV",
      blackout: "Blocked Dates",
      status: {
        pendente: "Pending",
        confirmada: "Confirmed",
        cancelada: "Cancelled",
        "no-show": "No-show"
      }
    }
  }
};

export default translations;
