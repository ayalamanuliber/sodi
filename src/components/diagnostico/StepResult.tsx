"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  type Answers,
  type ProductOutput,
  buildWhatsAppMessage,
  buildWhatsAppURL,
} from "@/lib/diagnostico";

interface Props {
  result: ProductOutput;
  answers: Answers;
  showPrice: boolean;
  onRestart: () => void;
  onBack: () => void;
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export function StepResult({ result, answers, showPrice, onRestart, onBack }: Props) {
  const message = buildWhatsAppMessage(answers, result);
  const waURL = buildWhatsAppURL(message);

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-s-dim text-[12px] hover:text-white transition-colors mb-6 sm:mb-8 group"
      >
        <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M19 12H5m7-7l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver
      </button>

      {/* Badge */}
      <motion.div {...fade(0)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-s-accent/[0.08] border border-s-accent/20 text-s-accent text-[10px] font-bold uppercase tracking-[0.25em] mb-5 sm:mb-6">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Solución sugerida
      </motion.div>

      {/* Title */}
      <motion.h2 {...fade(0.05)} className="text-[1.5rem] sm:text-3xl md:text-[2.5rem] font-extrabold tracking-tighter mb-3 sm:mb-4 font-heading text-white leading-tight">
        {result.title}
      </motion.h2>

      {/* Description */}
      <motion.p {...fade(0.1)} className="text-s-sub text-[14px] sm:text-[15px] leading-relaxed mb-6 sm:mb-8 max-w-xl">
        {result.description}
      </motion.p>

      {/* Ideal for */}
      <motion.div {...fade(0.15)} className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-4 sm:mb-5">
        <p className="text-[10px] text-s-accent font-bold uppercase tracking-[0.3em] mb-2">Ideal para vos si</p>
        <p className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed">{result.ideal}</p>
      </motion.div>

      {/* Features */}
      <motion.div {...fade(0.2)} className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-4 sm:mb-5">
        <p className="text-[10px] text-s-accent font-bold uppercase tracking-[0.3em] mb-3">Incluye</p>
        <ul className="space-y-2">
          {result.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2.5 text-[13px] text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-s-accent shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Price + Timeline */}
      <motion.div {...fade(0.25)} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {showPrice && (
          <div className="p-4 sm:p-5 bg-s-accent/[0.04] border border-s-accent/15 rounded-xl">
            <p className="text-[10px] text-s-accent font-bold uppercase tracking-[0.3em] mb-2">Rango estimado</p>
            <p className="text-[18px] sm:text-[22px] font-extrabold font-heading text-white tracking-tight">{result.priceRange}</p>
            <p className="text-[11px] text-s-dim mt-1">{result.priceRangeARS}</p>
          </div>
        )}
        <div className={`p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl ${showPrice ? "" : "sm:col-span-2"}`}>
          <p className="text-[10px] text-s-sub font-bold uppercase tracking-[0.3em] mb-2">Plazo estimado</p>
          <p className="text-[18px] sm:text-[22px] font-extrabold font-heading text-white tracking-tight">{result.timeline}</p>
        </div>
      </motion.div>

      {/* Next step */}
      <motion.div {...fade(0.3)} className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-6 sm:mb-8">
        <p className="text-[10px] text-s-sub font-bold uppercase tracking-[0.3em] mb-2">Siguiente paso</p>
        <p className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed">{result.nextStep}</p>
      </motion.div>

      {/* Disclaimer */}
      {showPrice && (
        <motion.p {...fade(0.32)} className="text-[11px] text-s-dim mb-6 sm:mb-8 leading-relaxed">
          Esto no es una cotización final. Es una referencia para orientarte mejor. El alcance y presupuesto exacto se definen
          en el diagnóstico.
        </motion.p>
      )}

      {/* CTAs */}
      <motion.div {...fade(0.35)} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <a
          href={waURL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full sm:w-auto bg-s-accent text-black px-7 sm:px-10 py-4 sm:py-[18px] rounded-2xl sm:rounded-xl text-[14px] font-black uppercase tracking-tight flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.892.527 3.66 1.438 5.163L2 22l4.97-1.392A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
          Continuar por WhatsApp
        </a>
        <button
          onClick={onRestart}
          className="btn-secondary w-full sm:w-auto px-7 sm:px-10 py-4 sm:py-[18px] rounded-2xl sm:rounded-xl text-[14px] font-semibold text-white border border-white/10 uppercase tracking-tight text-center"
        >
          Volver a empezar
        </button>
      </motion.div>

      {/* Contact */}
      <motion.p {...fade(0.4)} className="mt-5 sm:mt-7 text-s-dim text-[11px] text-center sm:text-left">
        <a href="tel:+541157210923" className="hover:text-white transition-colors">11 5721-0923</a> · hola@sodi.ar
      </motion.p>
    </div>
  );
}
