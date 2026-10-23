// Gate editorial: cifras de precio sin fuente.
// Un bloque (<p>, <li>, <tr>, <h*>, o cada string suelto como respuesta de FAQ) que contiene un monto
// ($ cifra, US$, USD, ARS, "mil pesos") debe llevar un link externo http(s) a la fuente EN EL MISMO BLOQUE.
// Allowlist documentada en scripts/price-sources-allowlist.json (ver docs/price-sources-gate.md):
//   - strictSlugs: articulos con cero tolerancia (nunca pueden tener bloques en la baseline ni links en FAQs).
//   - ownPrice: bloques por hash con tarifa que cobra SODI (voz de SODI: "hacemos", "ofrecemos", "estimacion de SODI"):
//     no hay fuente externa posible, la fuente es nuestra lista. Solo hashes explicitos (no por articulo): un monto nuevo
//     o editado en la misma pagina falla igual, y una entrada que ya no existe o ya tiene link externo falla. Una cifra
//     de terceros (Xubio, hosting, "precios de mercado") NO entra aca: va con fuente o se reescribe.
//   - baseline: bloques heredados sin fuente, por hash. Solo puede achicarse: un bloque nuevo sin fuente
//     falla, y una entrada de baseline que ya no existe tambien falla (hay que borrarla).
// Uso: node scripts/check-price-sources.mjs [--content DIR] [--allowlist FILE] [--update-baseline]
//      node scripts/check-price-sources.mjs --list SLUG   (imprime los bloques completos sin fuente de ese articulo)
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const contentDir = resolve(opt("--content", "content"));
const allowPath = resolve(opt("--allowlist", "scripts/price-sources-allowlist.json"));
const update = args.includes("--update-baseline");
const listSlug = opt("--list", null);

const MONEY = /(\$\s?\d|US\$|\bUSD\b|\bARS\b|\d\s?(mil\s)?pesos)/i;
const EXT_LINK = /<a\s[^>]*href=\\?["']https?:\/\/[^"'\\\s>]+/i;
const SKIP_TOP = new Set(["slug", "relatedSlugs", "tags", "silo", "siloLabel", "datePublished", "dateModified", "editorialReview"]);

function* strings(node, top) {
  if (typeof node === "string") yield node;
  else if (Array.isArray(node)) for (const v of node) yield* strings(v, top);
  else if (node && typeof node === "object")
    for (const [k, v] of Object.entries(node)) if (!(top && SKIP_TOP.has(k))) yield* strings(v, false);
}
const blocksOf = (s) =>
  s.split(/<\/?(?:p|li|tr|h\d|ul|ol|table|thead|tbody|div)(?:\s[^>]*)?>/i).filter((b) => b.trim());
const norm = (b) => b.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const hashOf = (slug, b) => createHash("sha256").update(`${slug}\n${norm(b)}`).digest("hex").slice(0, 16);

const found = new Map(); // slug -> Map(hash -> preview)
const ownSeen = new Set(); // "slug:hash" de bloques sin link (candidatos a precio propio)
const faqLinks = new Set(); // slugs con <a> en una respuesta de FAQ (la plantilla renderiza la FAQ como texto plano)
let total = 0;
const own = JSON.parse(readFileSync(allowPath, "utf8")).ownPrice ?? {};
for (const file of readdirSync(contentDir).filter((f) => f.endsWith(".json")).sort()) {
  const doc = JSON.parse(readFileSync(join(contentDir, file), "utf8"));
  const slug = doc.slug ?? file.replace(/\.json$/, "");
  if ((doc.content?.faqs ?? []).some((f) => /<a\s/i.test(f.answer ?? ""))) faqLinks.add(slug);
  for (const s of strings(doc, true))
    for (const b of blocksOf(s)) {
      if (!MONEY.test(b) || EXT_LINK.test(b)) continue;
      total++;
      ownSeen.add(`${slug}:${hashOf(slug, b)}`);
      if (own[slug]?.[hashOf(slug, b)]) continue;
      if (!found.has(slug)) found.set(slug, new Map());
      found.get(slug).set(hashOf(slug, b), norm(b).slice(0, 90));
      if (listSlug === slug) console.log(`- ${norm(b)}\n`);
    }
}

if (listSlug) process.exit(0);
const allow = JSON.parse(readFileSync(allowPath, "utf8"));
if (update) {
  const strict = new Set(allow.strictSlugs);
  allow.baseline = Object.fromEntries(
    [...found].filter(([slug]) => !strict.has(slug)).map(([slug, m]) => [slug, Object.fromEntries(m)]),
  );
  writeFileSync(allowPath, JSON.stringify(allow, null, 1) + "\n");
  console.log(`baseline actualizada: ${Object.values(allow.baseline).reduce((n, o) => n + Object.keys(o).length, 0)} bloques`);
  process.exit(0);
}

const errors = [];
for (const [slug, entries] of Object.entries(own))
  for (const h of Object.keys(entries))
    if (!ownSeen.has(`${slug}:${h}`)) errors.push(`[precio propio viejo] ${slug}: ${h} ya no existe o ya tiene link de fuente, borralo de ownPrice`);
for (const slug of allow.strictSlugs)
  for (const [h, p] of found.get(slug) ?? []) errors.push(`[estricto] ${slug}: cifra sin link de fuente: "${p}"`);
const strict = new Set(allow.strictSlugs);
let legacy = 0;
for (const [slug, m] of found) {
  if (strict.has(slug)) continue;
  for (const [h, p] of m) {
    if (allow.baseline[slug]?.[h]) legacy++;
    else errors.push(`[nuevo] ${slug}: cifra sin link de fuente fuera de la baseline: "${p}"`);
  }
}
for (const [slug, entries] of Object.entries(allow.baseline))
  for (const h of Object.keys(entries))
    if (!found.get(slug)?.has(h)) errors.push(`[baseline vieja] ${slug}: ${h} ya no existe, borrala de la allowlist`);
for (const slug of allow.strictSlugs)
  if (faqLinks.has(slug)) errors.push(`[estricto] ${slug}: una respuesta de FAQ lleva <a>; la FAQ se muestra como texto plano, poné el link en el cuerpo`);
for (const slug of allow.strictSlugs)
  if (allow.baseline[slug]) errors.push(`[estricto] ${slug} no puede tener baseline`);

if (errors.length) {
  console.error(`price-sources: ${errors.length} problema(s)\n` + errors.slice(0, 40).join("\n"));
  process.exit(1);
}
const ownN = Object.values(own).reduce((n, o) => n + Object.keys(o).length, 0);
console.log(`price-sources OK: ${strict.size} articulos estrictos con 0 cifras sin fuente; ${legacy} bloques heredados en baseline (solo pueden bajar); ${ownN} bloques de precio propio de SODI`);
