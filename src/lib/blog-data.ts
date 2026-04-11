import fs from "fs";
import path from "path";
import type { Article, ArticleMeta } from "./blog-types";

const CONTENT_DIR = path.join(process.cwd(), "content");

// ── Read all articles ──

function readArticleFile(filePath: string): Article | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Article;
  } catch {
    return null;
  }
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json"));

  return files
    .map((file) => {
      const article = readArticleFile(path.join(CONTENT_DIR, file));
      if (!article) return null;

      // Return only meta (no content) for index pages
      const { content, ...meta } = article;
      return meta;
    })
    .filter(Boolean) as ArticleMeta[];
}

export function getAllSlugs(): string[] {
  return getAllArticles().map((a) => a.slug);
}

export function getArticle(slug: string): Article | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.json`);
  return readArticleFile(filePath);
}

export function getRelatedArticles(article: ArticleMeta): ArticleMeta[] {
  const all = getAllArticles();
  const related: ArticleMeta[] = [];

  // First: explicitly linked articles
  for (const relSlug of article.relatedSlugs || []) {
    const found = all.find((a) => a.slug === relSlug);
    if (found) related.push(found);
  }

  // Then: same silo articles (up to 4 total)
  if (related.length < 4) {
    const sameSilo = all.filter(
      (a) => a.silo === article.silo && a.slug !== article.slug && !related.find((r) => r.slug === a.slug)
    );
    for (const a of sameSilo) {
      if (related.length >= 4) break;
      related.push(a);
    }
  }

  return related.slice(0, 4);
}
