"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, easeOut } from "@/lib/motion";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex flex-col justify-center items-center pt-24 sm:pt-32 pb-14 sm:pb-24 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-s-accent/[0.03] blur-[140px] pointer-events-none z-0" />
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          {...fadeUp()}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-[9px] sm:text-[10px] font-bold text-s-accent uppercase tracking-[0.2em] sm:tracking-[0.35em] mb-8 sm:mb-12"
        >
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-s-accent opacity-50" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-s-accent" />
          </span>
          Webs, sistemas y automatización
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          className="text-[2.4rem] sm:text-5xl md:text-[4.5rem] lg:text-[5.5rem] font-extrabold leading-[0.95] mb-6 sm:mb-8 tracking-tighter font-heading"
        >
          <span className="tg-white">Menos desorden.</span>
          <br />
          <span className="tg-accent">Más ventas y control.</span>
        </motion.h1>

        <motion.p {...fadeUp(0.2)} className="text-[15px] sm:text-lg md:text-xl text-s-sub max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6">
          Webs, automatizaciones y sistemas para empresas que ya venden, pero necesitan más orden para crecer.
        </motion.p>
        <motion.p {...fadeUp(0.2)} className="text-[13px] sm:text-[15px] text-s-dim max-w-xl mx-auto leading-relaxed mb-8 sm:mb-12">
          Si estás buscando una web, más clientes o simplemente ordenar tu negocio digital, estás en el lugar correcto.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center">
          <Link
            href="/diagnostico"
            className="w-full sm:w-auto bg-s-accent text-black px-7 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-xl text-[14px] font-black uppercase tracking-tight hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(0,255,163,0.2)]"
          >
            Hacer diagnóstico guiado
          </Link>
          <a
            href="#soluciones"
            className="w-full sm:w-auto px-7 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-xl text-[14px] font-semibold text-white border border-white/10 hover:bg-white/5 transition-all uppercase tracking-tight text-center"
          >
            Ver cómo funciona
          </a>
        </motion.div>
      </div>
    </section>
  );
}
