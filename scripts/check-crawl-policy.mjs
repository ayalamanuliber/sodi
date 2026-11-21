import assert from "node:assert/strict";
import robots from "../src/app/robots.ts";

const policy = robots();
assert.ok(Array.isArray(policy.rules), "robots policy must expose grouped rules");

function findRule(userAgent) {
  return policy.rules.find((rule) => {
    const agents = Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent];
    return agents.includes(userAgent);
  });
}

// Policy since 8d444f4 (Manuel 19/11/2026): search bots, user-triggered bots and
// reputable AI crawlers are welcome; only SEO scrapers and bulk harvesters are blocked.
for (const userAgent of [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
]) {
  const rule = findRule(userAgent);
  assert.equal(rule?.allow, "/", `${userAgent} must be allowed to crawl public pages`);
  assert.equal(rule?.disallow, undefined, `${userAgent} must not inherit the bulk-crawler block`);
}

for (const userAgent of ["AhrefsBot", "SemrushBot", "MJ12bot", "Bytespider", "DataForSeoBot"]) {
  const rule = findRule(userAgent);
  assert.equal(rule?.disallow, "/", `${userAgent} must remain blocked`);
  assert.equal(rule?.allow, undefined, `${userAgent} must not be in the allow group`);
}

assert.equal(policy.sitemap, "https://sodi.com.ar/sitemap.xml");
console.log("Crawl policy verified: search, user-triggered and reputable AI bots (GPTBot, ClaudeBot included) allowed; SEO scrapers and bulk crawlers blocked.");
