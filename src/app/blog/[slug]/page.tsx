import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getArticle, getAllSlugs, getRelatedArticles } from "@/lib/blog-data";
import { buildArticleSchema, buildFAQSchema, silos } from "@/lib/blog-types";
import { Footer } from "@/components/landing/Footer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: "article",
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      tags: article.tags,
      url: `https://sodi.com.ar/blog/${article.slug}`,
    },
    alternates: {
      canonical: `https://sodi.com.ar/blog/${article.slug}`,
    },
  };
}


export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article);
  const url = `https://sodi.com.ar/blog/${article.slug}`;
  const siloInfo = silos[article.silo];

  return (
    <>
      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleSchema(article, url)) }}
      />
      {article.content.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQSchema(article.content.faqs)) }}
        />
      )}

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-6 py-3 sm:py-5">
        <div className="max-w-4xl mx-auto flex justify-between items-center glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 border-white/5 shadow-2xl">
          <Link href="/" className="sodi-mark text-[1rem] sm:text-[1.2rem]">SODI</Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/blog" className="text-[11px] text-s-sub hover:text-white transition-colors uppercase tracking-wider font-bold">
              Blog
            </Link>
            <Link href="/#servicios" className="hidden sm:block text-[11px] text-s-sub hover:text-white transition-colors uppercase tracking-wider font-bold">
              Servicios
            </Link>
            <Link href="/diagnostico" className="bg-white text-black px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-tight hover:bg-s-accent transition-all">
              Diagnóstico
            </Link>
          </div>
        </div>
      </nav>

      <article className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-5 sm:px-6">
        <div className="max-w-[680px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] text-s-dim mb-6 sm:mb-8 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">SODI</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span>/</span>
            <Link href={`/blog?silo=${article.silo}`} className="hover:text-white transition-colors">
              {siloInfo?.label || article.silo}
            </Link>
          </nav>

          {/* Header */}
          <header className="mb-8 sm:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.15em] rounded bg-s-accent/10 text-s-accent border border-s-accent/15">
                {siloInfo?.label || article.silo}
              </span>
              <span className="text-[11px] text-s-dim">{article.readingTime}</span>
            </div>

            <h1 className="text-[1.6rem] sm:text-[2.2rem] md:text-[2.6rem] font-extrabold tracking-tighter leading-[1.05] font-heading text-white mb-4">
              {article.title}
            </h1>

            <div
              className="text-s-sub text-[15px] sm:text-[17px] leading-relaxed blog-prose"
              dangerouslySetInnerHTML={{ __html: article.content.intro }}
            />

            <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/5">
              <div className="w-8 h-8 rounded-full bg-s-accent/10 border border-s-accent/20 flex items-center justify-center text-[11px] font-bold text-s-accent">
                S
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white">SODI</p>
                <p className="text-[10px] text-s-dim">
                  {new Date(article.datePublished).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="blog-body space-y-8 sm:space-y-10">
            {article.content.sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-[1.15rem] sm:text-[1.4rem] font-bold tracking-tight text-white mb-3 font-heading">
                  {section.heading}
                </h2>
                <div
                  className="text-[15px] text-s-sub leading-[1.75] space-y-4 blog-prose"
                  dangerouslySetInnerHTML={{ __html: section.body }}
                />
              </section>
            ))}
          </div>

          {/* FAQ */}
          {article.content.faqs.length > 0 && (
            <section className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-white/5">
              <h2 className="text-[1.15rem] sm:text-[1.4rem] font-bold tracking-tight text-white mb-6 font-heading">
                Preguntas frecuentes
              </h2>
              <div className="space-y-3">
                {article.content.faqs.map((faq, i) => (
                  <details key={i} className="group p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <summary className="flex items-center justify-between cursor-pointer text-[14px] font-semibold text-white list-none">
                      {faq.question}
                      <svg className="w-4 h-4 text-s-dim shrink-0 ml-3 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <p className="mt-3 text-[14px] text-s-sub leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl bg-s-accent/[0.04] border border-s-accent/15 text-center">
            <p className="text-[15px] sm:text-[17px] font-bold text-white mb-2">
              {article.content.ctaText || "¿Necesitás esto para tu empresa?"}
            </p>
            <p className="text-[13px] text-s-sub mb-5">
              Hacé el diagnóstico guiado y recibí un plan con precio fijo en 1 minuto.
            </p>
            <Link
              href="/diagnostico"
              className="inline-flex items-center gap-2 bg-s-accent text-black px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-[13px] font-black uppercase tracking-tight hover:brightness-110 transition-all"
            >
              Hacer diagnóstico
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-white/5">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-s-dim mb-5">
                Artículos relacionados
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/15 hover:bg-white/[0.04] transition-all group"
                  >
                    <span className="text-[10px] text-s-dim uppercase tracking-wider font-bold">
                      {silos[r.silo]?.label || r.silo}
                    </span>
                    <p className="text-[13px] font-semibold text-white mt-1 group-hover:text-s-accent transition-colors leading-snug">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <Footer />
    </>
  );
}
