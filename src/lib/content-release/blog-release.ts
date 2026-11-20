import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  getEditorialReleaseRoutes,
  isEditorialRouteSearchEligible,
} from "./editorial-release";
import { BLOG_MERGE_REDIRECTS, BLOG_NOINDEX_SLUGS } from "./blog-pruning.generated";

export const BLOG_RELEASE_BASELINE = {
  status: "legacy_live_baseline",
  approvedAt: "2026-08-28",
  expectedSearchEligibleCount: 467,
  approvedSlugSetSha256: "421cae56c6df5e021eb4d3add5a229cf55a8c598d3bb6324642abd606db6de25",
  // Re-pin 22/10/2026: CyberMonday (title/H1/meta) + Community Manager (title/H1/H2, sueldo con fuente). Manuel TG3533: "siempre lo que tenga más sentido, no preguntes, ejecutá bien".
  // Re-pin 22/10/2026: title/meta CTR (comisiones Mercado Pago, facturacion electronica, MODO vs MP, publicidad FB/IG sin cifras sin fuente). Manuel TG3533: "siempre lo que tenga más sentido, no preguntes, ejecutá bien".
  // Re-pin 22/10/2026: cifras de precio sin fuente (Meta Ads, agencia/freelance/consultoria/ads) con link de fuente o reescritas sin numero + gate price-sources. Manuel TG3533: "siempre lo que tenga más sentido, no preguntes, ejecutá bien".
  // Re-pin 22/10/2026: enlaces desde 5 notas existentes a las paginas nuevas de aguinaldo 2026 y vencimientos ARCA nov/dic 2026 (sodi-fc15). Lagos, correccion 22/10 (TG3533): "siempre lo que tenga mas sentido, no preguntes, ejecuta bien".
  // Re-pin 22/10/2026: lote 4 de cifras de precio sin fuente, 23 articulos mas en estricto (baseline 2416 -> 2053), link con fecha a fuente leida o reescritas sin numero. Manuel TG3533: "siempre lo que tenga mas sentido, no preguntes, ejecuta bien".
  // Re-pin 22/10/2026: lote 5 de cifras de precio sin fuente, 24 articulos mas en estricto (baseline 2053 -> 1885), reescritos sin numero. Lagos, correccion 22/10 (TG3533): "siempre lo que tenga mas sentido, no preguntes, ejecuta bien".
  // Re-pin 23/10/2026: lote 6 de cifras de precio sin fuente, 24 articulos mas en estricto (baseline 1885 -> 1706 con 8 bloques de precio propio de SODI aparte), reescritos sin numero. Lagos, correccion 22/10 (TG3533): "siempre lo que tenga mas sentido, no preguntes, ejecuta bien".
  // Re-pin 23/10/2026: calculadora de comisiones de cobro (sodi-4e6e): enlace a /herramientas/calculadora-comisiones-cobro desde las 3 notas de pagos, tasas del Plan Essential de Mobbex publicadas en mobbex.com/planes (leidas 23/10), seccion "¿Mobbex es seguro?" con el registro PSP del BCRA. Lagos, correccion 22/10 (TG3533): el re-pin no depende de Manuel.
  // Re-pin 17/11/2026 (sodi-9422): salida de la pila chica bajo la regla de Manuel del 17/11 (cambios chicos con fuente sobre paginas existentes). Sobre unico sodi-b9d7 sin la RG 5927 (BO 403 hoy), Workspace con la lectura del 17/11, Respuesta corta en 5 notas, titulos y metas de 5 paginas de segunda pagina, un enlace relacionado. Primarias releidas el 17/11: ARCA, INDEC, Xubio, WP Rocket, CACE, Google.
  // Re-pin 17/11/2026 (sodi-9422, segundo grupo): retiro de cifras sin fuente de las tandas 8 a 17 (sodi-5abc, sodi-d4dc, sodi-cbf8, sodi-980f, sodi-6b1f, sodi-f066, sodi-e3bc), FAQ y metaTitle de 2 huecos de pagina (sodi-e187), JSON-LD 41-80 y 121-160. Sin cifras nuevas. Fuera por el gate price-sources (tocan bloques de precio heredados): automatizar-whatsapp-restaurantes, chatbot-ia-vs-atencion-humana-argentina, como-centralizar-informacion-empresa, como-gestionar-stock-sin-excel, sistema-de-turnos-para-clinicas-esteticas, sistema-de-turnos-vs-whatsapp.
  // Re-pin 17/11/2026 (sodi-0f64): FAQ "costo mensual" y metaTitle de la guia de Google Ads (sodi-e187), sin cifras de precio; unico dato 30,4 dias por mes releido el 17/11 en support.google.com/google-ads/answer/2375454. Tarjeta og regenerada.
  // Re-pin 17/11/2026 (sodi-f6e6): segunda tanda chica. Indice de precios: Sysarmy enlazado al dataset abierto con su recorte y FINMI auditoria expres $300.000 (pagina finmi-auditoria-express, lectura 17/11; en octubre decia USD 200). TikTok Ads: minimo "mas de USD 50/dia por campana" y "mas de 20 por grupo" con el Centro de ayuda de TikTok (feb 2025) y ~25 resultados o 7 dias (jun 2026), sin 16-35 ni 7-14 dias sin fuente. Google Ads: percepcion ARCA RG 5617/2024 y IVA para Responsable Inscripto a consultar con contador (ARCA RG 4240 solo cubre no inscriptos). metaTitle con tildes de la guia de paginas para veterinarias. Primarias releidas el 17/11.
  // Re-pin 17/11/2026 (sodi-9918): metaTitle y metaDescription de MODO vs Mercado Pago con ano y la frase de modo.com.ar/comercios releida el 17/11 (mismas comisiones que la tarjeta; sin porcentaje: Mercado Pago devuelve 403 y no se publica cifra). Cuerpo sin cambios. Tarjeta og regenerada.
  // Re-pin 17/11/2026 (sodi-47eb, tanda para el OK de Manuel, rama tanda/sodi-20261117): cuanto-cuesta-mantenimiento-pagina-web sin rangos de precio sin fuente, costos fijos con la primaria de cada proveedor releida el 17/11 (Donweb, BanaHosting, SiteGround, DigitalOcean, BlogVault, UptimeRobot), sodi-151b. Publicado con el OK de Manuel del 17/11 (tanda-sodi-20261117-1215).
  // Re-pin 17/11/2026 (sodi-76b8): metaTitle de 3 paginas con posicion <=10 y CTR bajo (comisiones de Mercado Pago, alternativas a Mercado Pago, factura electronica) y metaDescription de alternativas a Mercado Pago, consulta real al inicio. Sin cifras nuevas; cuerpo sin cambios. Informe projects/contenido-seo/informes/sodi-titulos-20261117.md en lagos-lab.
  // Re-pin 18/11/2026 (sodi-4b5e, lote 3 de relecturas de primaria): Tiendanube vs Empretienda con precios publicados de ambas (Tiendanube Esencial/Escala, Empretienda $10.490) y sin conteos de tiendas, plantillas ni apps sin primaria; WhatsApp para farmacias sin porcentajes de volumen, facturacion ni retencion sin fuente; posicionamiento en Google Maps sin llamadas por mes sin fuente; fechas de consulta de Wati, Botmaker, Calendly, Cal.com y Mailchimp releidas el 18/11. Informe projects/contenido-seo/informes/sodi-chicos-lote3-20261118.md en lagos-lab.
  // Re-pin 18/11/2026 (sodi-48f9): fuente UNER 404 resuelta y vigencia de la RG 5617. Redaccion SEO: Agencia Palabra (404 el 17/11) reemplazada por el PDF primario del tarifario FCEDU-UNER de agosto 2026 (leido 18/11), tabla recalculada (nota $9.200-$11.550, inedito $20.650-$28.700, ghostwriting $37.400-$54.500 por 1.000 caracteres; rango $55.000-$327.000 por 1.000 palabras). RG 5617/2024: texto consolidado en Infoleg (argentina.gob.ar/normativa/nacional/norma-407430) estado Vigente con RG 5672 y 5677 de 2025, 30% en art. 6, leido 18/11 y citado con fecha en 6 guias; Boletin Oficial 403 sin rodear, Anexo de portales excluidos no legible. Informe projects/contenido-seo/informes/sodi-48f9-uner-rg5617-20261118.md en lagos-lab.
  // Re-pin 18/11/2026 (sodi-bb44, lote 4 de relecturas de primaria): cobrar con QR con fechas de BCRA, MODO y Uala releidas el 18/11 y sin plazos de acreditacion ni tiempos sin fuente; turnos para gimnasios y nutricionistas sin el plan de $32.900 ni "+ IVA" de Cloxsy que su pagina no publica; CRM para pymes con Bitrix24 Free corregido a 1-2 usuarios, enlace a Zoho y sin porcentajes de PyMEs sin fuente; app de turnos sin el 40-60% de ausencias atribuido a AgendaPro; fechas de consulta de Caterease y Pixieset releidas. Aguinaldo sin cambio: Infoleg 403 desde la box. Informe projects/contenido-seo/informes/sodi-chicos-lote4-20261118.md en lagos-lab.
  // Re-pin 18/11/2026 (sodi-2759, lote 5, cifras sin enlace a primaria): TikTok vs Facebook Ads con DataReportal Digital 2026 Argentina leido el 18/11 (TikTok 29,2 M, Facebook 29,3 M, Instagram 31,1 M) en lugar de "140%" y "35M+", sin CPA 40% ni 80% de opciones sin fuente; software a medida, UX/UI, mantenimiento web, opticas, restaurantes, abogados y Excel vs sistema sin porcentajes sin fuente (70%, 30-50%, 40-60%, 60%, 20-200%, 90%, 95%, 80%, 65%, 72%, 88%). Informe projects/contenido-seo/informes/sodi-fuentes-sin-enlace-20261118.md en lagos-lab.
  // Re-pin 18/11/2026 (sodi-84d1, lote 6, cifras sin enlace a primaria): marketing digital vs tradicional sin CPC ni tarifas de medios tradicionales sin fuente; clubes deportivos sin el 30% de morosidad recuperada (y 150-200 cuotas corregido a unas 150); WhatsApp para transporte sin 50%, 60% ni 70%; WhatsApp vs email sin aperturas, respuestas, ROI de USD 36 ni tarifas sin fuente; publicidad online vs tradicional con DataReportal Digital 2026 Argentina (41,6 M de usuarios, 90,6%) en lugar de "78% todos los dias" y "5-8% anual"; que es marketing digital, turnos vs WhatsApp y atencion al cliente sin porcentajes sin fuente. Aguinaldo releido en argentina.gob.ar sin cambio de contenido (pagina fijada en el manifiesto editorial). Informe projects/contenido-seo/informes/sodi-fuentes-lote6-20261118.md en lagos-lab.
  // Re-pin 18/11/2026 (sodi-4203, lote 7 + RG 5677): community manager sin engagement ni cuentas por agencia sin fuente; facturacion electronica con estimaciones rotuladas y sin juicios sobre SOAP; sin facturar sin intimaciones "multiplicadas" ni plazo de 15 dias; programador freelance sin el 50% CABA; abogados con el reparto rotulado propuesta de SODI; agencias con enlaces a Mind Circus, FINMI, Hostinger y Point Web; Meta Ads con el plazo de 3 meses rotulado criterio propio; Workspace con la RG 5677 enlazada y el Anexo no leido declarado; aguinaldo con LCT/Decreto 1078/Ley 23.041 releidos en Argentina.gob.ar; manifiesto editorial regenerado (3 paginas fijadas por hash).
  // Re-pin 18/11/2026 (sodi-98de, lote 8, cifras sin enlace a primaria): SEO en Argentina sin los crecimientos de trafico 20-40% y 100-300% ni el rango de 10-50 competidores, con los plazos rotulados como estimacion de SODI (los rangos en USD quedan sin tocar: bloques heredados sin fuente, cambiarlos exige fuente); WhatsApp para restaurantes sin tarifas de Botmaker, ChatCompose, PideDirecto ni Peel (sin tarifa publica legible el 18/11), sin USD 500-1.500 de comisiones, 25-35% ni 30-50% de no-shows; redes para nutricionistas y coaches con los porcentajes de contenido y 3-4x de engagement rotulados como criterio de SODI. Aguinaldo ya enlazado a argentina.gob.ar en d61bed6 (lote 7). Informe projects/contenido-seo/informes/sodi-aguinaldo-lote8-20261118.md en lagos-lab.
  // Re-pin 18/11/2026 (sodi-f1c0, publicacion de amarillos espera-manuel sin tarjeta, regla 17/11): WhatsApp Business con cobro por mensaje desde 01/07/2025 y limite inicial de 250 releidos en Meta el 18/11; cifras sin fuente retiradas o rotuladas como criterio de SODI en 5 guias (envios, logo, ERP, panel operativo, WhatsApp) y 3 (CRM, email marketing, HubSpot vs Zoho) con horas de configuracion sin fuente retiradas o rotuladas; IPC de octubre 2026 (INDEC, leido 18/11) en el indice de precios.
  // Re-pin 18/11/2026 (sodi-0b61, pre-vuelo lote 8, regla 17/11): SEO en Argentina con el rango en pesos de FINMI (leido 02/11) y Ahrefs rotulado como dato no argentino (leido 18/11) en lugar de los rangos en USD sin fuente en meta, intro y FAQ, sin el 80% de las PyMEs; WhatsApp para restaurantes sin el monto de setup custom sin fuente.
  // Re-pin 18/11/2026 (sodi-e441, publicacion de la tanda sodi-f1c0 aprobada por Manuel 18/11 11:20): bloque "Respuesta corta" con montos de terceros en 8 guias cuanto-cuesta (agencia, community manager, consultor por hora, consultoria, programador freelance, mantenimiento web, Facebook/Instagram, software a medida), 10 fuentes releidas el 18/11 y montos verificados; etiqueta de la intro renombrada en 3 paginas que ya abrian con Respuesta corta (community manager, programador, software a medida)
  // Re-pin 19/11/2026 (sodi-f959, radar fiscal): fecha de consulta a ARCA actualizada a 19/11/2026 en 3 notas (que-pasa-si-vendo-online-sin-facturar, como-preparar-negocio-para-vender-online, como-vender-por-internet-argentina) tras releer arca.gob.ar/monotributo/categorias.asp el 19/11 (valores desde 1/08/2026 sin cambio: categoria A $12.009.410,45 y $49.527,18/mes, B $17.595.182,74 y $56.379,08/mes). Sin cambio de cifras.
  // Re-pin 19/11/2026 (sodi-6664, regla 17/11): bloque "Respuesta corta" sin cifras al inicio de la intro en redes-sociales-para-nutricionistas-coaches y redes-sociales-para-constructoras (editoriales; manufactura y presencia-digital se saltan por traer precios). Sin cambio de cifras.
  // Re-pin 19/11/2026 (sodi-0da9, precios en falta primaria): hosting con Respuesta corta de Hostinger releido el 19/11 (ARS 2.499 / 9.699) y DonWeb sin cifra (su tarifario cambio y no rotula el periodo); pagina web para inmobiliarias con Respuesta corta sin cifras. Alternativas a Mercado Pago sin cambio: Mercado Pago dio 403 el 19/11. Informe projects/contenido-seo/informes/sodi-precios-primaria-20261119.md en lagos-lab.
  // Re-pin 20/11/2026 (sodi-cifras-top, sodi-1121): releidas las primarias del top 10 por impresiones (ARCA agenda, Randstad, Aprender21, Web360, Develop Argentina, FINMI, TikTok Ads, MODO, DonWeb, Mobbex, RG 5617). Software a medida sin el 70% de PyMEs, el 15-20% de mantenimiento, el 1,3-1,5x y los plazos sin fuente (plazos de Develop Argentina); MODO vs Mercado Pago sin el 0% de transferencia sin fuente.
  approvedCatalogContentSha256: "77c4419c92645fbf21a571767db476d48cd867e7243b8f2ad5594cbbfa5f05c5",
  authority:
    "Migration baseline of the existing SODI article catalog. It preserves current coverage but is not a fresh editorial quality approval.",
} as const;

