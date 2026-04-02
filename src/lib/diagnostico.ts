// ── Types ──

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

export interface ProductOutput {
  slug: string;
  title: string;
  description: string;
  ideal: string;
  features: string[];
  priceRange: string;
  priceRangeARS: string;
  timeline: string;
  nextStep: string;
}

export type Answers = Record<string, string>;

// ── Questions ──

export const questions: Question[] = [
  {
    id: "necesidad",
    title: "¿Qué necesitás resolver?",
    subtitle: "Elegí la opción que más se parezca a tu situación actual.",
    options: [
      { id: "web", label: "Necesito una web", tags: ["web"] },
      { id: "automatizar", label: "Quiero automatizar respuestas o consultas", tags: ["auto"] },
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
      { id: "presencia", label: "Tener una presencia profesional", tags: ["web"] },
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
    options: [
      { id: "simple", label: "Algo simple", tags: ["simple"] },
      { id: "intermedio", label: "Algo intermedio", tags: ["medio"] },
      { id: "completo", label: "Algo más completo", tags: ["completo"] },
      { id: "nosesabe", label: "No sé todavía", tags: ["medio"] },
    ],
  },
  {
    id: "urgencia",
    title: "¿Qué urgencia tenés?",
    options: [
      { id: "ya", label: "Lo necesito ya", tags: ["urgente"] },
      { id: "semanas", label: "En las próximas semanas", tags: ["normal"] },
      { id: "comparando", label: "Estoy comparando opciones", tags: ["explorando"] },
      { id: "precios", label: "Solo quiero entender precios y tiempos", tags: ["explorando"] },
    ],
  },
  {
    id: "inversion",
    title: "¿Querés una referencia de inversión?",
    subtitle: "No es una cotización final. Es una referencia orientativa.",
    options: [
      { id: "si", label: "Sí, quiero un rango estimado", tags: ["show_price"] },
      { id: "no", label: "Prefiero hablarlo primero", tags: ["hide_price"] },
    ],
  },
];

// ── Product Outputs ──

export const products: ProductOutput[] = [
  {
    slug: "web-esencial",
    title: "Web esencial",
    description:
      "Una web profesional que represente tu negocio, genere confianza y conecte con WhatsApp para recibir consultas de forma ordenada.",
    ideal:
      "Querés una presencia profesional, más consultas y una forma más clara de responder sin arrancar con un sistema más grande.",
    features: [
      "Sitio web / landing page",
      "WhatsApp integrado",
      "Diseño optimizado para celular",
      "Formulario de contacto",
    ],
    priceRange: "USD 400–800",
    priceRangeARS: "ARS 400.000–800.000",
    timeline: "1 a 2 semanas",
    nextStep: "Diagnóstico breve para definir estructura, contenido y flujo de contacto.",
  },
  {
    slug: "web-consultas",
    title: "Web + consultas automatizadas",
    description:
      "Una web que convierte visitantes en consultas, con respuestas automáticas por WhatsApp y formularios inteligentes que califican cada contacto.",
    ideal:
      "Ya recibís consultas pero respondés desordenado. Querés más velocidad, más orden y no perder oportunidades.",
    features: [
      "Sitio web de conversión",
      "WhatsApp automático con flujos",
      "Formularios con agenda integrada",
      "Calificación automática de consultas",
    ],
    priceRange: "USD 800–1.800",
    priceRangeARS: "ARS 800.000–1.800.000",
    timeline: "2 a 4 semanas",
    nextStep: "Diagnóstico para mapear el flujo de consultas actual y diseñar las automatizaciones.",
  },
  {
    slug: "sistema-interno",
    title: "Sistema interno / operación",
    description:
      "Paneles, procesos y herramientas internas para dejar de depender de chats, memoria o Excel. Todo centralizado y accesible.",
    ideal:
      "Ya vendés, pero el caos interno frena tu crecimiento. Necesitás paneles, organización y procesos claros.",
    features: [
      "Panel operativo a medida",
      "Control de clientes / stock / proyectos",
      "Información centralizada",
      "Automatización de procesos repetitivos",
    ],
    priceRange: "USD 1.500–3.500",
    priceRangeARS: "ARS 1.500.000–3.500.000",
    timeline: "3 a 6 semanas",
    nextStep: "Diagnóstico para relevar operación actual, cuellos de botella y prioridades de implementación.",
  },
  {
    slug: "solucion-integral",
    title: "Solución integral",
    description:
      "Web + automatización + sistema interno, implementado por etapas. Para empresas que necesitan ordenar todo: presencia, consultas y operación.",
    ideal:
      "Necesitás varias cosas juntas. Tu presencia, tus consultas y tu operación están desordenadas y querés ordenar todo por etapas.",
    features: [
      "Web de conversión",
      "Automatización de consultas y WhatsApp",
      "Sistema / panel interno",
      "Implementación por etapas",
      "Soporte y optimización continua",
    ],
    priceRange: "USD 2.500–6.000+",
    priceRangeARS: "ARS 2.500.000–6.000.000+",
    timeline: "4 a 10 semanas (por etapas)",
    nextStep: "Diagnóstico completo para definir etapas, prioridades y roadmap de implementación.",
  },
];

// ── Routing Logic ──

export function getResult(answers: Answers): ProductOutput {
  const necesidad = answers.necesidad;
  const prioridad = answers.prioridad;
  const tamano = answers.tamano;

  // Direct mapping first
  if (necesidad === "varias" || necesidad === "nosesabe" || prioridad === "todo") {
    return tamano === "simple" ? products[1] : products[3]; // integral unless explicitly simple
  }

  if (necesidad === "ordenar" || prioridad === "operacion") {
    return tamano === "simple" ? products[1] : products[2]; // sistema
  }

  if (necesidad === "automatizar" || prioridad === "rapidez") {
    return tamano === "completo" ? products[2] : products[1]; // web + consultas
  }

  if (necesidad === "web") {
    if (prioridad === "consultas" || tamano === "intermedio" || tamano === "completo") {
      return products[1]; // web + consultas
    }
    return products[0]; // web esencial
  }

  // Fallback: web + consultas (safest middle ground)
  return products[1];
}

// ── WhatsApp message builder ──

export function buildWhatsAppMessage(answers: Answers, result: ProductOutput): string {
  const prioridadLabels: Record<string, string> = {
    presencia: "Tener una presencia profesional",
    consultas: "Conseguir más consultas",
    rapidez: "Responder más rápido",
    operacion: "Ordenar mejor la operación",
    todo: "Todo junto",
  };

  const urgenciaLabels: Record<string, string> = {
    ya: "Lo necesito ya",
    semanas: "En las próximas semanas",
    comparando: "Estoy comparando opciones",
    precios: "Solo quiero entender precios y tiempos",
  };

  const puntoLabels: Record<string, string> = {
    cero: "Arranco de cero",
    flojo: "Ya tengo algo, pero está flojo",
    desconectado: "Ya tengo algo, pero no está conectado",
    nosesabe: "No estoy seguro",
  };

  const lines = [
    `Hola SODI, hice el diagnóstico guiado.`,
    `La solución sugerida fue: ${result.title}.`,
    `Mi prioridad hoy es: ${prioridadLabels[answers.prioridad] || answers.prioridad}.`,
    `Mi urgencia es: ${urgenciaLabels[answers.urgencia] || answers.urgencia}.`,
    `Hoy estoy en esta etapa: ${puntoLabels[answers.punto] || answers.punto}.`,
    `Quiero conversar alcance, tiempos y opciones.`,
  ];

  return lines.join("\n");
}

export function buildWhatsAppURL(message: string): string {
  return `https://wa.me/5491157210923?text=${encodeURIComponent(message)}`;
}
