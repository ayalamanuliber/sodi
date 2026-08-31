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

for (const userAgent of [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "PerplexityBot",
]) {
  const rule = findRule(userAgent);
  assert.equal(rule?.allow, "/", `${userAgent} must be allowed to crawl public pages`);
  assert.equal(rule?.disallow, undefined, `${userAgent} must not inherit the training-bot block`);
}

for (const userAgent of ["GPTBot", "ClaudeBot"]) {
  const rule = findRule(userAgent);
  assert.equal(rule?.disallow, "/", `${userAgent} must remain blocked`);
  assert.equal(rule?.allow, undefined, `${userAgent} must not be in the search-bot allow group`);
}

assert.equal(policy.sitemap, "https://sodi.com.ar/sitemap.xml");
console.log("Crawl policy verified: search and user-triggered bots allowed; GPTBot and ClaudeBot blocked.");