// Pruned programmatic pages (blog-pruning.generated.ts). Their content files are unchanged, so
// they keep their file digest; only their search eligibility changes.
const PRUNED_RELEASES = Object.fromEntries(
  [...Object.keys(BLOG_MERGE_REDIRECTS), ...BLOG_NOINDEX_SLUGS].map((slug) => [
    slug,
    {
      status: "retired" as const,
      reason: "Pagina programatica sin senal de busqueda: poda 20/10/2026.",
      baselineMember: true,
    },
  ]),
);

// Any new local article must be declared here until it receives editorial and
// release approval. Declared previews remain renderable locally, but never enter
// the sitemap or inherit indexable metadata.
export const BLOG_NON_SEARCH_RELEASES: Readonly<Record<string, {
  status: "approved" | "preview" | "hold" | "retired";
  reason: string;
  packetId?: string;
  reviewGate?: string;
  baselineMember?: boolean;
  approvedContentSha256?: string;
}>> = {
  ...PRUNED_RELEASES,
  "costo-total-erp-pyme-argentina": {
    status: "approved",
    reason: "Artículo nuevo compilado desde el corpus 2026-08-27; requiere revisión local y autorización.",
    packetId: "sodi-content-sodi-010-v1",
    reviewGate: "No comparar períodos distintos ni inventar ROI, ahorro o valores de proveedor.",
    baselineMember: false,
  },
  "hot-sale-2026-ecommerce-argentina": {
    status: "approved",
    reason: "Activo estacional nuevo; requiere revalidación de fecha y condiciones antes de cualquier publicación.",
    packetId: "sodi-content-sodi-045-v1",
    reviewGate: "Revalidar fecha oficial, condiciones comerciales y medios de pago antes de publicar.",
    baselineMember: false,
  },
  "como-hacer-aparecer-negocio-google-maps": {
    status: "approved",
    reason: "Refresh editorial listo para revisión local; todavía no tiene aprobación de publicación.",
    packetId: "sodi-content-sodi-059-v1",
    reviewGate: "Revalidar políticas, etiquetas de interfaz y funciones del producto antes de nombrarlas.",
    baselineMember: true,
    approvedContentSha256: "2422023338803382ce29c36d8ac3073970c94910c6a4df554f969fe62891e18c",
  },
  "software-a-medida-vs-estandar": {
    status: "approved",
    reason: "Refresh editorial listo para revisión local; todavía no tiene aprobación de publicación.",
    packetId: "sodi-content-sodi-090-v1",
    reviewGate: "Verificar capacidades y contratos de cualquier producto usado como ejemplo.",
    baselineMember: true,
    approvedContentSha256: "077bd9db52e4dd360b3b296bb85074ee8f40797fcd92441f203e182e9dfaccdb",
  },
  "agencia-web-vs-freelancer": {
    status: "approved",
    reason: "Refresh editorial listo para revisión local; todavía no tiene aprobación de publicación.",
    packetId: "sodi-content-sodi-100-v1",
    reviewGate: "Revisar que ejemplos o claims de capacidad correspondan al proveedor evaluado.",
    baselineMember: true,
    approvedContentSha256: "741bf5cb3da321f16b9dd8965b1cd714f7063cd0d3529a11ebd203769ffea683",
  },
  "pagina-web-para-inmobiliarias": {
    status: "approved",
    reason: "Refresh editorial listo para revisión local; todavía no tiene aprobación de publicación.",
    packetId: "sodi-content-sodi-069-v1",
    reviewGate: "Verificar integraciones, permisos sobre fotos y datos, y capacidad real de actualización.",
    baselineMember: true,
    approvedContentSha256: "c19ff67587abf848b0c68d3a0150004627917e229831f6c1ef68d1283c8835c2",
  },
  "whatsapp-manual-vs-bot-automatico": {
    status: "approved",
    reason: "Refresh editorial listo para revisión local; todavía no tiene aprobación de publicación.",
    packetId: "sodi-content-sodi-058-v1",
    reviewGate: "Revisar capacidades de cualquier proveedor nombrado y conservar un escalamiento humano real.",
    baselineMember: true,
    approvedContentSha256: "bfa4e4191122c6f601014af984c865de79ea15eb17e4b2ddc2095e4e6f6f6da5",
  },
  "cuanto-cuesta-shopify-argentina": {
    status: "approved",
    reason: "Pagina nueva de precios (radar SODI 24/10/2026): planes en dolares, pago anual y cargo por pasarela externa leidos en la pagina oficial de Shopify para Argentina el 24/10/2026; autocompletado 'shopify precio argentina'.",
    packetId: "sodi-radar3-20261024-01-v1",
    reviewGate: "Revalidar precios en shopify.com/ar/precios antes de subir dateModified.",
    baselineMember: false,
  },
  "cuanto-cuesta-empretienda-argentina": {
    status: "approved",
    reason: "Pagina nueva de precios (radar SODI 24/10/2026): precio fijo, sin comision por venta y condiciones leidos en empretienda.com y sus preguntas frecuentes el 24/10/2026; autocompletado 'cuanto cuesta empretienda por mes'.",
    packetId: "sodi-radar3-20261024-02-v1",
    reviewGate: "Revalidar el precio en empretienda.com antes de subir dateModified.",
    baselineMember: false,
  },
  "cuanto-cuesta-agencia-de-marketing-digital-argentina": {
    status: "approved",
    reason: "Pagina nueva de precios (escala 21/10/2026): demanda en GSC sin pagina propia; rango armado con fuentes fechadas listadas en la propia pagina.",
    packetId: "sodi-escala-20261021-01-v1",
    reviewGate: "Revalidar precios y fuentes antes de subir dateModified; los rangos no son tarifas del proveedor salvo donde la pagina lo dice.",
    baselineMember: false,
  },
  "cuanto-cuesta-auditoria-seo-argentina": {
    status: "approved",
    reason: "Pagina nueva de precios (escala 21/10/2026): demanda en GSC sin pagina propia; rango armado con fuentes fechadas listadas en la propia pagina.",
    packetId: "sodi-escala-20261021-02-v1",
    reviewGate: "Revalidar precios y fuentes antes de subir dateModified; los rangos no son tarifas del proveedor salvo donde la pagina lo dice.",
    baselineMember: false,
  },
  "cuanto-cuesta-consultor-por-hora-argentina": {
    status: "approved",
    reason: "Pagina nueva de precios (escala 21/10/2026): demanda en GSC sin pagina propia; rango armado con fuentes fechadas listadas en la propia pagina.",
    packetId: "sodi-escala-20261021-03-v1",
    reviewGate: "Revalidar precios y fuentes antes de subir dateModified; los rangos no son tarifas del proveedor salvo donde la pagina lo dice.",
    baselineMember: false,
  },
  "cuanto-cuesta-contratar-programador-freelance-argentina": {
    status: "approved",
    reason: "Pagina nueva de precios (escala 21/10/2026): demanda en GSC sin pagina propia; rango armado con fuentes fechadas listadas en la propia pagina.",
    packetId: "sodi-escala-20261021-04-v1",
    reviewGate: "Revalidar precios y fuentes antes de subir dateModified; los rangos no son tarifas del proveedor salvo donde la pagina lo dice.",
    baselineMember: false,
  },
  "cuanto-cuesta-google-workspace-argentina": {
    status: "approved",
    reason: "Pagina nueva de precios (escala 21/10/2026): demanda en GSC sin pagina propia; rango armado con fuentes fechadas listadas en la propia pagina.",
    packetId: "sodi-escala-20261021-05-v1",
    reviewGate: "Revalidar precios y fuentes antes de subir dateModified; los rangos no son tarifas del proveedor salvo donde la pagina lo dice.",
    baselineMember: false,
  },
  "cuanto-cuesta-mantenimiento-wordpress-argentina": {
    status: "approved",
    reason: "Pagina nueva de precios (escala 21/10/2026): demanda en GSC sin pagina propia; rango armado con fuentes fechadas listadas en la propia pagina.",
    packetId: "sodi-escala-20261021-06-v1",
    reviewGate: "Revalidar precios y fuentes antes de subir dateModified; los rangos no son tarifas del proveedor salvo donde la pagina lo dice.",
    baselineMember: false,
  },
  "cuanto-cuesta-redaccion-contenidos-seo-argentina": {
    status: "approved",
    reason: "Pagina nueva de precios (escala 21/10/2026): demanda en GSC sin pagina propia; rango armado con fuentes fechadas listadas en la propia pagina.",
    packetId: "sodi-escala-20261021-07-v1",
    reviewGate: "Revalidar precios y fuentes antes de subir dateModified; los rangos no son tarifas del proveedor salvo donde la pagina lo dice.",
    baselineMember: false,
  },
  "indice-precios-servicios-digitales-argentina": {
    status: "approved",
    reason: "Aprobado por Manuel 22/10/2026 (tarjeta 6c82f0a2): indice de precios con fuente y fecha por fila, 22 filas releidas hoy.",
    packetId: "sodi-indice-20261022-01-v1",
    reviewGate: "Releer cada fuente antes de aprobar; no convertir monedas ni promediar; sin precios propios de SODI.",
    baselineMember: false,
  },
  "aguinaldo-2026-pymes-como-calcular-cuando-pagar": {
    status: "approved",
    reason: "Pagina nueva estacional (22/10/2026): aguinaldo de diciembre 2026 para pymes; reglas citadas de LCT arts. 121-123 y 128 y Decreto 1078/1984 leidos el 22/10/2026.",
    packetId: "sodi-aguinaldo-20261022-01-v1",
    reviewGate: "Releer LCT art. 122 (fechas) y 128 antes de cualquier cambio; el ejemplo usa sueldos ficticios; sin alicuotas de cargas sociales.",
    baselineMember: false,
  },
  "vencimientos-arca-diciembre-2026": {
    status: "approved",
    reason: "Pagina nueva estacional (17/11/2026, tanda con OK de Manuel): vencimientos ARCA diciembre 2026 tomados de la agenda oficial de ARCA leida el 17/11/2026; enero 2027 no estaba cargado.",
    packetId: "sodi-venc-20261117-01-v1",
    reviewGate: "Releer la agenda oficial de ARCA antes de cada cambio de fecha; sumar enero 2027 solo cuando ARCA lo cargue; sin calendarios de terceros; descargo YMYL (consultar contador).",
    baselineMember: false,
  },
  "calendario-vencimientos-arca": {
    status: "approved",
    reason: "Pagina fija nueva (17/11/2026, tanda con OK de Manuel): calendario de vencimientos ARCA que apunta a la pagina del mes vigente.",
    packetId: "sodi-venc-20261117-02-v1",
    reviewGate: "Cada mes actualizar el enlace al mes vigente tras releer la agenda oficial de ARCA; descargo YMYL.",
    baselineMember: false,
  },
  "vencimientos-arca-noviembre-diciembre-2026": {
    status: "approved",
    reason: "Pagina nueva estacional (22/10/2026): vencimientos ARCA noviembre y diciembre 2026 tomados de la agenda oficial de ARCA leida el 22/10/2026.",
    packetId: "sodi-venc-20261022-01-v1",
    reviewGate: "Releer la agenda oficial de ARCA antes de cada cambio de fecha; sin calendarios de terceros; descargo YMYL (consultar contador).",
    baselineMember: false,
  },
  "black-friday-argentina-2026-ecommerce-pyme": {
    status: "approved",
    reason: "Pagina nueva estacional (22/10/2026): Black Friday 2026 para ecommerce pyme; fecha y fuentes citadas en la propia pagina.",
    packetId: "sodi-bf-20261022-01-v1",
    reviewGate: "Revalidar fecha de Black Friday y condiciones de medios de pago antes de subir dateModified; no inventar cifras de ventas.",
    baselineMember: false,
  },
};

