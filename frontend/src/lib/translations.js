// Kaisō Sushi - Sistema de Traduções ES/PT/EN
const translations = {
  es: {
    // Nav
    nav: {
      inicio: "Inicio",
      carta: "Carta",
      reservas: "Reservas",
      ubicacion: "Ubicación",
      entrega: "Entrega",
      contacto: "Contacto",
      franquicias: "Franquicias"
    },
    // Hero
    hero: {
      badge: "KAISŌ SIGNATURE STANDARD",
      headline: "Donde la precisión se encuentra con el sabor",
      subheadline: "Alta cocina japonesa de autor en el corazón de Córdoba",
      cta_reservar: "Reservar Mesa",
      cta_carta: "Ver Carta"
    },
    // Reservation
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
      observations: "Observaciones / comentarios",
      lunch: "Almuerzo",
      dinner: "Cena",
      closed_monday: "Cerrado los lunes",
      capacity_full: "Capacidad agotada para esta fecha",
      remaining: "plazas disponibles",
      confirm: "Confirmar Reserva",
      confirm_whatsapp: "Confirmar por WhatsApp",
      success_title: "¡Reserva Recibida!",
      success_message: "Hemos recibido su solicitud. Le confirmaremos a la brevedad.",
      // Aviso horário
      hours_notice: "Reservas atendidas de 08:00 a 21:00. Fuera de este horario, confirmaremos en el siguiente tramo disponible.",
      // Desconto
      discount_notice: "De martes a jueves, disfruta de un 10% de ventaja en tu reserva. Una cortesía de la casa para quienes eligen vivir Kaisō entre semana.",
      discount_applied: "10% aplicado (Mar–Jue)",
      // Rodizio
      tasting_title: "Rodizio de sushis premium",
      tasting_desc: "Comer a voluntad.",
      tasting_price: "€19,90 por persona",
      tasting_availability: "Disponible en horario de reservas.",
      tasting_allergies: "Alergias / restricciones alimentarias"
    },
    // Delivery
    delivery: {
      title: "Entrega a Domicilio",
      headline: "Servicio Propio de Entrega",
      description: "Entrega con estafeta propia. No utilizamos Uber Eats ni Glovo. Calidad garantizada hasta tu puerta.",
      cta: "Pedir por WhatsApp"
    },
    // Franchise
    franchise: {
      title: "Franquicias",
      headline: "Únete a la Familia Kaisō",
      description: "Descubre las oportunidades de franquicia con Grupo Kaisō España.",
      cta: "Más Información"
    },
    // Footer
    footer: {
      hours_title: "Horarios",
      lunch_label: "Almuerzo",
      dinner_label: "Cena",
      tue_thu: "Mar–Jue",
      fri_sat: "Vie–Sáb",
      fri_sun: "Vie–Dom",
      sun: "Dom",
      closed: "Lunes: Cerrado",
      contact: "Contacto",
      location: "Ubicación"
    },
    // Admin
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
      carta: "Cardápio",
      reservas: "Reservas",
      ubicacion: "Localização",
      entrega: "Delivery",
      contacto: "Contato",
      franquicias: "Franquias"
    },
    hero: {
      badge: "KAISŌ SIGNATURE STANDARD",
      headline: "Onde a precisão encontra o sabor",
      subheadline: "Alta gastronomia japonesa autoral no coração de Córdoba",
      cta_reservar: "Reservar Mesa",
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
      observations: "Observações / comentários",
      lunch: "Almoço",
      dinner: "Jantar",
      closed_monday: "Fechado às segundas",
      capacity_full: "Capacidade esgotada para esta data",
      remaining: "vagas disponíveis",
      confirm: "Confirmar Reserva",
      confirm_whatsapp: "Confirmar por WhatsApp",
      success_title: "Reserva Recebida!",
      success_message: "Recebemos sua solicitação. Confirmaremos em breve.",
      hours_notice: "Reservas atendidas das 08:00 às 21:00. Fora desse horário, confirmaremos no próximo período disponível.",
      discount_notice: "De terça a quinta, aproveite 10% de vantagem na sua reserva. Uma cortesia da casa para quem escolhe viver o Kaisō durante a semana.",
      discount_applied: "10% aplicado (Ter–Qui)",
      tasting_title: "Menu Degustação Premium",
      tasting_desc: "Menu para casal. Mais de 10 etapas, bebidas inclusas e sobremesa.",
      tasting_price: "€65,90 por casal",
      tasting_availability: "Disponível de terça a quinta, das 19:00 às 21:00.",
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
      closed: "Segunda: Fechado",
      contact: "Contato",
      location: "Localização"
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
      franquicias: "Franchises"
    },
    hero: {
      badge: "KAISŌ SIGNATURE STANDARD",
      headline: "Where precision meets flavor",
      subheadline: "Signature Japanese haute cuisine in the heart of Córdoba",
      cta_reservar: "Book a Table",
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
      observations: "Notes / comments",
      lunch: "Lunch",
      dinner: "Dinner",
      closed_monday: "Closed on Mondays",
      capacity_full: "Fully booked for this date",
      remaining: "spots available",
      confirm: "Confirm Reservation",
      confirm_whatsapp: "Confirm via WhatsApp",
      success_title: "Reservation Received!",
      success_message: "We have received your request. We will confirm shortly.",
      hours_notice: "Reservations are handled from 08:00 to 21:00. Outside these hours, we will confirm during the next available window.",
      discount_notice: "Tuesday to Thursday, enjoy a 10% advantage on your reservation — a house courtesy for those who choose the Kaisō experience midweek.",
      discount_applied: "10% applied (Tue–Thu)",
      tasting_title: "Premium Tasting Menu",
      tasting_desc: "Menu for couples. Over 10 courses, beverages included, plus dessert.",
      tasting_price: "€65.90 per couple",
      tasting_availability: "Available Tuesday to Thursday, 19:00–21:00.",
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
      closed: "Monday: Closed",
      contact: "Contact",
      location: "Location"
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
