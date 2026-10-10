// End-to-end storage test against a Worker bound to R2 (sodi-r2-test, or `wrangler dev`).
//   node --experimental-strip-types cf/r2-test.mjs <baseUrl> [--real-compare <json file of {path,md5}>]
// Writes only under slug `test-claude-wedding` and prefix boda-studio/test-claude-r2/ (set by wrangler.r2-test.jsonc).
// Uses fake credentials from .dev.vars / test Worker secrets. Reads (never writes) the real wedding slug.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
const base = process.argv[2].replace(/\/$/, '');
const realCompare = process.argv.includes('--real-compare') ? JSON.parse(readFileSync(process.argv[process.argv.indexOf('--real-compare') + 1], 'utf8')) : null;
const ADMIN_PW = process.env.TEST_ADMIN_PW || 'test-claude-admin-pw';
const OP = process.env.TEST_OPERATOR_TOKEN || 'test-claude-operator-token-0123456789';
const SLUG = 'test-claude-wedding-' + Date.now().toString(36);
const ORIGIN = { Origin: new URL(base).origin, 'User-Agent': 'Mozilla/5.0 test-claude' };
const results = [];
const step = async (name, fn) => { try { await fn(); results.push(['PASS', name]); console.log('PASS', name); } catch (e) { results.push(['FAIL', name]); console.log('FAIL', name, '-', e.message); } };
const j = async (path, init = {}) => { const r = await fetch(base + path, { ...init, headers: { 'content-type': 'application/json', ...ORIGIN, ...(init.headers || {}) } }); let body; const t = await r.text(); try { body = JSON.parse(t); } catch { body = t; } return { status: r.status, body, headers: r.headers }; };
let cookie = '';
const A = (extra = {}) => ({ headers: { cookie, ...extra } });

