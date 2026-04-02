"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const sectors = ["Inmobiliarias", "Estudios profesionales", "Salud y atención", "Construcción e industria", "y otros rubros"];

export function CaseStudy() {
  return (
    <section id="casoreal" className="py-14 sm:py-24 px-6 relative overflow-hidden bg-black border-y border-white/5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,107,0,0.07),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,107,0,0.03),transparent_40%)]" />
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 sm:gap-16 items-center relative z-10">
        <motion.div {...fadeUp()}>
          <div className="flex items-center gap-4 mb-5">
            <div className="inline-flex items-center gap-3 text-s-orange text-[10px] font-black tracking-[0.4em] uppercase">
              <span className="w-6 h-[2px] bg-s-orange" /> Caso real
            </div>
            <span className="px-3 py-1 border border-s-orange/25 rounded-md text-[10px] font-heading font-bold text-s-orange/70 tracking-[0.15em] uppercase bg-s-orange/[0.06]">
              CAEDE
            </span>
            <span className="px-2 py-0.5 text-[8px] font-bold text-s-accent uppercase tracking-[0.15em] bg-s-accent/[0.08] border border-s-accent/15 rounded">
              Proyecto activo
            </span>
          </div>
          <h2 className="text-[1.5rem] sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6 tracking-tighter leading-tight text-white font-heading">
            CAEDE: de web a canal comercial.
          </h2>
          <p className="text-s-sub text-[14px] sm:text-[15px] mb-6 sm:mb-8 leading-relaxed max-w-lg">
            Desarrollamos la presencia digital de CAEDE como base para conectar empresas con soluciones de sistema y
            operación. No fue solo una web. Fue un canal.
          </p>
          <div className="space-y-3 mb-6 sm:mb-8">
            {["Web institucional y presencia digital", "Canal de entrada hacia empresas del sector", "Base para venta de sistemas operativos"].map(
              (item, i) => (
                <div key={i} className="flex items-center gap-3 text-[12px] sm:text-[13px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-s-orange shrink-0" />
                  <span className="text-white/70">{item}</span>
                </div>
              )
            )}
          </div>
          <a
            href="#diagnostico"
            className="inline-flex items-center gap-3 bg-s-orange text-black px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-black text-[12px] sm:text-[13px] uppercase tracking-wide hover:brightness-110 transition-all w-full sm:w-auto justify-center"
          >
            Solicitar diagnóstico para tu empresa
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>

        <motion.div {...fadeUp(0.2)} className="rounded-xl border border-s-orange/10 bg-[#060608] p-5 sm:p-7 shadow-[0_8px_50px_rgba(255,107,0,0.06)]">
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
            <div><div className="text-base font-bold font-heading">18</div><div className="text-[8px] text-s-dim uppercase">Equipos</div></div>
            <div><div className="text-base font-bold font-heading text-s-accent">3</div><div className="text-[8px] text-s-dim uppercase">Obras</div></div>
            <div><div className="text-base font-bold font-heading text-s-orange">1</div><div className="text-[8px] text-s-dim uppercase">Alerta</div></div>
          </div>
        </motion.div>
      </div>

      <motion.div {...fadeUp(0.3)} className="max-w-6xl mx-auto mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-white/5">
        <p className="text-[10px] text-s-dim uppercase tracking-[0.25em] font-bold mb-4">También aplicamos en</p>
        <div className="flex flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-[12px] text-s-sub font-medium">
          {sectors.map((s) => (
            <span key={s} className="px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg">{s}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
