import type { Metadata } from "next";
import { getAllArticles } from "@/lib/blog-data";
import { silos } from "@/lib/blog-types";
import { getSearchEligibleArticles } from "@/lib/content-release/blog-release";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { BlogNav } from "@/components/blog/BlogNav";
import { Footer } from "@/components/landing/Footer";
import styles from "@/components/blog/blog.module.css";

export const metadata: Metadata = {
  title: "Guías y decisiones digitales para empresas | SODI",
  description:
    "Guías para comparar webs, automatización, WhatsApp y sistemas desde el problema real de una empresa argentina.",
  openGraph: {
    title: "Guías y decisiones digitales para empresas | SODI",
    description:
      "Compará caminos, costos y procesos antes de elegir una solución digital.",
    type: "website",
  },
};

const FEATURED_SLUGS = [
  "software-a-medida-vs-estandar",
  "cuanto-cuesta-pagina-web-argentina",
  "automatizar-whatsapp-empresas-de-servicios",
];

export default function BlogPage() {
  const articles = getSearchEligibleArticles(getAllArticles());
  const siloGroups = Object.entries(silos)
    .map(([key, info]) => ({
      key,
      ...info,
      articles: articles.filter((article) => article.silo === key),
    }))
    .filter((group) => group.articles.length > 0);
  const featured = FEATURED_SLUGS
    .map((slug) => articles.find((article) => article.slug === slug))
    .filter((article): article is NonNullable<typeof article> => Boolean(article));

  return (
    <div className={styles.blogPage}>
      <BlogNav />
      <header className={styles.indexHero}>
        <div>
          <h1>Decidir mejor antes de construir.</h1>
          <p>
            Guías para reconocer el problema, comparar caminos y entender qué
            debería resolver una inversión digital.
          </p>
        </div>
        <aside>
          <strong>SODI trabaja desde el proceso.</strong>
          <p>
            La tecnología viene después de entender dónde se pierde tiempo,
            información o consultas.
          </p>
        </aside>
      </header>
      <BlogIndex siloGroups={siloGroups} featured={featured} />
      <Footer />
    </div>
  );
}