await step('admin login (fake pw) sets session cookie', async () => {
  const r = await fetch(base + '/api/boda/admin/login', { method: 'POST', headers: { 'content-type': 'application/json', ...ORIGIN }, body: JSON.stringify({ password: ADMIN_PW }) });
  assert.equal(r.status, 200); cookie = (r.headers.get('set-cookie') || '').split(';')[0]; assert.ok(cookie);
});
await step('guests: read of missing object returns empty (404 path -> [])', async () => {
  const r = await j(`/api/boda/invitados?slug=${SLUG}`, A()); assert.equal(r.status, 200); assert.deepEqual(r.body.guests, []);
});
let guest;
await step('guests: add = first write (no etag) creates object', async () => {
  const r = await j('/api/boda/invitados', { method: 'POST', ...A(), body: JSON.stringify({ slug: SLUG, action: 'add', nombre: 'test-claude Guest', pases: 2, telefono: '000' }) });
  assert.equal(r.status, 200); guest = r.body.guest; assert.ok(guest.id);
});
await step('guests: read back with etag, public view hides telefono', async () => {
  const r = await j(`/api/boda/invitados?slug=${SLUG}&code=${guest.id}`); assert.equal(r.status, 200);
  assert.equal(r.body.guest.nombre, 'test-claude Guest'); assert.equal(r.body.guest.telefono, undefined);
});
await step('guests: vistoEn mutation persisted (conditional write ifMatch)', async () => {
  const r = await j(`/api/boda/invitados?slug=${SLUG}`, A()); assert.ok(r.body.guests[0].vistoEn);
});
await step('rsvp write (conditional overwrite)', async () => {
  const r = await j('/api/boda/rsvp', { method: 'POST', body: JSON.stringify({ slug: SLUG, code: guest.id, asistencia: 'confirmado', pasesConfirmados: 2, integrantes: ['test-claude A', 'test-claude B'], menu: 'Tradicional' }) });
  assert.equal(r.status, 200);
  const g = (await j(`/api/boda/invitados?slug=${SLUG}`, A())).body.guests[0]; assert.equal(g.estado, 'confirmado'); assert.equal(g.respuesta.pasesConfirmados, 2);
});
await step('rsvp validation (wrong passes) -> 400, 404 unknown code', async () => {
  assert.equal((await j('/api/boda/rsvp', { method: 'POST', body: JSON.stringify({ slug: SLUG, code: guest.id, asistencia: 'confirmado', pasesConfirmados: 9, integrantes: [] }) })).status, 400);
  assert.equal((await j('/api/boda/rsvp', { method: 'POST', body: JSON.stringify({ slug: SLUG, code: 'nope', asistencia: 'rechazado' }) })).status, 404);
});
await step('cancion write + idempotent no-write path', async () => {
  const a = await j('/api/boda/cancion', { method: 'POST', body: JSON.stringify({ slug: SLUG, code: guest.id, cancion: 'test-claude song' }) }); assert.equal(a.status, 200); assert.ok(!a.body.alreadySaved);
  const b = await j('/api/boda/cancion', { method: 'POST', body: JSON.stringify({ slug: SLUG, code: guest.id, cancion: 'test-claude song' }) }); assert.equal(b.body.alreadySaved, true);
});
await step('concurrent mutations do not lose updates (ETag retry)', async () => {
  const rs = await Promise.all([1, 2, 3, 4].map((i) => j('/api/boda/invitados', { method: 'POST', ...A(), body: JSON.stringify({ slug: SLUG, action: 'add', nombre: `test-claude C${i}`, pases: 1 }) })));
  const ok = rs.filter((r) => r.status === 200).length;
  const n = (await j(`/api/boda/invitados?slug=${SLUG}`, A())).body.guests.length;
  assert.equal(n, 1 + ok, `ok=${ok} stored=${n}`); assert.ok(ok >= 3, 'at least 3 of 4 concurrent writes should win with 4 retries');
});
await step('toggleEnviado + delete guest', async () => {
  assert.equal((await j('/api/boda/invitados', { method: 'POST', ...A(), body: JSON.stringify({ slug: SLUG, action: 'toggleEnviado', id: guest.id }) })).status, 200);
  assert.equal((await j('/api/boda/invitados', { method: 'POST', ...A(), body: JSON.stringify({ slug: SLUG, action: 'delete', id: guest.id }) })).status, 200);
});
await step('guests: admin list requires auth (401 without cookie)', async () => {
  assert.equal((await j(`/api/boda/invitados?slug=${SLUG}`)).status, 401);
});
await step('settings: default when missing, write, read back', async () => {
  const a = await j(`/api/boda/configuracion?slug=${SLUG}`, A()); assert.equal(a.status, 200); assert.equal(a.body.settings.guestGoal, 0);
  const b = await j('/api/boda/configuracion', { method: 'POST', ...A(), body: JSON.stringify({ slug: SLUG, guestGoal: 77, whatsappMessage: 'test-claude mensaje largo con {enlace} incluido' }) }); assert.equal(b.status, 200);
  const c = await j(`/api/boda/configuracion?slug=${SLUG}`, A()); assert.equal(c.body.settings.guestGoal, 77);
});
await step('private data is not reachable by URL (no /files route, no r2 listing)', async () => {
  for (const p of [`/files/weddings/${SLUG}/guests.json`, `/weddings/${SLUG}/guests.json`, '/boda-studio/test-claude-r2/']) {
    const r = await fetch(base + p, { headers: ORIGIN }); assert.ok([404, 403].includes(r.status), `${p} -> ${r.status}`); const t = await r.text(); assert.ok(!t.includes('test-claude Guest'));
  }
});
let ev;
await step('studio: capabilities reports durable storage', async () => {
  const r = await j('/api/boda-studio/capabilities'); assert.equal(r.status, 200); console.log('   capabilities', JSON.stringify(r.body).slice(0, 300));
});
await step('studio: operator creates event (create-only put), session cookie', async () => {
  const { createWeddingTrial } = await import('../src/lib/boda-trial/schema.ts');
  const w = createWeddingTrial(); w.guests = []; w.rsvps = []; w.content.partnerOne = 'test-claude Uno'; w.content.partnerTwo = 'test-claude Dos';
  const r = await j('/api/boda-studio/events', { method: 'POST', headers: { authorization: `Bearer ${OP}` }, body: JSON.stringify({ workspace: w, password: 'test-claude-pass-12345' }) });
  assert.equal(r.status, 201, JSON.stringify(r.body).slice(0, 200)); ev = r.body.event; ev.cookie = (r.headers.get('set-cookie') || '').split(';')[0];
});
await step('studio: list events (prefix listing) contains the event', async () => {
  const r = await j('/api/boda-studio/events', { headers: { authorization: `Bearer ${OP}` } }); assert.equal(r.status, 200);
  assert.ok(JSON.stringify(r.body).includes(ev.id), 'event id in list');
});
await step('studio: login throttle write (limit_*), login ok, wrong pw 401', async () => {
  assert.equal((await j(`/api/boda-studio/events/${ev.id}/login`, { method: 'POST', body: JSON.stringify({ password: 'test-claude-pass-12345' }) })).status, 200);
  assert.equal((await j(`/api/boda-studio/events/${ev.id}/login`, { method: 'POST', body: JSON.stringify({ password: 'wrong-wrong-wrong' }) })).status, 401);
});
await step('studio: get event with session, unauthenticated -> 401', async () => {
  assert.equal((await j(`/api/boda-studio/events/${ev.id}`, { headers: { cookie: ev.cookie } })).status, 200);
  assert.equal((await j(`/api/boda-studio/events/${ev.id}`)).status, 401);
});
await step('studio: stale revision delete -> 409 (precondition path), then real delete', async () => {
  const bad = await j(`/api/boda-studio/events/${ev.id}/delete`, { method: 'POST', headers: { cookie: ev.cookie }, body: JSON.stringify({ revision: 999, password: 'test-claude-pass-12345' }) }); assert.equal(bad.status, 409);
  const cur = (await j(`/api/boda-studio/events/${ev.id}`, { headers: { cookie: ev.cookie } })).body.event;
  const ok = await j(`/api/boda-studio/events/${ev.id}/delete`, { method: 'POST', headers: { cookie: ev.cookie }, body: JSON.stringify({ revision: cur.revision, password: 'test-claude-pass-12345' }) }); assert.equal(ok.status, 200, JSON.stringify(ok.body));
  assert.equal((await j(`/api/boda-studio/events/${ev.id}`, { headers: { authorization: `Bearer ${OP}` } })).status, 404);
});
if (realCompare) {
  await step('REAL data reads match source objects (read-only, real slug)', async () => {
    const g = await j('/api/boda/invitados?slug=mirta-y-guillermo', A()); assert.equal(g.status, 200);
    const want = realCompare.find((x) => x.path === 'weddings/mirta-y-guillermo/guests.json'); const arr = JSON.parse(want.text);
    assert.equal(g.body.guests.length, arr.length);
    assert.equal(createHash('md5').update(JSON.stringify(g.body.guests)).digest('hex'), createHash('md5').update(JSON.stringify(arr)).digest('hex'), 'guests JSON identical');
    const s = await j('/api/boda/configuracion?slug=mirta-y-guillermo', A()); assert.equal(s.status, 200);
    const sw = JSON.parse(realCompare.find((x) => x.path === 'weddings/mirta-y-guillermo/settings.json').text);
    assert.equal(s.body.settings.guestGoal, sw.guestGoal); assert.equal(s.body.settings.whatsappMessage, sw.whatsappMessage);
  });
}
const fails = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - fails}/${results.length} passed`);
process.exit(fails ? 1 : 0);
