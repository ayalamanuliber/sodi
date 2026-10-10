SODI on Cloudflare Workers (prep only; Vercel still serves sodi.com.ar)
Branch cf/workers-migration, worktree ~/projects/sodi/releases/cf-workers-20261008, based on origin/main 07285de (= production deploy).
Worker `sodi` on Manuel's personal account (302f6e0f..., manuel@aivortex.io). Preview URL: https://sodi.cf-workers-20261008.workers.dev (noindex).

STACK
- OpenNext adapter @opennextjs/cloudflare 1.20.9 + wrangler 4.148. Entry: cf/worker.ts wraps .open-next/worker.js.
- next bumped 16.2.2 -> 16.3.8: the adapter's peer range is next >=15.5.27 <16 || >=16.3.8 (16.2.x is excluded). Production on Vercel still runs 16.2.2.
- Incremental cache: static-assets (read-only SSG output). No KV/R2/D1.

BUILD AND DEPLOY (always wrangler-vortex, never plain wrangler = Lococo account)
  npm ci
  NEXT_PUBLIC_SITE_URL=https://sodi.com.ar SODI_RELEASE_TARGET=production npx opennextjs-cloudflare build
  git checkout next-env.d.ts          # next build rewrites it
  wrangler-vortex deploy
SODI_RELEASE_TARGET=production stands in for VERCEL_ENV=production (editorial release guards in next.config.ts read it).
NEXT_PUBLIC_SITE_URL must be set at BUILD time too (metadata/canonicals are baked in).

