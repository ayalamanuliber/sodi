import type { MetadataRoute } from "next";

const SEARCH_AND_USER_TRIGGERED_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "PerplexityBot",
];

const TRAINING_AND_BULK_CRAWL_BOTS = [
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
  "GPTBot",
  "CCBot",
  "anthropic-ai",
  "ClaudeBot",
  "Amazonbot",
  "Applebot-Extended",
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
        userAgent: SEARCH_AND_USER_TRIGGERED_BOTS,
        allow: "/",
      },
      {
        userAgent: TRAINING_AND_BULK_CRAWL_BOTS,
        disallow: "/",
      },
    ],
    sitemap: "https://sodi.com.ar/sitemap.xml",
  };
}
