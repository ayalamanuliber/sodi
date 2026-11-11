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
