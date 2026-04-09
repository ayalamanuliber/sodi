// ── Types ──

export interface TierDetail {
  name: string;
  price: number;
  caede: number;
  features: string[];
}

export interface ServiceLine {
  slug: string;
  title: string;
  description: string;
  ideal: string;
  timeline: string;
  nextStep: string;
  tiers: [TierDetail, TierDetail, TierDetail]; // Starter, Profesional, Premium
}

export interface PackResult {
  slug: string;
  title: string;
  description: string;
  ideal: string;
  timeline: string;
  nextStep: string;
  tier: TierDetail;
  tierIndex: number; // 0=starter, 1=pro, 2=premium
  serviceLine: string;
  isPack: boolean;
  packSavings?: number;
}

export type Answers = Record<string, string>;

// ── Service Lines ──

export const presenciaOnline: ServiceLine = {
  slug: "presencia-online",
  title: "Presencia Online",
  description:
    "Tu sitio web profesional con dominio, hosting, email y todo lo que necesitás para estar online de verdad.",
  ideal:
    "Necesitás una presencia digital profesional que genere confianza y conecte con tus clientes.",
  timeline: "5 a 15 días hábiles",
  nextStep: "Diagnóstico breve para definir estructura, contenido y flujo de contacto.",
  tiers: [
    {
      name: "Starter",
      price: 400_000,
      caede: 300_000,
      features: [
        "Landing page (hasta 5 secciones)",
        "Diseño responsive mobile-first",
        "Copywriting profesional incluido",
        "Dominio .com.ar o .com (1 año)",
        "Hosting profesional (1 año)",
        "SSL + optimización de carga (90+ PageSpeed)",
        "Botón de WhatsApp + formulario de contacto",
        "Alta en Google Search Console",
        "1 ronda de revisiones",
        "Entrega en 5–7 días hábiles",
      ],
    },
    {
      name: "Profesional",
      price: 600_000,
      caede: 450_000,
      features: [
        "Sitio multi-página (hasta 7 secciones)",
        "Animaciones y transiciones profesionales",
        "Blog o sección de novedades",
        "Copywriting + estructura de conversión",
        "Logo profesional (3 propuestas, 2 rondas)",
        "Paleta de colores + tipografía + favicon",
        "3 casillas de email profesional",
        "SEO on-page (meta tags, estructura, velocidad)",
        "Google Business Profile optimizado + Maps",
        "WhatsApp con mensaje pre-armado",
        "Formulario inteligente",
        "Capacitación de 30 min",
        "2 rondas de revisiones",
        "Entrega en 7–12 días hábiles",
      ],
    },
    {
      name: "Premium",
      price: 900_000,
      caede: 675_000,
      features: [
        "Sitio completo (hasta 12 secciones/páginas)",
        "Portfolio / catálogo de productos o servicios",
        "Testimonios, casos de éxito y FAQ",
        "Blog con sistema de categorías",
        "Manual de marca (logo, colores, tipografía, usos)",
        "Kit de assets digitales + firmas de email",
        "5 casillas de email profesional",
        "SEO avanzado (schema, sitemap, keywords)",
        "Google Analytics 4 + dashboard configurado",
        "WhatsApp con auto-respuesta básica",
        "Formulario con calificación de consultas",
        "Integración con calendario (Calendly / Cal.com)",
        "Capacitación de 1 hora",
        "3 rondas de revisiones",
        "30 días de soporte post-entrega",
        "Entrega en 10–15 días hábiles",
      ],
    },
  ],
};

