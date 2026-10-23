// Gate de eventos GA4 estandar (Tarea medicion-marcas-6634).
// Uso:
//   node scripts/gate-eventos-ga4.mjs --base http://localhost:3000 [--negative]   (local: gtag stub + tracker forzado)
//   node scripts/gate-eventos-ga4.mjs --base https://sodi.com.ar  --live [--negative]  (produccion: tracker real)
// Requiere playwright (NODE_PATH=~/pwtest/node_modules). Sale 0 si pasa, 1 si falla.
//
// Local: ProductionAnalytics no carga fuera de sodi.com.ar (frontera de produccion), asi que el gate
// define window.gtag (stub que registra) e inyecta /event-tracker.js con addScriptTag.
// Live: se deja que el sitio cargue sus tags; se abortan los hits a GA/Meta/Vercel (no se ensucia GA)
// y se registran las llamadas gtag via dataLayer.push. Ningun form se envia: se aborta /api/** y se
// cancela el submit en fase burbuja.
// --negative: el tracker no se carga (local: no se inyecta; live: /event-tracker.js se sirve vacio).
// El gate DEBE fallar en ese modo.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const base = (arg("--base", "http://localhost:3000")).replace(/\/$/, "");
const live = args.includes("--live");
const negative = args.includes("--negative");

const failures = [];
const passes = [];
function expect(name, ok, detail = "") { (ok ? passes : failures).push(name + (detail ? " :: " + detail : "")); console.log((ok ? "PASS " : "FAIL ") + name + (detail ? " :: " + detail : "")); }

const REC = `(() => {
  window.__ev = [];
  const record = (a) => { try { if (a[0] === 'event') window.__ev.push({ name: a[1], params: a[2] || {} }); } catch (e) {} };
  window.dataLayer = window.dataLayer || [];
  const push = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function () { for (const a of arguments) record(a); return push.apply(null, arguments); };
  ${live ? "" : "window.gtag = function () { window.dataLayer.push(arguments); };"}
})();`;

const browser = await chromium.launch();
async function open(path, vw = 1280) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: 800 }, userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36" });
  await ctx.route(/google-analytics\.com|analytics\.google\.com|doubleclick|facebook\.com\/tr|connect\.facebook\.net|\/_vercel\/(insights|speed-insights)|vitals\.vercel/, (r) => r.abort());
  await ctx.route(/\/api\//, (r) => r.abort());
  if (live && negative) await ctx.route(/\/event-tracker\.js/, (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "/* negative: empty tracker */" }));
  const page = await ctx.newPage();
  let trackerRequested = false;
  page.on("request", (rq) => { if (/\/event-tracker\.js/.test(rq.url())) trackerRequested = true; });
  await page.addInitScript(REC);
  await page.goto(base + path, { waitUntil: "networkidle", timeout: 90000 });
  if (!live && !negative) await page.addScriptTag({ url: base + "/event-tracker.js" });
  if (live) await page.waitForTimeout(2500);
  // never let a test click navigate away or submit
  await page.evaluate(() => {
    window.addEventListener("click", (e) => { if (e.target.closest && e.target.closest("a")) e.preventDefault(); }, false);
    window.addEventListener("submit", (e) => e.preventDefault(), false);
  });
  return { ctx, page, trackerRequested: () => trackerRequested };
}
const evs = (page, name) => page.evaluate((n) => window.__ev.filter((e) => e.name === n), name);
const has = (list, pred) => list.some(pred);

