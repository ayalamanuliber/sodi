"use client";

import { useState, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  questions,
  getResult,
  type Answers,
  type PackResult,
} from "@/lib/diagnostico";
import { StepQuestion } from "./StepQuestion";
import { StepIntro } from "./StepIntro";
import { StepResult } from "./StepResult";
import { trackEvent } from "@/components/analytics/tracking";
import {
  classifySourceAttribution,
  type SourceAttribution,
} from "@/lib/source-attribution";

type Phase = "intro" | "questions" | "result";

export function DiagnosticoFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<PackResult | null>(null);
  const [direction, setDirection] = useState(1);
  const attribution = useMemo<SourceAttribution | undefined>(() => {
    if (typeof window === "undefined") return undefined;

    return classifySourceAttribution(
      new URLSearchParams(window.location.search),
      document.referrer,
      window.location.hostname,
    );
  }, []);

  const totalSteps = questions.length;
  const progress = phase === "intro" ? 0 : phase === "result" ? 100 : ((stepIndex + 1) / totalSteps) * 100;

  const handleStart = useCallback(() => {
    setDirection(1);
    setPhase("questions");
    setStepIndex(0);
  }, []);

  const handleSelect = useCallback(
    (optionId: string) => {
      const question = questions[stepIndex];
      const newAnswers = { ...answers, [question.id]: optionId };
      setAnswers(newAnswers);
      setDirection(1);

      if (stepIndex < totalSteps - 1) {
        setStepIndex((i) => i + 1);
      } else {
        const res = getResult(newAnswers);
        setResult(res);
        setPhase("result");
        trackEvent("diagnostic_complete", {
          service_line: res.serviceLine,
          plan: res.tier.name,
          source_class: attribution?.sourceClass ?? "direct",
          source: attribution?.source ?? "direct",
          medium: attribution?.medium ?? "none",
          campaign: attribution?.campaign,
          asset: attribution?.asset,
        });
      }
    },
    [stepIndex, answers, totalSteps, attribution]
  );

  const handleBack = useCallback(() => {
    setDirection(-1);
    if (phase === "result") {
      setPhase("questions");
      setStepIndex(totalSteps - 1);
    } else if (stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else {
      setPhase("intro");
    }
  }, [phase, stepIndex, totalSteps]);

  const handleRestart = useCallback(() => {
    setDirection(1);
    setAnswers({});
    setResult(null);
    setPhase("intro");
    setStepIndex(0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center glass rounded-xl px-4 sm:px-5 py-2.5 border-white/5 shadow-2xl">
          <Link href="/" className="sodi-mark text-[1rem] sm:text-[1.1rem]">
            SODI
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            {phase !== "intro" && (
              <span className="text-[10px] sm:text-[11px] text-s-dim font-mono">
                {phase === "result" ? "Resultado" : `${stepIndex + 1}/${totalSteps}`}
              </span>
            )}
            <Link
              href="/"
              className="text-[10px] sm:text-[11px] text-s-sub hover:text-white transition-colors uppercase tracking-wider font-bold"
            >
              Volver
            </Link>
          </div>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="fixed top-[52px] sm:top-[60px] left-0 w-full z-40 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-s-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            {phase === "intro" && (
              <MotionSlide key="intro" direction={direction}>
                <StepIntro onStart={handleStart} />
              </MotionSlide>
            )}

            {phase === "questions" && (
              <MotionSlide key={`q-${stepIndex}`} direction={direction}>
                <StepQuestion
                  question={questions[stepIndex]}
                  selectedId={answers[questions[stepIndex].id]}
                  onSelect={handleSelect}
                  onBack={handleBack}
                  stepIndex={stepIndex}
                  totalSteps={totalSteps}
                />
              </MotionSlide>
            )}

            {phase === "result" && result && (
              <MotionSlide key="result" direction={direction}>
                <StepResult
                  result={result}
                  answers={answers}
                  attribution={attribution}
                  onRestart={handleRestart}
                  onBack={handleBack}
                />
              </MotionSlide>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ── Slide animation wrapper ──

function MotionSlide({ children, direction }: { children: React.ReactNode; direction: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction * 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction * -40 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] as const }}
    >
      {children}
    </motion.div>
  );
}
