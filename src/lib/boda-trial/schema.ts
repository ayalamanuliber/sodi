import { validateWeddingTrial } from "./validation.ts";

export const WEDDING_TRIAL_STORAGE_KEY = "sodi:wedding-trial:v3";
export const WEDDING_TRIAL_RECOVERY_KEY = "sodi:wedding-trial:v3:recovery";
let trialAutosaveBlocked = false;

export function canAutosaveWeddingTrial() { return !trialAutosaveBlocked; }

/** Call only after explicit reset or an explicitly accepted valid file import. */
export function clearWeddingTrialRecovery() {
  if (typeof window !== "undefined") window.localStorage.removeItem(WEDDING_TRIAL_RECOVERY_KEY);
  trialAutosaveBlocked = false;
}
export const WEDDING_TRIAL_DURATION_DAYS = 7;
export const WEDDING_TRIAL_GUEST_LIMIT = 12;

export type WeddingThemeId = "cobalto" | "bosque" | "nocturno" | "clasico" | "romantico" | "campestre";
export type WeddingPaletteId = "forest-gold" | "olive-clay" | "cobalt-ivory" | "ink-silver";
export type WeddingTypographyId = "editorial" | "contemporary" | "romantic";
export type WeddingCoverId = "cinematic" | "split";
export type WeddingMonogramId = "seal" | "initials" | "wordmark";
export type WeddingGalleryId = "mosaic" | "film";
export type WeddingOrnamentId = "quiet" | "balanced" | "ceremonial";
export type WeddingTextPlacementId = "left" | "center" | "right";
export type WeddingPhotoFocusId = "left" | "center" | "right";
export type WeddingContrastId = "soft" | "balanced" | "strong";
export type TrialStatus = "active" | "expired" | "converted";
export type PublicationStatus = "draft" | "locked" | "published";

export interface TrialAccount {
  id: string;
  kind: "anonymous_trial";
}

