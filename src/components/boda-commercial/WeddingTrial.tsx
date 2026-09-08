"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  ExternalLink,
  ImagePlus,
  Music2,
  Plus,
  Trash2,
  Save,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import { isGuestWeddingReferral } from "@/lib/boda-referral";
import { BODA_START_SEED, type WeddingStartSeed } from "@/lib/boda-trial/start-seed";
import { preparePhoto, studioRequest } from "@/components/boda-studio/client";
import {
  canAutosaveWeddingTrial,
  clearWeddingTrialRecovery,
  createWeddingTrial,
  isWeddingTrialExpired,
  isWeddingTrialWorkspace,
  loadWeddingTrial,
  touchWeddingTrial,
  WEDDING_TRIAL_GUEST_LIMIT,
  WEDDING_TRIAL_STORAGE_KEY,
  type TrialGuest,
  type WeddingTrialWorkspace,
  type WeddingThemeId,
} from "@/lib/boda-trial/schema";
import { getWeddingTheme, resolveWeddingTrialDesign, WEDDING_THEMES, WEDDING_THEME_PRESETS } from "@/lib/boda-trial/themes";
import { InvitationPreview } from "./InvitationPreview";
import { WeddingDesignControls } from "./WeddingDesignControls";
import { WeddingPortalDemo } from "./WeddingPortalDemo";
import { WeddingThemeProof } from "./WeddingThemeProof";
import { WeddingWhatsAppPreview } from "./WeddingWhatsAppPreview";
import styles from "./trial.module.css";

type Stage = "theme" | "details" | "preview" | "rsvp" | "panel";

const STAGES: Array<{ id: Stage; label: string }> = [
  { id: "theme", label: "Estilo" },
  { id: "details", label: "Editá" },
  { id: "preview", label: "Invitación" },
  { id: "rsvp", label: "Confirmar" },
  { id: "panel", label: "Panel" },
];

const MAX_LOCAL_PHOTOS = 3;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const ALLOWED_AUDIO_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/ogg"]);
const SAMPLE_PHOTOS: LocalPhoto[] = [
  { id: "sample_hero", name: "Pareja ficticia", url: "/invitaciones-boda/couple-hero.webp" },
  { id: "sample_ceremony", name: "Ceremonia ficticia", url: "/invitaciones-boda/couple-ceremony.webp" },
  { id: "sample_celebration", name: "Celebración ficticia", url: "/invitaciones-boda/couple-celebration.webp" },
];

type LocalPhoto = {
  id: string;
  name: string;
  url: string;
};

type LocalAudio = { name: string; url: string };

type ResetSnapshot = {
  workspace: WeddingTrialWorkspace;
  stage: Stage;
  guestName: string;
  guestPasses: number;
  activeGuestId: string;
  attendance: "confirmed" | "declined";
  rsvpPasses: number;
  rsvpNote: string;
  rsvpMessage: string;
  lastConfirmedGuestId: string;
  localPhotos: LocalPhoto[];
  photoObjectUrls: string[];
  photoError: string;
  localMusic: LocalAudio | null;
  musicObjectUrl: string | null;
  musicError: string;
  draftMessage: string;
  draftError: string;
};

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function formatPassCount(value: number) {
  return `${value} ${value === 1 ? "lugar" : "lugares"}`;
}

function createLocalId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

const LEGACY_OPENED_DEMO_IDS = new Set(["demo_guest_sofia_rivas", "demo_guest_lucia_mendez"]);

function normalizeWorkspaceDesign(workspace: WeddingTrialWorkspace): WeddingTrialWorkspace {
  return {
    ...workspace,
    content: {
      ...workspace.content,
      ceremonyAddress: workspace.content.ceremonyAddress ?? "Camino de los Aromos 1200, ubicación ficticia",
      celebrationAddress: workspace.content.celebrationAddress ?? "Paseo de las Magnolias 450, ubicación ficticia",
    },
    guests: workspace.guests.map((guest) => ({
      ...guest,
      openedAt: guest.openedAt === undefined
        ? LEGACY_OPENED_DEMO_IDS.has(guest.id) ? workspace.event.updatedAt : null
        : guest.openedAt,
    })),
    design: resolveWeddingTrialDesign(workspace.event.themeId, workspace.design),
  };
}