WHAT THE WORKER ADDS (cf/worker.ts), all ported from Vercel behavior
- www.sodi.com.ar -> https://sodi.com.ar 308 (path + query kept). Active once www is routed to the Worker.
- Hosts other than sodi.com.ar / www.sodi.com.ar: X-Robots-Tag noindex, nofollow on every response; robots.txt = Disallow: /.
- vercel.json headers: /api/* no-store (except /api/boda-studio which keeps the next.config value), /blog/<slug> s-maxage CDN header.
- Prerendered pages: s-maxage=31536000 (OpenNext) rewritten to public, max-age=0, must-revalidate like Vercel.
- Redirect responses get Vercel's "Redirecting..." text/plain body + Refresh header.
next.config redirects/headers, the src/middleware.ts bot filter (403 for curl/empty UA) and all API routes run inside the Next app unchanged.

CODE CHANGES TO THE APP (small, all work on Vercel too)
- src/lib/directorio/delivery.ts: manifest imported statically instead of fs.readFile at runtime (Workers has no project filesystem).
- package.json overrides + cf/undici-shim: @vercel/blob imports undici, whose TLS ALPN is not implemented in workerd; the shim re-exports global fetch.
  Without it every Blob read/write (Bodas, RSVP) fails with "ALPNProtocols option is not implemented".
- src/app/api/boda-studio route: rate-limit identity falls back to cf-connecting-ip when not on Vercel (was a single shared bucket).
- tsconfig.json excludes cf/, .open-next, open-next.config.ts. .gitignore adds .open-next, .wrangler.

ENV / SECRETS
- wrangler.jsonc vars (not secret): NEXT_PUBLIC_SITE_URL, BODA_STUDIO_SELF_SERVE_ENABLED=true, BODA_STUDIO_PILOT_MAX_EVENTS=10.
- Secret set: BLOB_READ_WRITE_TOKEN (same PRODUCTION Blob store as Vercel; the workers.dev copy can read/write real Bodas data, so do not POST real data to it).
- NOT set (Vercel marks them Sensitive, so `vercel env pull` returns empty): MERCADOPAGO_ACCESS_TOKEN, WEDDING_ADMIN_PASSWORD, WEDDING_ADMIN_SESSION_TOKEN.
  Set before cutover:  printf '%s' '<value>' | wrangler-vortex secret put <NAME>   (from MercadoPago panel / password manager; run in a terminal, not chat)
  Unset effects today: /api/checkout 500, /api/directorio/confirm cannot verify payments, /api/boda/admin/login 503, admin APIs 503.
  DOWNLOAD_TOKEN_SECRET falls back to MERCADOPAGO_ACCESS_TOKEN; while both are unset the signing key is empty (forgeable tokens) so set MP token before routing the domain.
- Optional, were never set on Vercel: BODA_STUDIO_OPERATOR_TOKEN, DOWNLOAD_TOKEN_SECRET, NEXT_PUBLIC_META_PIXEL_ID (code default pixel is used).

PARITY
  python3 cf/parity.py https://sodi.cf-workers-20261008.workers.dev out.json
Read-only GET against https://sodi.com.ar vs the Workers URL: 516 URLs: all 487 sitemap URLs plus routes, 404s, trailing-slash redirects and API probes.
Compares status, redirect Location, content-type, cache-control; HTML compares title, description, canonical, h1, JSON-LD, hreflang, robots, OG, visible-text hash, links.

R2 STORAGE (Blob -> R2). STATUS: code + scripts ready and proven on the local R2 simulator; the REAL bucket does not exist yet.
BLOCKER: account 302f6e0f... returns "Please enable R2 through the Cloudflare Dashboard [code 10042]" (R2 never activated; dashboard > R2 Object Storage, accepts terms, may ask for a card; free tier 10 GB). Manuel must do that once.
DESIGN
- Everything in the store is PRIVATE (weddings/<slug>/guests.json + settings.json; boda-studio/<prefix>/{evt_*,limit_*,rate_*,rateip_*,selfserve_cohort}.json). 32 objects, 28 KB. No object is ever served by URL, no blob URLs are stored in any data or content (scan: 0 refs to *.blob.vercel-storage.com), so there is nothing to rewrite and no compat path is needed. The bucket has NO public access (no r2.dev, no custom domain); only the Worker binding SODI_STORAGE reads/writes it.
- src/lib/storage/objects.ts: adapter used by src/lib/boda-store.ts and src/lib/boda-service/store.ts. R2 binding wins when present (read via globalThis[Symbol.for('__cloudflare-context__')].env.SODI_STORAGE); otherwise Vercel Blob exactly as before (Vercel prod unaffected). Same keys, same JSON, same ETag semantics: put onlyIf etagMatches / create-only etagDoesNotMatch '*'. delete is head+compare+delete (R2 has no conditional delete; admin-only rare action).
- Config files: wrangler.jsonc = Blob (current, unchanged). wrangler.r2.jsonc = same Worker `sodi` + r2 binding (use ONLY at storage cutover). wrangler.r2-test.jsonc = Worker `sodi-r2-test`, workers.dev only, no routes, no BLOB token, store prefix boda-studio/test-claude-r2.
COMMANDS
  wrangler-vortex r2 bucket create sodi-storage
  # full copy / delta sync (idempotent, verifies size+md5 of every object, never deletes). Token: vercel env pull to a temp file OUTSIDE the repo, delete after.
  set -a; . /path/to/tmp.env; set +a
  node scripts/r2-sync.mjs --remote --dry-run     # compare only
  node scripts/r2-sync.mjs --remote               # copy, prints counts and "ok": true
  node scripts/r2-sync.mjs --local --wrangler-cwd "$PWD"   # same into the wrangler dev simulator
TEST (never touches production data: writes only slug test-claude-wedding-<ts> and prefix boda-studio/test-claude-r2/, fake creds)
  build as above, then: wrangler-vortex deploy -c wrangler.r2-test.jsonc
  printf '%s' test-claude-admin-pw | wrangler-vortex secret put WEDDING_ADMIN_PASSWORD -c wrangler.r2-test.jsonc   (also WEDDING_ADMIN_SESSION_TOKEN, BODA_STUDIO_OPERATOR_TOKEN=test-claude-operator-token-0123456789; fake values)
  node --experimental-strip-types cf/r2-test.mjs https://sodi-r2-test.<subdomain>.workers.dev --real-compare real.json
  (local: wrangler-vortex dev -c wrangler.r2-test.jsonc --local --port 8799 with a .dev.vars holding the same fake values)
  Delete test data: wrangler-vortex r2 object delete sodi-storage/weddings/test-claude-wedding-<ts>/guests.json (and settings.json, and boda-studio/test-claude-r2/* keys), then delete the test Worker: wrangler-vortex delete --name sodi-r2-test.
CUTOVER ORDER (only after DNS has propagated and Vercel receives no traffic)
  1. Confirm Vercel is idle (vercel logs / Analytics show no hits for sodi.com.ar; Worker serves the domain).
  2. Final delta sync: node scripts/r2-sync.mjs --remote  -> expect "ok": true, blobCount == verified. Writes that happened on Vercel/Blob since the last sync are picked up here.
  3. npx opennextjs-cloudflare build (same env as above); git checkout next-env.d.ts
  4. wrangler-vortex deploy -c wrangler.r2.jsonc     (this IS a production deploy of Worker sodi)
  5. Verify: /api/boda-studio/capabilities 200; guest invitation page + RSVP with a real code on a TEST slug is not possible on prod, so read-only: GET /api/boda/invitados?slug=mirta-y-guillermo&code=<an already seen code> matches Blob; admin panel loads guests.
  6. Leave Blob untouched (rollback). Rollback = wrangler-vortex deploy (wrangler.jsonc, Blob) BUT first re-sync any R2 writes back to Blob manually (no reverse script yet); until the Vercel downgrade, writes to R2 after cutover exist only in R2.
  7. After the Vercel downgrade/after a safe period, remove BLOB_READ_WRITE_TOKEN secret from the Worker.
