"use client";

import { ArrowUpRight, Check, ChevronDown, LockKeyhole, MessageCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import {
  buildWeddingPublicationMessage,
  buildWeddingPublicationWhatsAppUrl,
  publicationOptionsViewProperties,
  publicationScopeSelectProperties,
  publishInterestProperties,
  WEDDING_PUBLICATION_SCOPES,
  weddingWhatsAppOpenProperties,
  type WeddingPublicationScopeId,
} from "@/lib/boda-trial/publication-interest";
import type { WeddingTrialWorkspace } from "@/lib/boda-trial/schema";
import styles from "./publication-interest.module.css";

type Props = {
  workspace: WeddingTrialWorkspace;
  themeName: string;
};

export function WeddingPublicationInterest({ workspace, themeName }: Props) {
  const [open, setOpen] = useState(false);
  const [scopeId, setScopeId] = useState<WeddingPublicationScopeId>("guided-start");
  const [approximateGuests, setApproximateGuests] = useState("");
  const [note, setNote] = useState("");
  const detailsRef = useRef<HTMLDivElement>(null);

  const message = useMemo(() => buildWeddingPublicationMessage({
    partnerOne: workspace.content.partnerOne,
    partnerTwo: workspace.content.partnerTwo,
    weddingDate: workspace.content.date,
    themeName,
    scopeId,
    approximateGuests,
    note,
  }), [approximateGuests, note, scopeId, themeName, workspace.content.date, workspace.content.partnerOne, workspace.content.partnerTwo]);

  const whatsAppUrl = buildWeddingPublicationWhatsAppUrl(message);

  function openOptions() {
    setOpen(true);
    trackEvent("publication_options_view", publicationOptionsViewProperties(workspace.event.themeId));
    window.requestAnimationFrame(() => detailsRef.current?.focus());
  }

  function selectScope(nextScopeId: WeddingPublicationScopeId) {
    setScopeId(nextScopeId);
    trackEvent("publication_scope_select", publicationScopeSelectProperties(nextScopeId));
  }

  return (
    <section className={styles.wrap} aria-labelledby="publication-title">
      <div className={styles.intro}>
        <LockKeyhole size={23} strokeWidth={1.7} aria-hidden="true" />
        <div>
          <h3 id="publication-title">¿Quieren usarla en la boda?</h3>
          <p>Si les gusta cómo quedó, contanos cuándo se casan y qué ayuda necesitan. Revisamos juntos la puesta en marcha y el precio antes de avanzar.</p>
        </div>
      </div>

      <div className={styles.boundary}>
        <div>
          <span>En esta prueba</span>
          <strong>Su borrador está en este navegador</strong>
          <small>Pueden seguir editando y ensayando respuestas. Todavía no es una invitación publicada.</small>
        </div>
        <div>
          <span>Para usarla en su boda</span>
          <strong>Primero acordamos la propuesta</strong>
          <small>Revisamos la invitación, la lista de invitados, la ayuda incluida y los tiempos de entrega.</small>
        </div>
      </div>

      {!open ? (
        <button type="button" className={styles.openButton} onClick={openOptions}>
          Consultar cómo publicarla <ChevronDown size={18} strokeWidth={1.8} />
        </button>
      ) : (
        <div className={styles.details} ref={detailsRef} tabIndex={-1}>
          <div className={styles.sectionHeading}>
            <strong>¿Cuánta ayuda necesitan?</strong>
            <span>Elijan qué les gustaría resolver. Lo usamos para preparar su consulta.</span>
          </div>

          <div className={styles.scopeList}>
            {WEDDING_PUBLICATION_SCOPES.map((scope) => {
              const selected = scope.id === scopeId;
              return (
                <button
                  type="button"
                  key={scope.id}
                  className={styles.scope}
                  data-selected={selected ? "true" : undefined}
                  aria-pressed={selected}
                  onClick={() => selectScope(scope.id)}
                >
                  <span className={styles.scopeCheck}>{selected ? <Check size={15} strokeWidth={2.2} /> : null}</span>
                  <span>
                    <strong>{scope.label}</strong>
                    <small>{scope.description}</small>
                    <em>{scope.includes.join(" / ")}</em>
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.formGrid}>
            <label>
              <span>Personas aproximadas</span>
              <input
                inputMode="numeric"
                value={approximateGuests}
                onChange={(event) => setApproximateGuests(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="Ejemplo: 120"
              />
              <small>Opcional. Ayuda a estimar la puesta en marcha.</small>
            </label>
            <label>
              <span>¿Con qué necesitan ayuda?</span>
              <textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, 320))}
                placeholder="Ejemplo: cargar la lista y revisar las fotos"
              />
              <small>Opcional. No incluyan datos personales de invitados.</small>
            </label>
          </div>

          <div className={styles.messagePreview}>
            <div>
              <MessageCircle size={18} strokeWidth={1.8} aria-hidden="true" />
              <strong>Este es el mensaje que van a revisar</strong>
            </div>
            <p>{message}</p>
          </div>

          <a
            className={styles.whatsAppButton}
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent("publish_interest", publishInterestProperties({
                scopeId,
                themeId: workspace.event.themeId,
                approximateGuests,
                note,
              }));
              trackEvent("wedding_whatsapp_open", weddingWhatsAppOpenProperties(scopeId));
            }}
          >
            Abrir consulta en WhatsApp <ArrowUpRight size={18} strokeWidth={1.8} />
          </a>
          <p className={styles.disclaimer}>Revisen el mensaje en WhatsApp antes de enviarlo. La consulta no adjunta el borrador ni las fotos; tampoco publica la invitación ni reserva el servicio.</p>
        </div>
      )}
    </section>
  );
}