export const redesSociales: ServiceLine = {
  slug: "redes-sociales",
  title: "Redes Sociales",
  description:
    "Setup completo de tus redes: perfil, contenido, templates y estrategia para que arranques con todo.",
  ideal:
    "Querés presencia profesional en redes pero no sabés por dónde arrancar o no tenés tiempo.",
  timeline: "5 a 14 días hábiles",
  nextStep: "Diagnóstico para definir plataformas, tono y pilares de contenido.",
  tiers: [
    {
      name: "Starter",
      price: 300_000,
      caede: 225_000,
      features: [
        "1 red social (Instagram o Facebook)",
        "Optimización completa del perfil",
        "10 posteos diseñados y redactados",
        "5 templates editables en Canva",
        "Calendario de contenido (1 mes)",
        "Pilares de contenido definidos",
        "Guía de hashtags relevantes",
        "Entrega en 5–7 días hábiles",
      ],
    },
    {
      name: "Profesional",
      price: 500_000,
      caede: 375_000,
      features: [
        "2 redes sociales (IG + FB o LinkedIn)",
        "Catálogo / tienda en IG (si aplica)",
        "20 posteos diseñados y redactados",
        "8 stories diseñadas",
        "10 templates editables en Canva",
        "Calendario de contenido (2 meses)",
        "Documento de estrategia completo",
        "Análisis de 3 competidores",
        "Guía de copywriting en tu tono de marca",
        "Capacitación de 30 min",
        "Entrega en 7–10 días hábiles",
      ],
    },
    {
      name: "Premium",
      price: 800_000,
      caede: 600_000,
      features: [
        "3 redes sociales (IG + FB + LinkedIn o TikTok)",
        "Setup de Meta Business Suite",
        "30 posteos diseñados y redactados",
        "15 stories + 2 guiones para reels",
        "15 templates editables + banco de 20 copys",
        "Calendario de contenido (3 meses)",
        "Estrategia + roadmap de 90 días",
        "Análisis de 5 competidores",
        "Campañas estacionales + recomendaciones de pauta",
        "2 sesiones de capacitación (1 hora total)",
        "Guía PDF de mantenimiento de redes",
        "Entrega en 10–14 días hábiles",
      ],
    },
  ],
};

export const automatizacion: ServiceLine = {
  slug: "automatizacion",
  title: "Automatización y Consultas",
  description:
    "Flujos automáticos para responder consultas, calificar leads y no perder oportunidades.",
  ideal:
    "Ya recibís consultas pero respondés desordenado. Querés más velocidad y no perder oportunidades.",
  timeline: "2 a 5 semanas",
  nextStep: "Diagnóstico para mapear el flujo de consultas actual y diseñar las automatizaciones.",
  tiers: [
    {
      name: "Starter",
      price: 800_000,
      caede: 600_000,
      features: [
        "WhatsApp auto-reply con flujos básicos",
        "Formulario inteligente con campos dinámicos",
        "Notificaciones automáticas por email",
        "Mensaje de bienvenida personalizado",
        "Integración con 1 canal de entrada",
        "Entrega en 2–3 semanas",
      ],
    },
    {
      name: "Profesional",
      price: 1_500_000,
      caede: 1_125_000,
      features: [
        "Bot con flujos conversacionales completos",
        "Calificación automática de consultas",
        "Integración con agenda (Calendly / Cal.com)",
        "Formularios con lógica condicional",
        "Multi-canal (WhatsApp + web + email)",
        "Dashboard de métricas básico",
        "Capacitación de 1 hora",
        "Entrega en 3–4 semanas",
      ],
    },
    {
      name: "Premium",
      price: 2_500_000,
      caede: 1_875_000,
      features: [
        "Bot con IA conversacional",
        "CRM handoff automático",
        "Lead scoring + priorización",
        "Secuencias de follow-up automáticas",
        "Analytics completo con dashboard",
        "Multi-canal + integraciones personalizadas",
        "Soporte y ajustes por 30 días",
        "Capacitación de 2 horas",
        "Entrega en 4–5 semanas",
      ],
    },
  ],
};

