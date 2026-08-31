import fs from "node:fs";
import path from "node:path";

export interface TemplateResource {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  directAnswer: string;
  buyer: string;
  buyerJob: string;
  readingTime: string;
  dateModified: string;
  primaryKeyword: string;
  tags: string[];
  relatedRoutes: string[];
  editorialReview: {
    packetId: string;
    contentStatus: "ready_editorial";
    releaseStatus: "preview";
    evidenceStatus: string;
    verifiedAt: string;
    integrationMethod: "packet_compiled";
    contentSha256: string;
  };
  content: {
    intro: string;
    sections: { heading: string; body: string }[];
    faqs: { question: string; answer: string }[];
  };
  release: {
    sitemapEligible: false;
    publishAuthorized: false;
    reviewGate: string;
    doNotPublishIf: string;
  };
}

const templateDirectory = path.join(process.cwd(), "content", "templates");

export function getTemplateResource(slug: string): TemplateResource | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(templateDirectory, `${slug}.json`), "utf8")) as TemplateResource;
  } catch {
    return null;
  }
}

export function getTemplateSlugs() {
  if (!fs.existsSync(templateDirectory)) return [];
  return fs.readdirSync(templateDirectory)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => fileName.slice(0, -5))
    .sort();
}

export function getAllTemplateResources() {
  return getTemplateSlugs()
    .map((slug) => getTemplateResource(slug))
    .filter((resource): resource is TemplateResource => Boolean(resource));
}
