import type { MetadataRoute } from "next";

// Reputable search, AI-assistant and AI-training crawlers that honor robots.txt.
// Manuel 19/11/2026: SODI wants to be found and cited by AI tools, so good AI bots are welcome.
const ALLOWED_SEARCH_AND_AI_BOTS = [
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
];

// SEO scrapers, bulk harvesters and crawlers for markets SODI does not serve.
const BULK_CRAWL_BOTS = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "BLEXBot",
  "SearchmetricsBot",
  "ScraperForce",
  "Scrapy",
  "DataForSeoBot",
  "Bytespider",
  "PetalBot",
  "ZoominfoBot",
  "Diffbot",
  "omgili",
  "Barkrowler",
  "MegaIndex",
  "BomboraBot",
  "Linguee",
  "Yandex",
  "Sogou",
  "BaiduSpider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: ALLOWED_SEARCH_AND_AI_BOTS,
        allow: "/",
      },
      {
        userAgent: BULK_CRAWL_BOTS,
        disallow: "/",
      },
    ],
    sitemap: "https://sodi.com.ar/sitemap.xml",
  };
}
