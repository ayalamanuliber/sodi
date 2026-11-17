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

// Route params arrive percent-encoded for non-ASCII slugs (e.g. "mueblerías").
export function normalizeSlug(slug: string): string {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {}
  return decoded.normalize("NFC");
}

export function getArticle(rawSlug: string): Article | null {
  const slug = normalizeSlug(rawSlug);
  if (slug.includes("/") || slug.includes("..")) return null;
  const filePath = path.join(CONTENT_DIR, `${slug}.json`);
  return readArticleFile(filePath);
}

// Related block ("Para seguir."): up to 4 links per article. 3 slots keep the curated relatedSlugs; the 4th
// goes to the least-linked article of the same silo that shares tags with it (running count, tag affinity as tie-break) so articles with
// no inbound link from another article get one. Eligibility is applied BEFORE the cap of 4 (the page used to
// filter after slice(0, 4), leaving blocks with fewer than 4). The plan is computed once per process.
const RELATED_MAX = 4;
const RELATED_CURATED = 3;
// The rescue slot only goes to a same-silo article that shares at least this many tags (topic, not just silo).
const RELATED_RESCUE_MIN_TAGS = 2;
const relatedPlans = new WeakMap<(slug: string) => boolean, Map<string, string[]>>();

function planRelated(all: ArticleMeta[], isEligible: (slug: string) => boolean) {
  const bySlug = new Map(all.map((a) => [a.slug, a] as const));
  const eligible = all.filter((a) => isEligible(a.slug));
  const inbound = new Map<string, number>();
  for (const a of all) {
    for (const slug of new Set(a.relatedSlugs || [])) inbound.set(slug, (inbound.get(slug) ?? 0) + 1);
  }
  const plan = new Map<string, string[]>();
  for (const a of [...eligible].sort((x, y) => x.slug.localeCompare(y.slug))) {
    const curated = [...new Set(a.relatedSlugs || [])].filter(
      (slug) => slug !== a.slug && bySlug.has(slug) && isEligible(slug),
    );
    const picked = curated.slice(0, RELATED_CURATED);
    const tags = new Set((a.tags || []).map((t) => t.toLowerCase()));
    const overlap = (c: ArticleMeta) => (c.tags || []).filter((t) => tags.has(t.toLowerCase())).length;
    const pool = eligible
      .filter((c) => c.silo === a.silo && c.slug !== a.slug && !picked.includes(c.slug))
      .sort(
        (x, y) =>
          (inbound.get(x.slug) ?? 0) - (inbound.get(y.slug) ?? 0) ||
          overlap(y) - overlap(x) ||
          x.slug.localeCompare(y.slug),
      );
    const rest = curated.slice(RELATED_CURATED);
    const first = pool.find((c) => overlap(c) >= RELATED_RESCUE_MIN_TAGS);
    if (first && (inbound.get(first.slug) ?? 0) <= 1) {
      picked.push(first.slug);
      if (!curated.includes(first.slug)) inbound.set(first.slug, (inbound.get(first.slug) ?? 0) + 1);
    } else if (rest.length) {
      picked.push(rest[0]);
    } else if (first) {
      picked.push(first.slug);
    }
    for (const slug of [...rest, ...pool.filter((c) => overlap(c) >= 1).map((c) => c.slug)]) {
      if (picked.length >= RELATED_MAX) break;
      if (!picked.includes(slug)) picked.push(slug);
    }
    plan.set(a.slug, picked.slice(0, RELATED_MAX));
  }
  return plan;
}

export function getRelatedArticles(
  article: ArticleMeta,
  isEligible: (slug: string) => boolean = () => true,
): ArticleMeta[] {
  const all = getAllArticles();
  let plan = relatedPlans.get(isEligible);
  if (!plan) {
    plan = planRelated(all, isEligible);
    relatedPlans.set(isEligible, plan);
  }
  const bySlug = new Map(all.map((a) => [a.slug, a] as const));
  return (plan.get(article.slug) ?? []).map((slug) => bySlug.get(slug)).filter((a): a is ArticleMeta => Boolean(a));
}