export const sistemasInternos: ServiceLine = {
  slug: "sistemas-internos",
  title: "Sistemas Internos",
  description:
    "Paneles, procesos y herramientas internas para dejar de depender de chats, memoria o Excel.",
  ideal:
    "Ya vendés, pero el caos interno frena tu crecimiento. Necesitás paneles, organización y procesos claros.",
  timeline: "3 a 8 semanas",
  nextStep: "Diagnóstico para relevar operación actual, cuellos de botella y prioridades.",
  tiers: [
    {
      name: "Starter",
      price: 1_500_000,
      caede: 1_125_000,
      features: [
        "Panel operativo simple (1 proceso)",
        "CRUD de clientes o proyectos",
        "Usuarios con roles básicos",
        "Diseño responsive",
        "Hosting y deploy incluido",
        "Entrega en 3–4 semanas",
      ],
    },
    {
      name: "Profesional",
      price: 2_500_000,
      caede: 1_875_000,
      features: [
        "Dashboard con métricas y reportes",
        "Múltiples módulos (clientes, stock, proyectos)",
        "Sistema de roles y permisos",
        "Notificaciones automáticas",
        "Exportación de datos (CSV/PDF)",
        "Capacitación de 1 hora",
        "30 días de soporte post-entrega",
        "Entrega en 4–6 semanas",
      ],
    },
    {
      name: "Premium",
      price: 4_000_000,
      caede: 3_000_000,
      features: [
        "Sistema multi-módulo completo",
        "Integraciones con herramientas externas",
        "Panel de analytics avanzado",
        "Automatización de procesos internos",
        "API propia para conexiones futuras",
        "Documentación técnica",
        "Capacitación de 2 horas",
        "60 días de soporte post-entrega",
        "Entrega en 6–8 semanas",
      ],
    },
  ],
};

// ── Pack Digital (Web + Redes combo) ──

export const packDigital: ServiceLine = {
  slug: "pack-digital",
  title: "Pack Digital Completo",
  description:
    "Web + redes sociales en un solo paquete con descuento. Todo lo que necesitás para arrancar tu presencia digital.",
  ideal:
    "Querés resolver presencia web y redes de una sola vez, con ahorro y todo integrado.",
  timeline: "10 a 20 días hábiles",
  nextStep: "Diagnóstico para definir estructura web, plataformas de redes y estrategia integrada.",
  tiers: [
    {
      name: "Arranque",
      price: 550_000,
      caede: 410_000,
      features: [
        "Web Starter (landing + dominio + hosting + email)",
        "Redes Starter (1 red, 10 posteos, 5 templates)",
        "Identidad visual unificada web + redes",
        "Ahorrás $150.000 vs comprar por separado",
      ],
    },
    {
      name: "Crecimiento",
      price: 880_000,
      caede: 660_000,
      features: [
        "Web Profesional (multi-página + logo + 3 emails + SEO)",
        "Redes Profesional (2 redes, 20 posteos, estrategia)",
        "Identidad visual completa y coherente",
        "Ahorrás $220.000 vs comprar por separado",
      ],
    },
    {
      name: "Lanzamiento Total",
      price: 1_400_000,
      caede: 1_050_000,
      features: [
        "Web Premium (sitio completo + marca + SEO avanzado)",
        "Redes Premium (3 redes, 30 posteos, roadmap 90 días)",
        "Manual de marca integrado web + redes",
        "Ahorrás $300.000 vs comprar por separado",
      ],
    },
  ],
};

// ── Solución Integral ──