export interface TrialEvent {
  id: string;
  accountId: string;
  slug: string;
  themeId: WeddingThemeId;
  status: TrialStatus;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface TrialContent {
  eventId: string;
  partnerOne: string;
  partnerTwo: string;
  date: string;
  ceremonyLocation: string;
  celebrationLocation: string;
  ceremonyAddress?: string;
  celebrationAddress?: string;
  message: string;
  story: string;
  ceremonyTime: string;
  celebrationTime: string;
  dressCode: string;
}

export interface TrialGuest {
  id: string;
  eventId: string;
  name: string;
  passLimit: number;
  status: "pending" | "confirmed" | "declined";
  sent: boolean;
  openedAt?: string | null;
  menu: string;
  note: string;
}

export interface TrialRsvp {
  id: string;
  eventId: string;
  guestId: string;
  attendance: "confirmed" | "declined";
  passes: number;
  note: string;
  submittedAt: string;
}

export interface TrialPublication {
  eventId: string;
  status: "locked";
  publicUrl: null;
  exportStatus: "locked";
}

export interface TrialDesign {
  paletteId: WeddingPaletteId;
  typographyId: WeddingTypographyId;
  coverId: WeddingCoverId;
  monogramId: WeddingMonogramId;
  galleryId: WeddingGalleryId;
  ornamentId: WeddingOrnamentId;
  textPlacementId?: WeddingTextPlacementId;
  photoFocusId?: WeddingPhotoFocusId;
  contrastId?: WeddingContrastId;
  samplePhotosEnabled: boolean;
}

export interface WeddingTrialWorkspace {
  version: 3;
  account: TrialAccount;
  event: TrialEvent;
  content: TrialContent;
  guests: TrialGuest[];
  rsvps: TrialRsvp[];
  publication: TrialPublication;
  design: TrialDesign;
}

function createId(prefix: string) {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${randomId}`;
}

export function createWeddingTrial(now = new Date()): WeddingTrialWorkspace {
  const accountId = createId("trial_account");
  const eventId = createId("trial_event");
  const createdAt = now.toISOString();
  const expiresAt = new Date(
    now.getTime() + WEDDING_TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    version: 3,
    account: {
      id: accountId,
      kind: "anonymous_trial",
    },
    event: {
      id: eventId,
      accountId,
      slug: "julia-y-mateo-muestra",
      themeId: "bosque",
      status: "active",
      publicationStatus: "locked",
      createdAt,
      updatedAt: createdAt,
      expiresAt,
    },
    content: {
      eventId,
      partnerOne: "Julia",
      partnerTwo: "Mateo",
      date: "2027-03-20",
      ceremonyLocation: "Jardín del Río",
      celebrationLocation: "Casa Magnolia",
      ceremonyAddress: "Camino de los Aromos 1200, ubicación ficticia",
      celebrationAddress: "Paseo de las Magnolias 450, ubicación ficticia",
      message: "Hay días que se vuelven inolvidables porque los compartimos con las personas que queremos.",
      story: "Nos conocimos entre amigos, aprendimos a viajar liviano y llenamos la casa de plantas. Ahora queremos celebrar este nuevo capítulo con ustedes.",
      ceremonyTime: "18:30",
      celebrationTime: "20:00",
      dressCode: "Elegante, con libertad para bailar",
    },
    guests: [
      {
        id: "demo_guest_sofia_rivas",
        eventId,
        name: "Lucía Rivas",
        passLimit: 2,
        status: "pending",
        sent: true,
        openedAt: "2026-08-23T11:40:00.000Z",
        menu: "Tradicional",
        note: "",
      },
      {
        id: "demo_guest_valentina_costa",
        eventId,
        name: "Camila Ríos",
        passLimit: 2,
        status: "confirmed",
        sent: true,
        openedAt: "2026-08-22T18:05:00.000Z",
        menu: "Vegetariano",
        note: "Sin nueces",
      },
      {
        id: "demo_guest_tomas_ibarra",
        eventId,
        name: "Lucas Ferrer",
        passLimit: 1,
        status: "confirmed",
        sent: true,
        openedAt: "2026-08-22T15:44:00.000Z",
        menu: "Tradicional",
        note: "",
      },
      {
        id: "demo_guest_martina_aguirre",
        eventId,
        name: "Elena Méndez",
        passLimit: 2,
        status: "declined",
        sent: true,
        openedAt: "2026-08-21T21:45:00.000Z",
        menu: "Tradicional",
        note: "Viaje programado",
      },
      {
        id: "demo_guest_julian_ferrer",
        eventId,
        name: "Julián Ferrer",
        passLimit: 2,
        status: "pending",
        sent: false,
        openedAt: null,
        menu: "Tradicional",
        note: "",
      },
      {
        id: "demo_guest_lucia_mendez",
        eventId,
        name: "Lucía Méndez",
        passLimit: 3,
        status: "pending",
        sent: true,
        openedAt: "2026-08-23T10:20:00.000Z",
        menu: "Sin TACC",
        note: "",
      },
      {
        id: "demo_guest_bruno_soria",
        eventId,
        name: "Andrés Molina",
        passLimit: 3,
        status: "confirmed",
        sent: true,
        openedAt: "2026-08-21T19:20:00.000Z",
        menu: "Tradicional",
        note: "Mesa cerca de la familia",
      },
      {
        id: "demo_guest_clara_benitez",
        eventId,
        name: "Clara Benítez",
        passLimit: 2,
        status: "pending",
        sent: false,
        openedAt: null,
        menu: "Vegano",
        note: "",
      },
      {
        id: "demo_guest_matias_suarez",
        eventId,
        name: "Matías Suárez",
        passLimit: 2,
        status: "pending",
        sent: true,
        openedAt: null,
        menu: "Tradicional",
        note: "",
      },
      {
        id: "demo_guest_florencia_roca",
        eventId,
        name: "Florencia Roca",
        passLimit: 2,
        status: "confirmed",
        sent: true,
        openedAt: "2026-08-20T14:02:00.000Z",
        menu: "Sin TACC",
        note: "Alergia al maní",
      },
    ],
    rsvps: [
      { id: "demo_response_valentina", eventId, guestId: "demo_guest_valentina_costa", attendance: "confirmed", passes: 2, note: "Sin nueces", submittedAt: "2026-08-22T18:20:00.000Z" },
      { id: "demo_response_tomas", eventId, guestId: "demo_guest_tomas_ibarra", attendance: "confirmed", passes: 1, note: "", submittedAt: "2026-08-22T16:05:00.000Z" },
      { id: "demo_response_martina", eventId, guestId: "demo_guest_martina_aguirre", attendance: "declined", passes: 0, note: "Viaje programado", submittedAt: "2026-08-21T22:10:00.000Z" },
      { id: "demo_response_bruno", eventId, guestId: "demo_guest_bruno_soria", attendance: "confirmed", passes: 3, note: "Mesa cerca de la familia", submittedAt: "2026-08-21T19:45:00.000Z" },
      { id: "demo_response_florencia", eventId, guestId: "demo_guest_florencia_roca", attendance: "confirmed", passes: 2, note: "Alergia al maní", submittedAt: "2026-08-20T14:30:00.000Z" },
    ],
    publication: {
      eventId,
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
      textPlacementId: "left",
      photoFocusId: "right",
      contrastId: "balanced",
      samplePhotosEnabled: false,
    },
  };
}

export function isWeddingTrialWorkspace(value: unknown): value is WeddingTrialWorkspace {
  return validateWeddingTrial(value);
}

export function isWeddingTrialExpired(workspace: WeddingTrialWorkspace, now = new Date()) {
  const expiresAt = new Date(workspace.event.expiresAt).getTime();
  return !Number.isFinite(expiresAt) || expiresAt <= now.getTime();
}

export function loadWeddingTrial(): WeddingTrialWorkspace {
  if (typeof window === "undefined") return createWeddingTrial();
  try {
    const recovery = window.localStorage.getItem(WEDDING_TRIAL_RECOVERY_KEY);
    if (recovery) {
      try {
        const snapshot = JSON.parse(recovery);
        if (!snapshot.expiresAt || !Number.isFinite(Date.parse(snapshot.expiresAt)) || Date.parse(snapshot.expiresAt) <= Date.now()) window.localStorage.removeItem(WEDDING_TRIAL_RECOVERY_KEY);
      } catch { window.localStorage.removeItem(WEDDING_TRIAL_RECOVERY_KEY); }
    }
    const stored = window.localStorage.getItem(WEDDING_TRIAL_STORAGE_KEY);
    if (!stored) { trialAutosaveBlocked = false; return createWeddingTrial(); }
    let parsed: unknown;
    try { parsed = JSON.parse(stored); } catch { parsed = null; }
    if (!isWeddingTrialWorkspace(parsed)) {
      // Preserve the rejected source before the editor autosaves a fresh workspace.
      // Never replace the previous recovery copy; it may be the only recoverable draft.
      if (!window.localStorage.getItem(WEDDING_TRIAL_RECOVERY_KEY)) {
        window.localStorage.setItem(WEDDING_TRIAL_RECOVERY_KEY, JSON.stringify({ raw: stored, expiresAt: new Date(Date.now() + WEDDING_TRIAL_DURATION_DAYS * 86400000).toISOString() }));
      } else {
        // Do not overwrite a different rejected draft if a recovery copy exists.
        const previous = JSON.parse(window.localStorage.getItem(WEDDING_TRIAL_RECOVERY_KEY)!);
        if (previous.raw !== stored) { trialAutosaveBlocked = true; return createWeddingTrial(); }
      }
      trialAutosaveBlocked = false;
      return createWeddingTrial();
    }
    if (isWeddingTrialExpired(parsed)) {
      window.localStorage.removeItem(WEDDING_TRIAL_STORAGE_KEY);
      return createWeddingTrial();
    }
    trialAutosaveBlocked = false;
    return parsed;
  } catch {
    // Reading/storage can be disabled. Never delete a draft because of an I/O failure.
    trialAutosaveBlocked = true;
    return createWeddingTrial();
  }
}

export function touchWeddingTrial(workspace: WeddingTrialWorkspace): WeddingTrialWorkspace {
  return {
    ...workspace,
    event: {
      ...workspace.event,
      updatedAt: new Date().toISOString(),
    },
  };
}
