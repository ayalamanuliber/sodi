import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getArticle, getAllSlugs, getRelatedArticles, getAllArticles } from "@/lib/blog-data";
import { buildArticleSchema, buildFAQSchema, silos } from "@/lib/blog-types";
import { getSearchEligibleArticles, isBlogArticleSearchEligible } from "@/lib/content-release/blog-release";
import { Footer } from "@/components/landing/Footer";
import { BlogNav } from "@/components/blog/BlogNav";
import { ContentToolLink } from "@/components/blog/ContentToolLink";
import { SiloHub } from "@/components/blog/SiloHub";
import styles from "@/components/blog/blog.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [...getAllSlugs(), ...Object.keys(silos)].map((slug) => ({ slug }));
}

function cleanVisibleHtml(html: string) {
  return html.replaceAll("—", "-").replaceAll("–", "-");
}

function headingId(heading: string, index: number) {
  const normalized = heading
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return normalized || `seccion-${index + 1}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const silo = silos[slug];
  if (silo) {
    return {
      title: `${silo.label} | Guías SODI`,
      description: silo.description,
      alternates: { canonical: `https://sodi.com.ar/blog/${slug}` },
      openGraph: {
        title: `${silo.label} | Guías SODI`,
        description: silo.description,
        type: "website",
        url: `https://sodi.com.ar/blog/${slug}`,
      },
    };
  }

  const article = getArticle(slug);
  if (!article) return {};
  const searchEligible = isBlogArticleSearchEligible(slug);

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    robots: searchEligible
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: "article",
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      tags: article.tags,
      url: `https://sodi.com.ar/blog/${article.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
    },
    alternates: {
      canonical: `https://sodi.com.ar/blog/${article.slug}`,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  if (silos[slug]) {
    const articles = getSearchEligibleArticles(getAllArticles()).filter((article) => article.silo === slug);
    return (
      <div className={styles.blogPage}>
        <BlogNav />
        <SiloHub silo={slug} articles={articles} />
        <Footer />
      </div>
    );
  }

  const article = getArticle(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article).filter((candidate) =>
    isBlogArticleSearchEligible(candidate.slug),
  );
  const url = `https://sodi.com.ar/blog/${article.slug}`;
  const siloInfo = silos[article.silo];
  const visibleArticleDate = new Date(`${article.dateModified}T12:00:00`);
  const sections = article.content.sections.map((section, index) => ({
    ...section,
    id: headingId(section.heading, index),
  }));

  return (
    <div className={styles.blogPage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleSchema(article, url)) }}
      />
      {article.content.faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQSchema(article.content.faqs)) }}
        />
      ) : null}

      <BlogNav />
      <article className={styles.articlePage}>
        <div className={styles.articleMain}>
          <nav className={styles.breadcrumb} aria-label="Migas de pan">
            <Link href="/">SODI</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <Link href={`/blog/${article.silo}`}>{siloInfo?.label ?? article.silo}</Link>
          </nav>

          <header className={styles.articleHeader}>
            <div className={styles.articleMeta}>
              <Link href={`/blog/${article.silo}`}>{siloInfo?.label ?? article.silo}</Link>
              <span>{article.readingTime}</span>
            </div>
            <h1>{article.title.replaceAll("—", "-").replaceAll("–", "-")}</h1>
            <div
              className={styles.articleIntro}
              dangerouslySetInnerHTML={{ __html: cleanVisibleHtml(article.content.intro) }}
            />
            <div className={styles.articleAuthor}>
              <span className={styles.articleMark}>S</span>
              <span>
                <strong>SODI</strong><br />
                Revisado el {visibleArticleDate.toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {article.editorialReview?.releaseStatus === "preview" && process.env.NODE_ENV !== "production" ? (
              <p className={styles.localReviewNotice}>
                Revisión local. Packet {article.editorialReview.packetId}. No está aprobado para indexación ni publicación.
              </p>
            ) : null}
          </header>

          <div className={styles.articleBody}>
            {sections.map((section) => (
              <section id={section.id} key={section.id}>
                <h2>{section.heading.replaceAll("—", "-").replaceAll("–", "-")}</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: cleanVisibleHtml(section.body) }}
                />
              </section>
            ))}
          </div>

          {article.content.faqs.length > 0 ? (
            <section className={styles.faqBlock}>
              <h2>Preguntas frecuentes</h2>
              {article.content.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question.replaceAll("—", "-").replaceAll("–", "-")}</summary>
                  <p>{faq.answer.replaceAll("—", "-").replaceAll("–", "-")}</p>
                </details>
              ))}
            </section>
          ) : null}

          <ContentToolLink articleSlug={article.slug} articleSilo={article.silo} />

          {related.length > 0 ? (
            <section className={styles.relatedBlock}>
              <h2>Para seguir.</h2>
              <div className={styles.relatedList}>
                {related.map((relatedArticle) => (
                  <Link key={relatedArticle.slug} href={`/blog/${relatedArticle.slug}`}>
                    <span>{silos[relatedArticle.silo]?.label ?? relatedArticle.silo}</span>
                    <strong>{relatedArticle.title.replaceAll("—", "-").replaceAll("–", "-")}</strong>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className={styles.articleAside} aria-label="Contenido del artículo">
          <strong>En esta guía</strong>
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.heading.replaceAll("—", "-").replaceAll("–", "-")}</a>
              </li>
            ))}
          </ol>
        </aside>
      </article>
      <Footer />
    </div>
  );
}
