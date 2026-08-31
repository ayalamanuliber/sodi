import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAllArticles } from "../src/lib/blog-data.ts";
import {
  assertBlogReleaseCatalog,
  assertNoUnapprovedProductionEditorial,
  getSearchEligibleArticles,
} from "../src/lib/content-release/blog-release.ts";
import {
  assertEditorialRelease,
  inspectEditorialRelease,
} from "../src/lib/content-release/editorial-release.ts";
import {
  assertNoUnapprovedProductionTemplates,
  getSearchEligibleTemplateSlugs,
} from "../src/lib/content-release/template-release.ts";
import { getTemplateSlugs } from "../src/lib/template-data.ts";

const inspection = inspectEditorialRelease();
assert.equal(inspection.valid, true, inspection.errors.join(" "));
const manifest = assertEditorialRelease();
assert.equal(manifest.routes.length, 10);

for (const entry of manifest.routes) {
  const source = readFileSync(resolve(process.cwd(), entry.sourcePath));
  assert.equal(createHash("sha256").update(source).digest("hex"), entry.sourceFileSha256);
}

assert.doesNotThrow(() => assertBlogReleaseCatalog());
assert.doesNotThrow(() => assertNoUnapprovedProductionEditorial("production"));
assert.doesNotThrow(() => assertNoUnapprovedProductionTemplates("production"));

const articleSlugs = new Set(getSearchEligibleArticles(getAllArticles()).map((article) => article.slug));
for (const entry of manifest.routes.filter((route) => route.kind === "blog")) {
  assert.equal(articleSlugs.has(entry.route.slice("/blog/".length)), true, `${entry.route}: missing from discovery.`);
}

assert.deepEqual(
  getSearchEligibleTemplateSlugs(getTemplateSlugs()).sort(),
  manifest.routes.filter((entry) => entry.kind === "template").map((entry) => entry.route.slice("/plantillas/".length)).sort(),
);

console.log("SODI editorial release verified: 7 articles, 3 templates, hashes, discovery and production gates passed.");
