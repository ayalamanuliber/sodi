"use client";

import { BentoCard } from "./BentoCard";

const sectors = ["Inmobiliarias", "Estudios profesionales", "Salud y atención", "Construcción e industria", "y otros rubros"];

export function CaseStudy() {
  return (
    <section id="casoreal" className="py-20 lg:py-32 relative">
      <div className="absolute inset-0 bg-[#050508]/80 backdrop-blur-2xl" />
      <div className="max-w-6xl mx-auto px-5 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 reveal">
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tg-white mb-4 md:mb-6 tracking-tight">
            Caso real.
          </h2>
          <p className="text-s-sub text-base md:text-lg lg:text-xl font-light">
            Un proyecto activo que muestra cómo trabajamos.
          </p>
        </div>

        <BentoCard className="p-6 sm:p-10 md:p-16 lg:p-20 reveal reveal-delay-1 border-s-orange/20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 relative z-10 items-center">
            {/* Left — Story */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-s-orange/25 bg-s-orange/10 mb-6 md:mb-8">
                <span className="w-2 h-2 rounded-full bg-s-orange animate-pulse" />
                <span className="text-[10px] md:text-xs font-bold tracking-[0.15em] text-s-orange uppercase">
                  CAEDE · Proyecto activo
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-white leading-[1.2] tracking-tight">
                CAEDE: de web a canal comercial.
              </h3>

              <p className="text-s-sub mb-8 md:mb-10 text-sm md:text-lg leading-relaxed font-light">
                Desarrollamos la presencia digital de CAEDE como base para conectar empresas con soluciones de sistema y operación. No fue solo una web. Fue un canal.
              </p>

              <div className="space-y-3 mb-8 md:mb-10">
                {[
                  "Web institucional y presencia digital",
                  "Canal de entrada hacia empresas del sector",
                  "Base para venta de sistemas operativos",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[12px] sm:text-[13px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-s-orange shrink-0" />
                    <span className="text-white/70">{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://caede.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-s-orange font-bold uppercase tracking-wider text-xs md:text-sm group hover:text-white transition-colors"
              >
                Ver CAEDE
                <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Right — Mock panel */}
            <div className="rounded-xl border border-s-orange/10 bg-[#060608] p-5 sm:p-7 shadow-[0_8px_50px_rgba(255,107,0,0.06)]">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-s-orange animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">Panel CAEDE</span>
                </div>
                <span className="text-[9px] font-mono text-s-dim">En operación</span>
              </div>

              <div className="p-3.5 bg-white/[0.02] border-l-2 border-s-orange rounded-lg mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-white">Excavadora CAT-930</span>
                  <span className="text-[8px] font-bold text-s-orange px-1.5 py-0.5 bg-s-orange/10 rounded">Service</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-bold font-heading">502 <span className="text-[9px] text-s-dim">hs</span></span>
                  <span className="text-[9px] text-s-dim">J. Domínguez</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/[0.02] border-l-2 border-s-accent rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold text-white">Mixer 04</span>
                  <span className="text-[8px] font-bold text-s-accent px-1.5 py-0.5 bg-s-accent/10 rounded">Operativo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12px] font-bold text-white/70">Obra San Telmo</span>
                  <span className="text-[9px] text-s-dim">ETA: 14:35</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5 text-center">
                <div>
                  <div className="text-base font-bold font-heading">18</div>
                  <div className="text-[8px] text-s-dim uppercase">Equipos</div>
                </div>
                <div>
                  <div className="text-base font-bold font-heading text-s-accent">3</div>
                  <div className="text-[8px] text-s-dim uppercase">Obras</div>
                </div>
                <div>
                  <div className="text-base font-bold font-heading text-s-orange">1</div>
                  <div className="text-[8px] text-s-dim uppercase">Alerta</div>
                </div>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Sectors */}
        <div className="reveal reveal-delay-3 mt-10 sm:mt-14 text-center">
          <p className="text-[10px] text-s-dim uppercase tracking-[0.25em] font-bold mb-4">También aplicamos en</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-[11px] sm:text-[12px] text-s-sub font-medium">
            {sectors.map((s) => (
              <span key={s} className="px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
