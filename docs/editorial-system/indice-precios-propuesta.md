# SODI: índice de precios con fecha (propuesta + prototipo)

Fecha: 22/10/2026 · Ítem sodi-f1f6 · Estado: prototipo en rama, NO desplegado, NO aprobado.
Rama: `sodi/indice-precios-20261022` (repo `~/repos/sodi-indice-1022`, desde origin/main `915d5e4`; incluye `02abdd0`).

## Qué es y por qué
Una página hub, `/blog/indice-precios-servicios-digitales-argentina`, con una tabla de precios de terceros, cada fila con valor, quién lo publica, enlace a la fuente, fecha de la fuente y fecha de lectura por SODI. Un valor con fuente y fecha es citable por asistentes de IA (AI Assistant = 13,6% de sesiones, carril sodi.md). No son precios de SODI.

## Qué productos (7 rubros, 22 filas)
Solo cifras que el repo ya cita con fuente en páginas existentes. Cada rubro enlaza a su guía completa.

| Rubro | Filas | Guía de origen |
|---|---|---|
| Google Workspace | Starter USD 7, Standard USD 14, Plus USD 22 por usuario/mes | cuanto-cuesta-google-workspace-argentina |
| Agencia de marketing | Redes (Web360 $150.000-$400.000; FINMI $200.000-$600.000), SEO FINMI $200.000-$800.000, paquete Web360 $500.000-$1.500.000+ | cuanto-cuesta-agencia-de-marketing-digital-argentina |
| Community manager | Agencia Mind Circus básica $200.000-$400.000 y avanzada $400.000-$800.000; freelance Aprender21 $120.000-$600.000; sueldo Randstad semi senior BA $2.659.076-$3.861.441 | cuanto-cuesta-community-manager-argentina |
| Consultor por hora | CPCE Jujuy $130.000; CPCE Santa Fe Cám. 2 $47.495 | cuanto-cuesta-consultor-por-hora-argentina |
| Programador | Sysarmy 2026.1 medianas brutas $1.650.000 / $2.600.000 / $3.500.000; freelancermap 13-51 EUR/h (prom. 20) | cuanto-cuesta-contratar-programador-freelance-argentina |
| Auditoría SEO | FINMI USD 200; SeoExit $890.000 | cuanto-cuesta-auditoria-seo-argentina |
| Mantenimiento WordPress | Vealaonline $69.900-$179.900; WP Buffs Maintain USD 89 y Custom USD 359 | cuanto-cuesta-mantenimiento-wordpress-argentina |

Fuera a propósito: redacción SEO (la fuente UNER no tiene URL citada en el repo), Meta/Google/TikTok Ads, conversiones ARS/USD (el dólar usado difiere entre guías: $1.535 del 19/10 vs $1.545 del 21/10), y la tercera tarifa local de WordPress que el repo descartó por falta de fecha.

## De dónde sale cada precio
Tabla completa (valor, fuente, URL, fecha de la fuente, fecha de lectura) en `content/indice-precios-servicios-digitales-argentina.json` de la rama. Fecha de lectura: la que el repo ya registra para cada guía (21/10 o 22/10/2026). Re-lectura en vivo hoy, 22/10/2026, de 4 fuentes (el resto conserva la fecha del repo):
- Google Workspace pricing: USD 7/14/22 por usuario/mes, "no incluye impuestos", todo en USD. Coincide. Nota: hoy la página dice promo desde el 5/11/2026; la guía dice 4/11. El índice usa solo precio de lista, no promo.
- CPCE Jujuy: valor hora $130.000, CD 53/2026, septiembre a diciembre 2026. Coincide.
- WP Buffs: 89 / 179 / 239 / 359 USD por mes. Coincide.
- Mind Circus: publicada 14/09/2026, básico $200.000-$400.000, avanzado $400.000-$800.000. Coincide.

## Frecuencia y fecha visible
- Fecha visible: `dateModified` del artículo + columna "Leído por SODI" en cada fila + intro con "primera edición 22/10/2026".
- Frecuencia: mensual (aprovechar el disparo del IPC INDEC, fecha de publicación sin fuente leída: [?]) y fuera de calendario si un proveedor cambia su lista. Cada edición: releer todas las URLs, actualizar fila y fecha, subir dateModified solo si algo cambió.
- Un lag de más de 45 días en una fila = quitar la fila, no dejarla vieja.