type CatalogArticle = { slug: string };
type CatalogReleaseEntry = CatalogArticle & { contentSha256: string };

type ReleaseInspection = {
  valid: boolean;
  catalogCount: number;
  baselineMemberCount: number;
  searchEligibleCount: number;
  nonSearchCount: number;
  approvedSlugSetSha256: string;
  expectedSearchEligibleCount: number;
  expectedSlugSetSha256: string;
  catalogContentSha256: string | null;
  expectedCatalogContentSha256: string;
  undeclaredSlugs: string[];
  declaredMissingSlugs: string[];
};

function contentDirectory() {
  return path.join(process.cwd(), "content");
}

function readCatalogEntries(): CatalogReleaseEntry[] {
  const directory = contentDirectory();
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      try {
        const raw = fs.readFileSync(path.join(directory, fileName), "utf8");
        const parsed = JSON.parse(raw) as Partial<CatalogArticle>;
        if (typeof parsed.slug !== "string") return null;
        return {
          slug: parsed.slug,
          contentSha256: createHash("sha256").update(raw).digest("hex"),
        };
      } catch {
        return null;
      }
    })
    .filter((entry): entry is CatalogReleaseEntry => Boolean(entry))
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

function digestSlugs(slugs: string[]) {
  return createHash("sha256").update(slugs.join("\n")).digest("hex");
}

