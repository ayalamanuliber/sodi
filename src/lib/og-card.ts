import manifest from "@/data/og-manifest.json";

// Per-page social cards (1200x630 JPG) rendered by scripts/og-entries.mjs + og-cards.mjs into public/og/.
// The manifest lives outside content/ on purpose: content/*.json is hashed by the editorial release gate.
const SITE = "https://sodi.com.ar";
const DEFAULT_IMAGE = {
  url: `${SITE}/icon-512.png`,
  width: 512,
  height: 512,
  alt: "SODI",
};

type OgCard = { file: string; width: number; height: number; alt: string };
const cards = manifest as Record<string, OgCard>;

export function normalizeOgPath(path: string) {
  let p = path;
  try {
    p = decodeURIComponent(p);
  } catch {}
  p = p.normalize("NFC").replace(/[?#].*$/, "");
  return p.length > 1 ? p.replace(/\/$/, "") : p;
}

export function hasOgCard(path: string) {
  return Boolean(cards[normalizeOgPath(path)]);
}

/** Absolute-URL image list for openGraph.images / twitter.images; falls back to the site default. */
export function ogImages(path: string, alt?: string) {
  const card = cards[normalizeOgPath(path)];
  if (!card) return [DEFAULT_IMAGE];
  return [
    {
      url: `${SITE}/og/${card.file}`,
      width: card.width,
      height: card.height,
      alt: alt ?? card.alt,
    },
  ];
}

/**
 * For dynamic routes that ship their own opengraph-image file as a fallback: only set `images` when a
 * rendered card exists, so pages without one (noindex/retired) keep the file-based image instead of the default.
 */
export function ogImageProps(path: string) {
  return hasOgCard(path) ? { images: ogImages(path) } : {};
}
