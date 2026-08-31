import Link from "next/link";
import type { ArticleMeta } from "@/lib/blog-types";
import styles from "./blog.module.css";

interface SiloGroup {
  key: string;
  label: string;
  description: string;
  articles: ArticleMeta[];
}

type Props = {
  siloGroups: SiloGroup[];
  featured: ArticleMeta[];
};

function cleanText(value: string) {
  return value.replaceAll("—", "-").replaceAll("–", "-");
}

export function BlogIndex({ siloGroups, featured }: Props) {
  const articleCount = siloGroups.reduce(
    (total, group) => total + group.articles.length,
    0,
  );

  return (
    <div className={styles.indexBody}>
      <section className={styles.decisionShelf} aria-labelledby="decision-title">
        <div className={styles.sectionIntro}>
          <h2 id="decision-title">Empezá por la decisión, no por la tecnología.</h2>
          <p>
            Tres lecturas para comparar opciones, entender el costo y ubicar el
            proceso que conviene ordenar primero.
          </p>
        </div>
        <div className={styles.featuredGrid}>
          {featured.map((article, index) => (
            <Link
              className={styles.featuredArticle}
              href={`/blog/${article.slug}`}
              key={article.slug}
            >
              <span>{index === 0 ? "Elegir" : index === 1 ? "Presupuestar" : "Ordenar"}</span>
              <strong>{cleanText(article.title)}</strong>
              <p>{cleanText(article.metaDescription)}</p>
              <small>{article.readingTime}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.routeSection} aria-labelledby="routes-title">
        <div className={styles.sectionIntro}>
          <h2 id="routes-title">Explorá por problema.</h2>
          <p>
            {articleCount} artículos organizados en rutas más chicas. Cada ruta
            tiene su propia página y enlaces hacia decisiones relacionadas.
          </p>
        </div>
        <div className={styles.routeGrid}>
          {siloGroups.map((group) => (
            <Link
              className={styles.routeLink}
              href={`/blog/${group.key}`}
              key={group.key}
            >
              <span>{group.articles.length} artículos</span>
              <h3>{group.label}</h3>
              <p>{group.description}</p>
              <strong>Ver la ruta</strong>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
