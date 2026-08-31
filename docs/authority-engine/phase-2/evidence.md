# SODI Authority Engine — Phase 2 evidence

Observed on 2026-08-31. This record separates authenticated source data, public-page observation, repository evidence, and unknowns. It does not authorize outreach or changes to DNS, aliases, firewall, credentials, or third-party accounts.

## Referring-domain inventory

Authenticated GSC Links evidence available in the portfolio authority report records 1,188 external links to `https://sodi.com.ar/` from four referring domains. GSC did not expose every source URL in the available export, so unobservable source pages remain `Unknown` rather than inferred.

| Referring domain | GSC links | Exact observed source URL | Target | Observable context | Follow state | Classification | Evidence status |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| `caede.com.ar` | 1,182 | `https://www.caede.com.ar/` | `https://sodi.com.ar?ref=caede` | Site footer: “Soluciones digitales para empresas · sodi.com.ar” | Follow observable (`rel="noopener"`, no `nofollow`) | portfolio | Source and target observed; remaining GSC source URLs Unknown |
| `invicto.live` | 3 | `https://invicto.live/`; `https://invicto.live/privacy-policy` | `https://sodi.com.ar/` | Global footer “DEVELOPMENT BY SODI”; privacy page also names `sodi.com.ar` as the support channel | Follow observable on rendered anchors (`noreferrer` or no `nofollow`) | independent | Two source pages and three rendered anchors observed; no additional source page inferred |
| `contra.com` | 2 | `https://contra.com/community/Qw0bAkJv-conversion-focused-landing-page-for-a-digital` | `https://sodi.com.ar/` | Manuel Ayala portfolio post, “Completed work” | `nofollow` not present; `rel="noreferrer ugc"` observable | portfolio | One exact source observed; second GSC source URL Unknown |
| `nuevosnegocios.com.ar` | 1 | Unknown | `https://sodi.com.ar/` per GSC target data | Site states that it automatically detects, monitors, and classifies newly registered `.ar` domains; exact linking record was not discoverable through public search or its 28 business sitemaps | Unknown | scraper | Domain model observed; exact source URL/context Unknown |

Engagement evidence available for the same snapshot: `caede.com.ar` produced 9 GA4 sessions and 3 engaged sessions in 28 days. Referral engagement, contact, qualified opportunity, and revenue for the other domains are Unknown in the authorized evidence.

## Production technical audit

### Crawl policy and observable gateway behavior

- `https://sodi.com.ar/robots.txt` returns 200 and explicitly allows `OAI-SearchBot`, `ChatGPT-User`, `Claude-SearchBot`, and `PerplexityBot`.
- The same file explicitly disallows training/scraping agents including `GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`, `Amazonbot`, and `Applebot-Extended`. A 200 response to those user agents does not override the robots disallow rule.
- Full browser, Googlebot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot, GPTBot, and ClaudeBot user-agent probes returned 200 at the homepage.
- Generic curl returned 403 at apex and every http/www variant after canonical redirects. Sitemap and robots remained reachable. This is observable WAF/edge behavior, not a robots rule and not changed here. Owner gate: inspect account-level firewall logs only if generic non-browser clients are intended users.

### Canonicals, duplicates, redirects, and discovery

- HTTPS apex is canonical. `https://www`, `http://`, and `http://www` converge to it in one, one, and two redirects respectively.
- Homepage, blog, and diagnostic query variants return 200 with clean canonicals that omit `ref`, UTM, and internal handoff parameters.
- `https://sodi.com.ar/sitemap.xml` returned 200 with 487 unique URLs and no duplicate `<loc>` values. Article and template `lastmod` values come from their checked-in `dateModified`; static/hub entries omit false timestamps.
- `/feed.xml` and `/rss.xml` return 404. No public RSS or changelog contract exists in this phase.
- The legacy `/directorio-comercial-argentino` redirect remains a permanent one-hop route to `/directorio`.

### Rendering and performance

- Raw HTML contains the primary landing content and canonical; the site is not dependent on client JS for discovery. Browser render produced 5,506 visible text characters, no horizontal overflow at 390×844, no framework error overlay, and no page errors.
- Local browser lab observation: TTFB 35.9 ms, LCP/FCP 932 ms, CLS 0. These are not CrUX field data.
- PageSpeed Insights/CrUX field status: Unknown. The public API returned its daily quota-exceeded response for both mobile checks; no field claim is inferred from lab output.

## Funnel and attribution audit

- CAEDE uses a durable `?ref=caede` target; article and template handoffs use `origen`, `articulo`, and `recurso` parameters.
- Before this phase, those parameters reached `/diagnostico` but were dropped at completion and the final WhatsApp CTA had no event handler.
- `src/lib/source-attribution.ts` now classifies `portfolio`, `editorial`, `campaign`, `referral`, and `direct` without storing full referrer URLs. Values are lowercased, length-bounded, and reduced to safe token characters. Diagnostic completion and WhatsApp events carry the bounded classification; only controlled portfolio/editorial origins are included in the user-visible WhatsApp message.
- Cross-domain GA linker is not configured. That is intentional for now: CAEDE and SODI are distinct business properties, while `ref=caede` supplies the portfolio attribution contract. Any shared-cookie or cross-property measurement change requires an analytics ownership decision.

## Unknowns and owner gates

1. Exact GSC source rows not present in the authorized export, especially the remaining Contra URL and the Nuevos Negocios record.
2. Field CWV/CrUX until PageSpeed quota or an authorized CrUX source is available.
3. WAF rule/log cause for generic curl 403; account-level inspection only, no code-side workaround.
4. Qualified opportunities and revenue by referring domain; no CRM/revenue join was available.
