import type { Metadata } from "next";
import Link from "next/link";
import { BlogNav } from "@/components/blog/BlogNav";
import { Footer } from "@/components/landing/Footer";
import { CalculadoraComisiones } from "@/components/herramientas/CalculadoraComisiones";
import { IVA_RATE, IVA_SOURCE, PROVIDERS, TARIFAS_CONSULTA, TARIFAS_CONSULTA_LABEL, formatRate } from "@/lib/comisiones-cobro";
import { buildFAQSchema } from "@/lib/blog-types";
import { ogImages } from "@/lib/og-card";
import styles from "./page.module.css";

const PATH = "/herramientas/calculadora-comisiones-cobro";
const URL = `https://sodi.com.ar${PATH}`;
const BCRA_AGREGADORES = "https://www.bcra.gob.ar/registro-de-proveedores-de-servicios-de-pago-resultados-por-tipo/?tipoPSP=7";

export const metadata: Metadata = {
  title: "Calculadora de comisiones Mercado Pago, MODO y Mobbex (2026) | SODI",
  description:
    "Calculá la comisión, el IVA y cuánto te llega al cobrar con Mercado Pago, Mobbex o MODO, según medio y plazo. Tarifas oficiales consultadas el 23/10/2026.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Calculadora de comisiones Mercado Pago, MODO y Mobbex (2026)",
    description: "Comisión, IVA y neto por medio de cobro y plazo, con la tarifa oficial de cada proveedor y su fecha.",
    type: "website",
    url: URL,
    images: ogImages(PATH),
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de comisiones Mercado Pago, MODO y Mobbex (2026)",
    description: "Comisión, IVA y neto por medio de cobro y plazo, con la tarifa oficial de cada proveedor y su fecha.",
    images: ogImages(PATH),
  },
};

const FAQS = [
  {
    question: "¿Cómo se calcula la comisión de cobro?",
    answer: `Se multiplica el monto cobrado por la tasa del proveedor (sin IVA) y a esa comisión se le suma IVA ${IVA_RATE}%. Lo que te llega es el monto menos comisión e IVA. No incluye retenciones impositivas, que dependen de tu situación fiscal.`,
  },
  {
    question: "¿Mobbex es seguro?",
    answer:
      "Mobbex Argentina SRL (CUIT 30-71512358-0) figura en el Registro de proveedores de servicios de pago del BCRA como Agregador, código 33532 (consulta del 23/10/2026). Según sus términos, actúa como proveedor de servicios de pago y los cobros con tarjeta los procesan las adquirentes. Antes de operar, revisá contrato, plazos de acreditación y política de contracargos.",
  },
  {
    question: "¿MODO cobra comisión a los comercios?",
    answer:
      "MODO no publica un porcentaje. En su página para comercios dice que no suma costos ni comisiones adicionales y que cobrás las mismas comisiones que con tarjeta, así que la tasa depende de tu banco o procesadora.",
  },
  {
    question: "¿Cuál es la comisión más baja de Mercado Pago?",
    answer:
      "Según su página de comisiones vigente desde el 19/10/2026, la tasa más baja para vendedores es 0,80% + IVA, cobrando por QR cuando el cliente paga con dinero en Mercado Pago. En link de pago y checkout baja de 6,29% al instante a 1,49% a 35 días.",
  },
];

export default function CalculadoraComisionesPage() {
  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQSchema(FAQS)) }} />
      <BlogNav />
      <main>
        <header className={styles.hero}>
          <p>Herramienta SODI</p>
          <h1>Calculadora de comisiones de cobro</h1>
          <div>
            <p>
              Mercado Pago, Mobbex y MODO: elegí monto, medio y plazo y mirá la comisión, el IVA y cuánto te llega. Solo usamos
              tarifas publicadas por cada proveedor.
            </p>
            <small>
              Tarifas consultadas el <time dateTime={TARIFAS_CONSULTA}>{TARIFAS_CONSULTA_LABEL}</time> en las páginas oficiales.
            </small>
          </div>
        </header>

        <CalculadoraComisiones />

        <section className={styles.block} aria-labelledby="tabla-tarifas">
          <h2 id="tabla-tarifas">Tabla de tarifas al {TARIFAS_CONSULTA_LABEL}</h2>
          <p>
            Porcentajes sin IVA, tal como los publica cada proveedor. Fecha de consulta:{" "}
            <time dateTime={TARIFAS_CONSULTA}>{TARIFAS_CONSULTA_LABEL}</time>.
          </p>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Medio</th>
                  <th>Plazo</th>
                  <th>Comisión</th>
                </tr>
              </thead>
              <tbody>
                {PROVIDERS.flatMap((p) =>
                  p.methods.flatMap((m) =>
                    m.terms.map((t, i) => (
                      <tr key={`${p.id}-${m.id}-${t.id}`}>
                        <td>{p.name}</td>
                        <td>{i === 0 ? m.label : ""}</td>
                        <td>{t.label}</td>
                        <td>{t.rate === null ? "Sin tarifa pública" : `${formatRate(t.rate)} + IVA`}</td>
                      </tr>
                    )),
                  ),
                )}
              </tbody>
            </table>
          </div>
          <ul className={styles.sources}>
            {PROVIDERS.map((p) => (
              <li key={p.id}>
                <strong>{p.name}:</strong>{" "}
                <a href={p.source.url} target="_blank" rel="nofollow noopener">
                  {p.source.label}
                </a>{" "}
                ({p.validity}; consulta {TARIFAS_CONSULTA_LABEL}).
              </li>
            ))}
            <li>
              <strong>IVA {IVA_RATE}%:</strong>{" "}
              <a href={IVA_SOURCE.url} target="_blank" rel="nofollow noopener">
                {IVA_SOURCE.label}
              </a>{" "}
              (consulta {TARIFAS_CONSULTA_LABEL}).
            </li>
          </ul>
        </section>

        <section className={styles.block} aria-labelledby="preguntas">
          <h2 id="preguntas">Preguntas frecuentes</h2>
          {FAQS.map((f) => (
            <details key={f.question} className={styles.faq}>
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
              {f.question.includes("Mobbex") ? (
                <p>
                  Fuente:{" "}
                  <a href={BCRA_AGREGADORES} target="_blank" rel="nofollow noopener">
                    BCRA, Registro de proveedores de servicios de pago, Agregador
                  </a>{" "}
                  (consulta {TARIFAS_CONSULTA_LABEL}).
                </p>
              ) : null}
            </details>
          ))}
        </section>

        <section className={styles.block} aria-labelledby="guias">
          <h2 id="guias">Guías relacionadas</h2>
          <ul className={styles.links}>
            <li>
              <Link href="/blog/como-reducir-comisiones-mercadopago">Cómo bajar la comisión de Mercado Pago</Link>
            </li>
            <li>
              <Link href="/blog/mercadopago-vs-mobbex-ecommerce">Mercado Pago vs Mobbex para ecommerce</Link>
            </li>
            <li>
              <Link href="/blog/modo-vs-mercadopago-para-negocios">MODO vs Mercado Pago para negocios</Link>
            </li>
          </ul>
        </section>

        <section className={styles.bridge}>
          <h2>¿La comisión es el problema o es cómo cobrás?</h2>
          <Link href="/diagnostico?origen=calculadora-comisiones">Revisar mi caso</Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
