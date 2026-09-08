"use client";

import {
  Activity,
  CheckCheck,
  CheckCircle2,
  Clock3,
  Eye,
  Mail,
  MessageCircle,
  Send,
  Settings,
  Users,
} from "lucide-react";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import type { WeddingTrialWorkspace } from "@/lib/boda-trial/schema";
import { getWeddingTheme } from "@/lib/boda-trial/themes";
import styles from "./portal-demo.module.css";

type PortalView = "resumen" | "invitados" | "envios" | "respuestas" | "invitacion" | "configuracion";

const NAV_ITEMS: Array<{ id: PortalView; label: string; icon: typeof Activity }> = [
  { id: "resumen", label: "Resumen", icon: Activity },
  { id: "invitados", label: "Invitados", icon: Users },
  { id: "envios", label: "Envíos", icon: Send },
  { id: "respuestas", label: "Respuestas", icon: MessageCircle },
  { id: "invitacion", label: "Invitación", icon: Mail },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

const INVITATION_ACCENTS = { cobalto: "#3154a8", bosque: "#c49a52", nocturno: "#7f738d", clasico: "#a77b35", romantico: "#985b63", campestre: "#6d724e" } as const;
function deliveryState(guest: WeddingTrialWorkspace["guests"][number]) {
  if (guest.status !== "pending") return { label: "Respondió", className: styles.deliveryAnswered, Icon: CheckCheck };
  if (!guest.sent) return { label: "Por enviar", className: styles.deliveryUnsent, Icon: Clock3 };
  if (guest.openedAt) return { label: "Abrió, falta responder", className: styles.deliveryOpened, Icon: Eye };
  return { label: "Enviado, sin abrir", className: styles.deliverySent, Icon: Send };
}

function guestStatus(guest: WeddingTrialWorkspace["guests"][number]) {
  if (guest.status === "confirmed") return "Confirmó";
  if (guest.status === "declined") return "No asiste";
  return guest.sent ? "Esperando respuesta" : "Por enviar";
}

function statusClass(guest: WeddingTrialWorkspace["guests"][number]) {
  if (guest.status === "confirmed") return styles.statusConfirmed;
  if (guest.status === "declined") return styles.statusDeclined;
  return guest.sent ? styles.statusWaiting : styles.statusUnsent;
}

function formatPortalDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Fecha a definir";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function WeddingPortalDemo({
  workspace,
  compact = false,
  highlightedGuestId,
  onOpenInvitation,
}: {
  workspace: WeddingTrialWorkspace;
  compact?: boolean;
  highlightedGuestId?: string;
  onOpenInvitation?: () => void;
}) {
  const [view, setView] = useState<PortalView>("resumen");
  const [preparedGuestId, setPreparedGuestId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const activeTheme = getWeddingTheme(workspace.event.themeId);

  const stats = useMemo(() => {
    const confirmedPeople = workspace.rsvps
      .filter((response) => response.attendance === "confirmed")
      .reduce((sum, response) => sum + response.passes, 0);
    return {
      sent: workspace.guests.filter((guest) => guest.sent).length,
      assigned: workspace.guests.reduce((sum, guest) => sum + guest.passLimit, 0),
      confirmedPeople,
      waiting: workspace.guests.filter((guest) => guest.sent && guest.status === "pending").length,
      unsent: workspace.guests.filter((guest) => !guest.sent).length,
    };
  }, [workspace]);

  const recentResponses = useMemo(
    () => [...workspace.rsvps]
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
      .slice(0, compact ? 4 : 7)
      .map((response) => ({
        response,
        guest: workspace.guests.find((guest) => guest.id === response.guestId),
      }))
      .filter((item) => item.guest),
    [compact, workspace],
  );

  function chooseView(next: PortalView) {
    setView(next);
    contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
    trackEvent("portal_view", { view: next, surface: compact ? "landing_demo" : "trial" });
  }

  return (
    <section className={styles.portal} data-compact={compact ? "true" : undefined} style={{ "--portal-theme-accent": INVITATION_ACCENTS[workspace.event.themeId] } as CSSProperties} aria-label="Panel de organización con datos ficticios">
      <aside className={styles.sidebar}>
        <div className={styles.brand}><strong>SODI</strong><span>BODAS</span></div>
        <nav aria-label="Secciones del panel">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={view === item.id ? styles.navActive : undefined}
              aria-label={item.label}
              aria-current={view === item.id ? "page" : undefined}
              aria-controls="wedding-portal-content"
              onClick={() => chooseView(item.id)}
            >
              <item.icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.profile}><span>{workspace.content.partnerOne.charAt(0) || "A"}</span><div><strong>{workspace.content.partnerOne || "Pareja"}</strong><small>Organización</small></div></div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div><small>Ejemplo ficticio | {workspace.content.partnerOne || "Nombre 1"} y {workspace.content.partnerTwo || "Nombre 2"} | {formatPortalDate(workspace.content.date)}</small><h2>{NAV_ITEMS.find((item) => item.id === view)?.label}</h2><span className={styles.themeAccent}>Invitación {activeTheme.name}</span></div>
          {onOpenInvitation ? <button type="button" onClick={onOpenInvitation}><Eye size={17} /> Ver invitación</button> : null}
        </header>

        <div
          ref={contentRef}
          className={styles.content}
          id="wedding-portal-content"
          role="region"
          aria-label={`${NAV_ITEMS.find((item) => item.id === view)?.label} del panel`}
          tabIndex={0}
        >
          {view === "resumen" ? (
            <>
              <div className={styles.metrics}>
                <article><Mail size={18} /><div><strong>{stats.sent}/{workspace.guests.length}</strong><span>invitaciones enviadas</span></div></article>
                <article><Users size={18} /><div><strong>{stats.assigned}</strong><span>lugares en las invitaciones</span></div></article>
                <article data-updated={Boolean(highlightedGuestId)}><CheckCircle2 size={18} /><div><strong>{stats.confirmedPeople}</strong><span>personas confirmadas</span></div></article>
                <article data-updated={Boolean(highlightedGuestId)}><Activity size={18} /><div><strong>{stats.waiting}</strong><span>invitaciones por responder</span></div></article>
              </div>

              <div className={styles.summaryGrid}>
                <section className={styles.progressPanel}>
                  <span>Planificación general</span>
                  <h3>Quién viene y qué falta confirmar</h3>
                  <p>{countLabel(stats.assigned, "lugar disponible", "lugares disponibles")} en {countLabel(workspace.guests.length, "invitación", "invitaciones")} para personas, parejas o familias.</p>
                  <div className={styles.progressNumbers}>
                    <strong>{stats.confirmedPeople}</strong>
                    <span>{stats.confirmedPeople === 1 ? "persona confirmada" : "personas confirmadas"}</span>
                  </div>
                  <small>{stats.unsent ? countLabel(stats.unsent, "invitación lista para enviar", "invitaciones listas para enviar") : "Todas las invitaciones de ejemplo figuran enviadas"}</small>
                </section>

                <section className={styles.activityPanel}>
                  <div className={styles.panelHeading}><div><span>Últimos movimientos</span><h3>Actividad y respuestas</h3></div><button type="button" onClick={() => chooseView("respuestas")}>Ver todas</button></div>
                  <div className={styles.activityList}>
                    {recentResponses.map(({ guest, response }) => guest ? (
                      <article key={response.id} data-highlighted={guest.id === highlightedGuestId}>
                        <span className={`${styles.statusMark} ${statusClass(guest)}`} />
                        <div><strong>{guest.name}</strong><small>{response.attendance === "confirmed" ? `Respondió: ${response.passes === 1 ? "viene" : "vienen"} ${response.passes} ${response.passes === 1 ? "persona" : "personas"}` : "Respondió: no asistirá"}</small></div>
                        <span className={styles.deliveryAnswered}>Respondió</span>
                      </article>
                    ) : null)}
                  </div>
                </section>
              </div>
            </>
          ) : null}

          {view === "invitados" ? (
            <section className={styles.listView}>
              <div className={styles.viewHeading}><div><span>Lista ficticia</span><h3>{countLabel(workspace.guests.length, "invitación", "invitaciones")}, {countLabel(stats.assigned, "lugar", "lugares")}</h3><p>Cada invitación puede representar a una persona, una pareja o una familia. Los lugares son el máximo que pueden confirmar.</p></div></div>
              <div className={styles.guestList}>
                {workspace.guests.map((guest) => (
                  <article key={guest.id} data-highlighted={guest.id === highlightedGuestId}>
                    <span className={styles.avatar}>{guest.name.charAt(0)}</span>
                    <div><strong>{guest.name}</strong><small>Hasta {guest.passLimit} {guest.passLimit === 1 ? "lugar" : "lugares"}{guest.note ? ` | ${guest.note}` : ""}</small><span className={`${styles.deliveryState} ${deliveryState(guest).className}`}>{(() => { const DeliveryIcon = deliveryState(guest).Icon; return <DeliveryIcon size={13} aria-hidden="true" />; })()}{deliveryState(guest).label}</span></div>
                    <span className={`${styles.guestStatus} ${statusClass(guest)}`}>{guestStatus(guest)}</span>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {view === "envios" ? (
            <section className={styles.listView}>
              <div className={styles.viewHeading}><div><span>Envíos ficticios de ejemplo</span><h3>{countLabel(stats.unsent, "invitación por enviar", "invitaciones por enviar")}</h3><p>Este ejemplo distingue las invitaciones marcadas como enviadas, los enlaces abiertos y las respuestas pendientes.</p></div></div>
              <div className={styles.sendList}>{workspace.guests.map((guest) => {
                const delivery = deliveryState(guest);
                const DeliveryIcon = delivery.Icon;
                return (
                  <article key={guest.id}>
                    <DeliveryIcon size={18} />
                    <div><strong>{guest.name}</strong><small>{countLabel(guest.passLimit, "lugar en su invitación", "lugares en su invitación")}</small></div>
                    <span className={`${styles.deliveryState} ${delivery.className}`}><DeliveryIcon size={13} aria-hidden="true" />{delivery.label}</span>
                    {!guest.sent ? (
                      <button
                        type="button"
                        aria-expanded={preparedGuestId === guest.id}
                        aria-controls={`demo-message-${guest.id}`}
                        onClick={() => setPreparedGuestId((current) => current === guest.id ? null : guest.id)}
                      >
                        {preparedGuestId === guest.id ? "Cerrar ejemplo" : "Ver mensaje de ejemplo"}
                      </button>
                    ) : null}
                    {preparedGuestId === guest.id ? (
                      <div id={`demo-message-${guest.id}`} style={{ gridColumn: "1 / -1" }} role="status">
                        <p>Hola {guest.name}, somos {workspace.content.partnerOne} y {workspace.content.partnerTwo}. ¡Nos casamos el {formatPortalDate(workspace.content.date)}! Nos encantaría compartir ese día con ustedes. Les dejamos la invitación para que vean los detalles y nos confirmen si vienen: [enlace para esta invitación].</p>
                        <small>Mensaje de ejemplo. En una invitación publicada, ese espacio lleva el enlace de la familia. Desde esta demostración no se envía ningún mensaje.</small>
                      </div>
                    ) : null}
                  </article>
                );
              })}</div>
            </section>
          ) : null}

          {view === "respuestas" ? (
            <section className={styles.listView}>
              <div className={styles.viewHeading}><div><span>Confirmaciones</span><h3>{countLabel(workspace.rsvps.length, "respuesta recibida", "respuestas recibidas")}</h3><p>Asistencia, cantidad de personas, menú y notas en un solo lugar.</p></div></div>
              <div className={styles.responseList}>{recentResponses.map(({ guest, response }) => guest ? <article key={response.id} data-highlighted={guest.id === highlightedGuestId}><div><strong>{guest.name}</strong><small>Respondió | {guest.menu}{guest.note ? ` | ${guest.note}` : ""}</small></div><span>{response.attendance === "confirmed" ? `${response.passes} asisten` : "No asiste"}</span></article> : null)}</div>
            </section>
          ) : null}

          {view === "invitacion" ? (
            <section className={styles.emptyView}><Mail size={30} /><h3>Así queda su invitación de prueba</h3><p>Los nombres, la fecha, los lugares y el estilo que eligieron aparecen en la invitación de prueba.</p>{onOpenInvitation ? <button type="button" onClick={onOpenInvitation}>Abrir invitación de prueba</button> : null}</section>
          ) : null}

          {view === "configuracion" ? (
            <section className={styles.settingsView}><article><span>Evento</span><strong>{workspace.content.partnerOne} y {workspace.content.partnerTwo}</strong><small>{formatPortalDate(workspace.content.date)}</small></article><article><span>Estilo de invitación</span><strong>{activeTheme.name}</strong><small>Es el estilo que eligieron para la invitación.</small></article><article><span>Publicación</span><strong>Sin publicar</strong><small>Esta prueba no crea una URL pública.</small></article><article><span>Invitados de ejemplo</span><strong>Datos ficticios</strong><small>Pueden recorrer las respuestas y ver cómo se cuentan personas e invitaciones por separado.</small></article></section>
          ) : null}
        </div>
      </div>
    </section>
  );
}