// 1. home: cta_click, whatsapp_click, outbound, download, scroll
{
  const { ctx, page, trackerRequested } = await open("/");
  if (live && !negative) expect("live: la pagina pide /event-tracker.js por si misma", trackerRequested());
  // CTA propio de la pagina: se clickea con un handler en captura que corta Next Link (navegacion SPA) tras nuestro tracker
  const ctaInfo = await page.evaluate(() => {
    const a = document.querySelector("a.btn-primary, a.btn-secondary");
    a.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); });
    a.scrollIntoView();
    return a.textContent.trim();
  });
  await page.locator("a.btn-primary, a.btn-secondary").first().click({ noWaitAfter: true });
  const ctas = await evs(page, "cta_click");
  expect("home: cta_click con cta_id", has(ctas, (e) => typeof e.params.cta_id === "string" && e.params.cta_id.length > 0), ctaInfo + " -> " + JSON.stringify(ctas[0]?.params));

  const wa = page.locator('a[href*="wa.me"]:not([data-wa-tracked])').first();
  await wa.scrollIntoViewIfNeeded();
  await wa.click({ noWaitAfter: true, force: true });
  const was = await evs(page, "whatsapp_click");
  expect("home: whatsapp_click con link_url sin query", has(was, (e) => /wa\.me\//.test(e.params.link_url || "") && !(e.params.link_url || "").includes("?")), JSON.stringify(was[0]?.params));
  const outAfterWa = await evs(page, "outbound_click");
  expect("home: WhatsApp NO cuenta como outbound_click", outAfterWa.length === 0);

  await page.evaluate(() => {
    let n = 0; const mk = (id, href, extra = "") => { const a = document.createElement("a"); a.id = id; a.href = href; a.textContent = id; a.style.cssText = "position:fixed;top:" + (n++ * 40) + "px;left:0;z-index:99999;background:#fff;color:#000"; if (extra) a.setAttribute(extra, ""); document.body.appendChild(a); };
    mk("gate-out", "https://example.org/algo?token=SECRETO");
    mk("gate-pdf", "/gate/guia-prueba.pdf?x=1");
    mk("gate-dl", "/gate/archivo", "download");
  });
  await page.click("#gate-out", { noWaitAfter: true });
  const outs = await evs(page, "outbound_click");
  expect("outbound_click con link_url y link_domain, sin query", has(outs, (e) => e.params.link_domain === "example.org" && e.params.link_url === "https://example.org/algo"), JSON.stringify(outs[0]?.params));
  await page.click("#gate-pdf", { noWaitAfter: true });
  await page.click("#gate-dl", { noWaitAfter: true });
  const dls = await evs(page, "file_download");
  expect("file_download pdf con file_name, file_extension, link_url", has(dls, (e) => e.params.file_name === "guia-prueba.pdf" && e.params.file_extension === "pdf" && /guia-prueba\.pdf$/.test(e.params.link_url || "")), JSON.stringify(dls[0]?.params));
  expect("file_download por atributo download", has(dls, (e) => e.params.file_name === "archivo"));

  await page.evaluate(() => window.scrollTo(0, 0));
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (const f of [0.3, 0.55, 0.8, 1]) { await page.evaluate((y) => window.scrollTo(0, y), total * f); await page.waitForTimeout(250); }
  await page.waitForTimeout(400);
  const sc = await evs(page, "scroll_depth");
  const got = sc.map((e) => e.params.percent);
  expect("scroll_depth 25/50/75/90 una vez cada uno", [25, 50, 75, 90].every((n) => got.filter((g) => g === n).length === 1), JSON.stringify(got));
  await ctx.close();
}

// 2. /boda: form_start una vez + form_submit
{
  const { ctx, page } = await open("/boda");
  const form = page.locator("form").first();
  await form.scrollIntoViewIfNeeded();
  const field = form.locator("input:not([type=hidden]), textarea, select").first();
  await field.focus();
  await page.keyboard.type("x");
  await field.blur();
  await field.focus();
  const st = await evs(page, "form_start");
  expect("boda: form_start una sola vez por form, con form_id", st.length === 1 && !!st[0].params.form_id, JSON.stringify(st.map((e) => e.params)));
  await form.evaluate((f) => f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  await page.waitForTimeout(300);
  const sb = await evs(page, "form_submit");
  expect("boda: form_submit con el mismo form_id", sb.length >= 1 && sb[0].params.form_id === st[0]?.params.form_id, JSON.stringify(sb.map((e) => e.params)));
  await ctx.close();
}

// 3. blog y diagnostico: scroll + sin duplicar whatsapp ya instrumentado
{
  const { ctx, page } = await open("/blog/agencia-web-vs-freelancer", 390);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (const f of [0.3, 0.55, 0.8, 1]) { await page.evaluate((y) => window.scrollTo(0, y), total * f); await page.waitForTimeout(250); }
  await page.waitForTimeout(400);
  const got = (await evs(page, "scroll_depth")).map((e) => e.params.percent);
  expect("blog (390px): scroll_depth 25/50/75/90", [25, 50, 75, 90].every((n) => got.includes(n)), JSON.stringify(got));
  const float = page.locator("a.wa-btn");
  if (await float.count()) {
    await float.first().click({ noWaitAfter: true, force: true });
    const w = await evs(page, "whatsapp_click");
    expect("blog: boton flotante WhatsApp no duplica (solo el evento propio del sitio, una vez)", w.length <= 1 && w.every((e) => e.params.location === "floating_button"), JSON.stringify(w.map((e) => e.params.location || "tracker")));
  }
  await ctx.close();
}
{
  const { ctx, page } = await open("/diagnostico");
  const el = page.locator("a.btn-primary, a.btn-secondary, button.btn-primary, button.btn-secondary").first();
  if (await el.count()) {
    await el.evaluate((n) => n.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); }));
    await el.click({ noWaitAfter: true, force: true });
    const c = await evs(page, "cta_click");
    expect("diagnostico: cta_click", c.length >= 1, JSON.stringify(c[0]?.params));
  } else expect("diagnostico: hay un CTA", false);
  await ctx.close();
}

// 4. frontera de privacidad: ruta privada no trackea
{
  const { ctx, page, trackerRequested } = await open("/invitacion/gate-privado");
  if (!live) await page.addScriptTag({ url: base + "/event-tracker.js" }).catch(() => {});
  await page.evaluate(() => { const a = document.createElement("a"); a.href = "https://example.org/x"; a.className = "btn-primary"; a.textContent = "x"; a.id = "pv"; a.style.cssText = "position:fixed;top:0;left:0;z-index:99999"; document.body.appendChild(a); });
  await page.click("#pv", { noWaitAfter: true, force: true }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(500);
  const all = await page.evaluate(() => window.__ev.filter((e) => ["cta_click", "outbound_click", "scroll_depth", "form_start", "form_submit", "whatsapp_click", "file_download"].includes(e.name)));
  // en negativo el tracker no corre, asi que "sin eventos" no prueba nada: solo se exige en modo normal
  if (!negative) expect("ruta privada /invitacion/*: cero eventos del tracker", all.length === 0, JSON.stringify(all));
  if (live && !negative) expect("ruta privada: la pagina no pide el tracker", !trackerRequested());
  await ctx.close();
}

await browser.close();
console.log(`\n${passes.length} PASS, ${failures.length} FAIL (${live ? "live" : "local"}${negative ? ", NEGATIVO" : ""})`);
if (negative) console.log(failures.length ? "NEGATIVO OK: el gate detecta la ausencia del tracker (fallo esperado)." : "NEGATIVO MAL: el gate paso sin tracker.");
process.exit(failures.length ? 1 : 0);
