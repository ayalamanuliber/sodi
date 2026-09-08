"use client";

import { ArrowRight, Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import { TrackedLink } from "./TrackedLink";
import styles from "./product-film.module.css";
import { useWeddingReducedMotion } from "./useWeddingReducedMotion";

export function WeddingProductFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewedRef = useRef(false);
  const completedRef = useRef(false);
  const reduceMotion = useWeddingReducedMotion();

  useEffect(() => {
    if (reduceMotion) videoRef.current?.pause();
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !viewedRef.current) {
        viewedRef.current = true;
        trackEvent("demo_view", { location: "landing_product_film" });
      }
      if (!entry.isIntersecting) {
        videoRef.current?.pause();
      } else if (!reduceMotion) {
        void videoRef.current?.play().catch(() => undefined);
      }
    }, { threshold: .35 });
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <section className={styles.film} id="como-funciona">
      <div className={styles.copy}>
        <h2>Una respuesta cambia la lista.</h2>
        <p>Lucía confirma para dos. Ustedes ven dos personas más confirmadas y una invitación menos pendiente. Miren cómo pasa.</p>
        <TrackedLink href="/boda/prueba" eventName="trial_start" eventLocation="product_film">Probar invitación <ArrowRight size={18} strokeWidth={1.8} /></TrackedLink>
        <small>Demostración con fotos y datos de ejemplo.</small>
      </div>
      <figure className={styles.player}>
        <video
          ref={videoRef}
          src="/invitaciones-boda/sodi-bodas-emotional-preview.mp4?v=20260908b"
          poster="/invitaciones-boda/sodi-bodas-emotional-preview-poster.jpg?v=20260908b"
          muted
          loop={!reduceMotion}
          playsInline
          controls
          preload="metadata"
          aria-label="Demostración del recorrido desde la invitación hasta el panel de confirmaciones"
          onPlay={() => trackEvent("demo_play", { location: "landing_product_film" })}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            if (!completedRef.current && video.duration > 0 && video.currentTime >= video.duration - .45) {
              completedRef.current = true;
              trackEvent("demo_complete", { location: "landing_product_film", duration: Math.round(video.duration) });
            }
          }}
        />
        <figcaption><Play size={15} fill="currentColor" /> Una confirmación de ejemplo y su efecto en la lista.</figcaption>
      </figure>
    </section>
  );
}
