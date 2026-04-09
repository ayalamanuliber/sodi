"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export function CaedeBanner() {
  return (
    <section className="py-8 sm:py-12 px-6">
      <motion.div
        {...fadeUp()}
        className="max-w-4xl mx-auto p-6 sm:p-8 rounded-2xl border border-s-accent/15 bg-gradient-to-r from-s-accent/[0.04] to-transparent relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,rgba(0,255,163,0.06),transparent_60%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-s-accent">
                CAEDE
              </span>
              <span className="px-2 py-0.5 bg-s-accent/15 border border-s-accent/20 rounded text-[10px] font-bold text-s-accent">
                -25%
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] text-white font-semibold mb-1">
              Miembros de CAEDE tienen 25% de descuento en todos los servicios.
            </p>
            <p className="text-[12px] text-s-sub">
              Cámara Argentina de Empresas — descuento exclusivo para socios activos.
            </p>
          </div>
          <a
            href="https://caede.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-s-accent/10 border border-s-accent/20 text-s-accent text-[12px] font-bold uppercase tracking-tight hover:bg-s-accent/20 transition-all"
          >
            Conocé CAEDE
          </a>
        </div>
      </motion.div>
    </section>
  );
}
