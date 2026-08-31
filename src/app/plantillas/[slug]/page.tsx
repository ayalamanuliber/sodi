import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogNav } from "@/components/blog/BlogNav";
import { Footer } from "@/components/landing/Footer";
import { TemplateActions } from "@/components/templates/TemplateActions";
import { TemplateDiagnosticLink } from "@/components/templates/TemplateDiagnosticLink";
import { getAllTemplateResources, getTemplateResource, getTemplateSlugs } from "@/lib/template-data";
import { isTemplateResourceSearchEligible } from "@/lib/content-release/template-release";
import styles from "./template.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getTemplateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resource = getTemplateResource(slug);
  if (!resource) return {};
  const url = `https://sodi.com.ar/plantillas/${resource.slug}`;
  const searchEligible = isTemplateResourceSearchEligible(slug);
  return {
    title: resource.metaTitle,
    description: resource.metaDescription,
    robots: searchEligible
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true },
    alternates: { canonical: url },
    openGraph: {
      title: resource.metaTitle,
      description: resource.metaDescription,
      type: "website",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: resource.metaTitle,
      description: resource.metaDescription,
    },
  };
}

export default async function TemplateResourcePage({ params }: Props) {
  const { slug } = await params;
  const resource = getTemplateResource(slug);
  if (!resource) notFound();
  const searchEligible = isTemplateResourceSearchEligible(slug);
  const otherTemplates = getAllTemplateResources().filter((candidate) => candidate.slug !== slug);
  const closeCopy: Record<string, { title: string; body: string; label: string }> = {
    "presupuesto-servicios-digitales": {
      title: "¿Dos propuestas incluyen trabajos distintos?",
      body: "Usá el diagnóstico para fijar alcance, responsables y dependencias antes de comparar el total.",
      label: "Preparar el alcance",
    },
    "checklist-conciliacion-pagos-ecommerce": {
      title: "¿Lo cobrado no coincide con lo liquidado?",
      body: "Ubicá en qué paso se pierde la diferencia antes de cambiar la pasarela o sumar otra planilla.",
      label: "Revisar el flujo de cobro",
    },
    "dashboard-operativo-pyme": {
      title: "¿El equipo arma el mismo reporte en varias planillas?",
      body: "Definí decisión, fuente y responsable antes de comprar una herramienta de tableros.",
      label: "Ubicar el primer tablero",
    },
  };
  const close = closeCopy[resource.slug];
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://sodi.com.ar/plantillas/${resource.slug}#webpage`,
    url: `https://sodi.com.ar/plantillas/${resource.slug}`,
    name: resource.metaTitle,
    description: resource.metaDescription,
    inLanguage: "es-AR",
    isPartOf: { "@id": "https://sodi.com.ar/#website" },
    mainEntity: {
      "@type": "DigitalDocument",
      name: resource.title,
      description: resource.directAnswer,
      inLanguage: "es-AR",
    },
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <BlogNav />
      <main className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Migas de pan">
          <Link href="/">SODI</Link><span>/</span><Link href="/plantillas">Plantillas</Link>
        </nav>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{searchEligible ? "Herramienta operativa" : "Herramienta operativa · vista previa local"}</p>
            <h1>{resource.title}</h1>
            <p className={styles.answer}>{resource.directAnswer}</p>
            <TemplateActions />
            {!searchEligible ? (
              <p className={styles.reviewNote}>
                Packet {resource.editorialReview.packetId}. No está aprobado para indexación ni publicación.
              </p>
            ) : null}
          </div>
          <aside className={styles.brief} aria-label="Para qué sirve esta plantilla">
            <span>Sirve para</span>
            <strong>{resource.buyerJob}</strong>
            <dl>
              <div><dt>Para</dt><dd>{resource.buyer}</dd></div>
              <div><dt>Lectura</dt><dd>{resource.readingTime}</dd></div>
              <div><dt>Datos</dt><dd>No persiste respuestas</dd></div>
            </dl>
          </aside>
        </header>

        <article className={styles.worksheet}>
          {resource.content.intro ? (
            <div className={styles.intro} dangerouslySetInnerHTML={{ __html: resource.content.intro }} />
          ) : null}
          {resource.content.sections.map((section, index) => (
            <section key={`${section.heading}-${index}`}>
              <span className={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.heading}</h2>
                <div className={styles.body} dangerouslySetInnerHTML={{ __html: section.body }} />
              </div>
            </section>
          ))}
        </article>

        {resource.content.faqs.length ? (
          <section className={styles.faqs}>
            <p className={styles.eyebrow}>Antes de usarla</p>
            <h2>Preguntas frecuentes</h2>
            {resource.content.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </section>
        ) : null}

        <section className={styles.related} aria-labelledby="related-title">
          <div>
            <p className={styles.eyebrow}>Para completar el recorrido</p>
            <h2 id="related-title">Seguí con una decisión relacionada.</h2>
          </div>
          <div className={styles.relatedLinks}>
            {resource.relatedRoutes.map((route) => (
              <Link href={route} key={route}>Leer la guía relacionada</Link>
            ))}
            {otherTemplates.map((template) => (
              <Link href={`/plantillas/${template.slug}`} key={template.slug}>{template.title}</Link>
            ))}
          </div>
        </section>

        <section className={styles.close}>
          <div>
            <p className={styles.eyebrow}>Cuando la plantilla muestra el problema</p>
            <h2>{close?.title ?? "Ordená el caso antes de comprar una solución."}</h2>
            {close?.body ? <p>{close.body}</p> : null}
          </div>
          <TemplateDiagnosticLink slug={resource.slug} label={close?.label ?? "Revisar mi caso"} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
