"use client";

import { FormEvent, useMemo, useState } from "react";

const PASSCODE = "2026";

const decisionExamples = [
  "qué parlante elegir para escritorio",
  "qué modelo conviene para gaming",
  "comparativas entre modelos EDIFIER",
  "EDIFIER vs otras opciones que la gente suele mirar",
  "setups reales",
  "reviews de clientes",
  "dudas frecuentes",
  "tips para mejorar el sonido del ambiente",
];

const includedItems = [
  "diagnóstico inicial de redes, web, Mercado Libre, pauta visible y canales actuales",
  "revisión del material disponible",
  "estrategia inicial de contenido",
  "calendario inicial",
  "creación/diseño de primeras piezas",
  "adaptación de contenido existente a nuevos ángulos",
  "revisión de campañas publicitarias",
  "análisis de métricas principales",
  "propuestas de mejora para anuncios",
  "búsqueda de referencias e inspiración de mercado",
  "ideas iniciales para blog, foro, comunidad o contenido de búsqueda",
  "seguimiento semanal",
  "recomendación de próximos pasos",
];

const operatingCards = [
  {
    title: "Comunicación",
    text: "WhatsApp para coordinación rápida y un documento/carpeta compartida para materiales, avances y aprobaciones.",
  },
  {
    title: "Accesos",
    text: "EDIFIER debería facilitar material disponible y acceso como colaboradores a cuentas publicitarias para revisar métricas y proponer mejoras.",
  },
  {
    title: "Aprobaciones",
    text: "Las piezas, campañas o cambios importantes se envían para aprobación antes de publicar o activar.",
  },
  {
    title: "Tiempos",
    text: "Los tiempos son estimados. Si materiales, accesos y aprobaciones están listos antes, las entregas pueden adelantarse. Si hay demoras externas, el cronograma se ajusta proporcionalmente.",
  },
];

function todayLabel() {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function Check() {
  return (
    <svg className="proposal-check" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg className="proposal-arrow" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code.trim() !== PASSCODE) {
      setError("Código incorrecto.");
      return;
    }

    onUnlock();
  }

  return (
    <main className="proposal-lock">
      <style jsx global>{proposalStyles}</style>
      <section className="lock-card">
        <div className="lock-topline">
          <span className="lock-brand">SODI</span>
          <span className="lock-chip">Propuesta privada</span>
        </div>
        <h1>Acceso a propuesta</h1>
        <p>Ingresá el código de acceso para ver la propuesta inicial para EDIFIER Argentina.</p>
        <form onSubmit={submit}>
          <label htmlFor="proposal-code">Código</label>
          <input
            id="proposal-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError("");
            }}
            inputMode="numeric"
            autoComplete="off"
            placeholder="••••"
          />
          {error && <span className="lock-error">{error}</span>}
          <button type="submit">
            Entrar
            <Arrow />
          </button>
        </form>
      </section>
    </main>
  );
}

