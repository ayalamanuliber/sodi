"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const checks = [
  { bold: "Tenés consultas", rest: "pero no seguimiento claro" },
  { bold: "Usás WhatsApp", rest: "como centro de operación" },
  { bold: "Info repartida", rest: "entre chats, Excel y herramientas sueltas" },
  { bold: "Dependés de personas", rest: "para responder o vender" },
];

export function Qualification() {
  return (
    <section className="py-14 sm:py-24 px-6 border-t border-white/5 bg-[#060609]">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp()} className="mb-8 sm:mb-14">
          <p className="text-s-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-3">Diagnóstico rápido</p>
          <h2 className="text-[1.5rem] sm:text-3xl md:text-4xl font-extrabold tracking-tighter font-heading">
            Esto es para vos si…
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {checks.map((c, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.1)}
              className="p-4 sm:p-5 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-3 hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300"
            >
              <svg className="w-4 h-4 text-s-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[13px] sm:text-[14px] text-s-sub">
                <strong className="text-white font-semibold">{c.bold}</strong> {c.rest}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
