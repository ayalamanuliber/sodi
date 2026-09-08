"use client";

import { FormEvent, useId, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { trackEvent } from "@/components/analytics/tracking";
import styles from "./landing.module.css";

type Status = "idle" | "preparing" | "ready";

export function WeddingInterestForm() {
  const formId = useId();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<"pareja" | "planner" | "salon">("pareja");
  const [context, setContext] = useState("");
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});
  const [status, setStatus] = useState<Status>("idle");
  const [whatsAppUrl, setWhatsAppUrl] = useState("");
  const startedRef = useRef(false);

  function markStarted() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("wedding_intake_start", { page: "/boda" });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = {
      ...(!name.trim() ? { name: "Decinos cómo te llamás." } : {}),
      ...(contact.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim()) ? { contact: "Revisá el email o dejalo vacío si preferís usar WhatsApp." } : {}),
    };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      trackEvent("wedding_intake_error", { fields: Object.keys(nextErrors) });
      return;
    }

    setStatus("preparing");
    const message = [
      role === "salon"
        ? "Hola SODI, trabajo en un salón de eventos y quiero revisar cómo cerrar la lista de invitados y las mesas con cada pareja."
        : role === "planner"
        ? "Hola SODI, trabajo organizando bodas y quiero consultar cómo podría usar sus invitaciones con mis parejas."
        : "Hola SODI, quiero consultar por una invitación y la organización de confirmaciones para nuestra boda.",
      `Nombre: ${name.trim()}`,
      contact.trim() ? `Email alternativo: ${contact.trim()}` : "",
      context.trim() ? `${role === "pareja" ? "Sobre la boda" : "Cómo organizamos los eventos"}: ${context.trim()}` : "",
    ].filter(Boolean).join("\n");

    window.setTimeout(() => {
      setWhatsAppUrl(`https://wa.me/5491138696958?text=${encodeURIComponent(message)}`);
      setStatus("ready");
      trackEvent(role !== "pareja" ? "wedding_planner_interest" : "wedding_intake_submit", {
        role,
        has_context: Boolean(context.trim()),
      });
    }, 350);
  }

  if (status === "ready") {
    return (
      <div className={styles.formReady} role="status" aria-live="polite">
        <strong>El mensaje está listo para revisar.</strong>
        <p>Abrí WhatsApp, revisá el mensaje y envialo cuando quieras. Todavía no se envió la consulta.</p>
        <a
          className={styles.primaryButton}
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("wedding_whatsapp_open", { location: "interest_form", role })}
        >
          Abrir WhatsApp <ArrowUpRight size={18} strokeWidth={1.8} />
        </a>
        <button type="button" className={styles.formEdit} onClick={() => setStatus("idle")}>
          Editar datos
        </button>
      </div>
    );
  }

  return (
    <form className={styles.interestForm} onSubmit={submit} noValidate>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Nombre</span>
          <input
            autoComplete="name"
            maxLength={80}
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            value={name}
            aria-invalid={Boolean(errors.name)}
            onFocus={markStarted}
            onChange={(event) => setName(event.target.value)}
          />
          {errors.name ? <small id={`${formId}-name-error`} className={styles.fieldError} role="alert">{errors.name}</small> : null}
        </label>
        <label className={styles.field}>
          <span>Email alternativo</span>
          <input
            type="email"
            autoComplete="email"
            maxLength={254}
            aria-describedby={`${formId}-email-hint${errors.contact ? ` ${formId}-email-error` : ""}`}
            value={contact}
            aria-invalid={Boolean(errors.contact)}
            onFocus={markStarted}
            onChange={(event) => setContact(event.target.value)}
          />
          <small id={`${formId}-email-hint`} className={styles.fieldHint}>Opcional. La consulta se abre desde tu WhatsApp.</small>
          {errors.contact ? <small id={`${formId}-email-error`} className={styles.fieldError} role="alert">{errors.contact}</small> : null}
        </label>
        <label className={styles.field}>
          <span>Estoy consultando como</span>
          <select
            value={role}
            onFocus={markStarted}
            onChange={(event) => setRole(event.target.value as "pareja" | "planner" | "salon")}
          >
            <option value="pareja">Parte de la pareja</option>
            <option value="planner">Wedding planner</option>
            <option value="salon">Salón de eventos</option>
          </select>
        </label>
        <label className={styles.field}>
          <span>{role === "pareja" ? "¿Cuándo se casan y qué necesitan?" : "¿Cómo organizás hoy tus eventos?"}</span>
          <input
            value={context}
            placeholder={role === "pareja" ? "Ej.: marzo · 120 personas" : "Ej.: listas en planillas"}
            onFocus={markStarted}
            onChange={(event) => setContext(event.target.value.slice(0, 240))}
          />
          <small className={styles.fieldHint}>Opcional. No incluyas datos de invitados.</small>
        </label>
      </div>
      <button
        type="submit"
        disabled={status === "preparing"}
        className={`${styles.primaryButton} ${status === "preparing" ? styles.loadingButton : ""}`}
      >
        {status === "preparing" ? "Preparando mensaje…" : "Preparar mi consulta"}
        {status === "idle" ? <ArrowUpRight size={18} strokeWidth={1.8} /> : null}
      </button>
      <p className={styles.formPrivacy}>
        Vas a revisar el mensaje antes de enviarlo por WhatsApp. Consultar no reserva ni publica la invitación.
      </p>
    </form>
  );
}
