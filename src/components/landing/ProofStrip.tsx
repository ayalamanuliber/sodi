"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const chips = [
  {
    label: "CAEDE",
    highlight: true,
    badge: "Proyecto activo",
  },
  { label: "Webs de conversión", highlight: false },
  { label: "Automatizaciones en WhatsApp", highlight: false },
  { label: "Sistemas internos", highlight: false },
];

export function ProofStrip() {
  return (
    <section className="relative py-8 sm:py-10 px-6 bg-s-surface/60 border-y border-white/[0.04]">
      {/* Subtle depth layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(0,255,163,0.03), transparent 60%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div {...fadeUp()} className="text-center mb-5 sm:mb-6">
          <p className="text-[13px] sm:text-[15px] text-white/90 font-semibold tracking-tight">
            Ya estamos construyendo sistemas y canales en operación real
          </p>
          <p className="text-[11px] sm:text-[12px] text-s-dim mt-1.5">
            No son ideas. Son implementaciones en curso.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.1)}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap sm:justify-center scrollbar-none"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {chips.map((chip) => (
            <div
              key={chip.label}
              className={`shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border transition-all duration-300 cursor-default group ${
                chip.highlight
                  ? "bg-s-accent/[0.06] border-s-accent/20 hover:border-s-accent/35 hover:shadow-[0_0_24px_rgba(0,255,163,0.1)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
              }`}
            >
              {chip.highlight && (
                <span className="px-3 py-0.5 text-[8px] font-heading font-bold text-white/50 tracking-[0.15em] uppercase border border-white/10 rounded-md">
                  CAEDE
                </span>
              )}
              {chip.badge && (
                <span className="hidden sm:inline text-[8px] font-bold text-s-accent uppercase tracking-[0.15em] bg-s-accent/[0.08] px-1.5 py-0.5 rounded">
                  {chip.badge}
                </span>
              )}
              {!chip.highlight && (
                <span className="text-[12px] sm:text-[13px] text-s-sub font-medium group-hover:text-white/80 transition-colors">
                  {chip.label}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
