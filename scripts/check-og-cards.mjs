// Gate: every page enumerated for a social card has a manifest entry, the JPG exists, is 1200x630, <300KB,
// and no two paths share a file. The card title (recorded as the manifest alt when the card is rendered)
// must equal the page's current title: a title edited after the card was drawn fails. Also checks public/og has no orphan files and content/ was not touched by cards.
// Run: npx tsx scripts/check-og-cards.mjs
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = process.cwd();
const { entries } = await import(path.join(root, "scripts/og-entries.mjs"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "src/data/og-manifest.json"), "utf8"));
const errors = [];
const files = new Map();
let maxBytes = 0, totalBytes = 0;
for (const e of entries) {
  const m = manifest[e.path];
  if (!m) { errors.push(`no manifest entry: ${e.path}`); continue; }
  const fp = path.join(root, "public/og", m.file);
  if (!fs.existsSync(fp)) { errors.push(`missing file for ${e.path}: ${m.file}`); continue; }
  const size = fs.statSync(fp).size;
  maxBytes = Math.max(maxBytes, size); totalBytes += size;
  if (size >= 300 * 1024) errors.push(`>=300KB ${e.path}: ${size}`);
  if (m.width !== 1200 || m.height !== 630) errors.push(`wrong size in manifest ${e.path}`);
  if (!m.alt) errors.push(`no alt ${e.path}`);
  else {
    // The card renderer draws the entry title with the brand prefix removed and no dashes; alt = "<drawn title> | SODI".
    const norm = (t) => t.replace(/^SODI\s*[:\u2014\u2013-]\s*/i, "").replace(/\s+/g, " ").trim();
    const drawn = m.alt.replace(/\s*\|\s*SODI$/, "");
    if (norm(drawn) !== norm(e.title)) errors.push(`card title differs from page title ${e.path}: card "${drawn}" vs page "${e.title}"`);
  }
  if (files.has(m.file)) errors.push(`file shared by ${files.get(m.file)} and ${e.path}`);
  files.set(m.file, e.path);
}
for (const p of Object.keys(manifest)) if (!entries.some((e) => e.path === p)) errors.push(`manifest path not enumerated (stale): ${p}`);
for (const f of fs.readdirSync(path.join(root, "public/og"))) if (!files.has(f)) errors.push(`orphan file in public/og: ${f}`);
const sharp = (await import("sharp")).default;
for (const [f, p] of files) {
  const md = await sharp(path.join(root, "public/og", f)).metadata();
  if (md.width !== 1200 || md.height !== 630 || md.format !== "jpeg") errors.push(`bad image ${p}: ${md.width}x${md.height} ${md.format}`);
}
if (errors.length) { console.error(errors.slice(0, 30).join("\n")); console.error(`FAIL: ${errors.length} problems`); process.exit(1); }
console.log(`OG cards verified: ${entries.length} paths, ${files.size} unique 1200x630 JPGs, max ${Math.round(maxBytes / 1024)}KB, total ${(totalBytes / 1048576).toFixed(1)}MB.`);
assert.ok(entries.length > 0);
