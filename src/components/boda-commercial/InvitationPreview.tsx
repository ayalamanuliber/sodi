"use client";

import Image from "next/image";
import Link from "next/link";
import { Gift, MapPin, Music2, Route, Shirt, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import { invitationGalleryAlt, resolveInvitationImages } from "@/lib/boda-trial/gallery";
import type { WeddingTrialWorkspace } from "@/lib/boda-trial/schema";
import { getWeddingTheme, resolveWeddingTrialDesign, weddingThemeStyle } from "@/lib/boda-trial/themes";
import styles from "./invitation-demo.module.css";

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Fecha a definir";
  return new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(parsed);
}

function usesLocalImage(url: string) { return url.startsWith("blob:") || url.startsWith("data:"); }

function photoKey(url: string, fallback: "hero" | "ceremony" | "celebration" | "walk" | "toast") {
  if (usesLocalImage(url)) return `local-${fallback}`;
  const match = url.match(/^\/invitaciones-boda\/couple-(hero|ceremony|celebration|walk|toast)\.(?:webp|avif|jpe?g|png)$/i);
  return match?.[1] ?? `local-${fallback}`;
}

export function InvitationPreview({ workspace, onRsvpClick, photoUrls = [], musicUrl, musicName, compact = false, coverOnly = false, startOpen, mode = "demo", guestLabel, guestCount }: {
  workspace: WeddingTrialWorkspace;
  onRsvpClick?: () => void;
  photoUrls?: string[];
  musicUrl?: string;
  musicName?: string;
  compact?: boolean;
  coverOnly?: boolean;
  startOpen?: boolean;
  mode?: "demo" | "published";
  guestLabel?: string;
  guestCount?: number;
}) {
  const theme = getWeddingTheme(workspace.event.themeId);
  const resolvedDesign = resolveWeddingTrialDesign(workspace.event.themeId, workspace.design);
  const { content } = workspace;
  const [opened, setOpened] = useState(startOpen ?? compact);
  const [infoOpen, setInfoOpen] = useState<"gifts" | "playlist" | null>(null);
  const infoCloseRef = useRef<HTMLButtonElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const infoOpenerRef = useRef<HTMLButtonElement | null>(null);
  const [countdown, setCountdown] = useState({ days: "--", hours: "--", minutes: "--" });
  const isPublished = mode === "published";
  const images = useMemo(() => isPublished ? Array.from({ length: Math.max(3, photoUrls.length) }, (_, i) => photoUrls.length ? photoUrls[i % photoUrls.length] : "/invitaciones-boda/paper-cover.svg") : resolveInvitationImages(photoUrls), [photoUrls, isPublished]);
  const pictureAlt = (demo: string, real: string) => isPublished ? real : demo;
  const initials = `${content.partnerOne.charAt(0) || "J"} + ${content.partnerTwo.charAt(0) || "M"}`;
  const monogram = resolvedDesign.monogramId === "wordmark"
    ? `${content.partnerOne || "Julia"} + ${content.partnerTwo || "Mateo"}`
    : resolvedDesign.monogramId === "initials"
      ? initials.replace(" + ", " / ")
      : initials;
  const partnerOne = content.partnerOne.trim() || "Nombre";
  const partnerTwo = content.partnerTwo.trim() || "Nombre";
  const longestName = Math.max(partnerOne.length, partnerTwo.length);
  const combinedNameLength = partnerOne.length + partnerTwo.length;
  const nameLength = longestName > 13 || combinedNameLength > 24
    ? "long"
    : longestName > 8 || combinedNameLength > 14
      ? "medium"
      : "short";
  const compactMonogram = nameLength === "long" ? initials : monogram;

  useEffect(() => {
    const update = () => {
      const target = new Date(`${content.date}T${content.ceremonyTime || content.celebrationTime || "18:30"}:00-03:00`).getTime();
      const diff = Math.max(0, target - Date.now());
      setCountdown({
        days: String(Math.floor(diff / 86_400_000)).padStart(2, "0"),
        hours: String(Math.floor((diff % 86_400_000) / 3_600_000)).padStart(2, "0"),
        minutes: String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0"),
      });
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [content.date, content.ceremonyTime, content.celebrationTime]);

  useEffect(() => {
    if (!infoOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => infoCloseRef.current?.focus(), 0);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInfoOpen(null);
      if (event.key === "Tab" && infoCardRef.current) {
        const focusable = Array.from(infoCardRef.current.querySelectorAll<HTMLElement>("button, input, textarea, select, a[href], [tabindex]:not([tabindex='-1'])"));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      infoOpenerRef.current?.focus({ preventScroll: true });
    };
  }, [infoOpen]);

  function openInfo(kind: "gifts" | "playlist", opener: HTMLButtonElement) {
    infoOpenerRef.current = opener;
    setInfoOpen(kind);
  }

  function openInvitation() {
    setOpened(true);
    if (!isPublished) trackEvent("demo_play", { location: compact ? "landing_invitation" : "trial_invitation", action: "open_envelope" });
  }

  return (
    <article className={styles.shell} data-theme={theme.id} data-layout={theme.layout} data-cover={resolvedDesign.coverId} data-gallery={resolvedDesign.galleryId} data-monogram={resolvedDesign.monogramId} data-ornament={resolvedDesign.ornamentId} data-text-placement={resolvedDesign.textPlacementId} data-photo-focus={resolvedDesign.photoFocusId} data-contrast={resolvedDesign.contrastId} data-name-length={nameLength} data-compact={compact ? "true" : undefined} data-cover-only={coverOnly ? "true" : undefined} data-opened={opened ? "true" : "false"} style={weddingThemeStyle(theme, resolvedDesign)} aria-label={`${coverOnly ? "Portada" : "Invitación completa"} ${isPublished ? "" : "de muestra "}con estilo ${theme.name}`}>
      {!opened ? (
        <div className={styles.opening}>
          <Image className={styles.openingPhoto} data-photo={photoKey(images[0], "hero")} src={images[0]} alt={pictureAlt("Pareja ficticia de la invitación de muestra", "Foto elegida por la pareja")} fill priority unoptimized={usesLocalImage(images[0])} sizes="100vw" />
          <div className={styles.openingShade} />
          <div className={styles.envelopeScene}>
            <p>{isPublished ? guestLabel ? `Una invitación especial para ${guestLabel}` : "Una invitación especial para vos" : "Una invitación especial para Lucía"}</p>
            <div className={styles.envelope}>
              <div className={styles.envelopeBack} />
            <div className={styles.envelopeLetter}><span>{compactMonogram}</span><strong>Invitación de boda</strong><small>{formatDate(content.date)}</small></div>
            <div className={styles.envelopeFront} />
              <button type="button" className={styles.seal} onClick={openInvitation} aria-label="Abrir invitación">{compactMonogram}</button>
            </div>
            <button type="button" className={styles.openButton} onClick={openInvitation}>Abrir invitación</button>
          </div>
        </div>
      ) : null}

      <div className={styles.invitation} aria-hidden={!opened} inert={!opened}>
        <header className={styles.invitationHeader}><strong>{compactMonogram}</strong><button type="button" onClick={onRsvpClick}>Confirmar asistencia</button></header>
        <section className={styles.hero}>
          <Image className={styles.heroPhoto} data-photo={photoKey(images[0], "hero")} src={images[0]} alt={pictureAlt("Portada ficticia de la invitación", "Portada de la invitación")} fill priority unoptimized={usesLocalImage(images[0])} sizes={compact ? "700px" : "100vw"} />
          <div className={styles.heroShade} />
          <div className={styles.heroContent}><p>Nos casamos</p><h2 className={styles.coupleNames}><span>{partnerOne}</span><i aria-hidden="true">y</i><span>{partnerTwo}</span></h2><strong>{formatDate(content.date)}</strong><blockquote>{content.message}</blockquote><button type="button" onClick={onRsvpClick}>Confirmar asistencia</button></div>
        </section>

        {!coverOnly ? <>
        <section className={styles.story}>
          <figure><Image data-photo={photoKey(images[1], "ceremony")} src={images[1]} alt={pictureAlt("Foto ficticia para la historia de la pareja", "Historia de la pareja")} fill unoptimized={usesLocalImage(images[1])} sizes="(max-width: 720px) 100vw, 48vw" /></figure>
          <div><p>Nuestra historia</p><h3>Un camino que merece celebrarse.</h3><span>{content.story}</span></div>
        </section>

        <section className={styles.events}>
          <div className={styles.sectionHeading}><p>Dónde y cuándo</p><h3>Todo para acompañarnos.</h3></div>
          <div className={styles.eventGrid} style={isPublished && !content.ceremonyLocation ? { gridTemplateColumns: "1fr" } : undefined}>
            {(!isPublished || content.ceremonyLocation) && <article><MapPin size={20} /><span>Ceremonia</span><h4>{content.ceremonyLocation}</h4><p>{content.ceremonyTime} hs</p><small>{content.ceremonyAddress || (isPublished ? "Dirección a confirmar" : "Ubicación ficticia para esta prueba")}</small></article>}
            <article><MapPin size={20} /><span>Celebración</span><h4>{content.celebrationLocation}</h4><p>{content.celebrationTime} hs</p><small>{content.celebrationAddress || (isPublished ? "Dirección a confirmar" : "Ubicación ficticia para esta prueba")}</small></article>
          </div>
          {(!isPublished || content.ceremonyLocation) && <div className={styles.routePreview} aria-label={isPublished ? "Orden del recorrido" : "Orden del recorrido de muestra"}>
            <Route size={20} aria-hidden="true" />
            <span><strong>Primero, la ceremonia</strong><small>{content.ceremonyLocation}</small></span>
            <i aria-hidden="true" />
            <span><strong>Después, la celebración</strong><small>{content.celebrationLocation}</small></span>
          </div>}
          {isPublished ? <div className={styles.routeNote}>{content.ceremonyAddress && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.ceremonyAddress)}`} target="_blank" rel="noreferrer">Cómo llegar a la ceremonia</a>}{content.celebrationAddress && <> · <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(content.celebrationAddress)}`} target="_blank" rel="noreferrer">Cómo llegar a la celebración</a></>}</div> : <p className={styles.routeNote}>El mapa exacto y los enlaces de navegación se cargan al preparar la publicación. Esta prueba no consulta servicios de mapas.</p>}
        </section>

        {(!isPublished || photoUrls.length > 1) && <section className={styles.gallery}>
          <div className={styles.sectionHeading}><p>Momentos compartidos</p><h3>Una historia en imágenes.</h3></div>
          <div className={styles.galleryGrid}>{(isPublished ? photoUrls : images).map((image, index) => {
            const fallback = (["hero", "ceremony", "celebration", "walk", "toast"] as const)[index % 5];
            return <figure key={`${image}-${index}`} data-photo-slot={index + 1} data-photo-frame={fallback}><Image data-photo={photoKey(image, fallback)} src={image} alt={pictureAlt(invitationGalleryAlt(index), `Foto ${index + 1} de la pareja`)} fill unoptimized={usesLocalImage(image)} sizes="(max-width: 720px) 50vw, 25vw" /></figure>;
          })}</div>
        </section>}

        <section className={styles.countdown}>
          <Image data-photo={photoKey(images[2], "celebration")} src={images[2]} alt={pictureAlt("Composición ficticia de la celebración", "Foto de la pareja")} fill unoptimized={usesLocalImage(images[2])} sizes="100vw" />
          <div className={styles.countdownShade} />
          <div><p>Falta menos</p><h3>{content.partnerOne} y {content.partnerTwo}</h3><dl><span><dt>{countdown.days}</dt><dd>días</dd></span><span><dt>{countdown.hours}</dt><dd>horas</dd></span><span><dt>{countdown.minutes}</dt><dd>minutos</dd></span></dl></div>
        </section>

        <section className={styles.details}>
          <div className={styles.sectionHeading}><p>Información útil</p><h3>Todo lo necesario.</h3></div>
          <div className={styles.detailGrid}>
            <article><Shirt size={22} /><h4>Código de vestimenta</h4><p>{content.dressCode}</p></article>
            {!isPublished && <button type="button" onClick={(event) => openInfo("gifts", event.currentTarget)}><Gift size={22} /><strong>Regalos</strong><span>Ver información de muestra</span></button>}
            {!isPublished && (musicUrl ? <article className={styles.musicCard}><Music2 size={22} /><h4>Música de la pareja</h4><p>{musicName || "Canción de prueba"}</p><audio controls preload="metadata" src={musicUrl}>Tu navegador no puede reproducir este audio.</audio></article> : <button type="button" onClick={(event) => openInfo("playlist", event.currentTarget)}><Music2 size={22} /><strong>Playlist colaborativa</strong><span>Sugerir una canción</span></button>)}
          </div>
        </section>

        <section className={styles.confirmation}><p>Nos encantaría contar con vos</p><h3>¿Venís a celebrar?</h3><span>{isPublished ? guestLabel ? `${guestLabel}${guestCount ? ` · ${guestCount} ${guestCount === 1 ? "persona invitada" : "personas invitadas"}` : ""}` : "Respondé desde el enlace que recibiste para tu invitación." : "Lucía tiene 2 lugares reservados en esta invitación de prueba."}</span><button type="button" onClick={onRsvpClick}>Confirmar asistencia</button></section>
        <footer className={styles.closing}><Image data-photo={photoKey(images[1], "ceremony")} src={images[1]} alt={pictureAlt("Cierre ficticio de la invitación", "Foto de cierre de la invitación")} fill unoptimized={usesLocalImage(images[1])} sizes="100vw" /><div className={styles.closingShade} /><div><p>{content.partnerOne} y {content.partnerTwo}</p><h3>Gracias por ser parte de nuestra historia.</h3></div></footer>
        <aside className={styles.sodiAttribution} aria-label="Creado con SODI Bodas">
          <span>Invitación creada con <strong>SODI Bodas</strong></span>
          <Link
            href="/boda?utm_source=invitacion&utm_medium=guest_attribution&utm_campaign=sodi_bodas"
            onClick={() => trackEvent("wedding_guest_attribution_click", {
              surface: "invitation_footer",
              invite_theme: theme.id,
              destination: "/boda",
            })}
          >
            ¿También están organizando una boda? Conocé cómo funciona
          </Link>
        </aside>
        </> : null}
      </div>

      {infoOpen ? (
        <div className={styles.infoModal} role="dialog" aria-modal="true" aria-label={infoOpen === "gifts" ? "Regalos" : "Playlist colaborativa"} onMouseDown={(event) => { if (event.target === event.currentTarget) setInfoOpen(null); }}>
          <div ref={infoCardRef}>
            <button ref={infoCloseRef} type="button" aria-label="Cerrar" onClick={() => setInfoOpen(null)}><X size={18} /></button>
            {infoOpen === "gifts" ? (
              <><Gift size={26} /><h3>Regalos</h3><p>Acá la pareja puede compartir cómo prefiere recibir regalos. Esta prueba no muestra alias, cuentas ni enlaces reales.</p><small>Contenido ficticio para ver el formato.</small></>
            ) : (
              <><Music2 size={26} /><h3>Playlist colaborativa</h3><p>Las personas invitadas pueden sugerir una canción y la pareja la encuentra junto con cada confirmación.</p><label><span>Canción de prueba</span><input value="La canción que siempre bailamos" readOnly /></label></>
            )}
          </div>
        </div>
      ) : null}
    </article>
  );
}
