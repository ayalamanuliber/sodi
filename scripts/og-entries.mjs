// Enumerates the pages that get a social card (og:image) and their title/description/kicker.
// Source of truth: the same release helpers the sitemap uses, so indexable pages = cards.
// Run from the repo root with tsx (it resolves the "@/..." imports):
//   npx tsx scripts/og-entries.mjs [--out entries.json]
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const { getAllArticles } = await import(path.join(root, "src/lib/blog-data.ts"));
const { silos } = await import(path.join(root, "src/lib/blog-types.ts"));
const { getSearchEligibleArticles } = await import(path.join(root, "src/lib/content-release/blog-release.ts"));
const { getAllTemplateResources } = await import(path.join(root, "src/lib/template-data.ts"));

const SILO_KICKER = {
  "web-por-rubro": "Web por rubro",
  "sistema-por-rubro": "Sistemas por rubro",
  "whatsapp-por-rubro": "WhatsApp por rubro",
  "redes-por-rubro": "Redes por rubro",
  "turnos-por-rubro": "Turnos por rubro",
  precios: "Cuánto cuesta",
  guias: "Guía SODI",
  comparativas: "Comparativa",
  "por-ciudad": "Por ciudad",
  "digital-ideal": "El digital ideal",
  conceptos: "Qué es",
};

// Static pages: title/description are read from the page's own metadata source (first `title`/`description` string).
function readMeta(file, { title, description } = {}) {
  const src = fs.readFileSync(path.join(root, file), "utf8");
  const grab = (key) => {
    const m = src.match(new RegExp(`\\b${key}\\s*[:=]\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    if (!m) throw new Error(`cannot read ${key} from ${file}`);
    return JSON.parse(`"${m[1]}"`);
  };
  return { title: title ?? grab("title"), description: description ?? grab("description") };
}

const strip = (t) => t.replace(/\s*[|—–-]\s*(Guías )?SODI\s*$/i, "").replace(/^SODI\s*[—–]\s*/i, "").replace(/\s+/g, " ").trim();

const entries = [];
// Mid-title pipes read as clutter on a card ("Diseño Web Lanús | Agencia Digital 2026"): use a colon.
const cardTitle = (t) => strip(t).replace(/\s+\|\s+/g, ": ");
const add = (p, title, description, kicker, extra = {}) => entries.push({ path: p, title: cardTitle(title), description: description || "", kicker, ...extra });

const home = readMeta("src/app/layout.tsx");
add("/", home.title, home.description, "Para empresas que ya venden");
for (const [p, file, kicker] of [
  ["/diagnostico", "src/app/diagnostico/page.tsx", "Diagnóstico"],
  ["/blog", "src/app/blog/page.tsx", "Blog SODI"],
  ["/directorio", "src/app/directorio/page.tsx", "Directorio"],
  ["/directorio-comercial-argentino", "src/app/directorio-comercial-argentino/page.tsx", "Directorio"],
  ["/plantillas", "src/app/plantillas/page.tsx", "Plantillas"],
  ["/herramientas/calculadora-comisiones-cobro", "src/app/herramientas/calculadora-comisiones-cobro/page.tsx", "Calculadora"],
]) {
  const m = readMeta(file);
  add(p, m.title, m.description, kicker);
}

const articles = getSearchEligibleArticles(getAllArticles());
const hubs = new Set(articles.map((a) => a.silo));
for (const key of Object.keys(silos)) {
  if (hubs.has(key)) add(`/blog/${key}`, `${silos[key].label} | Guías SODI`, silos[key].description, "Guías SODI");
}
for (const a of articles) add(`/blog/${a.slug}`, a.metaTitle, a.metaDescription, SILO_KICKER[a.silo] || "Guía SODI");

// Templates are previews (not search-eligible yet): cards are ready for when they are approved.
for (const t of getAllTemplateResources()) add(`/plantillas/${t.slug}`, t.metaTitle, t.metaDescription, "Plantilla", { preview: true });

const seen = new Set();
for (const e of entries) { if (seen.has(e.path)) throw new Error("duplicate path " + e.path); seen.add(e.path); }

export { entries };
const out = process.argv.indexOf("--out");
if (out > 0) {
  fs.writeFileSync(process.argv[out + 1], JSON.stringify(entries, null, 1) + "\n");
  console.error(`${entries.length} entries -> ${process.argv[out + 1]}`);
}
