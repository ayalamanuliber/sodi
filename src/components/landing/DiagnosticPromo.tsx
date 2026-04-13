"use client";

import Link from "next/link";
import { BentoCard } from "./BentoCard";

export function DiagnosticPromo() {
  return (
    <section className="py-20 lg:py-32 relative border-t border-white/5 bg-black">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[60%] h-px bg-gradient-to-r from-transparent via-s-accent/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="lg:col-span-7 reveal">
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 text-white leading-[1.1] tracking-tight">
              ¿No sabés qué plan es para vos?{" "}
              <span className="tg-accent block mt-1 md:mt-2">Hacé el diagnóstico guiado.</span>
            </h2>
            <p className="text-base md:text-xl text-s-sub mb-10 md:mb-12 leading-relaxed font-light">
              Contanos tu situación en 1 minuto y te sugerimos un plan con precio fijo. Sin llamada, sin compromiso, plan concreto para tu caso.
            </p>

            <div className="space-y-6 md:space-y-8 bg-white/[0.02] border border-white/5 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <h4 className="font-bold text-white uppercase tracking-[0.15em] text-[10px] md:text-[11px] flex items-center gap-3 md:gap-4">
                <span className="w-6 md:w-10 h-px bg-s-accent" /> Qué te llevás del diagnóstico:
              </h4>

              <div className="flex items-start gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-s-accent/20 to-transparent border border-s-accent/30 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-s-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-lg md:text-xl mb-1 md:mb-2">Servicio y plan recomendado</p>
                  <p className="text-s-sub text-sm md:text-base leading-relaxed">Basado en tu rubro, prioridad y situación actual.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-s-accent/20 to-transparent border border-s-accent/30 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-s-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-lg md:text-xl mb-1 md:mb-2">Precio fijo al instante</p>
                  <p className="text-s-sub text-sm md:text-base leading-relaxed">Sin adivinar, sin llamada de entrada. Sabés exactamente cuánto sale.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — CTA card */}
          <div className="lg:col-span-5 relative reveal reveal-delay-2">
            <BentoCard className="p-8 md:p-10 lg:p-12 text-center border-2 border-s-accent/40 shadow-[0_20px_50px_rgba(0,255,163,0.1)] md:shadow-[0_30px_100px_rgba(0,255,163,0.15)] bg-gradient-to-b from-[#050508] to-[#0A1A12]">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-s-accent/20 to-s-accent/5 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 border border-s-accent/40 shadow-[inset_0_0_30px_rgba(0,255,163,0.3),0_10px_30px_rgba(0,255,163,0.2)]">
                <svg className="w-8 h-8 md:w-9 md:h-9 text-s-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                Diagnóstico guiado
              </h3>
              <p className="text-s-sub text-sm md:text-base mb-8 md:mb-10 font-light leading-relaxed">
                6 preguntas, 1 minuto, plan con precio fijo. Sin datos personales.
              </p>

              <Link
                href="/diagnostico"
                className="btn-primary w-full py-4 md:py-5 rounded-2xl text-base md:text-lg flex items-center justify-center gap-3 relative z-10"
              >
                Empezar diagnóstico
                <svg className="w-5 h-5 md:w-[22px] md:h-[22px]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
}
