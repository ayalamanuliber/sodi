import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog-data";
import { getSearchEligibleArticles } from "@/lib/content-release/blog-release";
import { silos } from "@/lib/blog-types";
import { getTemplateResource, getTemplateSlugs } from "@/lib/template-data";
import { getSearchEligibleTemplateSlugs } from "@/lib/content-release/template-release";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sodi.com.ar";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/diagnostico`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const articles = getSearchEligibleArticles(getAllArticles());
  const blogPages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.dateModified),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogHubs: MetadataRoute.Sitemap = Object.keys(silos).map((silo) => ({
    url: `${baseUrl}/blog/${silo}`,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const templateSlugs = getSearchEligibleTemplateSlugs(getTemplateSlugs());
  const templatePages: MetadataRoute.Sitemap = templateSlugs.map((slug) => {
    const resource = getTemplateResource(slug);
    return {
      url: `${baseUrl}/plantillas/${slug}`,
      lastModified: resource?.dateModified ? new Date(resource.dateModified) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });
  const templateHub: MetadataRoute.Sitemap = templateSlugs.length
    ? [{
        url: `${baseUrl}/plantillas`,
        changeFrequency: "monthly" as const,
        priority: 0.75,
      }]
    : [];

  return [...staticPages, ...blogHubs, ...blogPages, ...templateHub, ...templatePages];
}
