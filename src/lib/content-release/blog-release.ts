import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  getEditorialReleaseRoutes,
  isEditorialRouteSearchEligible,
} from "./editorial-release";

export const BLOG_RELEASE_BASELINE = {
  status: "legacy_live_baseline",
  approvedAt: "2026-08-28",
  expectedSearchEligibleCount: 467,
  approvedSlugSetSha256: "421cae56c6df5e021eb4d3add5a229cf55a8c598d3bb6324642abd606db6de25",
  approvedCatalogContentSha256: "ce107772af20fa2879f191494ff3c18e4195436d763eea477d84edd9626d2a2a",
  authority:
    "Migration baseline of the existing SODI article catalog. It preserves current coverage but is not a fresh editorial quality approval.",
} as const;

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
