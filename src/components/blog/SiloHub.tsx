import Link from "next/link";
import type { ArticleMeta } from "@/lib/blog-types";
import { silos } from "@/lib/blog-types";
import styles from "./blog.module.css";

type Props = {
  silo: string;
  articles: ArticleMeta[];
};

const HUB_PROMISES: Record<string, string> = {
  "web-por-rubro": "Qué debería resolver una web en cada tipo de negocio antes de elegir diseño o proveedor.",
  "sistema-por-rubro": "Procesos que conviene ordenar antes de comprar o desarrollar un sistema.",
  "whatsapp-por-rubro": "Consultas, seguimientos y tareas repetidas que hoy dependen del chat.",
  "redes-por-rubro": "Qué tiene que comunicar cada negocio para atraer consultas más claras.",
  "turnos-por-rubro": "Cuándo un sistema de turnos reduce coordinación y cuándo agrega fricción.",
  precios: "Referencias para presupuestar sin confundir precio inicial con costo total.",
  guias: "Recorridos prácticos para definir el problema antes de elegir una solución.",
  comparativas: "Diferencias que importan para elegir, implementar y poder cambiar de rumbo.",
  "por-ciudad": "Qué revisar al contratar ayuda digital cerca de tu operación.",
  "digital-ideal": "Una referencia concreta de qué debería hacer bien la presencia digital de cada rubro.",
  conceptos: "Explicaciones directas de herramientas y decisiones digitales sin jerga innecesaria.",
};

function cleanText(value: string) {
  return value.replaceAll("—", "-").replaceAll("–", "-");
}

export function SiloHub({ silo, articles }: Props) {
  const info = silos[silo];
  const latest = [...articles]
    .sort((a, b) => b.dateModified.localeCompare(a.dateModified))
    .slice(0, 4);

  return (
    <main className={styles.hubPage}>
      <nav className={styles.breadcrumb} aria-label="Migas de pan">
        <Link href="/">SODI</Link>
        <span>/</span>
        <Link href="/blog">Blog</Link>
        <span>/</span>
        <span aria-current="page">{info.label}</span>
      </nav>

      <header className={styles.hubHero}>
        <div>
          <span className={styles.routeCount}>{articles.length} artículos conectados</span>
          <h1>{info.label}</h1>
          <p>{HUB_PROMISES[silo] ?? info.description}</p>
        </div>
        <aside>
          <strong>Usá esta ruta para:</strong>
          <p>reconocer el problema, comparar caminos y llegar al diagnóstico con mejor contexto.</p>
        </aside>
      </header>

      <section className={styles.hubLatest} aria-labelledby="latest-title">
        <div className={styles.sectionIntro}>
          <h2 id="latest-title">Para empezar.</h2>
          <p>Las guías revisadas más recientemente dentro de esta ruta.</p>
        </div>
        <div className={styles.latestList}>
          {latest.map((article) => (
            <Link href={`/blog/${article.slug}`} key={article.slug}>
              <span>{article.readingTime}</span>
              <strong>{cleanText(article.title)}</strong>
              <p>{cleanText(article.metaDescription)}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.hubLibrary} aria-labelledby="library-title">
        <div className={styles.sectionIntro}>
          <h2 id="library-title">Todas las guías de esta ruta.</h2>
          <p>Elegí la situación más parecida a la de tu negocio.</p>
        </div>
        <div className={styles.libraryList}>
          {articles.map((article) => (
            <Link href={`/blog/${article.slug}`} key={article.slug}>
              <strong>{cleanText(article.title)}</strong>
              <span>{article.readingTime}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.hubClose}>
        <div>
          <h2>¿El problema cruza varias rutas?</h2>
          <p>El diagnóstico general ayuda a ubicar qué conviene resolver primero y qué todavía no hace falta construir.</p>
        </div>
        <Link href="/diagnostico">Hacer el diagnóstico</Link>
      </section>
    </main>
  );
}
