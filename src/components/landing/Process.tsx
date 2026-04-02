"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { fadeUp, easeOut } from "@/lib/motion";

const steps = [
  { num: "1", title: "Diagnóstico", desc: "Dónde perdés tiempo, control o ventas." },
  { num: "2", title: "Diseño", desc: "Qué automatizar o centralizar primero." },
  { num: "3", title: "Implementación", desc: "Web, flujos o sistema según el caso." },
  { num: "4", title: "Optimización", desc: "Ajustes reales sobre lo que funciona." },
];

export function Process() {
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(gridRef, { once: true, amount: 0.2 });
  const [litIndex, setLitIndex] = useState(-1);

  useEffect(() => {
    if (!isInView) return;
    steps.forEach((_, i) => {
      setTimeout(() => setLitIndex(i), i * 300);
    });
  }, [isInView]);

  return (
    <section id="metodo" className="py-14 sm:py-24 px-6 bg-[#06060A]/50 border-y border-white/5">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="mb-8 sm:mb-14">
          <p className="text-s-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-3">Proceso</p>
          <h2 className="text-[1.4rem] sm:text-3xl md:text-4xl font-extrabold tracking-tighter font-heading">Cómo trabajamos</h2>
        </motion.div>
        <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {steps.map((step, i) => {
            const lit = i <= litIndex;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: easeOut, delay: i * 0.15 }}
                className={`p-4 sm:p-6 bg-white/[0.02] border rounded-xl transition-all duration-500 ${
                  lit ? "border-s-accent/15 shadow-[0_0_20px_rgba(0,255,163,0.04)]" : "border-white/5"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-heading font-bold mb-3 sm:mb-4 transition-all duration-500 border ${
                    lit ? "bg-s-accent/[0.12] border-s-accent/20 text-s-accent" : "bg-white/[0.04] border-white/5 text-white"
                  }`}
                >
                  {step.num}
                </div>
                <h4 className="font-bold text-[13px] sm:text-[15px] mb-1">{step.title}</h4>
                <p className="text-s-sub text-[11px] sm:text-[13px] leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
