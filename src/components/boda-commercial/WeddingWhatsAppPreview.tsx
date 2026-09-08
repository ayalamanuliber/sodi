"use client";

import { Check, Copy, MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import type { WeddingTrialWorkspace } from "@/lib/boda-trial/schema";
import styles from "./whatsapp-preview.module.css";

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "la fecha de nuestra boda" : new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export function WeddingWhatsAppPreview({ workspace }: { workspace: WeddingTrialWorkspace }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const initialMessage = useMemo(() => `Hola Lucía,\n\n${workspace.content.partnerOne} y ${workspace.content.partnerTwo} se casan el ${formatDate(workspace.content.date)} y quieren compartirte su invitación. Tenés 2 lugares reservados.\n\nAbrí la invitación y confirmá si venís:\n[el enlace personal aparece después de publicar]`, [workspace.content.date, workspace.content.partnerOne, workspace.content.partnerTwo]);
  const [message, setMessage] = useState(initialMessage);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      trackEvent("whatsapp_message_copy", { surface: "trial_preview" });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className={styles.wrap}>
      <button type="button" className={styles.openButton} aria-expanded={open} onClick={() => { const next = !open; setOpen(next); if (next) { trackEvent("whatsapp_preview_open", { surface: "trial_preview" }); trackEvent("whatsapp_interest", { surface: "trial_preview", intent: "preview" }); } }}>
        <MessageCircle size={17} strokeWidth={1.8} /> Ver cómo se enviaría por WhatsApp
      </button>
      {open ? (
        <div className={styles.preview}>
          <header><div><strong>Así se enviaría por WhatsApp</strong><span>Vista previa. Nada se envía desde esta prueba.</span></div><button type="button" aria-label="Cerrar vista previa" onClick={() => setOpen(false)}><X size={17} /></button></header>
          <div className={styles.chat}><p>{message}</p></div>
          <label><span>Podés ajustar el mensaje de ejemplo</span><textarea value={message} rows={8} onChange={(event) => setMessage(event.target.value.slice(0, 900))} /></label>
          <div className={styles.actions}><button type="button" onClick={copyMessage}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Mensaje copiado" : "Copiar mensaje"}</button><span>El enlace público y personal se agrega recién al publicar la invitación.</span></div>
        </div>
      ) : null}
    </section>
  );
}
