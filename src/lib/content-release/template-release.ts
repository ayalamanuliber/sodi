import {
  getEditorialReleaseRoutes,
  isEditorialRouteSearchEligible,
} from "./editorial-release";

export const TEMPLATE_NON_SEARCH_RELEASES = {
  "presupuesto-servicios-digitales": {
    packetId: "sodi-content-sodi-012-v1",
    status: "approved",
  },
  "checklist-conciliacion-pagos-ecommerce": {
    packetId: "sodi-content-sodi-019-v1",
    status: "approved",
  },
  "dashboard-operativo-pyme": {
    packetId: "sodi-content-sodi-086-v1",
    status: "approved",
  },
} as const;

export function assertNoUnapprovedProductionTemplates(
  releaseTarget = process.env.VERCEL_ENV ?? process.env.SODI_RELEASE_TARGET,
) {
  if (releaseTarget !== "production") return;
  const blocked = Object.entries(TEMPLATE_NON_SEARCH_RELEASES)
    .filter(([, release]) => release.status !== "approved")
    .map(([slug]) => slug);
  if (!blocked.length) return;
  throw new Error(
    `SODI production release blocked: ${blocked.length} template previews remain unapproved (${blocked.join(", ")}).`,
  );
}

export function isTemplateResourceSearchEligible(slug: string) {
  return isEditorialRouteSearchEligible(`/plantillas/${slug}`);
}

export function getSearchEligibleTemplateSlugs(slugs: string[]) {
  const candidates = new Set(
    getEditorialReleaseRoutes("template").map((entry) => entry.route.slice("/plantillas/".length)),
  );
  return slugs.filter((slug) => candidates.has(slug));
}
