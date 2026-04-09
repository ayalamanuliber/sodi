"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export function DiagnosticPromo() {
  return (
    <motion.section {...fadeUp()} className="py-10 sm:py-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h3 className="text-[1.2rem] sm:text-2xl md:text-3xl font-extrabold tracking-tighter mb-3 text-white font-heading">
          ¿No sabés qué plan es para vos?
        </h3>
        <p className="text-s-sub text-[13px] sm:text-[15px] mb-5 max-w-lg mx-auto leading-relaxed">
          Contanos tu situación en 1 minuto y te sugerimos un plan con precio fijo.
        </p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] sm:text-[12px] text-s-dim mb-6">
          <span>Precio fijo al instante</span>
          <span>Sin llamada de entrada</span>
          <span>Plan concreto para tu caso</span>
        </div>
        <Link
          href="/diagnostico"
          className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-tight hover:bg-white/10 transition-all"
        >
          Descubrir mi plan
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </motion.section>
  );
}
