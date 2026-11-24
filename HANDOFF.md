# SODI Cloudflare Builds preparation

Updated 2026-11-11 by Codex migration subagent. Integration/release owner: parent migration coordinator. Prepared from origin/main `67d95b19361df019d5452028abc6ded34affe918` in isolated branch `codex/sodi-cloudflare-ci-20261111`. No push, deployment, secret or account change performed here.

## Objective and current state

Restore automatic GitHub main → existing SODI Free Worker publishing after migration. The previous CLI wrapper deliberately stripped API tokens and forced local OAuth; that cannot use Cloudflare Builds' existing scoped deployment token. The new CI path preserves that token only in Cloudflare Builds, while keeping existing manual CLI behavior unchanged.

Local guards tested using synthetic artifacts and environment values: 17 cases passed, including wrong account/branch/SHA, stale remote main, wrong production URL/target, mismatched build UUID, altered output/runtime/config, symlinks, missing token and preserved manual OAuth. JavaScript syntax checks passed. No full application rebuild or real Cloudflare build was run in this preparation; integration must verify those and production readback.

## Exact dashboard configuration

Connect the existing GitHub repository to the existing **sodi** Worker in Free account `835bcafab8d90df2d0fb6c9b8fa095e3`; production branch `main`, repository root `/`. Disable non-production branch builds/previews. Reuse the existing scoped Builds token. Do not create a Worker, paid binding or preview.

- Build command: `node scripts/build-free-ci.mjs`
- Deploy command: `npm run cf:deploy`
- Build variables: `CLOUDFLARE_ACCOUNT_ID=835bcafab8d90df2d0fb6c9b8fa095e3`, `NEXT_PUBLIC_SITE_URL=https://sodi.com.ar`, `SODI_RELEASE_TARGET=production`.
- Cloudflare supplies `WORKERS_CI=1`, `WORKERS_CI_BRANCH`, `WORKERS_CI_COMMIT_SHA`, `WORKERS_CI_BUILD_UUID` and the configured deployment token as `CLOUDFLARE_API_TOKEN`; never hardcode credentials in repository files.
- Keep repository dependency installation enabled (lockfile committed).

Built-in identity variables are documented at https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ .

## Release contract

Build and deploy require exact checked-out CI SHA equal to remote main, the production environment and reviewed Free configuration. Build invokes unchanged `npm run cf:build`, including local cache population, then emits ignored `.wrangler/sodi-ci-build.json`: current build UUID/SHA plus SHA-256 output and runtime digests. Deploy verifies that receipt and tracked-source cleanliness, then checks remote main immediately before Wrangler. CI sets `OPEN_NEXT_DEPLOY=true` to prevent OpenNext autodetection regenerating assets after receipt verification. Wrangler receives explicit config. The exact reviewed config digest blocks new resources, preview exposure or account changes until intentionally reviewed.

Only this CI route gets receipt/freshness checks. Existing manual `npm run cf:deploy [-- --dry-run]` continues to use the dedicated Free OAuth profile and strips API tokens, as requested. Remote freshness is a point-in-time check, not a distributed lock: keep one production publisher and Cloudflare's serialized Free build lane; do not overlap manual releases with CI. Subsequent builds on newer main repair a commit that arrives during an already-admitted upload.

## Next step / unresolved verification

Coordinator reviews and integrates this local commit onto refreshed main, configures Builds, verifies first real build uses the new revision and existing Free Worker, then reads production health/content/version. Do not label automatic updates restored before that end-to-end run succeeds. Subsequent content releases must reach main through existing content gates; connecting CI does not merge stale Lagos branches or grant publication to drafts.

To rerun local checks: `node scripts/test-free-ci.mjs`; `node --check scripts/build-free-ci.mjs`; `node --check scripts/deploy-free.mjs`.

## 17/11/2026 · Menos pedidos al Worker (sodi-6a50)
- robots.txt y sitemap.xml salen como assets nativos: `scripts/emit-crawl-assets.mjs` (paso de `cf:build`, despues de OpenNext) copia el `.body` prerenderizado de `src/app/robots.ts` y `src/app/sitemap.ts` a `.open-next/assets/`. Contenido byte a byte igual al de produccion del 17/11. La fuente sigue siendo robots.ts/sitemap.ts (no hay archivos en `public/`: chocarian con las rutas y ensuciarian el arbol que exige build-free-ci).
- `prefetch={false}` en enlaces de listas: indice del blog, hubs de silo, relacionados de articulo, plantillas y pie.
- El Worker (`cf/worker.ts`) ya no corre para esas dos rutas; lo unico que hacia ahi era el robots `Disallow: /` de hosts no productivos (workers.dev y previews estan apagados) y el middleware las exime del filtro de bots.
- Revertir: `git revert <commit>` (vuelve a servirlas el Worker, sin perdida de datos) y esperar el Build.

## 24/11/2026 · JSON-LD de plantilla (sodi-seo-2921, Ahrefs 697 paginas con error de rich results)
- Causa probable (no confirmada con el validador de Ahrefs): validando las paginas en vivo contra los campos de Google, en 347/349 el nodo `ProfessionalService` (tipo LocalBusiness) de `src/app/layout.tsx` no tiene `address`, y en 328 articulos `author`/`publisher` eran solo `{"@id"}` a una Organization que vive en OTRO bloque `<script>` (sin name). Unico cambio de JSON-LD en codigo la ultima semana: d4ad4c3 (17/11, logo ImageObject, email, name del WebSite).
- Arreglo c02f3b3 (main): ofertas movidas a la Organization y nodo ProfessionalService retirado (SODI no tiene direccion publica; no se inventa); `author`/`publisher` inline con name+url; ultimo item del breadcrumb con `item`; FAQPage sin `@id` relativo. Sin cambios de contenido. build, price-sources y og-cards OK. Workers Build de c02f3b3: success.
- Pendiente: verificar en vivo (curl estaba sin cuota 2500/2500, vuelve a las 00:00 ART) 5 URLs sin ProfessionalService y con author.name; esperar el crawl de Ahrefs del 1/12. Links internos a redirect (40) y title largo (2): no tocados.
- Rollback: git revert c02f3b3.
