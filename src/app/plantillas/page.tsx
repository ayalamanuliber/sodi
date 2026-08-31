import type { Metadata } from "next";
import Link from "next/link";
import { BlogNav } from "@/components/blog/BlogNav";
import { Footer } from "@/components/landing/Footer";
import { getAllTemplateResources } from "@/lib/template-data";
import { getSearchEligibleTemplateSlugs } from "@/lib/content-release/template-release";
import styles from "./page.module.css";

export function generateMetadata(): Metadata {
  const eligible = getSearchEligibleTemplateSlugs(
    getAllTemplateResources().map((resource) => resource.slug),
  );
  const searchEligible = eligible.length > 0;
  return {
    title: "Plantillas para ordenar decisiones digitales | SODI",
    description:
      "Plantillas prácticas para comparar propuestas, conciliar cobros y definir tableros antes de comprar una solución.",
    robots: searchEligible
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true },
    alternates: { canonical: "https://sodi.com.ar/plantillas" },
    openGraph: {
      title: "Plantillas para ordenar decisiones digitales | SODI",
      description: "Herramientas prácticas para llevar una decisión digital a un alcance, un control o un próximo paso concreto.",
      type: "website",
      url: "https://sodi.com.ar/plantillas",
    },
  };
}

export default function TemplatesHubPage() {
  const resources = getAllTemplateResources();
  const eligible = new Set(getSearchEligibleTemplateSlugs(resources.map((resource) => resource.slug)));

  return (
    <div className={styles.page}>
      <BlogNav />
      <main>
        <header className={styles.hero}>
          <p>Herramientas SODI</p>
          <h1>Pasá de “hay que ordenarlo” a una decisión concreta.</h1>
          <div>
            <p>
              Tres plantillas para definir qué comparar, qué controlar y quién
              necesita hacerse cargo antes de sumar tecnología.
            </p>
            {!eligible.size ? (
              <small>Vista local. Estas herramientas todavía no están autorizadas para indexación.</small>
            ) : null}
          </div>
        </header>

        <section className={styles.resources} aria-label="Plantillas disponibles">
          {resources.map((resource) => (
            <Link href={`/plantillas/${resource.slug}`} key={resource.slug}>
              <span>{resource.buyerJob}</span>
              <h2>{resource.title}</h2>
              <p>{resource.directAnswer}</p>
              <strong>Abrir la plantilla</strong>
            </Link>
          ))}
        </section>

        <section className={styles.bridge}>
          <h2>La plantilla ordena la conversación. El diagnóstico ubica qué resolver primero.</h2>
          <Link href="/diagnostico?origen=plantillas">Revisar mi caso</Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

