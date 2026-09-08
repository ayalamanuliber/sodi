import type { CSSProperties } from "react";
import type { TrialDesign, WeddingThemeId } from "./schema";
import { mergeDesignDefaults } from "./merge-design-defaults.ts";

export interface WeddingTheme {
  id: WeddingThemeId;
  name: string;
  direction: string;
  description: string;
  moodboard: string;
  layout: "split" | "editorial" | "poster";
  tokens: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    accentContrast: string;
    border: string;
    displayFont: string;
    bodyFont: string;
    radius: string;
  };
}

export const WEDDING_THEMES: WeddingTheme[] = [
  {
    id: "cobalto",
    name: "Moderno",
    direction: "Azul, limpio y luminoso",
    description: "Una portada contemporánea, con aire y foco en la fotografía.",
    moodboard: "/invitaciones-boda/couple-hero.webp",
    layout: "split",
    tokens: {
      background: "#eef1f5",
      surface: "#f9fafc",
      text: "#171a23",
      muted: "#606675",
      accent: "#3154a8",
      accentContrast: "#f8faff",
      border: "#cbd1dc",
      displayFont: "var(--boda-ui)",
      bodyFont: "var(--boda-ui)",
      radius: "20px",
    },
  },
  {
    id: "bosque",
    name: "Jardín",
    direction: "Botánico, cálido y sereno",
    description: "Verde profundo, marfil y detalles dorados para una boda entre plantas.",
    moodboard: "/invitaciones-boda/couple-hero.webp",
    layout: "editorial",
    tokens: {
      background: "#e9eee8",
      surface: "#f4f6f1",
      text: "#18241d",
      muted: "#536158",
      accent: "#c49a52",
      accentContrast: "#173c2a",
      border: "#bdc8bf",
      displayFont: "var(--boda-display)",
      bodyFont: "var(--boda-ui)",
      radius: "4px",
    },
  },
  {
    id: "nocturno",
    name: "Noche",
    direction: "Elegante, gráfico y ceremonial",
    description: "Grafito y plata para una celebración de noche con presencia.",
    moodboard: "/invitaciones-boda/couple-hero.webp",
    layout: "poster",
    tokens: {
      background: "#111318",
      surface: "#1a1d24",
      text: "#eef0f4",
      muted: "#a7abb5",
      accent: "#7f738d",
      accentContrast: "#ffffff",
      border: "#3a3e48",
      displayFont: "var(--boda-ui)",
      bodyFont: "var(--boda-ui)",
      radius: "0px",
    },
  },
  {
    id: "clasico",
    name: "Clásico",
    direction: "Marfil, dorado y atemporal",
    description: "Simetría, letras elegantes y el tono formal de una invitación impresa.",
    moodboard: "/invitaciones-boda/couple-hero.webp",
    layout: "editorial",
    tokens: {
      background: "#f2eee5",
      surface: "#fbf8f1",
      text: "#302a22",
      muted: "#756b5d",
      accent: "#a77b35",
      accentContrast: "#fffaf0",
      border: "#d5c8b4",
      displayFont: "var(--boda-display)",
      bodyFont: "var(--boda-ui)",
      radius: "2px",
    },
  },
  {
    id: "romantico",
    name: "Romántico",
    direction: "Suave, cálido y cinematográfico",
    description: "Arcilla, rosa apagado y una portada envolvente sin excesos.",
    moodboard: "/invitaciones-boda/couple-hero.webp",
    layout: "poster",
    tokens: {
      background: "#f1e9e2",
      surface: "#fbf7f3",
      text: "#30241f",
      muted: "#74645b",
      accent: "#985b63",
      accentContrast: "#fff8f2",
      border: "#d3c0b5",
      displayFont: "'Baskerville', var(--boda-display)",
      bodyFont: "var(--boda-ui)",
      radius: "18px",
    },
  },
  {
    id: "campestre",
    name: "Campestre",
    direction: "Natural, cercano y relajado",
    description: "Lino y oliva para una celebración al aire libre, simple y cuidada.",
    moodboard: "/invitaciones-boda/couple-hero.webp",
    layout: "split",
    tokens: {
      background: "#eee9df",
      surface: "#faf7ef",
      text: "#2f3027",
      muted: "#6b6d5b",
      accent: "#6d724e",
      accentContrast: "#fffaf0",
      border: "#c9c7ae",
      displayFont: "var(--boda-display)",
      bodyFont: "var(--boda-ui)",
      radius: "5px",
    },
  },
];

