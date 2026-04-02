"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export function FinalCTA() {
  return (
    <section id="diagnostico" className="py-16 sm:py-28 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          {...fadeUp()}
          className="sodi-card p-7 sm:p-14 md:p-20 text-center relative overflow-hidden bg-gradient-to-b from-[#0C0C12] to-black"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,163,0.04),transparent_70%)]" />
          <h2 className="text-[1.4rem] sm:text-3xl md:text-5xl font-extrabold mb-4 sm:mb-6 tracking-tighter relative z-10 text-white leading-tight font-heading">
            Te mostramos dónde estás perdiendo ventas, tiempo o control.
          </h2>
          <p className="text-s-sub text-[14px] sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Hacé el diagnóstico guiado o escribinos directo por WhatsApp.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link
              href="/diagnostico"
              className="w-full sm:w-auto bg-s-accent text-black px-7 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-xl text-[14px] font-black uppercase tracking-tight hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(0,255,163,0.2)]"
            >
              Hacer diagnóstico guiado
            </Link>
            <a
              href="https://wa.me/5491157210923"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-xl text-[14px] font-semibold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 uppercase tracking-tight"
            >
              <svg className="w-4 h-4 text-s-wa" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.892.527 3.66 1.438 5.163L2 22l4.97-1.392A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
              WhatsApp
            </a>
          </div>

          <p className="mt-5 sm:mt-7 text-s-dim text-[11px] relative z-10">
            <a href="tel:+541157210923" className="hover:text-white transition-colors">11 5721-0923</a> · hola@sodi.ar
          </p>
        </motion.div>
      </div>
    </section>
  );
}
