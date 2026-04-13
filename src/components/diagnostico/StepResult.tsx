"use client";

import { motion } from "framer-motion";
import {
  type Answers,
  type PackResult,
  formatPrice,
  buildWhatsAppMessage,
  buildWhatsAppURL,
} from "@/lib/diagnostico";

interface Props {
  result: PackResult;
  answers: Answers;
  onRestart: () => void;
  onBack: () => void;
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 12 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export function StepResult({ result, answers, onRestart, onBack }: Props) {
  const message = buildWhatsAppMessage(answers, result);
  const waURL = buildWhatsAppURL(message);
  const isCaede = answers.caede === "si";

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
        Plan sugerido
      </motion.div>

      {/* Title + Tier */}
      <motion.h2 {...fade(0.05)} className="text-[1.5rem] sm:text-3xl md:text-[2.5rem] font-extrabold tracking-tighter mb-1 sm:mb-2 font-heading text-white leading-tight">
        {result.title}
      </motion.h2>
      <motion.p {...fade(0.07)} className="text-s-accent text-[13px] font-bold uppercase tracking-wider mb-4 sm:mb-5">
        Plan {result.tier.name}
      </motion.p>

      {/* Description */}
      <motion.p {...fade(0.1)} className="text-s-sub text-[14px] sm:text-[15px] leading-relaxed mb-6 sm:mb-8 max-w-xl">
        {result.description}
      </motion.p>

      {/* Price */}
      <motion.div {...fade(0.15)} className="p-5 sm:p-6 bg-s-accent/[0.04] border border-s-accent/15 rounded-xl mb-4 sm:mb-5">
        <p className="text-[10px] text-s-accent font-bold uppercase tracking-[0.3em] mb-2">Precio fijo</p>
        <p className="text-[2rem] sm:text-[2.5rem] font-extrabold font-heading text-white tracking-tighter leading-none">
          ${formatPrice(result.tier.price)}
        </p>
        {isCaede && (
          <p className="text-[12px] text-s-accent font-semibold mt-2">
            <span className="line-through text-s-dim font-normal mr-2">
              ${formatPrice(result.tier.caede === result.tier.price ? result.tier.price : Math.round(result.tier.price / 0.75))}
            </span>
            Descuento CAEDE -25% aplicado
          </p>
        )}
        {result.packSavings && (
          <p className="text-[11px] text-s-accent/80 mt-1">
            Ahorrás ${formatPrice(result.packSavings)} vs comprar por separado
          </p>
        )}
      </motion.div>

      {/* Timeline */}
      <motion.div {...fade(0.18)} className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-4 sm:mb-5">
        <p className="text-[10px] text-s-sub font-bold uppercase tracking-[0.3em] mb-2">Plazo estimado</p>
        <p className="text-[18px] sm:text-[22px] font-extrabold font-heading text-white tracking-tight">{result.timeline}</p>
      </motion.div>

      {/* Features */}
      <motion.div {...fade(0.2)} className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-4 sm:mb-5">
        <p className="text-[10px] text-s-accent font-bold uppercase tracking-[0.3em] mb-3">Incluye</p>
        <ul className="space-y-2">
          {result.tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-white/70 leading-snug">
              <svg className="w-3.5 h-3.5 text-s-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Ideal for */}
      <motion.div {...fade(0.23)} className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-4 sm:mb-5">
        <p className="text-[10px] text-s-accent font-bold uppercase tracking-[0.3em] mb-2">Ideal para vos si</p>
        <p className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed">{result.ideal}</p>
      </motion.div>

      {/* Next step */}
      <motion.div {...fade(0.26)} className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-6 sm:mb-8">
        <p className="text-[10px] text-s-sub font-bold uppercase tracking-[0.3em] mb-2">Siguiente paso</p>
        <p className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed">{result.nextStep}</p>
      </motion.div>

      {/* CAEDE interested */}
      {answers.caede === "quiero" && (
        <motion.div {...fade(0.28)} className="p-4 sm:p-5 bg-s-accent/[0.04] border border-s-accent/15 rounded-xl mb-6 sm:mb-8">
          <p className="text-[13px] text-white/80 leading-relaxed">
            Como miembro de <span className="text-s-accent font-semibold">CAEDE</span> tendrías 25% de descuento:{" "}
            <span className="text-white font-bold">${formatPrice(result.tier.caede)}</span>.{" "}
            <a
              href="https://caede.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-s-accent underline underline-offset-2 hover:text-white transition-colors"
            >
              Conocé CAEDE
            </a>
          </p>
        </motion.div>
      )}

      {/* CTAs */}
      <motion.div {...fade(0.3)} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
      <motion.p {...fade(0.35)} className="mt-5 sm:mt-7 text-s-dim text-[11px] text-center sm:text-left">
        <a href="tel:+541157210923" className="hover:text-white transition-colors">11 5721-0923</a> · hola@sodi.com.ar
      </motion.p>
    </div>
  );
}
