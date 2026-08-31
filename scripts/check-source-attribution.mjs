import assert from "node:assert/strict";
import {
  classifySourceAttribution,
  formatAttributionForMessage,
} from "../src/lib/source-attribution.ts";

const caede = classifySourceAttribution(
  new URLSearchParams("ref=caede&utm_medium=referral"),
  "https://www.caede.com.ar/socios",
);
assert.equal(caede.sourceClass, "portfolio");
assert.equal(caede.source, "caede");
assert.equal(caede.medium, "referral");

const article = classifySourceAttribution(
  new URLSearchParams("origen=blog&articulo=guia-segura"),
  "https://sodi.com.ar/blog/guia-segura",
);
assert.deepEqual(article, {
  sourceClass: "editorial",
  source: "blog",
  medium: "internal",
  asset: "guia-segura",
  referrerHost: "sodi.com.ar",
});
assert.equal(formatAttributionForMessage(article), "editorial: blog / guia-segura");

const external = classifySourceAttribution(
  new URLSearchParams(),
  "https://example.org/directory/sodi",
);
assert.equal(external.sourceClass, "referral");
assert.equal(external.source, "example.org");

const direct = classifySourceAttribution(new URLSearchParams());
assert.equal(direct.sourceClass, "direct");
assert.equal(formatAttributionForMessage(direct), undefined);

const hostileCampaign = classifySourceAttribution(
  new URLSearchParams('utm_source=%3Cscript%3Ealert(1)%3C%2Fscript%3E&utm_campaign=%22bad%22'),
);
assert.equal(hostileCampaign.source, 'script-alert-1-script');
assert.equal(hostileCampaign.campaign, 'bad');
assert.equal(formatAttributionForMessage(hostileCampaign), undefined);

console.log("source attribution checks passed");
