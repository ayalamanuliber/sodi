"use client";

import { motion } from "framer-motion";
import type { Question } from "@/lib/diagnostico";

interface Props {
  question: Question;
  selectedId?: string;
  onSelect: (optionId: string) => void;
  onBack: () => void;
  stepIndex: number;
  totalSteps: number;
}

export function StepQuestion({ question, selectedId, onSelect, onBack, stepIndex, totalSteps }: Props) {
  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-s-dim text-[12px] hover:text-white transition-colors mb-6 sm:mb-8 group"
      >
        <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="M19 12H5m7-7l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <span className="text-s-accent text-[10px] font-bold uppercase tracking-[0.3em]">
          Paso {stepIndex + 1} de {totalSteps}
        </span>
      </div>

      {/* Question */}
      <h2 className="text-[1.4rem] sm:text-2xl md:text-3xl font-extrabold tracking-tighter mb-2 font-heading text-white leading-tight">
        {question.title}
      </h2>
      {question.subtitle && (
        <p className="text-s-sub text-[13px] sm:text-[14px] mb-6 sm:mb-8">{question.subtitle}</p>
      )}
      {!question.subtitle && <div className="mb-6 sm:mb-8" />}

      {/* Options */}
      <div className="space-y-2.5 sm:space-y-3">
        {question.options.map((option, i) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            onClick={() => onSelect(option.id)}
            className={`w-full text-left px-5 sm:px-6 py-4 sm:py-[18px] rounded-xl border transition-all duration-200 group ${
              selectedId === option.id
                ? "border-s-accent/30 bg-s-accent/[0.06] text-white"
                : "border-white/[0.06] bg-white/[0.02] text-s-sub hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] sm:text-[14px] font-medium">{option.label}</span>
              <svg
                className={`w-4 h-4 shrink-0 transition-all ${
                  selectedId === option.id
                    ? "text-s-accent opacity-100"
                    : "text-white/20 opacity-0 group-hover:opacity-100"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