export function EdifierProposalClient() {
  const [unlocked, setUnlocked] = useState(false);
  const date = useMemo(() => todayLabel(), []);

  if (!unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <main className="proposal-document">
      <style jsx global>{proposalStyles}</style>

      <article className="proposal-shell">
        <header className="proposal-hero">
          <div className="proposal-kicker">
            <span>SODI</span>
            <span>{date}</span>
          </div>
          <div className="proposal-hero-grid">
            <div>
              <h1>Propuesta inicial para EDIFIER Argentina</h1>
              <p className="hero-subtitle">
                Contenido, pauta y visibilidad para que más personas lleguen con intención real de compra.
              </p>
            </div>
            <aside className="hero-price-card" aria-label="Inversión inicial">
              <span>Inversión inicial</span>
              <strong>$500.000 ARS</strong>
            </aside>
          </div>

          <dl className="proposal-meta">
            <div>
              <dt>Preparado por</dt>
              <dd>SODI</dd>
            </div>
            <div>
              <dt>Preparado para</dt>
              <dd>EDIFIER Argentina</dd>
            </div>
            <div>
              <dt>Vigencia</dt>
              <dd>7 días corridos desde el envío</dd>
            </div>
          </dl>

          <div className="hero-note">
            Primer mes de diagnóstico, ordenamiento, creación inicial y revisión de pauta.
          </div>
        </header>

        <section className="proposal-section">
          <div className="section-label">01 · Diagnóstico inicial</div>
          <h2>EDIFIER no necesita “más posteos”. Necesita ordenar adquisición.</h2>
          <p>
            EDIFIER ya tiene algo muy importante: producto fuerte, comunidad, web, Mercado Libre, contenido y canales activos.
          </p>
          <p>
            Por eso, la oportunidad no pasa por hacer redes por hacer redes. La oportunidad está en ordenar mejor cómo una persona:
          </p>
          <ul className="compact-list">
            <li>descubre la marca;</li>
            <li>compara modelos;</li>
            <li>entiende qué producto le conviene;</li>
            <li>confía más en la decisión;</li>
            <li>llega con mayor intención a Mercado Libre, web o local.</li>
          </ul>
          <div className="callout">
            La propuesta no busca publicar más por volumen. Busca que contenido, pauta y visibilidad trabajen juntos para acercar a la compra.
          </div>
        </section>

        <section className="proposal-section">
          <div className="section-label">02 · Objetivo del primer mes</div>
          <h2>Primer mes: ordenar, probar y medir.</h2>
          <p>
            El primer mes funciona como una etapa inicial. No se promete un ROAS específico sin analizar datos internos, historial, presupuesto y campañas actuales.
          </p>
          <p>El objetivo es construir una base clara para:</p>
          <div className="two-column-list">
            {[
              "detectar qué contenido puede ayudar más a vender",
              "transformar material existente en nuevos ángulos útiles",
              "revisar campañas, creativos y métricas",
              "encontrar mejores hooks para anuncios",
              "identificar oportunidades de búsqueda, comunidad y visibilidad",
              "decidir qué conviene repetir, ajustar o escalar",
            ].map((item) => (
              <div key={item} className="check-row">
                <Check />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="mini-highlight">
            Primer resultado esperado: más claridad sobre qué piezas, ángulos y campañas tienen más potencial para generar intención de compra.
          </p>
        </section>

        <section className="proposal-section page-break">
          <div className="section-label">03 · Los 3 frentes de trabajo</div>
          <h2>Tres frentes conectados.</h2>
          <div className="front-grid">
            <article className="front-card">
              <h3>1. Contenido de decisión</h3>
              <p>
                Aprovechar el material que EDIFIER ya tiene —videos, fotos, productos, reviews, contenido crudo o piezas anteriores— para crear nuevos ángulos de comunicación.
              </p>
              <p className="card-note">
                Reutilizar contenido no significa subir exactamente lo mismo. Significa usar el material existente para crear nuevas piezas, hooks, ediciones y mensajes según el objetivo.
              </p>
              <ul>
                {decisionExamples.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="front-card">
              <h3>2. Pauta y creativos</h3>
              <p>
                Revisar campañas, anuncios, públicos, mensajes y métricas para detectar oportunidades de mejora.
              </p>
              <ul>
                {["campañas activas", "creativos actuales", "hooks", "visuales", "CTR", "costo por clic", "públicos", "oportunidades de retargeting"].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="card-note">
                El presupuesto publicitario queda a cargo de EDIFIER y no se modifica sin aprobación.
              </p>
            </article>

            <article className="front-card">
              <h3>3. Visibilidad y búsqueda</h3>
              <p>
                Trabajar cómo aparece EDIFIER cuando una persona busca recomendaciones, compara modelos o pregunta qué producto le conviene.
              </p>
              <ul>
                {["guías de compra", "comparativas", "contenido para web/blog", "foro/comunidad", "dudas frecuentes", "Google, redes y búsquedas con IA"].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="card-note">
                La pauta acelera ventas hoy. La visibilidad orgánica ayuda a bajar fricción y construir adquisición con el tiempo.
              </p>
            </article>
          </div>
        </section>

        <section className="proposal-section">
          <div className="section-label">04 · Qué incluye</div>
          <h2>Qué incluye el primer mes</h2>
          <div className="checklist-grid">
            {includedItems.map((item) => (
              <div key={item} className="check-row">
                <Check />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="section-note">
            La cantidad exacta de piezas se define según material disponible, prioridades y velocidad de aprobación. El foco del primer mes es ordenar, probar y medir, no producir volumen sin dirección.
          </p>
        </section>

        <section className="proposal-section page-break">
          <div className="section-label">05 · Forma de trabajo</div>
          <h2>Cómo nos manejaríamos</h2>
          <div className="ops-grid">
            {operatingCards.map((card) => (
              <article key={card.title} className="mini-card">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="proposal-section pricing-section">
          <div className="pricing-card">
            <div>
              <div className="section-label">06 · Inversión</div>
              <h2>Inversión inicial</h2>
              <p>
                Primer mes de diagnóstico, estrategia, creación inicial, revisión de pauta, propuestas de mejora y seguimiento.
              </p>
            </div>
            <div className="pricing-amount">
              <span>Primer mes inicial</span>
              <strong>$500.000 ARS</strong>
              <small>Primer mes de trabajo</small>
            </div>
          </div>

          <div className="pricing-columns">
            <div>
              <h3>Incluye</h3>
              <ul>
                <li>trabajo estratégico;</li>
                <li>creación/diseño inicial;</li>
                <li>revisión de campañas;</li>
                <li>análisis de métricas;</li>
                <li>seguimiento semanal.</li>
              </ul>
            </div>
            <div>
              <h3>No incluye</h3>
              <ul>
                <li>presupuesto publicitario;</li>
                <li>producción audiovisual presencial;</li>
                <li>herramientas pagas externas no acordadas;</li>
                <li>desarrollos web complejos fuera del alcance inicial.</li>
              </ul>
            </div>
          </div>

          <p className="section-note">
            Después del primer mes se revisan resultados, carga real de trabajo y prioridades para definir si conviene continuar igual, ampliar el alcance o enfocarse en un frente específico.
          </p>
          <p className="validity">Esta propuesta tiene una vigencia de 7 días corridos desde la fecha de envío.</p>
        </section>

        <footer className="proposal-footer">
          <div>
            <div className="section-label">07 · Próximo paso</div>
            <h2>Confirmar el inicio del primer mes.</h2>
            <p>
              A partir de ahí coordinamos accesos, materiales disponibles, productos o líneas prioritarias, canales principales de venta, primeras líneas de contenido y revisión inicial de pauta.
            </p>
            <strong>
              El objetivo no es publicar más. Es que más gente entienda qué EDIFIER comprar y llegue con más intención a Mercado Libre, web o local.
            </strong>
          </div>
          <a className="proposal-cta" href="https://wa.me/5491138696958" target="_blank" rel="noopener noreferrer">
            Coordinar inicio
            <Arrow />
          </a>
        </footer>
      </article>
    </main>
  );
}

const proposalStyles = `
  :root {
    color-scheme: light;
  }

  body {
    background: #f4f6f8 !important;
  }

  .noise,
  .wa-btn {
    display: none !important;
  }

  .proposal-document,
  .proposal-lock {
    min-height: 100vh;
    background:
      radial-gradient(circle at 20% 0%, rgba(0, 255, 163, 0.16), transparent 32rem),
      linear-gradient(180deg, #f8fafb 0%, #eef2f4 100%);
    color: #0d1117;
    font-family: var(--font-body), Inter, system-ui, sans-serif;
    letter-spacing: 0;
  }

  .proposal-lock {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
  }

  .lock-card {
    width: min(100%, 430px);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.92);
    padding: 32px;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
  }

  .lock-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
  }

  .lock-brand {
    font-family: var(--font-heading), Sora, system-ui, sans-serif;
    font-weight: 800;
    letter-spacing: 0.18em;
    color: #0d1117;
  }

  .lock-chip {
    border-radius: 999px;
    background: #e9fff6;
    color: #00794e;
    padding: 7px 10px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .lock-card h1 {
    color: #0d1117;
    font-family: var(--font-heading), Sora, system-ui, sans-serif;
    font-size: 34px;
    letter-spacing: -0.03em;
    margin: 0 0 12px;
  }

  .lock-card p {
    color: #5b6472;
    margin: 0;
  }

  .lock-card form {
    display: grid;
    gap: 12px;
    margin-top: 28px;
  }

  .lock-card label {
    color: #687180;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  .lock-card input {
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 16px;
    background: #fff;
    color: #0d1117;
    font: 700 18px/1 var(--font-body), Inter, system-ui, sans-serif;
    outline: none;
    padding: 16px;
  }

  .lock-card input:focus {
    border-color: #00b978;
    box-shadow: 0 0 0 4px rgba(0, 255, 163, 0.14);
  }

  .lock-error {
    color: #b42318;
    font-size: 13px;
    font-weight: 700;
  }

  .lock-card button,
  .proposal-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: 0;
    border-radius: 999px;
    background: #0d1117;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    font-weight: 800;
    padding: 15px 20px;
    text-decoration: none;
  }

  .proposal-arrow {
    height: 16px;
    width: 16px;
  }

  .proposal-shell {
    width: min(100% - 32px, 900px);
    margin: 0 auto;
    padding: 42px 0 72px;
  }

  .proposal-hero,
  .proposal-section,
  .proposal-footer {
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .proposal-hero {
    padding: 38px;
  }

  .proposal-kicker {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    color: #6a7280;
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  .proposal-hero-grid {
    display: grid;
    grid-template-columns: 1fr 240px;
    gap: 28px;
    align-items: end;
    margin-top: 42px;
  }

  .proposal-hero h1 {
    color: #0d1117;
    font-family: var(--font-heading), Sora, system-ui, sans-serif;
    font-size: clamp(42px, 6vw, 66px);
    font-weight: 850;
    letter-spacing: -0.055em;
    line-height: 0.98;
    margin: 0;
  }

  .hero-subtitle {
    color: #4d5664;
    font-size: 20px;
    line-height: 1.45;
    margin: 22px 0 0;
    max-width: 620px;
  }

  .hero-price-card {
    border: 1px solid rgba(0, 185, 120, 0.22);
    border-radius: 22px;
    background: linear-gradient(180deg, #f0fff9, #fff);
    padding: 20px;
  }

  .hero-price-card span,
  .pricing-amount span {
    display: block;
    color: #687180;
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.15em;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .hero-price-card strong {
    color: #0d1117;
    display: block;
    font-family: var(--font-heading), Sora, system-ui, sans-serif;
    font-size: 28px;
    letter-spacing: -0.035em;
    line-height: 1.05;
  }

  .proposal-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 34px 0 0;
  }

  .proposal-meta div {
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 16px;
    background: #f8fafb;
    padding: 14px;
  }

  .proposal-meta dt {
    color: #747d8c;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.12em;
    margin-bottom: 5px;
    text-transform: uppercase;
  }

  .proposal-meta dd {
    color: #111827;
    font-size: 14px;
    font-weight: 750;
    margin: 0;
  }

  .hero-note {
    border-left: 4px solid #00c982;
    color: #26303d;
    background: #f4fbf8;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 750;
    margin-top: 24px;
    padding: 14px 16px;
  }

  .proposal-section,
  .proposal-footer {
    margin-top: 18px;
    padding: 34px;
  }

  .section-label {
    color: #00a66a;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.16em;
    margin-bottom: 12px;
    text-transform: uppercase;
  }

  .proposal-section h2,
  .proposal-footer h2 {
    color: #0d1117;
    font-family: var(--font-heading), Sora, system-ui, sans-serif;
    font-size: clamp(26px, 4vw, 38px);
    font-weight: 850;
    letter-spacing: -0.045em;
    line-height: 1.08;
    margin: 0 0 18px;
  }

  .proposal-section p,
  .proposal-footer p {
    color: #4d5664;
    font-size: 16px;
    line-height: 1.65;
    margin: 0 0 13px;
  }

  .compact-list,
  .front-card ul,
  .pricing-columns ul {
    color: #2b3440;
    margin: 16px 0 0;
    padding-left: 20px;
  }

  .compact-list li,
  .front-card li,
  .pricing-columns li {
    margin: 6px 0;
  }

  .callout,
  .mini-highlight,
  .section-note,
  .validity {
    border-radius: 18px;
    background: #f5f8fa;
    color: #1d2733 !important;
    font-weight: 750;
    margin-top: 22px !important;
    padding: 18px 20px;
  }

  .mini-highlight {
    background: #eefcf6;
  }

  .two-column-list,
  .checklist-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
  }

  .check-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    border: 1px solid rgba(15, 23, 42, 0.07);
    border-radius: 16px;
    background: #fbfcfd;
    color: #2d3744;
    font-size: 14px;
    line-height: 1.45;
    padding: 13px;
  }

  .proposal-check {
    color: #00a66a;
    flex: 0 0 auto;
    height: 17px;
    margin-top: 1px;
    width: 17px;
  }

  .front-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 22px;
  }

  .front-card,
  .mini-card {
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 22px;
    background: #fbfcfd;
    padding: 20px;
  }

  .front-card h3,
  .mini-card h3,
  .pricing-columns h3 {
    color: #0d1117;
    font-family: var(--font-heading), Sora, system-ui, sans-serif;
    font-size: 18px;
    letter-spacing: -0.02em;
    margin: 0 0 12px;
  }

  .front-card p,
  .mini-card p {
    font-size: 14px;
    line-height: 1.55;
  }

  .front-card ul {
    font-size: 13px;
  }

  .card-note {
    border-radius: 14px;
    background: #f1f5f7;
    color: #25303b !important;
    font-size: 13px !important;
    font-weight: 700;
    margin-top: 14px !important;
    padding: 12px;
  }

  .ops-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .pricing-section {
    padding: 0;
    overflow: hidden;
  }

  .pricing-card {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 24px;
    align-items: center;
    background: linear-gradient(135deg, #0d1117, #17202b);
    padding: 34px;
  }

  .pricing-card h2,
  .pricing-card p,
  .pricing-card .section-label {
    color: #fff;
  }

  .pricing-card p {
    color: rgba(255, 255, 255, 0.74);
  }

  .pricing-amount {
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.08);
    padding: 22px;
  }

  .pricing-amount span {
    color: rgba(255, 255, 255, 0.62);
  }

  .pricing-amount strong {
    color: #fff;
    display: block;
    font-family: var(--font-heading), Sora, system-ui, sans-serif;
    font-size: 34px;
    letter-spacing: -0.045em;
    line-height: 1.05;
  }

  .pricing-amount small {
    color: rgba(255, 255, 255, 0.7);
    display: block;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.08em;
    margin-top: 10px;
    text-transform: uppercase;
  }

  .pricing-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    padding: 28px 34px 6px;
  }

  .pricing-columns > div {
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 20px;
    background: #fbfcfd;
    padding: 18px;
  }

  .pricing-section .section-note,
  .pricing-section .validity {
    margin: 18px 34px !important;
  }

  .validity {
    margin-bottom: 34px !important;
  }

  .proposal-footer {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 28px;
    align-items: center;
  }

  .proposal-footer strong {
    color: #0d1117;
    display: block;
    font-size: 17px;
    line-height: 1.55;
    margin-top: 18px;
  }

  @media (max-width: 820px) {
    .proposal-shell {
      width: min(100% - 20px, 900px);
      padding: 18px 0 42px;
    }

    .proposal-hero,
    .proposal-section,
    .proposal-footer {
      border-radius: 22px;
      padding: 22px;
    }

    .proposal-hero-grid,
    .proposal-meta,
    .front-grid,
    .two-column-list,
    .checklist-grid,
    .ops-grid,
    .pricing-card,
    .pricing-columns,
    .proposal-footer {
      grid-template-columns: 1fr;
    }

    .proposal-hero-grid {
      margin-top: 30px;
    }

    .hero-price-card {
      max-width: 340px;
    }

    .proposal-kicker {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .pricing-card {
      padding: 24px;
    }

    .pricing-columns {
      padding: 22px 22px 0;
    }

    .pricing-section .section-note,
    .pricing-section .validity {
      margin-left: 22px !important;
      margin-right: 22px !important;
    }

    .proposal-cta {
      width: 100%;
    }
  }

  @media print {
    @page {
      size: A4;
      margin: 14mm;
    }

    body,
    .proposal-document {
      background: #fff !important;
    }

    .proposal-shell {
      width: 100%;
      padding: 0;
    }

    .proposal-hero,
    .proposal-section,
    .proposal-footer {
      box-shadow: none;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .page-break {
      break-before: page;
      page-break-before: always;
    }

    .proposal-cta {
      display: none;
    }
  }
`;
