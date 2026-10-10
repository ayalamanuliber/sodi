#!/usr/bin/env node
// Idempotent Vercel Blob -> Cloudflare R2 copy with per-object verification (size + md5; R2 etag = md5 for single-part puts).
// Usage:
//   BLOB_READ_WRITE_TOKEN=... node scripts/r2-sync.mjs --remote            # real bucket, account via wrangler-vortex
//   BLOB_READ_WRITE_TOKEN=... node scripts/r2-sync.mjs --local             # wrangler local simulator (for wrangler dev tests)
//   add --dry-run to only compare, --bucket NAME (default sodi-storage), --prefix P to limit.
// Safe to re-run: unchanged objects are skipped, changed ones overwritten. Never deletes anything (Blob or R2).
import { list, get } from '@vercel/blob';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const remote = flag('--remote'), local = flag('--local');
if (remote === local) { console.error('Pass exactly one of --remote or --local'); process.exit(2); }
if (!process.env.BLOB_READ_WRITE_TOKEN) { console.error('BLOB_READ_WRITE_TOKEN missing'); process.exit(2); }
const bucket = opt('--bucket', 'sodi-storage'), prefix = opt('--prefix', ''), dry = flag('--dry-run');
const wrangler = process.env.WRANGLER_BIN || 'wrangler-vortex';
const cwdArgs = opt('--wrangler-cwd') ? ['--cwd', opt('--wrangler-cwd')] : [];
const target = remote ? ['--remote'] : ['--local'];
const md5 = (b) => createHash('md5').update(b).digest('hex');
const tmp = mkdtempSync(join(tmpdir(), 'r2sync-'));
const wr = (a) => execFileSync(wrangler, [...a, ...target, ...cwdArgs], { stdio: ['ignore', 'pipe', 'pipe'] });

async function blobObjects() {
  const out = []; let cursor;
  do { const p = await list({ prefix, cursor, limit: 1000 }); out.push(...p.blobs); cursor = p.hasMore ? p.cursor : undefined; } while (cursor);
  return out;
}
async function blobBytes(pathname) {
  const r = await get(pathname, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) throw new Error('cannot read blob ' + pathname);
  return Buffer.from(await new Response(r.stream).arrayBuffer());
}
function r2Bytes(key) {
  const f = join(tmp, 'get.bin');
  if (existsSync(f)) rmSync(f);
  try { wr(['r2', 'object', 'get', `${bucket}/${key}`, '--file', f]); } catch (e) {
    if (/not exist|10007|NoSuchKey|not found/i.test(String(e.stderr || e.stdout || e))) return null;
    throw e;
  }
  return existsSync(f) ? readFileSync(f) : null;
}

const objs = await blobObjects();
const stats = { blobCount: objs.length, blobBytes: 0, copied: 0, skipped: 0, verified: 0, mismatches: [], blobUrlRefs: 0 };
for (const o of objs.sort((a, b) => a.pathname.localeCompare(b.pathname))) {
  const bytes = await blobBytes(o.pathname);
  if (bytes.length !== o.size) throw new Error(`size mismatch reading blob ${o.pathname}`);
  stats.blobBytes += bytes.length;
  if (bytes.includes('blob.vercel-storage.com')) stats.blobUrlRefs++;
  const want = md5(bytes);
  const have = r2Bytes(o.pathname);
  if (have && md5(have) === want) { stats.skipped++; stats.verified++; continue; }
  if (dry) { stats.mismatches.push(o.pathname + (have ? ' (differs)' : ' (missing)')); continue; }
  const f = join(tmp, 'put.bin'); writeFileSync(f, bytes);
  wr(['r2', 'object', 'put', `${bucket}/${o.pathname}`, '--file', f, '--content-type', 'application/json']);
  const back = r2Bytes(o.pathname);
  if (back && back.length === bytes.length && md5(back) === want) { stats.copied++; stats.verified++; }
  else stats.mismatches.push(o.pathname);
}
rmSync(tmp, { recursive: true, force: true });
console.log(JSON.stringify({ target: remote ? 'remote' : 'local', bucket, ...stats, ok: stats.mismatches.length === 0 && stats.verified === stats.blobCount }, null, 2));
process.exit(stats.mismatches.length ? 1 : 0);
