"use client";

import { ExternalLink, HelpCircle } from "lucide-react";
import { trackEvent } from "@/components/analytics/tracking";
import type { TrialDesign } from "@/lib/boda-trial/schema";
import styles from "./design-controls.module.css";

type ControlKey = Exclude<keyof TrialDesign, "samplePhotosEnabled">;
type Option<K extends ControlKey> = { id: TrialDesign[K]; label: string; note?: string; swatches?: string[] };

const GROUPS: Array<{ key: ControlKey; title: string; help: string; event: string; options: Option<ControlKey>[] }> = [
  { key: "paletteId", title: "Paleta", help: "Cambia los colores de toda la invitación: fondo, botones, líneas y detalles. La legibilidad se conserva en las cuatro opciones.", event: "palette_select", options: [
    { id: "forest-gold", label: "Bosque", swatches: ["#244936", "#f7f5f0", "#c49a52"] },
    { id: "olive-clay", label: "Arcilla", swatches: ["#4f5a40", "#f1e9e2", "#8a4939"] },
    { id: "cobalt-ivory", label: "Cobalto", swatches: ["#3154a8", "#eef1f5", "#171a23"] },
    { id: "ink-silver", label: "Tinta", swatches: ["#111318", "#d5d9e1", "#eef0f4"] },
  ] },
  { key: "typographyId", title: "Tipografía", help: "Cambia la personalidad de los títulos y nombres. Los textos informativos mantienen una letra simple para que siempre se lean bien.", event: "typography_select", options: [
    { id: "editorial", label: "Editorial", note: "Serena" },
    { id: "contemporary", label: "Actual", note: "Precisa" },
    { id: "romantic", label: "Romántica", note: "Ceremonial" },
  ] },
  { key: "coverId", title: "Composición de portada", help: "Decide cuánto protagonismo tiene la foto. Cinematográfica usa texto sobre la imagen; Editorial reserva un lateral para los nombres.", event: "cover_select", options: [
    { id: "cinematic", label: "Cinematográfica", note: "Texto sobre la foto" },
    { id: "split", label: "Editorial", note: "Texto lateral" },
  ] },
  { key: "monogramId", title: "Monograma", help: "Es la firma visual que aparece en el sobre y en pequeños detalles. Se arma con los nombres que escribiste arriba.", event: "monogram_select", options: [
    { id: "seal", label: "Sello", note: "A + T" },
    { id: "initials", label: "Iniciales", note: "A / T" },
    { id: "wordmark", label: "Nombres", note: "Julia + Mateo" },
  ] },
  { key: "galleryId", title: "Galería", help: "Mosaico muestra varios momentos juntos. Secuencia da más espacio a cada foto y se recorre de lado.", event: "gallery_select", options: [
    { id: "mosaic", label: "Mosaico", note: "Todo a la vista" },
    { id: "film", label: "Secuencia", note: "Foto por foto" },
  ] },
  { key: "ornamentId", title: "Detalle visual", help: "Regula líneas, marcos y gestos decorativos. No agrega bloques ni cambia el contenido de la invitación.", event: "ornament_select", options: [
    { id: "quiet", label: "Sutil" },
    { id: "balanced", label: "Equilibrado" },
    { id: "ceremonial", label: "Ceremonial" },
  ] },
  { key: "textPlacementId", title: "Ubicación de los nombres", help: "Elegí el espacio libre de tu foto: si la pareja está a la derecha, llevá los nombres a la izquierda; si está a la izquierda, hacé lo contrario. Abajo funciona cuando la foto tiene aire debajo.", event: "text_placement_select", options: [
    { id: "left", label: "Texto a la izquierda", note: "Pareja a la derecha" },
    { id: "center", label: "Texto abajo", note: "Sobre un degradado" },
    { id: "right", label: "Texto a la derecha", note: "Pareja a la izquierda" },
  ] },
  { key: "photoFocusId", title: "Encuadre de la foto", help: "Mové el recorte hasta que las personas queden bien ubicadas. Este control no mueve los nombres: así podés corregir una foto propia sin perder la composición que elegiste.", event: "photo_focus_select", options: [
    { id: "left", label: "Mover a la izquierda", note: "Ajusta el recorte" },
    { id: "center", label: "Mantener al centro", note: "Encuadre neutro" },
    { id: "right", label: "Mover a la derecha", note: "Ajusta el recorte" },
  ] },
  { key: "contrastId", title: "Lectura sobre la foto", help: "Ajusta la protección detrás de los nombres. Usá Fuerte si la foto tiene muchas luces; no modifica la imagen original.", event: "contrast_select", options: [
    { id: "soft", label: "Suave", note: "Más foto" },
    { id: "balanced", label: "Equilibrada", note: "Recomendada" },
    { id: "strong", label: "Fuerte", note: "Más lectura" },
  ] },
];

export function WeddingDesignControls({
  design,
  partnerOne,
  partnerTwo,
  onChange,
}: {
  design: TrialDesign;
  partnerOne: string;
  partnerTwo: string;
  onChange: (next: TrialDesign) => void;
}) {
  const initials = `${partnerOne.trim().charAt(0) || "A"} + ${partnerTwo.trim().charAt(0) || "T"}`;
  const monogramNames = `${partnerOne.trim() || "Nombre 1"} + ${partnerTwo.trim() || "Nombre 2"}`;

  function select(key: ControlKey, value: TrialDesign[ControlKey], eventName: string) {
    const next = { ...design, [key]: value };
    onChange(next);
    trackEvent(eventName, { value, surface: "trial_personalization" });
  }

  return (
    <section className={styles.controls} aria-labelledby="design-controls-title">
      <div className={styles.heading}>
        <h3 id="design-controls-title">Tu estilo, dentro de combinaciones cuidadas.</h3>
        <p>Todas estas opciones fueron preparadas para funcionar juntas. Podés cambiarlas sin romper la invitación.</p>
      </div>
      {GROUPS.map((group) => (
        <fieldset className={styles.group} key={group.key}>
          <legend>
            <span>{group.title}</span>
            <details className={styles.help}>
              <summary aria-label={`Ayuda sobre ${group.title}`}><HelpCircle size={16} aria-hidden="true" /> ¿Qué cambia?</summary>
              <p>{group.help}</p>
            </details>
          </legend>
          <div className={styles.options} data-count={group.options.length}>
            {group.options.map((option) => (
              <button
                type="button"
                key={String(option.id)}
                aria-pressed={design[group.key] === option.id}
                onClick={() => select(group.key, option.id, group.event)}
              >
                {option.swatches ? <span className={styles.swatches}>{option.swatches.map((color) => <i key={color} style={{ background: color }} />)}</span> : null}
                <strong>{option.label}</strong>
                {option.note ? (
                  <small>
                    {group.key === "monogramId" && option.id === "seal"
                      ? initials
                      : group.key === "monogramId" && option.id === "initials"
                        ? initials.replace(" + ", " / ")
                        : group.key === "monogramId" && option.id === "wordmark"
                          ? monogramNames
                          : option.note}
                  </small>
                ) : null}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <a
        className={styles.customRequest}
        href="https://wa.me/5491138696958?text=Hola%20SODI%2C%20quiero%20consultar%20un%20dise%C3%B1o%20de%20invitaci%C3%B3n%20completamente%20personalizado."
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("custom_design_interest", { surface: "trial_personalization" })}
      >
        <span><strong>Quiero un diseño completamente personalizado</strong><small>Solicitud opcional. Se conversa y cotiza aparte.</small></span>
        <ExternalLink size={17} strokeWidth={1.8} />
      </a>
    </section>
  );
}