export function evaluateBlogReleaseSlugs(inputSlugs: string[]): ReleaseInspection {
  const catalogSlugs = [...new Set(inputSlugs)].sort();
  const declaredNonSearch = Object.keys(BLOG_NON_SEARCH_RELEASES).sort();
  const declaredNonSearchSet = new Set(declaredNonSearch);
  const baselineMemberSlugs = catalogSlugs.filter((slug) => {
    const release = BLOG_NON_SEARCH_RELEASES[slug];
    return !release || release.baselineMember === true;
  });
  const searchEligibleSlugs = catalogSlugs.filter((slug) => {
    const release = BLOG_NON_SEARCH_RELEASES[slug];
    return !release || release.status === "approved";
  });
  const approvedSlugSetSha256 = digestSlugs(baselineMemberSlugs);
  const declaredMissingSlugs = declaredNonSearch.filter(
    (slug) => !catalogSlugs.includes(slug),
  );
  const valid =
    baselineMemberSlugs.length === BLOG_RELEASE_BASELINE.expectedSearchEligibleCount &&
    approvedSlugSetSha256 === BLOG_RELEASE_BASELINE.approvedSlugSetSha256 &&
    declaredMissingSlugs.length === 0;

  return {
    valid,
    catalogCount: catalogSlugs.length,
    baselineMemberCount: baselineMemberSlugs.length,
    searchEligibleCount: searchEligibleSlugs.length,
    nonSearchCount: catalogSlugs.length - searchEligibleSlugs.length,
    approvedSlugSetSha256,
    expectedSearchEligibleCount: BLOG_RELEASE_BASELINE.expectedSearchEligibleCount,
    expectedSlugSetSha256: BLOG_RELEASE_BASELINE.approvedSlugSetSha256,
    catalogContentSha256: null,
    expectedCatalogContentSha256: BLOG_RELEASE_BASELINE.approvedCatalogContentSha256,
    undeclaredSlugs: valid
      ? []
      : catalogSlugs.filter((slug) => !declaredNonSearchSet.has(slug)),
    declaredMissingSlugs,
  };
}

