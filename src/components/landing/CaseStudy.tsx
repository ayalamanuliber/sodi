"use client";

import { BentoCard } from "./BentoCard";

const sectors = ["Inmobiliarias", "Estudios profesionales", "Salud y atención", "Construcción e industria", "Comercio exterior", "y más"];

export function CaseStudy() {
  return (
    <section id="casoreal" className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-[#050508]/80 backdrop-blur-2xl" />
      <div className="max-w-6xl mx-auto px-5 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 reveal">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tg-white mb-4 md:mb-6 tracking-tight">
            Resultados reales.
          </h2>
          <p className="text-s-sub text-base md:text-lg lg:text-xl font-light">
            No es teoría. Es lo que ya hicimos.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-12 md:mb-16 reveal">
          {[
            { number: "30+", label: "Proyectos entregados" },
            { number: "500+", label: "Horas automatizadas" },
            { number: "3 sem", label: "Entrega promedio" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-white tracking-tighter">
                {stat.number}
              </p>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-s-dim uppercase tracking-[0.15em] font-bold mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CAEDE Case Study */}
        <BentoCard className="p-6 sm:p-10 md:p-16 reveal reveal-delay-1 border-s-orange/20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 relative z-10 items-center">
            {/* Left — Story + Testimonial */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-s-orange/25 bg-s-orange/10 mb-6 md:mb-8">
                <span className="w-2 h-2 rounded-full bg-s-orange animate-pulse" />
                <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] text-s-orange uppercase">
                  CAEDE · Caso real
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-white leading-[1.2] tracking-tight">
                La Cámara Argentina de Excavadores y Demoledores confió en SODI para su presencia digital.
              </h3>

              <p className="text-s-sub mb-6 md:mb-8 text-sm md:text-base leading-relaxed font-light">
                CAEDE es la cámara que nuclea a las principales empresas de excavación, demolición y construcción del país. Necesitaban una presencia digital a la altura de su posición en la industria. En 3 semanas implementamos todo: web institucional premium con velocidad top 1%, rediseño de marca, bot de WhatsApp, redes sociales, SEO y sistema de gestión de equipos.
              </p>

              {/* What we did */}
              <div className="space-y-2.5 mb-8 md:mb-10">
                {[
                  "Web institucional profesional (top 1% velocidad)",
                  "Rediseño de logo e identidad visual",
                  "Bot de WhatsApp para consultas",
                  "Gestión de redes sociales",
                  "SEO y posicionamiento",
                  "Sistema de gestión de equipos",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[12px] sm:text-[13px]">
                    <svg className="w-3.5 h-3.5 text-s-accent shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-white/70">{item}</span>
                  </div>
                ))}
              </div>

              {/* Miguel Hale testimonial */}
              <div className="p-5 md:p-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl">
                <svg className="w-6 h-6 text-s-orange/40 mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                </svg>
                <p className="text-[14px] md:text-[15px] text-white/90 leading-relaxed mb-4 italic">
                  "SODI transformó nuestra presencia digital por completo. En tres semanas pasamos de no tener nada a tener una infraestructura profesional a la altura de lo que CAEDE representa para la industria de la construcción en Argentina."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-s-orange/30 to-s-orange/10 border border-s-orange/30 flex items-center justify-center text-[13px] font-bold text-s-orange">
                    MH
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">Miguel Hale</p>
                    <p className="text-[11px] text-s-orange">Presidente de CAEDE</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Before/After + Mock panel */}
            <div className="space-y-4 md:space-y-5">
              {/* Before/After metrics */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-4 md:p-6 text-center">
                  <p className="text-[9px] text-red-400/70 uppercase tracking-wider font-bold mb-2">Antes</p>
                  <p className="text-2xl md:text-3xl font-heading font-black text-white/40 tracking-tighter line-through decoration-red-500/40">0</p>
                  <p className="text-[8px] md:text-[9px] text-s-dim uppercase tracking-wider mt-1">Presencia digital</p>
                </div>
                <div className="bg-gradient-to-br from-s-accent/10 to-transparent border border-s-accent/30 rounded-2xl p-4 md:p-6 text-center">
                  <p className="text-[9px] text-s-accent uppercase tracking-wider font-bold mb-2">Después</p>
                  <p className="text-2xl md:text-3xl font-heading font-black text-s-accent tracking-tighter">100%</p>
                  <p className="text-[8px] md:text-[9px] text-white uppercase tracking-wider mt-1">Digitalizado</p>
                </div>
                <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-4 md:p-6 text-center">
                  <p className="text-2xl md:text-3xl font-heading font-black text-white tracking-tighter">Top 1%</p>
                  <p className="text-[8px] md:text-[9px] text-s-dim uppercase tracking-wider mt-1">Velocidad de carga</p>
                </div>
                <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-4 md:p-6 text-center">
                  <p className="text-2xl md:text-3xl font-heading font-black text-white tracking-tighter">3 sem</p>
                  <p className="text-[8px] md:text-[9px] text-s-dim uppercase tracking-wider mt-1">Tiempo de entrega</p>
                </div>
              </div>

              {/* Mock panel */}
              <div className="rounded-xl border border-s-orange/10 bg-[#060608] p-5 shadow-[0_8px_50px_rgba(255,107,0,0.06)]">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-s-orange animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">Panel CAEDE</span>
                  </div>
                  <span className="text-[9px] font-mono text-s-dim">En operación</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold font-heading">18</div>
                    <div className="text-[8px] text-s-dim uppercase">Equipos</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold font-heading text-s-accent">3</div>
                    <div className="text-[8px] text-s-dim uppercase">Obras</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold font-heading text-s-orange">1</div>
                    <div className="text-[8px] text-s-dim uppercase">Alerta</div>
                  </div>
                </div>
              </div>

              <a
                href="https://caede.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-s-orange font-bold uppercase tracking-wider text-xs group hover:text-white transition-colors"
              >
                Ver caede.com.ar
                <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </BentoCard>

        {/* Other projects */}
        <div className="reveal reveal-delay-3 mt-10 sm:mt-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
            <div className="p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-xl text-center">
              <p className="text-[11px] text-s-dim uppercase tracking-wider font-bold mb-1">También implementamos</p>
              <p className="text-[13px] text-white font-semibold">Agencia de servicios legales (internacional)</p>
            </div>
            <div className="p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-xl text-center">
              <p className="text-[11px] text-s-dim uppercase tracking-wider font-bold mb-1">También implementamos</p>
              <p className="text-[13px] text-white font-semibold">Taller de educación y formación</p>
            </div>
            <div className="p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-xl text-center">
              <p className="text-[11px] text-s-dim uppercase tracking-wider font-bold mb-1">Aplicamos en</p>
              <p className="text-[13px] text-white font-semibold">{sectors.join(" · ")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