export function WeddingTrial() {
  const [workspace, setWorkspace] = useState<WeddingTrialWorkspace | null>(null);
  const [stage, setStage] = useState<Stage>("theme");
  const [guestName, setGuestName] = useState("");
  const [guestPasses, setGuestPasses] = useState(2);
  const [activeGuestId, setActiveGuestId] = useState("");
  const [attendance, setAttendance] = useState<"confirmed" | "declined">("confirmed");
  const [rsvpPasses, setRsvpPasses] = useState(1);
  const [rsvpNote, setRsvpNote] = useState("");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [lastConfirmedGuestId, setLastConfirmedGuestId] = useState("");
  const [localPhotos, setLocalPhotos] = useState<LocalPhoto[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [localMusic, setLocalMusic] = useState<LocalAudio | null>(null);
  const [musicError, setMusicError] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [draftError, setDraftError] = useState("");
  const [selfServeEnabled, setSelfServeEnabled] = useState<boolean | null>(null);
  const [startBusy, setStartBusy] = useState(false);
  const [startError, setStartError] = useState("");
  const startBusyRef = useRef(false);
  const [localPersistenceAvailable, setLocalPersistenceAvailable] = useState(true);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [canUndoReset, setCanUndoReset] = useState(false);
  const [resetNotice, setResetNotice] = useState("");
  const photoUrlsRef = useRef<string[]>([]);
  const musicUrlRef = useRef<string | null>(null);
  const suppressNextAutosaveRef = useRef(false);
  const resetSnapshotRef = useRef<ResetSnapshot | null>(null);
  const resetUndoTimerRef = useRef<number | null>(null);
  const resetNoticeTimerRef = useRef<number | null>(null);
  const resetDialogRef = useRef<HTMLDivElement>(null);
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const resetOpenerRef = useRef<HTMLElement | null>(null);
  const resetUndoButtonRef = useRef<HTMLButtonElement>(null);
  const trialHeadingRef = useRef<HTMLHeadingElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const guestReferralRef = useRef(false);
  const guestReferralCompletionTrackedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    studioRequest<{ selfServeEnabled: boolean }>("/capabilities")
      .then((result) => { if (!cancelled) setSelfServeEnabled(result.selfServeEnabled); })
      .catch(() => { if (!cancelled) setSelfServeEnabled(false); });
    return () => { cancelled = true; };
  }, []);

  async function startFreeWedding() {
    if (!workspace || startBusyRef.current) return;
    startBusyRef.current = true;
    setStartBusy(true);
    setStartError("");
    try {
      const capabilities = await studioRequest<{ selfServeEnabled: boolean }>("/capabilities");
      if (!capabilities.selfServeEnabled) {
        setSelfServeEnabled(false);
        throw new Error("Estamos preparando el acceso gratuito. Su prueba se conserva para seguir editando.");
      }
      const photos: string[] = [];
      for (const photo of localPhotos.filter((item) => item.url.startsWith("blob:") || item.url.startsWith("data:image/"))) {
        const response = await fetch(photo.url);
        if (!response.ok) throw new Error("No pudimos recuperar una foto. Su prueba se conserva; vuelvan a agregar esa foto e intenten nuevamente.");
        const blob = await response.blob();
        photos.push(await preparePhoto(new File([blob], photo.name, { type: blob.type })));
      }
      const seed: WeddingStartSeed = {
        at: Date.now(),
        workspace: { ...workspace, guests: [], rsvps: [], design: { ...workspace.design, samplePhotosEnabled: false } },
        photos,
        acquisitionSource: guestReferralRef.current ? "guest_attribution" : "direct",
      };
      window.sessionStorage.setItem(BODA_START_SEED, JSON.stringify(seed));
      window.sessionStorage.removeItem("sodi:boda-created:v1");
      window.location.assign("/boda/empezar");
    } catch (error) {
      setStartError(error instanceof DOMException && error.name === "QuotaExceededError"
        ? "No hay espacio en este navegador para trasladar las fotos. Su prueba sigue intacta. Prueben con fotos más livianas."
        : error instanceof DOMException && error.name === "SecurityError"
          ? "Este navegador no permite guardar el paso siguiente. Su prueba sigue intacta; habiliten el almacenamiento para continuar."
        : error instanceof TypeError
          ? "No pudimos recuperar una foto o comprobar el acceso. Su prueba sigue intacta; intenten nuevamente."
        : error instanceof Error ? error.message : "No pudimos preparar el paso siguiente. Su prueba sigue intacta; intenten nuevamente.");
      startBusyRef.current = false;
      setStartBusy(false);
    }
  }

  useEffect(() => {
    let restored = false;
    try {
      restored = window.localStorage.getItem(WEDDING_TRIAL_STORAGE_KEY) !== null;
    } catch {
      setLocalPersistenceAvailable(false);
    }
    let loaded = normalizeWorkspaceDesign(loadWeddingTrial());
    const requestedTheme = new URLSearchParams(window.location.search).get("estilo");
    if (WEDDING_THEMES.some((theme) => theme.id === requestedTheme)) {
      const themeId = requestedTheme as WeddingThemeId;
      loaded = { ...loaded, event: { ...loaded.event, themeId }, design: { ...loaded.design, ...WEDDING_THEME_PRESETS[themeId] } };
    }
    setWorkspace(loaded);
    if (loaded.design.samplePhotosEnabled) setLocalPhotos(SAMPLE_PHOTOS);
    setActiveGuestId(loaded.guests[0]?.id ?? "");
    const searchParams = new URLSearchParams(window.location.search);
    guestReferralRef.current = isGuestWeddingReferral(searchParams);
    if (guestReferralRef.current) {
      trackEvent("guest_referral_trial_start", { source: "guest_attribution" });
    }
    if (searchParams.get("paso") === "editar") setStage("details");
    if (searchParams.get("modo") === "invitado") {
      setStage("preview");
    }
    trackEvent("wedding_trial_open", {
      trial_id: loaded.event.id,
      restored,
    });
  }, []);

  useEffect(() => {
    if (!workspace) return;
    if (suppressNextAutosaveRef.current) {
      suppressNextAutosaveRef.current = false;
      return;
    }
    try {
      if (!canAutosaveWeddingTrial()) throw new Error("Draft recovery must be resolved before autosave");
      window.localStorage.setItem(WEDDING_TRIAL_STORAGE_KEY, JSON.stringify(workspace));
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has("estilo")) {
        currentUrl.searchParams.delete("estilo");
        window.history.replaceState(window.history.state, "", `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
      }
      setLocalPersistenceAvailable(true);
    } catch {
      setLocalPersistenceAvailable(false);
    }
  }, [workspace]);

  useEffect(() => {
    return () => {
      if (resetUndoTimerRef.current !== null) window.clearTimeout(resetUndoTimerRef.current);
      if (resetNoticeTimerRef.current !== null) window.clearTimeout(resetNoticeTimerRef.current);
      photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      if (musicUrlRef.current) URL.revokeObjectURL(musicUrlRef.current);
      resetSnapshotRef.current?.photoObjectUrls.forEach((url) => URL.revokeObjectURL(url));
      if (resetSnapshotRef.current?.musicObjectUrl) URL.revokeObjectURL(resetSnapshotRef.current.musicObjectUrl);
    };
  }, []);

  useEffect(() => {
    if (!resetDialogOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    resetCancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeResetDialog();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = resetDialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [resetDialogOpen]);

  useEffect(() => {
    if (!canUndoReset) return;
    const frame = window.requestAnimationFrame(() => resetUndoButtonRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [canUndoReset]);

  const activeGuest = useMemo(() => {
    if (!workspace) return null;
    return (
      workspace.guests.find((guest) => guest.id === activeGuestId) ??
      workspace.guests[0] ??
      null
    );
  }, [activeGuestId, workspace]);

  function updateWorkspace(
    updater: (current: WeddingTrialWorkspace) => WeddingTrialWorkspace,
  ) {
    setWorkspace((current) => (current ? touchWeddingTrial(updater(current)) : current));
  }

  function goTo(nextStage: Stage) {
    setStage(nextStage);
    if (nextStage === "preview") {
      trackEvent("preview_complete", {
        theme: workspace?.event.themeId,
        photo_count: localPhotos.length,
      });
    }
    trackEvent("wedding_trial_stage_view", {
      stage: nextStage,
      theme: workspace?.event.themeId,
    });
    if (nextStage === "panel" && guestReferralRef.current && workspace?.rsvps.length && !guestReferralCompletionTrackedRef.current) {
      guestReferralCompletionTrackedRef.current = true;
      trackEvent("guest_referral_trial_completion", { source: "guest_attribution" });
    }
    window.requestAnimationFrame(() => {
      workspaceRef.current?.focus({ preventScroll: true });
      workspaceRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function selectTheme(themeId: WeddingThemeId) {
    updateWorkspace((current) => ({
      ...current,
      event: { ...current.event, themeId },
      design: {
        ...WEDDING_THEME_PRESETS[themeId],
        samplePhotosEnabled: current.design.samplePhotosEnabled,
      },
    }));
    trackEvent("theme_select", { theme: themeId, surface: "trial" });
  }

  function addLocalPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;

    const room = MAX_LOCAL_PHOTOS - localPhotos.length;
    if (room <= 0) {
      setPhotoError("Podés usar hasta 3 fotos en esta prueba.");
      return;
    }

    const selected = files.slice(0, room);
    const invalidType = selected.some((file) => !ALLOWED_PHOTO_TYPES.has(file.type));
    const tooLarge = selected.some((file) => file.size > MAX_PHOTO_BYTES);
    if (invalidType || tooLarge) {
      setPhotoError(
        invalidType
          ? "Usá imágenes JPG, PNG o WebP."
          : "Cada foto puede pesar hasta 4 MB.",
      );
      return;
    }

    const nextPhotos = selected.map((file) => {
      const url = URL.createObjectURL(file);
      photoUrlsRef.current.push(url);
      return { id: createLocalId("local_photo"), name: file.name, url };
    });
    setLocalPhotos((current) => [...current, ...nextPhotos]);
    setPhotoError(files.length > room ? "Se agregaron fotos hasta completar el máximo de 3." : "");
    trackEvent("photo_add", {
      added_count: nextPhotos.length,
      total_count: localPhotos.length + nextPhotos.length,
    });
  }

  function removeLocalPhoto(photoId: string) {
    setLocalPhotos((current) => {
      const photo = current.find((item) => item.id === photoId);
      if (photo) {
        URL.revokeObjectURL(photo.url);
        photoUrlsRef.current = photoUrlsRef.current.filter((url) => url !== photo.url);
      }
      return current.filter((item) => item.id !== photoId);
    });
    setPhotoError("");
  }

  function clearLocalPhotos() {
    photoUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    photoUrlsRef.current = [];
    setLocalPhotos([]);
    setPhotoError("");
  }

  function clearLocalMusic() {
    if (musicUrlRef.current) URL.revokeObjectURL(musicUrlRef.current);
    musicUrlRef.current = null;
    setLocalMusic(null);
    setMusicError("");
  }

  function addLocalMusic(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ALLOWED_AUDIO_TYPES.has(file.type)) {
      setMusicError("Usá un archivo MP3, M4A u OGG.");
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      setMusicError("El archivo puede pesar hasta 8 MB en esta prueba.");
      return;
    }
    clearLocalMusic();
    const url = URL.createObjectURL(file);
    musicUrlRef.current = url;
    setLocalMusic({ name: file.name, url });
    setMusicError("");
    trackEvent("music_add", { surface: "trial_details", size_bytes: file.size, type: file.type });
  }

  function clearResetUndoWindow() {
    if (resetUndoTimerRef.current !== null) {
      window.clearTimeout(resetUndoTimerRef.current);
      resetUndoTimerRef.current = null;
    }
    resetSnapshotRef.current?.photoObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    if (resetSnapshotRef.current?.musicObjectUrl) URL.revokeObjectURL(resetSnapshotRef.current.musicObjectUrl);
    resetSnapshotRef.current = null;
    setCanUndoReset(false);
  }

  function showResetNotice(message: string, duration = 8000) {
    if (resetNoticeTimerRef.current !== null) window.clearTimeout(resetNoticeTimerRef.current);
    setResetNotice(message);
    resetNoticeTimerRef.current = window.setTimeout(() => {
      setResetNotice("");
      resetNoticeTimerRef.current = null;
    }, duration);
  }

  function useSamplePhotos() {
    clearLocalPhotos();
    setLocalPhotos(SAMPLE_PHOTOS);
    updateWorkspace((current) => ({ ...current, design: { ...current.design, samplePhotosEnabled: true } }));
    trackEvent("sample_photos_use", { surface: "trial_photos" });
  }

  function exportDraft() {
    if (!workspace) return;
    const safeDraft = JSON.stringify(workspace, null, 2);
    const url = URL.createObjectURL(new Blob([safeDraft], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `sodi-bodas-${workspace.event.slug}-borrador.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDraftMessage("Copia descargada. Incluye textos, diseño, lista y confirmaciones. Las fotos propias y la música no se incluyen.");
    setDraftError("");
    trackEvent("draft_export", { trial_id: workspace.event.id, sample_photos: workspace.design.samplePhotosEnabled });
  }

  async function importDraft(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 512 * 1024) throw new Error("large");
      const parsed: unknown = JSON.parse(await file.text());
      if (!isWeddingTrialWorkspace(parsed)) throw new Error("invalid");
      if (isWeddingTrialExpired(parsed)) throw new Error("expired");
      const normalized = normalizeWorkspaceDesign(parsed);
      clearWeddingTrialRecovery();
      setWorkspace(normalized);
      clearLocalPhotos();
      clearLocalMusic();
      if (normalized.design.samplePhotosEnabled) setLocalPhotos(SAMPLE_PHOTOS);
      setActiveGuestId(normalized.guests[0]?.id ?? "");
      setAttendance("confirmed");
      setRsvpPasses(1);
      setRsvpNote("");
      setRsvpMessage("");
      setLastConfirmedGuestId("");
      setStage("details");
      setDraftMessage("Copia recuperada. Tus textos, estilo, lista y confirmaciones volvieron a esta prueba.");
      setDraftError("");
      trackEvent("draft_import", { success: true, trial_id: normalized.event.id });
      window.requestAnimationFrame(() => {
        workspaceRef.current?.focus({ preventScroll: true });
        workspaceRef.current?.scrollIntoView({ block: "start" });
      });
    } catch (error) {
      setDraftError(
        error instanceof Error && error.message === "expired"
          ? "Esa copia ya superó los 7 días de la prueba. Podés empezar una nueva desde acá."
          : "Ese archivo no parece ser una copia válida de SODI Bodas.",
      );
      setDraftMessage("");
      trackEvent("draft_import", { success: false });
    }
  }

  function addGuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace || !guestName.trim()) return;
    if (workspace.guests.length >= WEDDING_TRIAL_GUEST_LIMIT) return;

    const guest: TrialGuest = {
      id: createLocalId("trial_guest"),
      eventId: workspace.event.id,
      name: guestName.trim(),
      passLimit: guestPasses,
      status: "pending",
      sent: false,
      menu: "Tradicional",
      note: "",
    };

    updateWorkspace((current) => ({
      ...current,
      guests: [...current.guests, guest],
    }));
    setGuestName("");
    setActiveGuestId(guest.id);
    setRsvpPasses(1);
    trackEvent("wedding_trial_guest_add", {
      guest_count: workspace.guests.length + 1,
    });
  }

  function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace || !activeGuest) return;

    const passes = attendance === "confirmed"
      ? Math.max(1, Math.min(rsvpPasses, activeGuest.passLimit))
      : 0;
    const response = {
      id: createLocalId("trial_rsvp"),
      eventId: workspace.event.id,
      guestId: activeGuest.id,
      attendance,
      passes,
      note: rsvpNote.trim().slice(0, 300),
      submittedAt: new Date().toISOString(),
    } as const;

    updateWorkspace((current) => ({
      ...current,
      guests: current.guests.map((guest) =>
        guest.id === activeGuest.id
          ? {
              ...guest,
              status: attendance === "confirmed" ? "confirmed" : "declined",
              sent: true,
              openedAt: guest.openedAt ?? new Date().toISOString(),
            }
          : guest,
      ),
      rsvps: [...current.rsvps.filter((item) => item.guestId !== activeGuest.id), response],
    }));
    setRsvpMessage(
      attendance === "confirmed"
        ? `Confirmación guardada para ${activeGuest.name}.`
        : `Respuesta guardada para ${activeGuest.name}.`,
    );
    setLastConfirmedGuestId(activeGuest.id);
    trackEvent("confirmation_test", {
      attendance,
      passes,
      theme: workspace.event.themeId,
    });
  }

  function requestTrialReset() {
    resetOpenerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setResetDialogOpen(true);
  }

  function closeResetDialog() {
    setResetDialogOpen(false);
    window.requestAnimationFrame(() => resetOpenerRef.current?.focus());
  }

  function confirmTrialReset() {
    if (!workspace) return;
    clearResetUndoWindow();

    const deletedTrialId = workspace.event.id;
    resetSnapshotRef.current = {
      workspace,
      stage,
      guestName,
      guestPasses,
      activeGuestId,
      attendance,
      rsvpPasses,
      rsvpNote,
      rsvpMessage,
      lastConfirmedGuestId,
      localPhotos,
      photoObjectUrls: [...photoUrlsRef.current],
      photoError,
      localMusic,
      musicObjectUrl: musicUrlRef.current,
      musicError,
      draftMessage,
      draftError,
    };
    photoUrlsRef.current = [];
    musicUrlRef.current = null;

    try {
      clearWeddingTrialRecovery();
      window.localStorage.removeItem(WEDDING_TRIAL_STORAGE_KEY);
    } catch {
      setLocalPersistenceAvailable(false);
    }
    const next = createWeddingTrial();
    suppressNextAutosaveRef.current = true;
    setWorkspace(next);
    setStage("theme");
    setGuestName("");
    setGuestPasses(2);
    setActiveGuestId(next.guests[0]?.id ?? "");
    setAttendance("confirmed");
    setRsvpPasses(1);
    setRsvpNote("");
    setRsvpMessage("");
    setLastConfirmedGuestId("");
    setLocalPhotos([]);
    setPhotoError("");
    setLocalMusic(null);
    setMusicError("");
    setDraftMessage("");
    setDraftError("");
    setResetDialogOpen(false);
    setCanUndoReset(true);
    showResetNotice("La prueba anterior se borró de este navegador. Empezamos con datos ficticios nuevos.", 12500);
    resetUndoTimerRef.current = window.setTimeout(clearResetUndoWindow, 12000);
    trackEvent("wedding_trial_delete", { trial_id: deletedTrialId });
  }

  function undoTrialReset() {
    const snapshot = resetSnapshotRef.current;
    if (!snapshot) return;
    if (resetUndoTimerRef.current !== null) {
      window.clearTimeout(resetUndoTimerRef.current);
      resetUndoTimerRef.current = null;
    }

    setWorkspace(snapshot.workspace);
    setStage(snapshot.stage);
    setGuestName(snapshot.guestName);
    setGuestPasses(snapshot.guestPasses);
    setActiveGuestId(snapshot.activeGuestId);
    setAttendance(snapshot.attendance);
    setRsvpPasses(snapshot.rsvpPasses);
    setRsvpNote(snapshot.rsvpNote);
    setRsvpMessage(snapshot.rsvpMessage);
    setLastConfirmedGuestId(snapshot.lastConfirmedGuestId);
    setLocalPhotos(snapshot.localPhotos);
    photoUrlsRef.current = [...snapshot.photoObjectUrls];
    setPhotoError(snapshot.photoError);
    setLocalMusic(snapshot.localMusic);
    musicUrlRef.current = snapshot.musicObjectUrl;
    setMusicError(snapshot.musicError);
    setDraftMessage(snapshot.draftMessage);
    setDraftError(snapshot.draftError);
    try {
      window.localStorage.setItem(WEDDING_TRIAL_STORAGE_KEY, JSON.stringify(snapshot.workspace));
      setLocalPersistenceAvailable(true);
    } catch {
      setLocalPersistenceAvailable(false);
    }
    resetSnapshotRef.current = null;
    setCanUndoReset(false);
    showResetNotice("Restauramos la prueba tal como estaba.");
    window.requestAnimationFrame(() => trialHeadingRef.current?.focus());
    trackEvent("wedding_trial_delete_undo", { trial_id: snapshot.workspace.event.id });
  }

  if (!workspace) {
    return (
      <main className={styles.trialPage}>
        <div className={styles.trialShell}>
          <div className={styles.skeleton} aria-label="Preparando tu invitación">
            <div className={styles.skeletonLine} />
            <div className={styles.skeletonBlock} />
          </div>
        </div>
      </main>
    );
  }

  const activeTheme = getWeddingTheme(workspace.event.themeId);

  return (
    <main className={styles.trialPage} data-invite-theme={workspace.event.themeId}>
      <header className={styles.trialHeader}>
        <Link href="/boda" className={styles.trialBrand}>
          SODI <span>Bodas</span>
        </Link>
        <div className={styles.trialMeta}>
          <span>{localPersistenceAvailable ? "Guardado automático por 7 días en este navegador" : "Disponible mientras esta pestaña siga abierta"}</span>
          <strong>{localPersistenceAvailable ? `Caduca ${formatExpiry(workspace.event.expiresAt)}` : "Guardado local no disponible"}</strong>
        </div>
      </header>

      <div className={styles.trialShell}>
        <div className={styles.trialIntro}>
          <div>
            <span className={styles.localBadge}>Prueba gratis, sin registro</span>
            <h1 ref={trialHeadingRef} tabIndex={-1}>
              <span className={styles.desktopIntroTitle}>Creá tu invitación y mirá cómo se ordenan las respuestas.</span>
              <span className={styles.mobileIntroTitle}>Creá tu invitación. Ordená las respuestas.</span>
            </h1>
            <p>Elegí un estilo, hacela propia y probá una confirmación. Nada se publica ni se envía.</p>
            {selfServeEnabled ? <>
              <button type="button" className={styles.primaryButton} disabled={startBusy} onClick={startFreeWedding}>
                {startBusy ? "Preparando su diseño…" : "Crear nuestra boda gratis"} <ArrowRight size={18} />
              </button>
              <p>Conservamos sus textos, diseño y fotos propias. Los invitados de ejemplo quedan afuera. {localMusic ? "El audio de prueba no se traslada." : "El siguiente paso no publica ni envía mensajes."}</p>
            </> : <p>{selfServeEnabled === null ? "Comprobando el acceso gratuito…" : "Estamos preparando el acceso gratuito para crear y publicar su boda. Mientras tanto, pueden seguir con esta prueba."}</p>}
            {startError ? <p className={styles.draftError} role="alert">{startError}</p> : null}
          </div>
        </div>

        {resetNotice ? (
          <div className={styles.resetNotice} role="status" aria-live="polite">
            <span>{resetNotice}</span>
            {canUndoReset ? (
              <button ref={resetUndoButtonRef} type="button" onClick={undoTrialReset}>
                Deshacer
              </button>
            ) : null}
          </div>
        ) : null}

        <details className={styles.draftBar} aria-label="Guardado y datos de la prueba">
          <summary>
            <Save size={18} strokeWidth={1.8} />
            <span>
              <strong>{localPersistenceAvailable ? "Guardado automático por 7 días" : "Guardado sólo durante esta visita"}</strong>
              <small>{localPersistenceAvailable ? `En este navegador · hasta el ${formatExpiry(workspace.event.expiresAt)}` : "Descargá una copia si querés conservar los cambios"}</small>
            </span>
            <span className={styles.draftSummaryAction}>Opciones</span>
          </summary>
          <div className={styles.draftPanel}>
            <p>Textos, estilo, lista, confirmaciones y fotos de ejemplo quedan en este navegador. También podés llevarte una copia.</p>
            <div className={styles.draftActions}>
              <button type="button" onClick={exportDraft}><Download size={16} /> Descargar una copia</button>
              <label><Upload size={16} /> Recuperar una copia<input type="file" accept="application/json,.json" onChange={importDraft} /></label>
              <button type="button" className={styles.draftReset} onClick={requestTrialReset}><Trash2 size={16} /> Borrar esta prueba</button>
            </div>
            {draftMessage ? <p className={styles.draftMessage} role="status" aria-live="polite">{draftMessage}</p> : null}
            {draftError ? <p className={styles.draftError} role="alert">{draftError}</p> : null}
          </div>
        </details>

        <nav className={styles.stepNav} aria-label="Recorrido de la prueba">
          {STAGES.map((item) => (
            <button
              type="button"
              className={styles.stepButton}
              key={item.id}
              aria-current={stage === item.id ? "step" : undefined}
              onClick={() => goTo(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div
          ref={workspaceRef}
          className={styles.workspace}
          tabIndex={-1}
          role="region"
          aria-label={`Etapa: ${STAGES.find((item) => item.id === stage)?.label ?? stage}`}
        >
          {stage === "theme" ? (
            <section className={styles.stage}>
              <div className={styles.stageHeader}>
                <h2>Elegí cómo se va a ver.</h2>
                <p>
                  Seis combinaciones cuidadas para la misma invitación. Después podés cambiar de idea sin volver a cargar todo.
                </p>
                <span className={styles.themeScrollHint}>Deslizá hacia el costado para comparar los seis estilos.</span>
              </div>
              <div className={styles.themeGrid}>
                {WEDDING_THEMES.map((theme) => (
                  <article
                    className={styles.themeCard}
                    data-theme={theme.id}
                    data-selected={workspace.event.themeId === theme.id}
                    key={theme.id}
                  >
                    <div className={styles.themeImage}><WeddingThemeProof theme={theme} selector /></div>
                    <div className={styles.themeCopy}>
                      <strong>{theme.name}</strong>
                      <span>{theme.direction}</span>
                      <p>{theme.description}</p>
                      <button
                        type="button"
                        className={styles.themeButton}
                        onClick={() => selectTheme(theme.id)}
                      >
                        {workspace.event.themeId === theme.id ? "Estilo elegido" : "Elegir estilo"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className={styles.stageActions}>
                <button type="button" className={styles.primaryButton} onClick={() => goTo("details")}>
                  Personalizar <ArrowRight size={18} strokeWidth={1.8} />
                </button>
              </div>
            </section>
          ) : null}

          {stage === "details" ? (
            <section className={styles.stage}>
              <div className={styles.stageHeader}>
                <h2>Hacela propia.</h2>
                <p>Usá nombres, lugares y fotos de prueba. Todo queda en este navegador.</p>
              </div>
              <a
                className={styles.quickPreviewLink}
                href="#vista-en-tiempo-real"
                onClick={() => trackEvent("wedding_trial_preview_jump", { surface: "trial_details_mobile" })}
              >
                Ver el resultado mientras edito <ArrowRight size={16} strokeWidth={1.8} />
              </a>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Primer nombre</span>
                  <input
                    value={workspace.content.partnerOne}
                    onChange={(event) =>
                      updateWorkspace((current) => ({
                        ...current,
                        content: { ...current.content, partnerOne: event.target.value },
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Segundo nombre</span>
                  <input
                    value={workspace.content.partnerTwo}
                    onChange={(event) =>
                      updateWorkspace((current) => ({
                        ...current,
                        content: { ...current.content, partnerTwo: event.target.value },
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Fecha</span>
                  <input
                    type="date"
                    value={workspace.content.date}
                    onChange={(event) =>
                      updateWorkspace((current) => ({
                        ...current,
                        content: { ...current.content, date: event.target.value },
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Ceremonia</span>
                  <input
                    value={workspace.content.ceremonyLocation}
                    onChange={(event) =>
                      updateWorkspace((current) => ({
                        ...current,
                        content: { ...current.content, ceremonyLocation: event.target.value },
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Dirección de la ceremonia</span>
                  <input
                    value={workspace.content.ceremonyAddress ?? ""}
                    onChange={(event) => updateWorkspace((current) => ({ ...current, content: { ...current.content, ceremonyAddress: event.target.value } }))}
                  />
                  <small className={styles.fieldHint}>En esta prueba se muestra como texto. El enlace de mapa se prepara al publicar.</small>
                </label>
                <label className={styles.field}>
                  <span>Celebración</span>
                  <input
                    value={workspace.content.celebrationLocation}
                    onChange={(event) =>
                      updateWorkspace((current) => ({
                        ...current,
                        content: { ...current.content, celebrationLocation: event.target.value },
                      }))
                    }
                  />
                </label>
                <label className={styles.field}>
                  <span>Dirección de la celebración</span>
                  <input
                    value={workspace.content.celebrationAddress ?? ""}
                    onChange={(event) => updateWorkspace((current) => ({ ...current, content: { ...current.content, celebrationAddress: event.target.value } }))}
                  />
                  <small className={styles.fieldHint}>El recorrido une ambos momentos sin consultar un mapa externo.</small>
                </label>
                <label className={`${styles.field} ${styles.fieldFull}`}>
                  <span>Mensaje de bienvenida</span>
                  <textarea
                    rows={4}
                    maxLength={240}
                    value={workspace.content.message}
                    onChange={(event) =>
                      updateWorkspace((current) => ({
                        ...current,
                        content: { ...current.content, message: event.target.value },
                      }))
                    }
                  />
                  <small className={styles.fieldHint}>Hasta 240 caracteres.</small>
                </label>
              </div>
              <section className={styles.photoUpload} aria-labelledby="photo-upload-title">
                <div className={styles.photoUploadCopy}>
                  <span className={styles.photoIcon}>
                    <ImagePlus size={20} strokeWidth={1.7} />
                  </span>
                  <div>
                    <h3 id="photo-upload-title">Fotos de prueba</h3>
                    <p>Elegí hasta 3 fotos para ver tu portada y galería. No se suben a ningún servidor.</p>
                  </div>
                </div>
                <div className={styles.photoActions}>
                  <button type="button" className={styles.samplePhotoButton} onClick={useSamplePhotos}>Usar fotos de ejemplo</button>
                  <label className={styles.photoButton}>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={addLocalPhotos}
                      disabled={localPhotos.length >= MAX_LOCAL_PHOTOS}
                    />
                    <ImagePlus size={17} strokeWidth={1.8} />
                    {localPhotos.length ? "Agregar otra foto" : "Agregar fotos propias"}
                  </label>
                </div>
                <small className={styles.photoHint}>Las fotos de ejemplo son ficticias y se guardan con esta prueba durante 7 días. Las fotos propias sólo duran mientras esta pestaña siga abierta: no vuelven al recargar ni aparecen en la copia descargada. JPG, PNG o WebP, hasta 4 MB.</small>
                {photoError ? <p className={styles.photoError} role="alert">{photoError}</p> : null}
                {localPhotos.length ? (
                  <div className={styles.photoGrid} aria-label="Fotos elegidas">
                    {localPhotos.map((photo, index) => (
                      <figure className={styles.photoThumb} key={photo.id}>
                        <Image src={photo.url} alt={`Foto de prueba ${index + 1}`} fill unoptimized />
                        <figcaption>{index === 0 ? "Portada" : `Galería ${index}`}</figcaption>
                        <button
                          type="button"
                          aria-label={`Quitar foto ${index + 1}`}
                          onClick={() => removeLocalPhoto(photo.id)}
                        >
                          <X size={15} strokeWidth={2} />
                        </button>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </section>
              <section className={styles.musicUpload} aria-labelledby="music-upload-title">
                <div className={styles.photoUploadCopy}>
                  <span className={styles.photoIcon}><Music2 size={20} strokeWidth={1.7} /></span>
                  <div><h3 id="music-upload-title">Música propia, sólo para probar</h3><p>Escuchá cómo se integra una canción sin subirla ni reproducirla automáticamente.</p></div>
                </div>
                <div className={styles.musicActions}>
                  <label className={styles.photoButton}><input type="file" accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg" onChange={addLocalMusic} /><Music2 size={17} /> {localMusic ? "Reemplazar canción" : "Elegir una canción"}</label>
                  {localMusic ? <button type="button" className={styles.textButton} onClick={clearLocalMusic}>Quitar</button> : null}
                </div>
                <small className={styles.photoHint}>Una canción, MP3, M4A u OGG, hasta 8 MB. Vive sólo en esta pestaña y no entra en la copia descargada. La música publicada requiere revisión y autorización de uso.</small>
                {musicError ? <p className={styles.photoError} role="alert">{musicError}</p> : null}
                {localMusic ? <p className={styles.musicStatus} role="status"><strong>{localMusic.name}</strong><span>Lista para escuchar en la invitación de prueba.</span></p> : null}
              </section>
              <section className={styles.personalizationStudio}>
                <WeddingDesignControls
                  design={workspace.design}
                  partnerOne={workspace.content.partnerOne}
                  partnerTwo={workspace.content.partnerTwo}
                  onChange={(design) => updateWorkspace((current) => ({ ...current, design }))}
                />
                <div className={styles.livePreview} id="vista-en-tiempo-real">
                  <div className={styles.livePreviewHeading}>
                    <strong>Vista en tiempo real</strong>
                    <span>Deslizá dentro de la invitación para recorrerla completa.</span>
                  </div>
                  <InvitationPreview
                    workspace={workspace}
                    photoUrls={localPhotos.map((photo) => photo.url)}
                    musicUrl={localMusic?.url}
                    musicName={localMusic?.name}
                    compact
                    startOpen
                    onRsvpClick={() => goTo("rsvp")}
                  />
                </div>
              </section>
              <div className={styles.stageActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => goTo("theme")}>
                  <ArrowLeft size={18} strokeWidth={1.8} /> Estilo
                </button>
                <button type="button" className={styles.primaryButton} onClick={() => goTo("preview")}>
                  Ver mi invitación <ArrowRight size={18} strokeWidth={1.8} />
                </button>
              </div>
            </section>
          ) : null}

          {stage === "preview" ? (
            <section className={styles.previewStage}>
              <div className={styles.previewToolbar}>
                <p>Así la vería una persona invitada.</p>
                <div className={styles.stageActions}>
                  <WeddingWhatsAppPreview workspace={workspace} />
                  <button type="button" className={styles.primaryButton} onClick={() => goTo("rsvp")}>
                    Probar una confirmación <ArrowRight size={17} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
              <InvitationPreview
                workspace={workspace}
                photoUrls={localPhotos.map((photo) => photo.url)}
                musicUrl={localMusic?.url}
                musicName={localMusic?.name}
                onRsvpClick={() => goTo("rsvp")}
              />
            </section>
          ) : null}

          {stage === "rsvp" ? (
            <section className={styles.stage}>
              <div className={styles.stageHeader}>
                <h2>Así confirma una persona invitada.</h2>
                <p>
                  Guardá una respuesta y mirá cómo se actualizan la lista, los lugares usados y quién falta contestar.
                </p>
              </div>
              <div className={styles.rsvpLayout}>
                <section className={styles.guestPanel}>
                  <h3>Invitaciones de prueba</h3>
                  <p>Podés sumar hasta {WEDDING_TRIAL_GUEST_LIMIT} invitaciones ficticias.</p>
                  <div className={styles.unitExplainer}><strong>Cómo se cuenta</strong><span>Una invitación puede ser para una persona, una pareja o una familia. Los lugares indican cuántas personas puede confirmar.</span></div>
                  <form className={styles.guestForm} onSubmit={addGuest}>
                    <input
                      aria-label="Nombre de persona, pareja o familia ficticia"
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                    />
                    <select
                      aria-label="Lugares disponibles"
                      value={guestPasses}
                      onChange={(event) => setGuestPasses(Number(event.target.value))}
                    >
                      {[1, 2, 3, 4].map((value) => (
                        <option value={value} key={value}>{formatPassCount(value)}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className={styles.secondaryButton}
                      disabled={workspace.guests.length >= WEDDING_TRIAL_GUEST_LIMIT}
                    >
                      <Plus size={17} strokeWidth={1.8} /> Agregar invitación
                    </button>
                  </form>
                  {workspace.guests.length >= WEDDING_TRIAL_GUEST_LIMIT ? (
                    <p className={styles.limitNote}>Llegaste al límite de la prueba.</p>
                  ) : null}
                  <div className={styles.guestList}>
                    {workspace.guests.map((guest) => (
                      <button
                        type="button"
                        className={styles.guestRow}
                        key={guest.id}
                        onClick={() => {
                          setActiveGuestId(guest.id);
                          setRsvpPasses(1);
                          setRsvpMessage("");
                        }}
                      >
                        <span>
                          <strong>{guest.name}</strong>
                          <span>Hasta {formatPassCount(guest.passLimit)}</span>
                        </span>
                        <span className={styles.guestStatus}>
                          {guest.status === "pending"
                            ? "Pendiente"
                            : guest.status === "confirmed"
                              ? "Confirmado"
                              : "No asiste"}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className={styles.rsvpPanel}>
                  <h3>Confirmación de {activeGuest?.name ?? "invitado"}</h3>
                  <p>Esta respuesta queda sólo en tu navegador.</p>
                  {activeGuest ? (
                    <form className={styles.rsvpForm} onSubmit={submitRsvp}>
                      <label className={styles.field}>
                        <span>Asistencia</span>
                        <select
                          value={attendance}
                          onChange={(event) =>
                            setAttendance(event.target.value as "confirmed" | "declined")
                          }
                        >
                          <option value="confirmed">Confirmo asistencia</option>
                          <option value="declined">No voy a poder asistir</option>
                        </select>
                      </label>
                      {attendance === "confirmed" ? (
                        <label className={styles.field}>
                          <span>Cuántos lugares va a usar</span>
                          <select
                            value={rsvpPasses}
                            onChange={(event) => setRsvpPasses(Number(event.target.value))}
                          >
                            {Array.from({ length: activeGuest.passLimit }, (_, index) => index + 1).map(
                              (value) => <option value={value} key={value}>{value}</option>,
                            )}
                          </select>
                        </label>
                      ) : null}
                      <label className={styles.field}>
                        <span>Comentario</span>
                        <textarea
                          rows={3}
                          maxLength={300}
                          value={rsvpNote}
                          onChange={(event) => setRsvpNote(event.target.value)}
                        />
                      </label>
                      <button type="submit" className={styles.primaryButton}>
                        <Check size={18} strokeWidth={1.8} /> Guardar confirmación
                      </button>
                      {rsvpMessage ? <p className={styles.successText} role="status" aria-live="polite">{rsvpMessage}</p> : null}
                    </form>
                  ) : null}
                </section>
              </div>
              <div className={styles.stageActions}>
                <button type="button" className={styles.secondaryButton} onClick={() => goTo("preview")}>
                  <ArrowLeft size={18} strokeWidth={1.8} /> Ver invitación
                </button>
                <button type="button" className={styles.primaryButton} onClick={() => goTo("panel")}>
                  Ver respuesta en el panel <ArrowRight size={18} strokeWidth={1.8} />
                </button>
              </div>
            </section>
          ) : null}

          {stage === "panel" ? (
            <section className={styles.portalStage}>
              <div className={styles.stageHeader}>
                <h2>La respuesta ya está en el panel.</h2>
                <p>
                  Se actualizaron las personas confirmadas, las respuestas pendientes y la actividad reciente.
                </p>
              </div>
              <div className={styles.portalToolbar}>
                <Link href="/boda/prueba/panel" className={styles.secondaryButton}>
                  Abrir panel en pantalla completa <ExternalLink size={17} strokeWidth={1.8} />
                </Link>
                <button type="button" className={styles.secondaryButton} onClick={() => goTo("preview")}>
                  <ArrowLeft size={18} strokeWidth={1.8} /> Volver a la invitación
                </button>
              </div>
              <WeddingPortalDemo
                workspace={workspace}
                highlightedGuestId={lastConfirmedGuestId}
                onOpenInvitation={() => goTo("preview")}
              />
              <div className={styles.gateGrid}>
                <section className={styles.responseCard}>
                  <h3>{selfServeEnabled ? "Lleven este diseño a su boda" : "El acceso gratuito está en preparación"}</h3>
                  <p>{selfServeEnabled ? "Pueden crear su espacio con los textos, el estilo y las fotos propias que eligieron. Las confirmaciones ficticias quedan en la prueba." : "La invitación, las confirmaciones y las mesas básicas podrán usarse gratis. Por ahora pueden diseñar y ensayar sin publicar."}</p>
                  {selfServeEnabled ? <button type="button" className={styles.primaryButton} disabled={startBusy} onClick={startFreeWedding}>{startBusy ? "Preparando su diseño…" : "Crear nuestra boda gratis"} <ArrowRight size={18} /></button> : null}
                  {startError ? <p className={styles.draftError} role="alert">{startError}</p> : null}
                  <p>La ayuda para configurar o personalizar la invitación es opcional y se acuerda por separado.</p>
                </section>
                <section className={styles.responseCard}>
                  <Check size={24} strokeWidth={1.7} aria-hidden="true" />
                  <h3>Lo que quedó probado</h3>
                  <p>
                    Estilo {activeTheme.name}, {workspace.guests.length} invitaciones ficticias y {workspace.rsvps.length} {workspace.rsvps.length === 1 ? "respuesta guardada" : "respuestas guardadas"}.
                  </p>
                  <div className={styles.manualNotice}>
                    {selfServeEnabled ? "Crear su espacio es un paso aparte. Después podrán revisar y publicar desde su panel; esta prueba no envía mensajes." : "Esta prueba no publica ni envía datos a invitados. Estamos preparando el acceso gratuito; la asistencia será opcional."}
                  </div>
                  <button type="button" className={styles.textButton} onClick={requestTrialReset}>
                    <Trash2 size={16} strokeWidth={1.8} /> Borrar los datos locales
                  </button>
                </section>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {resetDialogOpen ? (
        <div
          className={styles.resetDialogBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeResetDialog();
          }}
        >
          <div
            ref={resetDialogRef}
            className={styles.resetDialog}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            aria-describedby="reset-dialog-description"
          >
            <button
              type="button"
              className={styles.resetDialogClose}
              onClick={closeResetDialog}
              aria-label="Cerrar sin borrar"
            >
              <X size={19} />
            </button>
            <span className={styles.resetDialogIcon} aria-hidden="true"><Trash2 size={20} /></span>
            <h2 id="reset-dialog-title">¿Borrar esta prueba del navegador?</h2>
            <p id="reset-dialog-description">
              Se quitarán los cambios, invitados, confirmaciones y fotos de esta prueba. Las copias que hayas descargado no se borran.
            </p>
            <p className={styles.resetDialogHint}>Después de borrar vas a poder deshacer durante unos segundos.</p>
            <div className={styles.resetDialogActions}>
              <button ref={resetCancelRef} type="button" className={styles.secondaryButton} onClick={closeResetDialog}>
                Seguir con mi prueba
              </button>
              <button type="button" className={styles.dangerButton} onClick={confirmTrialReset}>
                <Trash2 size={17} /> Sí, borrar y empezar de nuevo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
