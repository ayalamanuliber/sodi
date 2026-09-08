"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { loadWeddingTrial, WEDDING_TRIAL_STORAGE_KEY } from "@/lib/boda-trial/schema";
import { trackEvent } from "@/components/analytics/tracking";
import type { WeddingThemeId, WeddingTrialWorkspace } from "@/lib/boda-trial/schema";
import { WEDDING_THEMES, WEDDING_THEME_PRESETS } from "@/lib/boda-trial/themes";
import { InvitationPreview } from "./InvitationPreview";

import styles from "./landing.module.css";

const LANDING_FIXTURE: WeddingTrialWorkspace = {
  version: 3,
  account: { id: "landing_demo_account", kind: "anonymous_trial" },
  event: {
    id: "landing_demo_event",
    accountId: "landing_demo_account",
    slug: "julia-y-mateo-ejemplo",
    themeId: "bosque",
    status: "active",
    publicationStatus: "locked",
    createdAt: "2026-08-23T12:00:00.000Z",
    updatedAt: "2026-08-23T12:00:00.000Z",
    expiresAt: "2027-08-23T12:00:00.000Z",
  },
  content: {
    eventId: "landing_demo_event",
    partnerOne: "Julia",
    partnerTwo: "Mateo",
    date: "2027-03-20",
    ceremonyLocation: "Jardín del Sur",
    celebrationLocation: "Galería Central",
    message: "Una tarde para encontrarnos, brindar y celebrar juntos.",
    story: "Nos conocimos entre amigos y desde entonces elegimos compartir cada aventura. Queremos celebrar este nuevo capítulo con ustedes.",
    ceremonyTime: "18:30",
    celebrationTime: "20:00",
    dressCode: "Elegante, con libertad para bailar",
  },
  guests: [],
  rsvps: [],
  publication: {
    eventId: "landing_demo_event",
    status: "locked",
    publicUrl: null,
    exportStatus: "locked",
  },
  design: {
    paletteId: "forest-gold",
    typographyId: "editorial",
    coverId: "cinematic",
    monogramId: "seal",
    galleryId: "mosaic",
    ornamentId: "balanced",
    samplePhotosEnabled: true,
  },
};

export function WeddingHeroPreview() {
  const [themeId, setThemeId] = useState<WeddingThemeId>("bosque");
  const [partnerOne, setPartnerOne] = useState("Julia");
  const [partnerTwo, setPartnerTwo] = useState("Mateo");
  const router = useRouter();
  const [existingDraft, setExistingDraft] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const playedRef = useRef(false);
  const completedRef = useRef(false);

  const workspace = useMemo<WeddingTrialWorkspace>(() => ({
    ...LANDING_FIXTURE,
    event: { ...LANDING_FIXTURE.event, themeId },
    content: { ...LANDING_FIXTURE.content, partnerOne, partnerTwo },
    design: {
      ...LANDING_FIXTURE.design,
      ...WEDDING_THEME_PRESETS[themeId],
    },
  }), [partnerOne, partnerTwo, themeId]);

  function markInteraction(action: string) {
    if (!playedRef.current) {
      playedRef.current = true;
      trackEvent("demo_play", { location: "hero", action });
    }
    if (!completedRef.current) {
      completedRef.current = true;
      trackEvent("preview_complete", { location: "hero", action });
    }
  }

  function chooseTheme(nextTheme: WeddingThemeId) {
    setThemeId(nextTheme);
    markInteraction("theme");
    trackEvent("theme_select", { location: "hero", theme: nextTheme });
  }

  function continueDesign(apply = false) {
    const saved = loadWeddingTrial();
    try {
      if (!apply && window.localStorage.getItem(WEDDING_TRIAL_STORAGE_KEY)) {
        setExistingDraft(true);
        return;
      }
      const next = {
        ...saved,
        event: { ...saved.event, themeId, updatedAt: new Date().toISOString() },
        content: { ...saved.content, partnerOne: partnerOne.trim() || "Julia", partnerTwo: partnerTwo.trim() || "Mateo" },
        design: { ...saved.design, ...WEDDING_THEME_PRESETS[themeId] },
      };
      window.localStorage.setItem(WEDDING_TRIAL_STORAGE_KEY, JSON.stringify(next));
      trackEvent("trial_start", { location: "hero_design", theme: themeId });
      router.push("/boda/prueba?paso=editar");
    } catch {
      setStorageError(true);
    }
  }

  return (
    <div className={styles.heroProduct} data-theme={themeId} aria-label="Invitación de ejemplo que podés modificar">
      <div className={styles.heroProductTop}>
        <span>Una pequeña muestra de su gran día</span>
        <strong>{WEDDING_THEMES.find((theme) => theme.id === themeId)?.name}</strong>
      </div>
      <div className={styles.heroInvitation}>
        <InvitationPreview workspace={workspace} compact coverOnly startOpen onRsvpClick={() => { document.getElementById("confirmaciones")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }} />
      </div>
      <div className={styles.heroProductControls}>
        <div className={styles.heroNameFields}>
          <label><span>Sus nombres</span><input aria-label="Nombre 1" value={partnerOne} maxLength={20} onChange={(event) => { setPartnerOne(event.target.value); markInteraction("name"); }} /></label>
          <span className={styles.nameAmpersand} aria-hidden="true">&</span>
          <label><span>Y el de su persona</span><input aria-label="Nombre 2" value={partnerTwo} maxLength={20} onChange={(event) => { setPartnerTwo(event.target.value); markInteraction("name"); }} /></label>
        </div>
        <div className={styles.heroThemeSwitch} aria-label="Elegir estilo visual">
          {WEDDING_THEMES.map((theme) => (
            <button type="button" key={theme.id} aria-label={`Elegir ${theme.name}`} aria-pressed={themeId === theme.id} onClick={() => chooseTheme(theme.id)}>
              <span className={styles.themeSwatch} style={{ background: theme.tokens.text, borderColor: theme.tokens.accent }} aria-hidden="true" />
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.continueDesign} onClick={() => continueDesign()}>Seguir con este diseño <ArrowUpRight size={17} /></button>
        <small className={styles.sampleNote}>Fotos y datos de ejemplo. Podrán reemplazarlos en la prueba.</small>
        {existingDraft ? <div className={styles.draftChoice} role="status"><p>Ya tienen un borrador guardado en este navegador.</p><Link href="/boda/prueba">Continuar el borrador</Link><button type="button" onClick={() => continueDesign(true)}>Aplicar estos nombres y estilo al borrador</button></div> : null}
        {storageError ? <p className={styles.fieldError} role="alert">El navegador no permite guardar este diseño. <Link href="/boda/prueba">Abrir la prueba sin guardarlo</Link>.</p> : null}
      </div>
    </div>
  );
}