export function evaluateBlogReleaseEntries(entries: CatalogReleaseEntry[]): ReleaseInspection {
  const membership = evaluateBlogReleaseSlugs(entries.map((entry) => entry.slug));
  const baselineEntries = entries
    .filter((entry) => {
      const release = BLOG_NON_SEARCH_RELEASES[entry.slug];
      return !release || release.baselineMember === true;
    })
    .map((entry) => {
      const release = BLOG_NON_SEARCH_RELEASES[entry.slug];
      if (!release?.baselineMember) return entry;
      if (release.status === "retired") return entry;
      if (!release.approvedContentSha256) {
        return { ...entry, contentSha256: "missing-approved-content-digest" };
      }
      return { ...entry, contentSha256: release.approvedContentSha256 };
    })
    .sort((left, right) => left.slug.localeCompare(right.slug));
  const catalogContentSha256 = createHash("sha256")
    .update(baselineEntries.map((entry) => `${entry.slug}:${entry.contentSha256}`).join("\n"))
    .digest("hex");

  return {
    ...membership,
    valid:
      membership.valid &&
      catalogContentSha256 === BLOG_RELEASE_BASELINE.approvedCatalogContentSha256,
    catalogContentSha256,
  };
}

export function inspectBlogReleaseCatalog(): ReleaseInspection {
  return evaluateBlogReleaseEntries(readCatalogEntries());
}

