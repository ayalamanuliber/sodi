// Copies the prerendered robots.txt and sitemap.xml (Next metadata routes, same content as before)
// into .open-next/assets so Cloudflare serves them as native static assets without invoking the Worker.
// Output goes to the ignored .open-next dir on purpose: a tracked public/robots.txt would conflict with
// src/app/robots.ts and dirty the tree (build-free-ci.mjs requires `git diff --exit-code HEAD`).
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const checks = {
  "robots.txt": (t) => /^User-agent: \*/im.test(t) && /^Sitemap: https:\/\/sodi\.com\.ar\/sitemap\.xml$/m.test(t),
  "sitemap.xml": (t) => t.includes("<urlset") && t.includes("<loc>https://sodi.com.ar</loc>") && (t.match(/<url>/g) || []).length > 50,
};
for (const [name, ok] of Object.entries(checks)) {
  const from = path.join(root, ".next/server/app", `${name}.body`);
  const to = path.join(root, ".open-next/assets", name);
  if (!fs.existsSync(from)) throw new Error(`emit-crawl-assets: missing prerendered ${from}`);
  const text = fs.readFileSync(from, "utf8");
  if (!ok(text)) throw new Error(`emit-crawl-assets: ${name} content failed sanity check`);
  fs.copyFileSync(from, to);
  console.log(`emit-crawl-assets: ${name} -> .open-next/assets (${text.length} bytes)`);
}
