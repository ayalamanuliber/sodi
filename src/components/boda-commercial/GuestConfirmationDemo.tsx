"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import { createWeddingTrial } from "@/lib/boda-trial/schema";
import { WeddingPortalDemo } from "./WeddingPortalDemo";
import styles from "./landing.module.css";
import { useWeddingReducedMotion } from "./useWeddingReducedMotion";

const DEMO_STEPS = [
  "Lucía abre su invitación",
  "Confirma para 2 personas",
  "El panel queda actualizado",
] as const;

export function GuestConfirmationDemo() {
  const sectionRef = useRef<HTMLElement>(null);
  const startedRef = useRef(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [fixture] = useState(() => createWeddingTrial(new Date("2026-08-23T12:00:00.000Z")));
  const reduceMotion = useWeddingReducedMotion();

  const visibleFixture = useMemo(() => {
    if (step === 0) return fixture;
    return {
      ...fixture,
      guests: fixture.guests.map((guest) =>
        guest.id === "demo_guest_sofia_rivas"
          ? { ...guest, status: "confirmed" as const, sent: true }
          : guest,
      ),
      rsvps: [
        {
          id: "landing_demo_sofia",
          eventId: fixture.event.id,
          guestId: "demo_guest_sofia_rivas",
          attendance: "confirmed" as const,
          passes: 2,
          note: "Nos vemos en la pista",
          submittedAt: "2026-08-23T12:00:00.000Z",
        },
        ...fixture.rsvps,
      ],
    };
  }, [fixture, step]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || startedRef.current) return;
      startedRef.current = true;
      trackEvent("demo_view", { location: "confirmation_demo" });
      if (!reduceMotion) {
        trackEvent("demo_play", { location: "confirmation_demo", automatic: true });
      }
    }, { threshold: 0.35 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (!playing || reduceMotion) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % DEMO_STEPS.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [playing, reduceMotion]);

  function toggleDemo() {
    if (reduceMotion) {
      setStep((current) => (current + 1) % DEMO_STEPS.length);
    } else if (!playing && step === DEMO_STEPS.length - 1) {
      setStep(0);
      setPlaying(true);
    } else {
      setPlaying((current) => !current);
    }
    trackEvent("demo_play", { location: "confirmation_demo", automatic: false });
  }

  return (
    <section className={styles.confirmationDemo} id="confirmaciones" ref={sectionRef} data-wedding-reveal>
      <div className={styles.confirmationCopy}>
        <span className={styles.eyebrow}>De “¿venís?” a “ahí estaremos”</span>
        <h2>Las respuestas llegan. La lista se ordena.</h2>
        <p>
          Una persona confirma desde su invitación. En ese momento cambian el recuento, los pendientes y la actividad del panel.
        </p>
        <ol className={styles.demoSteps}>
          {DEMO_STEPS.map((label, index) => (
            <li key={label} data-active={step === index} data-complete={step > index}>
              <span>{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
        <button type="button" className={styles.demoControl} onClick={toggleDemo}>
          {reduceMotion ? <Play size={17} /> : playing ? <Pause size={17} /> : step === DEMO_STEPS.length - 1 ? <RotateCcw size={17} /> : <Play size={17} />}
          {reduceMotion ? "Ver el siguiente cambio" : playing ? "Pausar" : step === DEMO_STEPS.length - 1 ? "Ver otra vez" : "Ver el siguiente cambio"}
        </button>
        <small>Todos los nombres y datos de esta demostración son ficticios.</small>
      </div>

      <div className={styles.portalDemoWrap} aria-live="polite">
        <div className={styles.demoStatus}><span>{DEMO_STEPS[step]}</span><strong>{step === 0 ? "Esperando respuesta" : "Respuesta recibida"}</strong></div>
        <WeddingPortalDemo
          workspace={visibleFixture}
          compact
          highlightedGuestId={step > 0 ? "demo_guest_sofia_rivas" : undefined}
        />
      </div>
    </section>
  );
}