## Riesgos de exactitud
1. Casi todas son listas de proveedores que venden el servicio; no son mercado. La página lo dice.
2. IVA sin aclarar en varias fuentes; la fila lo marca.
3. Dos filas de Sysarmy son medianas calculadas por SODI sobre el dataset abierto (no una cifra publicada tal cual por Sysarmy); marcado en la fila.
4. Randstad (valores al cierre de 2025) y Aprender21 (marzo 2026) son más viejas que el resto; la fecha de la fuente está en la fila. Aprender21 es blog de cursos con contradicciones internas; solo se usa su rango freelance.
5. Los precios en pesos de proveedores chicos cambian seguido; el repo marcó que Vealaonline es versión del 28/09/2026.
6. Precios en USD pagados con tarjeta suman percepciones (30% RG 5617 según la guía de Workspace, fuente secundaria): no están en la tabla. No toca el hub fiscal ARCA.
7. "Sin precio por debajo de costo": el índice no publica ningún precio de SODI ni de Lococo; todo es de terceros con fuente. Cumple el gate.
8. Ninguna fila fue revisada por una persona (evidenceStatus "agent-compiled"); los 4 re-leídos hoy son la excepción.
9. Pendiente de verificar: el rendering en móvil no se inspeccionó (solo HTML del build: 29 filas `<tr>`, noindex).

## Prototipo y gates (resultado real)
- Cambios en la rama (1 commit): `content/indice-precios-servicios-digitales-argentina.json` (nuevo), declaración `preview` en `BLOG_NON_SEARCH_RELEASES` (`baselineMember:false`), slug agregado a `strictSlugs` de `scripts/price-sources-allowlist.json`. 0 cambios en main.
- `npx next build`: OK (EXIT 0); la página sale prerenderizada con `noindex, nofollow, noarchive` y no entra al sitemap.
- `npm run test:price-sources`: OK, 17 estrictos (el índice incluido) con 0 cifras sin fuente; negativos 5/5.
- `npm run test:source-attribution`, `npm run test:crawl-policy`: OK.
- `npm run test:editorial-release`: FALLA solo por diseño en `assertNoUnapprovedProductionEditorial("production")`: "SODI production release blocked: 1 editorial routes remain unapproved (indice-precios-servicios-digitales-argentina)". Todo el resto del script pasa (verificado quitando esa línea en una copia temporal, ya borrada). Es el freno que protege de publicar un preview.
- El pin del catálogo NO se rompe con el prototipo: `inspectBlogReleaseCatalog()` da `valid=true`, hash `68712cf0…` = pin actual, 467 baseline.

## Lo que pide re-pin (lista exacta, para un sí de Manuel)
Re-pin = `approvedCatalogContentSha256` en `src/lib/content-release/blog-release.ts`.
- La página nueva sola: NO pide re-pin (no es baselineMember). Para publicarla sí hace falta, sin tocar el pin: pasar su estado `preview` a `approved`, agregarla a `releaseSources` de `scripts/build-sodi-editorial-release.mjs`, subir 18 a 19 (`expectedRouteCount` en `editorial-release.ts`, `manifest.routes.length` en `check-sodi-editorial-release.mjs`, texto del mensaje final), regenerar `editorial-release.generated.ts` y el manifest con `node scripts/build-sodi-editorial-release.mjs` (ownerApproved: decisión de Manuel; no ejecutado) y su `editorialReview` pasar a `ready_editorial`/`approved`.
- Enlazarla desde las 5 páginas top (objetivo del backlog #4): cada una es baseline, y editar su JSON cambia el digest. Simulado en copia (un párrafo "índice SODI de precios con fuente y fecha" al final de la intro de: cuanto-cuesta-facturacion-electronica-argentina, como-reducir-comisiones-mercadopago, cuanto-cuesta-community-manager-argentina, modo-vs-mercadopago-para-negocios, cuanto-cuesta-publicidad-facebook-instagram-argentina): digest observado `4e4f0cee331cbe289ad079678f23b0d0a6f093ab256338ee88faa6cd2afdc56e` (hoy pin `68712cf0…`). Ese valor es sobre main `915d5e4`; si otra rama toca contenido antes, hay que recalcularlo sobre el conjunto combinado.
- Alternativa sin re-pin: publicar el índice sin enlaces desde las top (menos descubrimiento interno) y enlazar luego.

Decisión pedida (sí/no): aprobar (a) publicar la página nueva (manifest 19 rutas, sin re-pin) y (b) re-pin a `4e4f0cee…` con los 5 enlaces. Antes de (a): releer las filas que no se re-leyeron hoy y revisar el móvil.

## Fuera de alcance respetado
Sin deploy, sin tocar `ownerApproved`/manifest/pin, sin hub fiscal ARCA, sin mensajes.
