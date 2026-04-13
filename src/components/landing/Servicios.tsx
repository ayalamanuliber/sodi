"use client";

import { useState } from "react";
import Link from "next/link";
import { BentoCard } from "./BentoCard";
import { allServices, formatPrice, type ServiceLine } from "@/lib/diagnostico";

const tabs: { slug: string; short: string }[] = [
  { slug: "presencia-online", short: "Web" },
  { slug: "redes-sociales", short: "Redes" },
  { slug: "pack-digital", short: "Pack Digital" },
  { slug: "automatizacion", short: "Automatización" },
  { slug: "sistemas-internos", short: "Sistemas" },
  { slug: "solucion-integral", short: "Integral" },
];

const serviceCards = [
  {
    title: "Webs y Presencia Digital",
    desc: "Sitios web profesionales con dominio, hosting, email y todo incluido. Diseñados para convertir visitantes en clientes.",
    items: ["Landing pages de conversión", "Sitios institucionales", "E-commerce y tiendas"],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Automatización y WhatsApp",
    desc: "Bots de WhatsApp, formularios inteligentes y flujos automáticos para que no pierdas más consultas por tardar en responder.",
    items: ["Bots IA para WhatsApp 24/7", "Calificación automática de leads", "Conexión con CRM y agenda"],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    featured: true,
  },
  {
    title: "Sistemas Internos y CRM",
    desc: "Paneles, dashboards y herramientas internas para dejar de depender de chats, memoria o Excel. Todo centralizado.",
    items: ["Dashboards a medida", "Integraciones API (Make/Zapier)", "Automatización de procesos"],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function Servicios() {
  return (
    <section id="servicios" className="py-20 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24 reveal">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-bold mb-6 md:mb-8 tg-white tracking-tight">
            Todo lo que necesitás <span className="tg-accent">en un solo lugar</span>
          </h2>
          <p className="text-base md:text-xl text-s-sub max-w-2xl mx-auto font-light leading-relaxed">
            No vendemos herramientas aisladas. Construimos la infraestructura digital que tu empresa necesita para funcionar con orden.
          </p>
        </div>

        {/* 3 Service cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 md:mb-16">
          {serviceCards.map((card, i) => (
            <BentoCard
              key={i}
              className={`p-8 sm:p-10 lg:p-12 group flex flex-col h-full reveal reveal-delay-${i + 1} ${
                card.featured
                  ? "lg:-translate-y-6 border-s-accent/40 shadow-[0_10px_40px_rgba(0,255,163,0.1)] md:shadow-[0_20px_80px_rgba(0,255,163,0.15)]"
                  : ""
              }`}
            >
              {card.featured && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-s-accent/5 to-transparent pointer-events-none" />
                  <div className="absolute top-0 right-6 md:right-10 bg-s-accent text-black text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1.5 md:py-2 rounded-b-lg z-10 tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(0,255,163,0.5)]">
                    Alta Demanda
                  </div>
                </>
              )}

              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6 md:mb-8 transition-all duration-500 group-hover:-translate-y-2 ${
                  card.featured
                    ? "bg-s-accent/10 border border-s-accent/40 text-s-accent group-hover:bg-s-accent/20 group-hover:shadow-[0_0_40px_rgba(0,255,163,0.4)]"
                    : "bg-white/5 border border-white/10 text-gray-400 group-hover:bg-s-accent/10 group-hover:border-s-accent/30 group-hover:text-s-accent group-hover:shadow-[0_10px_30px_rgba(0,255,163,0.2)]"
                }`}
              >
                {card.icon}
              </div>

              <h3 className="font-heading text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">
                {card.title}
              </h3>
              <p className="text-s-sub mb-8 md:mb-10 text-sm md:text-base leading-relaxed flex-grow relative z-10">
                {card.desc}
              </p>

              <div className={`space-y-3 md:space-y-4 pt-6 md:pt-8 border-t ${card.featured ? "border-s-accent/20" : "border-white/10"} relative z-10`}>
                {card.items.map((item, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-3 text-xs md:text-sm text-white font-medium group-hover:translate-x-1 transition-transform"
                    style={{ transitionDelay: `${j * 75}ms` }}
                  >
                    <svg className="w-4 h-4 text-s-accent shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </BentoCard>
          ))}
        </div>

        {/* CTA */}
        <div className="reveal text-center">
          <p className="text-sm text-s-sub mb-5">
            Cada servicio tiene 3 planes con precio fijo. Hacé el diagnóstico y te sugerimos el ideal para vos.
          </p>
          <Link
            href="/diagnostico"
            className="btn-primary inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 text-sm md:text-base group"
          >
            Descubrir mi plan y precio
            <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="mt-4 text-[11px] text-s-dim">
            Miembros CAEDE obtienen 20% de descuento en todos los servicios
          </p>
        </div>
      </div>
    </section>
  );
}
