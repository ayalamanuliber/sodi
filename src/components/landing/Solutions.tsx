"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const Arrow = () => (
  <svg className="w-4 h-4 text-s-accent/40 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M5 12h14m-4-4l4 4-4 4" />
  </svg>
);

const cards = [
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconBg: "bg-s-accent/10 border-s-accent/15 text-s-accent",
    title: "Consultas y respuesta",
    titleColor: "",
    desc: "Automatizaciones y flujos para responder más rápido y no perder oportunidades.",
    items: ["WhatsApp automático", "Formularios y agenda", "Calificación de consultas"],
    dot: "bg-s-accent",
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconBg: "bg-blue-500/10 border-blue-500/15 text-blue-400",
    title: "Operación y gestión",
    titleColor: "text-blue-400",
    desc: "Paneles y procesos para dejar de depender de chats, memoria o Excel.",
    items: ["Paneles operativos", "Control de clientes / stock", "Info centralizada"],
    dot: "bg-blue-400",
  },
  {
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    iconBg: "bg-white/5 border-white/10 text-white",
    title: "Web y distribución",
    titleColor: "",
    desc: "Sitios que convierten y se conectan con tu operación real.",
    items: ["Webs de conversión", "Conexión con WhatsApp y sistema", "Optimizado para celular"],
    dot: "bg-white/60",
  },
];

export function Solutions() {
  return (
    <section id="soluciones" className="py-14 sm:py-24 px-6 bg-[#050508]">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp()} className="mb-8 sm:mb-16">
          <p className="text-s-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-3">Todo conectado</p>
          <h2 className="text-[1.4rem] sm:text-3xl md:text-[2.75rem] font-extrabold tracking-tighter leading-tight max-w-xl font-heading">
            Cómo conectamos tu web, tus consultas y tu operación
          </h2>
          <p className="text-s-dim text-[13px] sm:text-[14px] mt-3 max-w-lg leading-relaxed">
            Sí: también diseñamos y desarrollamos webs. Pero que funcionen dentro de tu negocio.
          </p>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="mb-8 sm:mb-16 hidden sm:block overflow-x-auto pb-2">
          <div className="flex items-center gap-3 min-w-max mx-auto justify-center text-[12px] font-semibold text-s-sub">
            <span className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">Web / Campaña</span>
            <Arrow />
            <span className="px-4 py-2.5 bg-white/[0.03] border border-s-accent/15 rounded-lg">WhatsApp</span>
            <Arrow />
            <span className="px-4 py-2.5 bg-white/[0.03] border border-blue-500/15 rounded-lg">Sistema / Panel</span>
            <Arrow />
            <span className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg">Seguimiento</span>
            <Arrow />
            <span className="px-4 py-2.5 bg-white/[0.03] border border-s-accent/25 rounded-lg text-s-accent">Venta</span>
          </div>
        </motion.div>
        <motion.p {...fadeUp(0.1)} className="sm:hidden text-[12px] text-s-dim mb-6 tracking-wide">
          Consulta → Respuesta → Sistema → Seguimiento → Venta
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {cards.map((card, i) => (
            <motion.div key={i} {...fadeUp(0.1 * (i + 1))} className="sodi-card p-6 sm:p-8 flex flex-col">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-5 border opacity-60 ${card.iconBg}`}>
                {card.icon}
              </div>
              <h3 className={`text-[16px] sm:text-lg font-bold mb-2 tracking-tight ${card.titleColor}`}>{card.title}</h3>
              <p className="text-s-sub text-[13px] mb-6 leading-relaxed">{card.desc}</p>
              <ul className="space-y-2.5 mt-auto border-t border-white/5 pt-5">
                {card.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-[11px] text-white/50">
                    <span className={`w-1 h-1 rounded-full ${card.dot}`} /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
