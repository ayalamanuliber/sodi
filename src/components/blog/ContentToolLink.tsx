"use client";

import Link from "next/link";
import { trackEvent } from "@/components/analytics/tracking";
import styles from "./blog.module.css";

interface ContentToolLinkProps {
  articleSlug: string;
  articleSilo: string;
}

const HANDOFF_COPY: Record<string, { title: string; body: string }> = {
  "web-por-rubro": {
    title: "¿Tu web hoy explica, filtra y convierte consultas?",
    body: "Usá el diagnóstico para separar un problema de mensaje, estructura, tráfico o seguimiento.",
  },
  "sistema-por-rubro": {
    title: "¿El trabajo depende de copiar, perseguir o recordar?",
    body: "Ubicá el proceso que conviene ordenar antes de elegir una plataforma o encargar un sistema.",
  },
  "whatsapp-por-rubro": {
    title: "¿WhatsApp concentra más trabajo del que debería?",
    body: "Revisá si el problema está en respuesta, derivación, seguimiento o falta de un sistema detrás.",
  },
  precios: {
    title: "¿Necesitás comparar una inversión real?",
    body: "El diagnóstico ayuda a definir alcance y prioridad antes de pedir presupuestos que no comparan lo mismo.",
  },
  comparativas: {
    title: "¿Seguís entre dos caminos?",
    body: "Llevá la decisión a tu operación: urgencia, dependencia, mantenimiento y costo de cambiar después.",
  },
};

const ARTICLE_HANDOFF_COPY: Record<string, { title: string; body: string }> = {
  "costo-total-erp-pyme-argentina": {
    title: "¿Dos opciones parecen parecidas hasta que sumás implementación y salida?",
    body: "Llevá usuarios, migración, soporte y dependencias a un mismo período antes de pedir una propuesta.",
  },
  "hot-sale-2026-ecommerce-argentina": {
    title: "¿Qué parte del Hot Sale todavía depende de que alguien se acuerde?",
    body: "Revisá stock, cobro, atención y contingencia como un solo recorrido antes de abrir la campaña.",
  },
  "agencia-web-vs-freelancer": {
    title: "¿Necesitás comparar propuestas reales?",
    body: "Definí alcance, responsables y continuidad antes de comparar totales que incluyen trabajos distintos.",
  },
  "pagina-web-para-inmobiliarias": {
    title: "¿Tu consulta pierde la propiedad de origen?",
    body: "Revisá inventario, ficha, contacto y seguimiento como un solo recorrido antes de elegir plataforma o diseño.",
  },
  "como-hacer-aparecer-negocio-google-maps": {
    title: "¿Tu ficha está incompleta o el problema empieza después del clic?",
    body: "Separá visibilidad, confianza, consulta y seguimiento antes de pagar por más tráfico local.",
  },
  "software-a-medida-vs-estandar": {
    title: "¿La herramienta no encaja o el proceso todavía no está definido?",
    body: "Ubicá excepciones, integraciones y costo de cambio antes de comprar una licencia o encargar desarrollo.",
  },
  "whatsapp-manual-vs-bot-automatico": {
    title: "¿Qué conversación conviene ordenar primero?",
    body: "Separá repetición, riesgo y excepciones antes de automatizar. El diagnóstico ayuda a elegir un primer flujo reversible.",
  },
};

export function ContentToolLink({
  articleSlug,
  articleSilo,
}: ContentToolLinkProps) {
  const copy = ARTICLE_HANDOFF_COPY[articleSlug] ?? HANDOFF_COPY[articleSilo] ?? {
    title: "¿Querés ubicar el próximo paso?",
    body: "Respondé seis preguntas generales y recibí una orientación inicial sobre qué conviene revisar primero.",
  };

  return (
    <div className={styles.articleHandoff}>
      <div>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </div>
      <Link
        href={`/diagnostico?origen=blog&articulo=${encodeURIComponent(articleSlug)}&ruta=${encodeURIComponent(articleSilo)}`}
        onClick={() =>
          trackEvent("content_tool_handoff", {
            source_asset: `/blog/${articleSlug}`,
            source_cluster: articleSilo,
            destination: "diagnostico",
            contact_state: "not_started",
          })
        }
      >
        Revisar mi caso
      </Link>
    </div>
  );
}
