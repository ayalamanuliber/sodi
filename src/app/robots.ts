import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [
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
          "PerplexityBot",
          "Diffbot",
          "omgili",
          "Barkrowler",
          "MegaIndex",
          "BomboraBot",
          "Linguee",
          "Yandex",
          "Sogou",
          "BaiduSpider",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://sodi.com.ar/sitemap.xml",
  };
}
