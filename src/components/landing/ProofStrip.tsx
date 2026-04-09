"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const items = [
  {
    label: "CAEDE",
    sub: "Canal + sistema operativo",
    highlight: true,
    badge: "En operación",
    icon: (
      <svg className="w-4 h-4 text-s-orange" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Webs",
    sub: "Landing + conversión",
    highlight: false,
    icon: (
      <svg className="w-4 h-4 text-s-accent/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Redes",
    sub: "Setup + estrategia",
    highlight: false,
    icon: (
      <svg className="w-4 h-4 text-purple-400/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    sub: "Automatización",
    highlight: false,
    icon: (
      <svg className="w-4 h-4 text-s-wa/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Sistemas",
    sub: "Paneles operativos",
    highlight: false,
    icon: (
      <svg className="w-4 h-4 text-blue-400/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function ProofStrip() {
  return (
    <section className="relative py-8 sm:py-12 px-6 bg-s-surface/60 border-y border-white/[0.04]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(0,255,163,0.03), transparent 60%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div {...fadeUp()} className="text-center mb-6 sm:mb-8">
          <p className="text-[13px] sm:text-[15px] text-white/90 font-semibold tracking-tight">
            Ya estamos construyendo sistemas y canales en operación real
          </p>
          <p className="text-[11px] sm:text-[12px] text-s-dim mt-1.5">
            No son ideas. Son implementaciones en curso.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.1)}
          className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3"
        >
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.08 }}
              className={`relative p-3.5 sm:p-4 rounded-xl border transition-all duration-300 cursor-default group ${
                item.highlight
                  ? "bg-s-orange/[0.04] border-s-orange/15 hover:border-s-orange/30 hover:shadow-[0_0_28px_rgba(255,107,0,0.08)]"
                  : "bg-white/[0.02] border-white/[0.05] hover:border-white/12 hover:bg-white/[0.03] hover:shadow-[0_0_20px_rgba(255,255,255,0.03)]"
              }`}
            >
              {/* Badge */}
              {item.badge && (
                <span className="absolute top-2.5 right-2.5 text-[7px] font-bold text-s-accent uppercase tracking-[0.1em] bg-s-accent/[0.1] border border-s-accent/15 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}

              <div className="flex items-center gap-2 mb-1.5">
                <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </span>
                <span className={`text-[12px] sm:text-[13px] font-bold tracking-tight ${
                  item.highlight ? "text-white" : "text-white/80 group-hover:text-white"
                } transition-colors`}>
                  {item.label}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-s-dim leading-snug group-hover:text-s-sub transition-colors">
                {item.sub}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
