import { createHash } from "node:crypto";
import { EDITORIAL_RELEASE } from "./editorial-release.generated";

export type EditorialReleaseKind = "blog" | "template";

export interface EditorialReleaseRoute {
  packetId: string;
  route: string;
  kind: EditorialReleaseKind;
  sourcePath: string;
  sourceFileSha256: string;
  contentSha256: string;
  canonical: string;
  internalLinks: string[];
  ctaDestination: string;
  release: {
    index: true;
    follow: true;
    sitemapEligible: true;
    ownerApproved: true;
    productionAuthorized: true;
  };
}

export interface EditorialReleaseManifest {
  schemaVersion: 1;
  releaseId: string;
  channel: "production_release";
  authority: "owner_authorized";
  generatedAt: string;
  expectedRouteCount: 10;
  routeSetSha256: string;
  routes: EditorialReleaseRoute[];
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function routeDigest(routes: string[]) {
  return sha256([...routes].sort().join("\n"));
}

export function inspectEditorialRelease(): {
  valid: boolean;
  errors: string[];
  manifest: EditorialReleaseManifest | null;
} {
  const errors: string[] = [];
  const manifest = EDITORIAL_RELEASE as unknown as EditorialReleaseManifest;

  if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1.");
  if (manifest.channel !== "production_release") errors.push("channel must be production_release.");
  if (manifest.authority !== "owner_authorized") errors.push("authority must be owner_authorized.");
  if (manifest.expectedRouteCount !== 10 || manifest.routes.length !== 10) {
    errors.push(`Expected exactly 10 routes; observed ${manifest.routes.length}.`);
  }

  const routes = manifest.routes.map((entry) => entry.route);
  if (new Set(routes).size !== routes.length) errors.push("Release routes must be unique.");
  if (manifest.routeSetSha256 !== routeDigest(routes)) errors.push("Route-set digest mismatch.");

  for (const entry of manifest.routes) {
    const expectedPrefix = entry.kind === "blog" ? "/blog/" : "/plantillas/";
    if (!entry.route.startsWith(expectedPrefix)) errors.push(`${entry.packetId}: route does not match kind.`);
    if (!entry.canonical.startsWith("https://sodi.com.ar/")) errors.push(`${entry.packetId}: invalid canonical.`);
    if (!entry.sourcePath.startsWith("content/") || entry.sourcePath.includes("..")) {
      errors.push(`${entry.packetId}: sourcePath must stay inside content/.`);
    }
    if (
      entry.release.index !== true ||
      entry.release.follow !== true ||
      entry.release.sitemapEligible !== true ||
      entry.release.ownerApproved !== true ||
      entry.release.productionAuthorized !== true
    ) {
      errors.push(`${entry.packetId}: release flags violate the production contract.`);
    }
  }

  return { valid: errors.length === 0, errors, manifest };
}

export function assertEditorialRelease() {
  const inspection = inspectEditorialRelease();
  if (!inspection.valid || !inspection.manifest) {
    throw new Error(`SODI editorial release failed closed. ${inspection.errors.join(" ")}`);
  }
  return inspection.manifest;
}

export function getEditorialReleaseRoutes(kind?: EditorialReleaseKind) {
  return assertEditorialRelease().routes.filter((entry) => !kind || entry.kind === kind);
}

export function isEditorialRouteSearchEligible(route: string) {
  return getEditorialReleaseRoutes().some((entry) => entry.route === route);
}
