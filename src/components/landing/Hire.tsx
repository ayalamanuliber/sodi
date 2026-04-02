"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const services = [
  { label: "Una web que convierta", accent: false },
  { label: "Un sistema interno", accent: false },
  { label: "Automatizaciones", accent: false },
  { label: "O una combinación de todo", accent: true },
];

export function Hire() {
  return (
    <section className="py-10 sm:py-16 px-6 bg-[#060609]">
      <motion.div {...fadeUp()} className="max-w-4xl mx-auto text-center">
        <p className="text-s-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-4">¿Qué podés contratar?</p>
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {services.map((s) => (
            <span
              key={s.label}
              className={`px-4 py-2 bg-white/[0.03] border rounded-xl text-[12px] sm:text-[13px] font-medium ${
                s.accent ? "border-s-accent/15 text-s-accent font-semibold" : "border-white/[0.08] text-white/80"
              }`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
