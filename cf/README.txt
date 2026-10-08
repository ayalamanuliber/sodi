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
