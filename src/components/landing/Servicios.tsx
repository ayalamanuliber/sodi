"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const services = [
  {
    title: "Presencia Online",
    desc: "Sitio web profesional con dominio, hosting, email y todo incluido. Listo para recibir clientes.",
    items: ["Sitio web / landing page", "Dominio + hosting + SSL", "Email profesional", "SEO y Google Business"],
    color: "s-accent",
    border: "border-s-accent/15",
    bg: "bg-s-accent/[0.03]",
    dot: "bg-s-accent",
    iconBg: "bg-s-accent/10 border-s-accent/15 text-s-accent",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Redes Sociales",
    desc: "Setup completo: perfiles, contenido, templates y estrategia para arrancar con todo.",
    items: ["Perfiles optimizados", "Contenido diseñado y redactado", "Templates editables", "Estrategia y calendario"],
    color: "purple-400",
    border: "border-purple-400/15",
    bg: "bg-purple-400/[0.03]",
    dot: "bg-purple-400",
    iconBg: "bg-purple-400/10 border-purple-400/15 text-purple-400",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Pack Digital",
    desc: "Web + redes en un solo paquete con descuento. Todo integrado y coherente.",
    items: ["Web completa + redes armadas", "Identidad visual unificada", "Ahorro vs comprar separado", "Entrega coordinada"],
    color: "s-accent",
    border: "border-s-accent/20",
    bg: "bg-s-accent/[0.04]",
    dot: "bg-s-accent",
    iconBg: "bg-s-accent/10 border-s-accent/20 text-s-accent",
    featured: true,
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Automatización",
    desc: "Flujos automáticos para responder consultas, calificar leads y no perder oportunidades.",
    items: ["WhatsApp automático", "Formularios inteligentes", "Calificación de consultas", "Multi-canal"],
    color: "s-wa",
    border: "border-s-wa/15",
    bg: "bg-s-wa/[0.03]",
    dot: "bg-s-wa",
    iconBg: "bg-s-wa/10 border-s-wa/15 text-s-wa",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Sistemas Internos",
    desc: "Paneles y procesos para dejar de depender de chats, memoria o Excel.",
    items: ["Panel operativo a medida", "Control de clientes / stock", "Roles y permisos", "Reportes y métricas"],
    color: "blue-400",
    border: "border-blue-400/15",
    bg: "bg-blue-400/[0.03]",
    dot: "bg-blue-400",
    iconBg: "bg-blue-400/10 border-blue-400/15 text-blue-400",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Solución Integral",
    desc: "Todo junto: web, redes, automatización y sistema interno, implementado por etapas.",
    items: ["Web + redes + automatización", "Sistema interno", "Implementación por etapas", "Soporte continuo"],
    color: "s-orange",
    border: "border-s-orange/15",
    bg: "bg-s-orange/[0.03]",
    dot: "bg-s-orange",
    iconBg: "bg-s-orange/10 border-s-orange/15 text-s-orange",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Servicios() {
  return (
    <section id="servicios" className="py-14 sm:py-24 px-4 sm:px-6 bg-[#050508]">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp()} className="mb-8 sm:mb-14">
          <p className="text-s-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-3">
            Servicios
          </p>
          <h2 className="text-[1.4rem] sm:text-3xl md:text-[2.75rem] font-extrabold tracking-tighter leading-tight max-w-2xl font-heading">
            Todo lo que necesitás para crecer, en un solo lugar
          </h2>
          <p className="text-s-dim text-[13px] sm:text-[14px] mt-3 max-w-lg leading-relaxed">
            Cada servicio tiene 3 planes con precio fijo. Hacé el diagnóstico y te sugerimos el ideal para vos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {services.map((s, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.06)}
              className={`relative p-5 sm:p-7 rounded-2xl border transition-all duration-300 hover:translate-y-[-2px] ${s.bg} ${s.border} ${
                s.featured ? "sm:ring-1 sm:ring-s-accent/10" : ""
              }`}
            >
              {s.featured && (
                <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-s-accent text-black text-[9px] font-black uppercase tracking-wider rounded-full">
                  Más elegido
                </span>
              )}

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 border ${s.iconBg}`}>
                {s.icon}
              </div>

              <h3 className="text-[15px] sm:text-[17px] font-bold tracking-tight text-white mb-2">
                {s.title}
              </h3>
              <p className="text-s-sub text-[12px] sm:text-[13px] leading-relaxed mb-5">
                {s.desc}
              </p>

              <ul className="space-y-2 border-t border-white/5 pt-4">
                {s.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-[11px] sm:text-[12px] text-white/50">
                    <span className={`w-1 h-1 rounded-full ${s.dot} shrink-0`} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div {...fadeUp(0.3)} className="mt-8 sm:mt-12 text-center">
          <Link
            href="/diagnostico"
            className="btn-primary inline-flex items-center gap-3 bg-s-accent text-black px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-xl text-[14px] font-black uppercase tracking-tight"
          >
            Descubrir mi plan y precio
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="mt-4 text-[11px] text-s-dim">
            Planes desde $300.000 · Miembros CAEDE -25%
          </p>
        </motion.div>
      </div>
    </section>
  );
}