export function assertBlogReleaseCatalog() {
  const inspection = inspectBlogReleaseCatalog();
  if (inspection.valid) return inspection;

  throw new Error(
    [
      "SODI blog release gate failed closed.",
      `Expected ${inspection.expectedSearchEligibleCount} baseline slugs with digest ${inspection.expectedSlugSetSha256}.`,
      `Observed ${inspection.baselineMemberCount} baseline members with digest ${inspection.approvedSlugSetSha256}.`,
      `Expected content digest ${inspection.expectedCatalogContentSha256}; observed ${inspection.catalogContentSha256 ?? "unavailable"}.`,
      "Declare new local content in BLOG_NON_SEARCH_RELEASES or update the baseline only after editorial and release approval.",
    ].join(" "),
  );
}

export function isBlogArticleSearchEligible(slug: string) {
  const inspection = inspectBlogReleaseCatalog();
  if (!inspection.valid) return false;
  if (isEditorialRouteSearchEligible(`/blog/${slug}`)) return true;
  return !(slug in BLOG_NON_SEARCH_RELEASES);
}

export function getSearchEligibleArticles<T extends CatalogArticle>(articles: T[]) {
  assertBlogReleaseCatalog();
  const releaseSlugs = new Set(
    getEditorialReleaseRoutes("blog").map((entry) => entry.route.slice("/blog/".length)),
  );
  return articles.filter(
    (article) => !(article.slug in BLOG_NON_SEARCH_RELEASES) || releaseSlugs.has(article.slug),
  );
}

export function assertNoUnapprovedProductionEditorial(
  releaseTarget = process.env.VERCEL_ENV ?? process.env.SODI_RELEASE_TARGET,
) {
  if (releaseTarget !== "production") return;
  const blocked = Object.entries(BLOG_NON_SEARCH_RELEASES)
    .filter(([, release]) => release.status === "preview" || release.status === "hold")
    .map(([slug]) => slug);
  if (blocked.length === 0) return;
  throw new Error(
    `SODI production release blocked: ${blocked.length} editorial routes remain unapproved (${blocked.join(", ")}).`,
  );
}