export const solucionIntegral: ServiceLine = {
  slug: "solucion-integral",
  title: "Solución Integral",
  description:
    "Web + redes + automatización + sistema interno. Para empresas que necesitan ordenar todo de una vez, por etapas.",
  ideal:
    "Necesitás varias cosas juntas. Tu presencia, tus consultas y tu operación están desordenadas.",
  timeline: "6 a 12 semanas (por etapas)",
  nextStep: "Diagnóstico completo para definir etapas, prioridades y roadmap de implementación.",
  tiers: [
    {
      name: "Starter",
      price: 2_000_000,
      caede: 1_500_000,
      features: [
        "Web Starter + Redes Starter",
        "Automatización Starter (WhatsApp + formularios)",
        "Implementación por etapas",
        "Soporte durante implementación",
      ],
    },
    {
      name: "Profesional",
      price: 3_500_000,
      caede: 2_625_000,
      features: [
        "Web Profesional + Redes Profesional",
        "Automatización Profesional (bot + agenda + multi-canal)",
        "Sistema interno Starter (panel operativo)",
        "Implementación por etapas con roadmap",
        "Soporte y optimización por 60 días",
      ],
    },
    {
      name: "Premium",
      price: 5_500_000,
      caede: 4_125_000,
      features: [
        "Web Premium + Redes Premium",
        "Automatización Premium (IA + CRM + analytics)",
        "Sistema interno Profesional (dashboard + reportes)",
        "Implementación por etapas con roadmap completo",
        "Soporte y optimización por 90 días",
        "Reuniones de seguimiento quincenales",
      ],
    },
  ],
};

// ── All services ──

export const allServices: ServiceLine[] = [
  presenciaOnline,
  redesSociales,
  packDigital,
  automatizacion,
  sistemasInternos,
  solucionIntegral,
];

// ── Questions ──

export interface Option {
  id: string;
  label: string;
  tags: string[];
}

export interface Question {
  id: string;
  title: string;
  subtitle?: string;
  options: Option[];
}

export const questions: Question[] = [
  {
    id: "necesidad",
    title: "¿Qué necesitás resolver?",
    subtitle: "Elegí la opción que más se parezca a tu situación actual.",
    options: [
      { id: "web", label: "Necesito una web profesional", tags: ["web"] },
      { id: "redes", label: "Necesito armar mis redes sociales", tags: ["redes"] },
      { id: "web-redes", label: "Web + redes sociales", tags: ["pack"] },
      { id: "automatizar", label: "Quiero automatizar consultas y respuestas", tags: ["auto"] },
      { id: "ordenar", label: "Quiero ordenar procesos internos", tags: ["sistema"] },
      { id: "varias", label: "Necesito varias cosas", tags: ["integral"] },
      { id: "nosesabe", label: "No estoy seguro todavía", tags: ["integral"] },
    ],
  },
  {
    id: "prioridad",
    title: "¿Qué prioridad tenés hoy?",
    subtitle: "Si pudieras resolver una sola cosa, ¿cuál sería?",
    options: [
      { id: "presencia", label: "Tener una presencia profesional online", tags: ["web", "redes"] },
      { id: "consultas", label: "Conseguir más consultas", tags: ["web", "auto"] },
      { id: "rapidez", label: "Responder más rápido", tags: ["auto"] },
      { id: "operacion", label: "Ordenar mejor la operación", tags: ["sistema"] },
      { id: "todo", label: "Todo junto", tags: ["integral"] },
    ],
  },
  {
    id: "punto",
    title: "¿En qué punto estás?",
    subtitle: "Nos ayuda a dimensionar el proyecto.",
    options: [
      { id: "cero", label: "Arranco de cero", tags: ["nuevo"] },
      { id: "flojo", label: "Ya tengo algo, pero está flojo", tags: ["mejora"] },
      { id: "desconectado", label: "Ya tengo algo, pero no está conectado", tags: ["conectar"] },
      { id: "nosesabe", label: "No estoy seguro", tags: ["nuevo"] },
    ],
  },
  {
    id: "tamano",
    title: "¿Qué tamaño imaginás para el proyecto?",
    subtitle: "Esto nos ayuda a sugerirte el plan correcto.",
    options: [
      { id: "simple", label: "Algo simple y funcional", tags: ["starter"] },
      { id: "intermedio", label: "Algo intermedio y profesional", tags: ["pro"] },
      { id: "completo", label: "Algo completo y premium", tags: ["premium"] },
      { id: "nosesabe", label: "No sé todavía", tags: ["pro"] },
    ],
  },
  {
    id: "urgencia",
    title: "¿Qué urgencia tenés?",
    options: [
      { id: "ya", label: "Lo necesito ya", tags: ["urgente"] },
      { id: "semanas", label: "En las próximas semanas", tags: ["normal"] },
      { id: "comparando", label: "Estoy comparando opciones", tags: ["explorando"] },
    ],
  },
  {
    id: "caede",
    title: "¿Sos miembro de CAEDE?",
    subtitle: "Los miembros de CAEDE tienen 25% de descuento en todos los servicios.",
    options: [
      { id: "si", label: "Sí, soy miembro", tags: ["caede"] },
      { id: "no", label: "No", tags: [] },
      { id: "quiero", label: "No, pero me interesa", tags: ["caede_interested"] },
    ],
  },
];

