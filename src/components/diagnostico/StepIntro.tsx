"use client";

import { motion } from "framer-motion";

interface Props {
  onStart: () => void;
}

export function StepIntro({ onStart }: Props) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-s-accent/[0.08] border border-s-accent/20 mb-6 sm:mb-8"
      >
        <svg className="w-7 h-7 sm:w-9 sm:h-9 text-s-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      <h1 className="text-[1.6rem] sm:text-3xl md:text-4xl font-extrabold tracking-tighter mb-4 font-heading text-white leading-tight">
        Diagnóstico guiado
        <span className="block text-s-accent">SODI</span>
      </h1>

      <p className="text-s-sub text-[14px] sm:text-[16px] max-w-md mx-auto leading-relaxed mb-3">
        Respondé 6 preguntas y te sugerimos un plan con precio fijo para tu proyecto.
      </p>

      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[11px] sm:text-[12px] text-s-dim mb-8 sm:mb-10">
        <span className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-s-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          1 minuto
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-s-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Sin compromiso
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-s-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Precio fijo al instante
        </span>
      </div>

      <button
        onClick={onStart}
        className="btn-primary w-full sm:w-auto bg-s-accent text-black px-8 sm:px-14 py-4 sm:py-5 rounded-2xl sm:rounded-xl text-[14px] sm:text-[15px] font-black uppercase tracking-tight"
      >
        Empezar diagnóstico
      </button>

      <p className="mt-5 text-s-dim text-[11px]">
        6 preguntas · resultado inmediato · sin datos personales
      </p>
    </div>
  );
}
