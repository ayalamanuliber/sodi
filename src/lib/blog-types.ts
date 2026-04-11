// ── Blog Article Types ──

export interface FAQ {
  question: string;
  answer: string;
}

export interface RelatedLink {
  slug: string;
  title: string;
}

export interface ArticleMeta {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  silo: string;
  siloLabel: string;
  tags: string[];
  datePublished: string;
  dateModified: string;
  readingTime: string;
  relatedSlugs: string[];
}

export interface ArticleContent {
  intro: string;
  sections: {
    heading: string;
    body: string;
  }[];
  faqs: FAQ[];
  ctaText: string;
}

export interface Article extends ArticleMeta {
  content: ArticleContent;
}

// ── Silo definitions ──

export const silos: Record<string, { label: string; description: string; color: string }> = {
  "web-por-rubro": {
    label: "Web por Rubro",
    description: "Páginas web profesionales para cada industria",
    color: "s-accent",
  },
  "sistema-por-rubro": {
    label: "Sistemas por Rubro",
    description: "CRM y sistemas de gestión para cada industria",
    color: "blue-400",
  },
  "whatsapp-por-rubro": {
    label: "WhatsApp por Rubro",
    description: "Automatización de WhatsApp para cada industria",
    color: "s-wa",
  },
  "redes-por-rubro": {
    label: "Redes por Rubro",
    description: "Estrategia de redes sociales para cada industria",
    color: "purple-400",
  },
  "turnos-por-rubro": {
    label: "Turnos por Rubro",
    description: "Sistemas de turnos online para cada industria",
    color: "amber-400",
  },
  "precios": {
    label: "Precios y Costos",
    description: "Cuánto cuestan los servicios digitales en Argentina",
    color: "s-accent",
  },
  "guias": {
    label: "Guías Prácticas",
    description: "Cómo resolver problemas digitales en tu empresa",
    color: "s-accent",
  },
  "comparativas": {
    label: "Comparativas",
    description: "Comparaciones entre herramientas y soluciones digitales",
    color: "s-orange",
  },
  "por-ciudad": {
    label: "Por Ciudad",
    description: "Servicios digitales en tu ciudad",
    color: "blue-400",
  },
  "digital-ideal": {
    label: "El Digital Ideal",
    description: "Cómo debería verse la presencia digital de tu rubro",
    color: "s-accent",
  },
  "conceptos": {
    label: "Conceptos",
    description: "Qué es cada herramienta y para qué sirve",
    color: "s-sub",
  },
};

// ── Schema builders ──

export function buildArticleSchema(article: ArticleMeta, url: string) {
  const siloInfo = silos[article.silo];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://sodi.com.ar/#organization",
        name: "SODI",
        url: "https://sodi.com.ar",
        logo: "https://sodi.com.ar/icon-512.png",
        description:
          "Implementamos webs, automatizaciones, bots de WhatsApp, redes sociales y sistemas internos para empresas argentinas.",
        areaServed: { "@type": "Country", name: "Argentina" },
        sameAs: ["https://www.instagram.com/sodi.ar"],
        knowsAbout: [
          "Desarrollo web",
          "Automatización empresarial",
          "WhatsApp Business",
          "Sistemas de gestión",
          "Redes sociales para empresas",
          "CRM para PyMEs",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://sodi.com.ar/#website",
        url: "https://sodi.com.ar",
        name: "SODI",
        publisher: { "@id": "https://sodi.com.ar/#organization" },
        inLanguage: "es-AR",
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: article.metaTitle,
        isPartOf: { "@id": "https://sodi.com.ar/#website" },
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        breadcrumb: { "@id": `${url}#breadcrumb` },
        inLanguage: "es-AR",
      },
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: article.title,
        description: article.metaDescription,
        author: { "@id": "https://sodi.com.ar/#organization" },
        publisher: { "@id": "https://sodi.com.ar/#organization" },
        datePublished: article.datePublished,
        dateModified: article.dateModified,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        inLanguage: "es-AR",
        about: article.tags.map((t) => ({ "@type": "Thing", name: t })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "SODI",
            item: "https://sodi.com.ar",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://sodi.com.ar/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: siloInfo?.label || article.silo,
            item: `https://sodi.com.ar/blog?silo=${article.silo}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: article.title,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faqpage`,
        mainEntity: article.tags.length > 0 ? [] : [],
      },
    ],
  };
}

export function buildFAQSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "#faqpage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