// ── Routing Logic ──

function getTierIndex(answers: Answers): number {
  const tamano = answers.tamano;
  if (tamano === "simple") return 0;
  if (tamano === "completo" || tamano === "premium") return 2;
  return 1; // intermedio, nosesabe
}

function getServiceLine(answers: Answers): ServiceLine {
  const necesidad = answers.necesidad;
  const prioridad = answers.prioridad;

  if (necesidad === "varias" || necesidad === "nosesabe" || prioridad === "todo") {
    return solucionIntegral;
  }
  if (necesidad === "ordenar" || prioridad === "operacion") {
    return sistemasInternos;
  }
  if (necesidad === "automatizar" || prioridad === "rapidez") {
    return automatizacion;
  }
  if (necesidad === "web-redes") {
    return packDigital;
  }
  if (necesidad === "redes") {
    return redesSociales;
  }
  if (necesidad === "web") {
    if (prioridad === "presencia") return presenciaOnline;
    if (prioridad === "consultas") return presenciaOnline;
    return presenciaOnline;
  }

  // Fallback
  return packDigital;
}

export function getResult(answers: Answers): PackResult {
  const service = getServiceLine(answers);
  const tierIdx = getTierIndex(answers);
  const tier = service.tiers[tierIdx];
  const isCaede = answers.caede === "si";

  return {
    slug: service.slug,
    title: service.title,
    description: service.description,
    ideal: service.ideal,
    timeline: service.timeline,
    nextStep: service.nextStep,
    tier: {
      ...tier,
      price: isCaede ? tier.caede : tier.price,
      caede: tier.caede,
    },
    tierIndex: tierIdx,
    serviceLine: service.slug,
    isPack: service.slug === "pack-digital" || service.slug === "solucion-integral",
    packSavings:
      service.slug === "pack-digital"
        ? [150_000, 220_000, 300_000][tierIdx]
        : undefined,
  };
}

// ── Format price ──

export function formatPrice(price: number): string {
  return price.toLocaleString("es-AR");
}

// ── WhatsApp message builder ──

export function buildWhatsAppMessage(answers: Answers, result: PackResult): string {
  const tierNames = ["Starter", "Profesional", "Premium"];

  const lines = [
    `Hola SODI, hice el diagnóstico guiado.`,
    `Servicio sugerido: ${result.title} — Plan ${result.tier.name}.`,
    `Precio: $${formatPrice(result.tier.price)}.`,
    answers.caede === "si" ? `Soy miembro CAEDE (descuento aplicado).` : "",
    `Mi urgencia: ${answers.urgencia === "ya" ? "Lo necesito ya" : answers.urgencia === "semanas" ? "En las próximas semanas" : "Estoy comparando opciones"}.`,
    `Quiero conversar alcance, tiempos y opciones.`,
  ];

  return lines.filter(Boolean).join("\n");
}

export function buildWhatsAppURL(message: string): string {
  return `https://wa.me/5491157210923?text=${encodeURIComponent(message)}`;
}
