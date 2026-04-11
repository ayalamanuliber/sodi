import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles } from "@/lib/blog-data";
import { silos } from "@/lib/blog-types";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Blog — SODI | Guías, precios y estrategia digital para empresas",
  description:
    "Todo lo que necesitás saber sobre webs, automatización, redes sociales y sistemas para tu empresa en Argentina. Precios reales, guías prácticas y comparativas.",
  openGraph: {
    title: "Blog — SODI",
    description: "Guías, precios y estrategia digital para empresas argentinas.",
    type: "website",
  },
};

export default function BlogPage() {
  const articles = getAllArticles();
  const siloGroups = Object.entries(silos).map(([key, info]) => ({
    key,
    ...info,
    articles: articles.filter((a) => a.silo === key),
  })).filter((g) => g.articles.length > 0);

  return (
    <>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-6 py-3 sm:py-5">
        <div className="max-w-5xl mx-auto flex justify-between items-center glass rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 border-white/5 shadow-2xl">
          <Link href="/" className="sodi-mark text-[1rem] sm:text-[1.2rem]">SODI</Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/#servicios" className="hidden sm:block text-[11px] text-s-sub hover:text-white transition-colors uppercase tracking-wider font-bold">
              Servicios
            </Link>
            <Link href="/diagnostico" className="bg-white text-black px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-tight hover:bg-s-accent transition-all">
              Diagnóstico
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="mb-10 sm:mb-16">
            <p className="text-s-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-3">Blog</p>
            <h1 className="text-[1.6rem] sm:text-3xl md:text-[2.75rem] font-extrabold tracking-tighter leading-tight font-heading text-white mb-3">
              Guías, precios y estrategia digital para tu empresa
            </h1>
            <p className="text-s-sub text-[14px] sm:text-[15px] max-w-2xl leading-relaxed">
              Todo lo que necesitás saber para digitalizar tu negocio en Argentina. Sin humo, con datos reales.
            </p>
          </header>

          {/* Client component handles filtering */}
          <BlogIndex siloGroups={siloGroups} />
        </div>
      </main>

      <Footer />
    </>
  );
}
