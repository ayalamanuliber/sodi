// Prueba negativa del gate de cifras sin fuente: el gate TIENE que fallar cuando corresponde y pasar cuando corresponde.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const run = (dir) =>
  spawnSync(process.execPath, ["scripts/check-price-sources.mjs", "--content", dir], { encoding: "utf8" });

const tmp = mkdtempSync(join(tmpdir(), "price-gate-"));
cpSync("content", tmp, { recursive: true });
const allow = JSON.parse(readFileSync("scripts/price-sources-allowlist.json", "utf8"));
const strictSlug = allow.strictSlugs[0];
const otherFile = readdirSync(tmp).find((f) => f.endsWith(".json") && f !== `${strictSlug}.json`);

const base = run(tmp);
assert.equal(base.status, 0, `la copia limpia debe pasar: ${base.stderr}`);

const inject = (file, html) => {
  const doc = JSON.parse(readFileSync(join(tmp, file), "utf8"));
  doc.content.intro += html;
  writeFileSync(join(tmp, file), JSON.stringify(doc));
  return doc;
};
const restore = (file) => cpSync(join("content", file), join(tmp, file));

// 1) cifra sin link en un articulo estricto -> falla
inject(`${strictSlug}.json`, "<p>La agencia cobra $150.000 por mes.</p>");
let r = run(tmp);
assert.equal(r.status, 1, "cifra sin fuente en articulo estricto debe fallar");
assert.match(r.stderr, /\[estricto\]/);
restore(`${strictSlug}.json`);

// 2) cifra sin link en un articulo fuera de la baseline -> falla
inject(otherFile, "<p>El CPC ronda USD 0.50.</p>");
r = run(tmp);
assert.equal(r.status, 1, "bloque nuevo sin fuente debe fallar");
assert.match(r.stderr, /\[nuevo\]/);
restore(otherFile);

// 3) la misma cifra CON link externo en el mismo bloque -> pasa
inject(otherFile, '<p>El CPC ronda USD 0.50 (<a href="https://example.org/f" rel="nofollow noopener">Fuente, 22/10/2026</a>).</p>');
r = run(tmp);
assert.equal(r.status, 0, `con link en el mismo bloque debe pasar: ${r.stderr}`);
restore(otherFile);

// 4) link solo en OTRO bloque no alcanza
inject(otherFile, '<p>El CPC ronda USD 0.50.</p><p><a href="https://example.org/f">Fuente</a></p>');
r = run(tmp);
assert.equal(r.status, 1, "link en otro parrafo no cuenta");
restore(otherFile);

// 5) un link interno no cuenta como fuente
inject(otherFile, '<p>El CPC ronda USD 0.50, mirá <a href="/blog/x">esto</a>.</p>');
r = run(tmp);
assert.equal(r.status, 1, "link interno no cuenta");

restore(otherFile);

// 6) precio propio: el bloque marcado en ownPrice pasa sin link (la copia limpia ya lo prueba), pero un monto nuevo
//    sin fuente en el MISMO articulo falla
const ownSlug = Object.keys(allow.ownPrice)[0];
inject(`${ownSlug}.json`, "<p>Un competidor cobra $90.000 por mes.</p>");
r = run(tmp);
assert.equal(r.status, 1, "cifra nueva sin fuente en un articulo con precio propio debe fallar");
assert.match(r.stderr, /\[nuevo\]/);
restore(`${ownSlug}.json`);

// 7) precio propio: editar la cifra propia cambia el hash y falla (hay que revisarla y volver a marcarla)
const ownHash = Object.keys(allow.ownPrice[ownSlug])[0];
const ownPrefix = allow.ownPrice[ownSlug][ownHash].slice(0, 40);
const ownFile = join(tmp, `${ownSlug}.json`);
const raw = readFileSync(ownFile, "utf8");
const m = raw.match(/\$(\d{3})\.000/);
assert.ok(m, "el articulo de precio propio de prueba debe tener un monto $NNN.000");
writeFileSync(ownFile, raw.replace(m[0], `$${Number(m[1]) + 7}.000`));
r = run(tmp);
assert.equal(r.status, 1, `precio propio editado debe fallar (${ownPrefix})`);
restore(`${ownSlug}.json`);

// 8) precio propio: una entrada que ya no existe en el contenido falla
const gone = JSON.parse(raw);
const wipe = (n) => (typeof n === "string" ? n.replace(/\$\d[\d.]*/g, "precio a consultar") : Array.isArray(n) ? n.map(wipe) : n && typeof n === "object" ? Object.fromEntries(Object.entries(n).map(([k, v]) => [k, wipe(v)])) : n);
writeFileSync(ownFile, JSON.stringify(wipe(gone)));
r = run(tmp);
assert.equal(r.status, 1, "entrada ownPrice huerfana debe fallar");
assert.match(r.stderr, /\[precio propio viejo\]/);

console.log("price-sources negative checks passed (8/8)");
