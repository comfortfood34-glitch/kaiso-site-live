// Kaisō Sushi - Sistema de Traduções ES/PT/EN
const translations = {
  es: {
    nav: {
      inicio: "Inicio",
      carta: "Carta",
      reservas: "Reservas",
      ubicacion: "Ubicación",
      entrega: "Entrega",
      contacto: "Contacto",
      franquicias: "Franquicias",
      filosofia: "Filosofía",
      experiencia: "Experiencia"
    },
    hero: {
      badge: "KAISŌ SIGNATURE STANDARD",
      headline: "kaisō",
      subtitle: "Edomae · Córdoba · Solo reservas",
      subheadline: "Alta cocina japonesa de autor en el corazón de Córdoba",
      cta_reservar: "Reservar mesa",
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
      location: "Ubicación"
    },
    filosofia: {
      line1: "El sushi no necesita explicación.",
      line2: "Solo necesita atención.",
      text1: "En Kaisō usamos pescado trabajado con técnica japonesa clásica. No fusión. No interpretación. Honestidad de ingrediente.",
      text2: "Cada pieza tarda años en aprender. Tarda segundos en desaparecer. Eso es lo que servimos."
    },
    chef: {
      label: "El Chef",
      text1: "Doce años perfeccionando arroz. Fermentación. Acidez. Temperatura. Precisión absoluta.",
      text2: "Leandro Crispim no aprendió a hacer sushi. Lo estudió. Cada lote, cada corte, cada grano de arroz trabajado con hangiri y vinagre rojo akazu es el resultado de una obsesión técnica que no tiene fin.",
      details: [
        "Sushi madurado 48 horas",
        "Arroz preparado con hangiri y vinagre akazu",
        "Control riguroso de temperatura y acidez",
        "Técnica Edomae clásica"
      ]
    },
    tecnica: {
      label: "La Técnica",
      caption1: "Precisión de corte",
      caption2: "Materia prima",
      headline: "No tenemos carta fija. Tenemos lo que llegó esta mañana.",
      subtext: "El ingrediente dicta la experiencia. Nunca al revés."
    },
    carta_editorial: {
      label: "La Carta",
      headline: "Una selección",
      nigiri_title: "Nigiris de Temporada",
      nigiri_desc: "Lo que el mar trajo. Lo que el arroz conoce.",
      omakase_title: "Experiencia Omakase",
      omakase_desc: "Deja que el chef decida. Disponible bajo reserva previa.",
      rolls_title: "Makis de Autor",
      rolls_desc: "Equilibrio entre Japón y el Mediterráneo.",
      sake_title: "Sake & Vinos",
      sake_desc: "Selección pequeña. Curada.",
      note: "La carta completa está disponible en el restaurante."
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
      carta: "Cardápio",
      reservas: "Reservas",
      ubicacion: "Localização",
      entrega: "Delivery",
      contacto: "Contato",
      franquicias: "Franquias",
      filosofia: "Filosofia",
      experiencia: "Experiência"
    },
    hero: {
      badge: "KAISŌ SIGNATURE STANDARD",
      headline: "kaisō",
      subtitle: "Edomae · Córdoba · Apenas reservas",
      subheadline: "Alta gastronomia japonesa autoral no coração de Córdoba",
      cta_reservar: "Reservar mesa",
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
      location: "Localização"
    },
    filosofia: {
      line1: "O sushi não precisa de explicação.",
      line2: "Só precisa de atenção.",
      text1: "No Kaisō usamos peixe trabalhado com técnica japonesa clássica. Sem fusão. Sem interpretação. Honestidade do ingrediente.",
      text2: "Cada peça leva anos para aprender. Leva segundos para desaparecer. É isso que servimos."
    },
    chef: {
      label: "O Chef",
      text1: "Doze anos aperfeiçoando arroz. Fermentação. Acidez. Temperatura. Precisão absoluta.",
      text2: "Leandro Crispim não aprendeu a fazer sushi. Estudou. Cada lote, cada corte, cada grão de arroz trabalhado com hangiri e vinagre vermelho akazu é o resultado de uma obsessão técnica sem fim.",
      details: [
        "Sushi maturado 48 horas",
        "Arroz preparado com hangiri e vinagre akazu",
        "Controle rigoroso de temperatura e acidez",
        "Técnica Edomae clássica"
      ]
    },
    tecnica: {
      label: "A Técnica",
      caption1: "Precisão de corte",
      caption2: "Matéria-prima",
      headline: "Não temos cardápio fixo. Temos o que chegou esta manhã.",
      subtext: "O ingrediente dita a experiência. Nunca o contrário."
    },
    carta_editorial: {
      label: "O Cardápio",
      headline: "Uma seleção",
      nigiri_title: "Nigiris de Temporada",
      nigiri_desc: "O que o mar trouxe. O que o arroz conhece.",
      omakase_title: "Experiência Omakase",
      omakase_desc: "Deixe o chef decidir. Disponível com reserva prévia.",
      rolls_title: "Makis de Autor",
      rolls_desc: "Equilíbrio entre o Japão e o Mediterrâneo.",
      sake_title: "Sake & Vinhos",
      sake_desc: "Seleção pequena. Curada.",
      note: "O cardápio completo está disponível no restaurante."
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
      badge: "KAISŌ SIGNATURE STANDARD",
      headline: "kaisō",
      subtitle: "Edomae · Córdoba · Reservations only",
      subheadline: "Signature Japanese haute cuisine in the heart of Córdoba",
      cta_reservar: "Reserve a table",
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
      location: "Location"
    },
    filosofia: {
      line1: "Sushi needs no explanation.",
      line2: "Only attention.",
      text1: "At Kaisō we use fish worked with classic Japanese technique. No fusion. No interpretation. Ingredient honesty.",
      text2: "Each piece takes years to learn. It takes seconds to disappear. That is what we serve."
    },
    chef: {
      label: "The Chef",
      text1: "Twelve years perfecting rice. Fermentation. Acidity. Temperature. Absolute precision.",
      text2: "Leandro Crispim didn't learn to make sushi. He studied it. Each batch, each cut, each grain of rice worked with hangiri and akazu red vinegar is the result of a technical obsession without end.",
      details: [
        "Sushi aged 48 hours",
        "Rice prepared with hangiri and akazu vinegar",
        "Rigorous control of temperature and acidity",
        "Classic Edomae technique"
      ]
    },
    tecnica: {
      label: "The Craft",
      caption1: "Cutting precision",
      caption2: "Raw material",
      headline: "We have no fixed menu. We have what arrived this morning.",
      subtext: "The ingredient dictates the experience. Never the other way around."
    },
    carta_editorial: {
      label: "The Menu",
      headline: "A selection",
      nigiri_title: "Seasonal Nigiris",
      nigiri_desc: "What the sea brought. What the rice knows.",
      omakase_title: "Omakase Experience",
      omakase_desc: "Let the chef decide. Available with prior reservation.",
      rolls_title: "Signature Rolls",
      rolls_desc: "Balance between Japan and the Mediterranean.",
      sake_title: "Sake & Wines",
      sake_desc: "Small selection. Curated.",
      note: "The full menu is available at the restaurant."
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