export const WEDDING_THEME_PRESETS: Record<WeddingThemeId, Omit<TrialDesign, "samplePhotosEnabled">> = {
  cobalto: {
    paletteId: "cobalt-ivory",
    typographyId: "contemporary",
    coverId: "split",
    monogramId: "initials",
    galleryId: "film",
    ornamentId: "quiet",
    textPlacementId: "left",
    photoFocusId: "right",
    contrastId: "soft",
  },
  bosque: {
    paletteId: "forest-gold",
    typographyId: "editorial",
    coverId: "cinematic",
    monogramId: "seal",
    galleryId: "mosaic",
    ornamentId: "balanced",
    textPlacementId: "left",
    photoFocusId: "left",
    contrastId: "balanced",
  },
  nocturno: {
    paletteId: "ink-silver",
    typographyId: "contemporary",
    coverId: "cinematic",
    monogramId: "wordmark",
    galleryId: "film",
    ornamentId: "ceremonial",
    textPlacementId: "left",
    photoFocusId: "right",
    contrastId: "strong",
  },
  clasico: {
    paletteId: "forest-gold",
    typographyId: "romantic",
    coverId: "split",
    monogramId: "seal",
    galleryId: "mosaic",
    ornamentId: "ceremonial",
    textPlacementId: "center",
    photoFocusId: "center",
    contrastId: "balanced",
  },
  romantico: {
    paletteId: "olive-clay",
    typographyId: "romantic",
    coverId: "cinematic",
    monogramId: "wordmark",
    galleryId: "film",
    ornamentId: "balanced",
    textPlacementId: "left",
    photoFocusId: "left",
    contrastId: "strong",
  },
  campestre: {
    paletteId: "olive-clay",
    typographyId: "editorial",
    coverId: "split",
    monogramId: "initials",
    galleryId: "mosaic",
    ornamentId: "quiet",
    textPlacementId: "left",
    photoFocusId: "right",
    contrastId: "soft",
  },
};

export function getWeddingTheme(id: WeddingThemeId) {
  return WEDDING_THEMES.find((theme) => theme.id === id) ?? WEDDING_THEMES[0];
}

export function resolveWeddingTrialDesign(themeId: WeddingThemeId, design: TrialDesign): TrialDesign {
  return mergeDesignDefaults({
    ...WEDDING_THEME_PRESETS[themeId],
    samplePhotosEnabled: design.samplePhotosEnabled,
  }, design);
}

const PALETTES: Record<TrialDesign["paletteId"], Pick<WeddingTheme["tokens"], "background" | "surface" | "text" | "muted" | "accent" | "accentContrast" | "border">> = {
  "forest-gold": { background: "#e9eee8", surface: "#f7f6f1", text: "#18241d", muted: "#536158", accent: "#355844", accentContrast: "#f8f5ec", border: "#bdc8bf" },
  "olive-clay": { background: "#f1e9e2", surface: "#fbf7f3", text: "#30241f", muted: "#74645b", accent: "#8a4939", accentContrast: "#fff8f2", border: "#d3c0b5" },
  "cobalt-ivory": { background: "#eef1f5", surface: "#fafbfc", text: "#171a23", muted: "#606675", accent: "#3154a8", accentContrast: "#f8faff", border: "#cbd1dc" },
  "ink-silver": { background: "#111318", surface: "#1a1d24", text: "#eef0f4", muted: "#a7abb5", accent: "#d5d9e1", accentContrast: "#15171d", border: "#3a3e48" },
};

const TYPOGRAPHY: Record<TrialDesign["typographyId"], Pick<WeddingTheme["tokens"], "displayFont" | "bodyFont">> = {
  editorial: { displayFont: "var(--boda-display)", bodyFont: "var(--boda-ui)" },
  contemporary: { displayFont: "var(--boda-ui)", bodyFont: "var(--boda-ui)" },
  romantic: { displayFont: "'Baskerville', var(--boda-display)", bodyFont: "var(--boda-ui)" },
};

export function weddingThemeStyle(theme: WeddingTheme, design?: TrialDesign) {
  const preset = WEDDING_THEME_PRESETS[theme.id];
  const palette = design && design.paletteId !== preset.paletteId
    ? PALETTES[design.paletteId]
    : theme.tokens;
  const typography = design && design.typographyId !== preset.typographyId
    ? TYPOGRAPHY[design.typographyId]
    : theme.tokens;
  return {
    "--trial-bg": palette.background,
    "--trial-surface": palette.surface,
    "--trial-text": palette.text,
    "--trial-muted": palette.muted,
    "--trial-accent": palette.accent,
    "--trial-accent-contrast": palette.accentContrast,
    "--trial-border": palette.border,
    "--trial-display": typography.displayFont,
    "--trial-body": typography.bodyFont,
    "--trial-radius": theme.tokens.radius,
  } as CSSProperties;
}
