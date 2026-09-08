"use client";

import Image from "next/image";
import Link from "next/link";
import {useSyncExternalStore} from "react";
import {useBodaCapabilities} from "@/components/boda-studio/useBodaCapabilities";
import {rememberedWedding} from "@/components/boda-studio/access-receipt";
import {
  ArrowRight,
  Check,
  Palette,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { WEDDING_THEMES } from "@/lib/boda-trial/themes";
import { GuestConfirmationDemo } from "./GuestConfirmationDemo";
import { TrackedLink } from "./TrackedLink";
import { WeddingAnalytics } from "./WeddingAnalytics";
import { WeddingFaq } from "./WeddingFaq";
import { WeddingExtras } from "./WeddingExtras";
import { WeddingHeroPreview } from "./WeddingHeroPreview";
import { WeddingInterestForm } from "./WeddingInterestForm";
import { WeddingOfferLadder } from "./WeddingOfferLadder";
import { WeddingProductFilm } from "./WeddingProductFilm";
import { WeddingReveal } from "./WeddingReveal";
import { WeddingThemeProof } from "./WeddingThemeProof";
import styles from "./landing.module.css";

function subscribeReturn(onChange:()=>void){window.addEventListener("storage",onChange);return()=>window.removeEventListener("storage",onChange);}
export function WeddingLanding() {
  const {capabilities}=useBodaCapabilities();
  const selfServe=capabilities?.selfServeEnabled===true;
  const returnPath=useSyncExternalStore(subscribeReturn,()=>rememberedWedding()?.panelPath??"",()=>"");
  return (
    <div className={styles.page}>
      <WeddingAnalytics />
      <WeddingReveal />

      <header className={styles.header}>
        <a href="#inicio" className={styles.brand} aria-label="SODI Bodas, inicio">
          SODI <span>Bodas</span>
        </a>
        <nav className={styles.nav} aria-label="Principal">
          <a href="#temas">Los estilos</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#publicar">Qué incluye</a>
        </nav>
        {returnPath&&<a className={styles.navCta} href={returnPath}>Volver a mi boda</a>}
        <TrackedLink
          href={selfServe ? "/boda/empezar" : "/boda/prueba"}
          className={styles.navCta}
          eventName="trial_start"
          eventLocation="nav"
        >
          {selfServe ? "Crear boda gratis" : "Probar invitación"}
        </TrackedLink>
      </header>

      <main>
        <section className={styles.hero} id="inicio">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Invitaciones digitales para bodas</span>
            <h1>Una invitación<br />muy <em>ustedes.</em></h1>
            <p>La fecha, el lugar y sus fotos en una invitación que los represente. Y un lugar para ver quién viene, cuántos son y quién falta responder.</p>
            <div className={styles.heroActions}>
              <TrackedLink
                href={selfServe ? "/boda/empezar" : "/boda/prueba"}
                className={styles.primaryButton}
                eventName="trial_start"
                eventLocation="hero"
              >
                {selfServe ? "Crear boda gratis" : "Probar invitación"} <ArrowRight size={18} strokeWidth={1.8} />
              </TrackedLink>
              <TrackedLink
                href="#como-funciona"
                className={styles.secondaryButton}
                eventName="demo_play"
                eventLocation="hero"
              >
                Ver cómo funciona
              </TrackedLink>
            </div>
            <small className={styles.heroReassurance}>{selfServe ? `${capabilities?.beta?"Beta gratis":"Gratis"}, sin tarjeta. Ustedes deciden cuándo publicarla.` : "Prueben con sus datos. Gratis, sin cuenta ni tarjeta."}</small>
            <div className={styles.heroFootnote}><span>Hecha para emocionarse.</span><span>Pensada para organizarse.</span></div>
          </div>
          <WeddingHeroPreview />
        </section>

        <section className={styles.promiseStrip} aria-label="Qué resuelve SODI Bodas">
          <span><Palette size={18} /> Invitación completa</span>
          <span><UsersRound size={18} /> Enlaces para cada familia</span>
          <span><UserRoundCheck size={18} /> Confirmaciones en un lugar</span>
        </section>

        <GuestConfirmationDemo />

        <section className={styles.productStory} id="invitacion" data-wedding-reveal>
          <div className={styles.productStoryImage}>
            <Image
              src="/invitaciones-boda/couple-ceremony.webp"
              alt="Pareja completamente ficticia durante una ceremonia de muestra"
              fill
              sizes="(max-width: 900px) 100vw, 52vw"
            />
            <span className={styles.photoCaption}>Lo importante es encontrarse.</span>
          </div>
          <div className={styles.productStoryCopy}>
            <span className={styles.eyebrow}>Cada detalle, en su lugar</span>
            <h2>El día es suyo. La información, para todos.</h2>
            <p>
              Dónde es la ceremonia, a qué hora empieza la fiesta y cómo vestirse. Sus invitados encuentran los detalles junto a sus fotos y pueden confirmar cuántas personas van.
            </p>
            <div className={styles.productBenefits}>
              <span><Check size={17} /> Un estilo elegido por ustedes, con sus fotos y textos</span>
              <span><Check size={17} /> Cantidad de personas definida para cada familia</span>
              <span><Check size={17} /> Quién viene, quién no y quién falta responder</span>
              <span><Check size={17} /> Lista de respuestas para revisar y descargar</span>
            </div>
          </div>
        </section>

        <section className={styles.themes} id="temas" data-wedding-reveal>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>La colección</span><h2>Distintas formas de decir <em>sí.</em></h2>
            <p>Seis puntos de partida. Cambien los nombres, las fotos y los colores hasta sentir que es suya. Pueden probar otro estilo sin volver a empezar.</p>
          </div>
          <div className={styles.themeRail}>
            {WEDDING_THEMES.map((theme) => (
              <article className={styles.themeCard} data-theme={theme.id} key={theme.id}>
                <div className={styles.themeImage}><WeddingThemeProof theme={theme} /></div>
                <div className={styles.themeCopy}>
                  <h3>{theme.name}</h3>
                  <span>{theme.direction}</span>
                  <p>{theme.description}</p><TrackedLink href={`/boda/prueba?estilo=${theme.id}`} eventName="trial_start" eventLocation={`collection_${theme.id}`} className={styles.themeLink}>Probar {theme.name} <ArrowRight size={16} /></TrackedLink>
                </div>
              </article>
            ))}
          </div>
          <TrackedLink
            href="/boda/prueba"
            className={styles.primaryButton}
            eventName="trial_start"
            eventLocation="themes"
          >
            Probar invitación <ArrowRight size={18} strokeWidth={1.8} />
          </TrackedLink>
        </section>

        <WeddingProductFilm />

        <WeddingOfferLadder selfServe={selfServe} beta={capabilities?.beta===true} limits={capabilities?.limits}/>

        <WeddingExtras />

        <section className={styles.faq} id="preguntas" data-wedding-reveal>
          <div className={styles.faqHeading}>
            <h2>Antes del primer paso.</h2>
            <p>Cómo funciona la prueba y qué acordamos antes de usarla en su boda.</p>
          </div>
          <WeddingFaq />
        </section>

        <section className={styles.contact} id="consulta" data-wedding-reveal>
          <div className={styles.contactCopy}>
            <h2>¿Ya tienen fecha para la boda?</h2>
            <p>Contanos cuándo se casan y qué ayuda necesitan. Con eso podemos revisar la propuesta para su boda.</p>
            <span>La consulta se prepara acá y la enviás vos por WhatsApp.</span>
          </div>
          <WeddingInterestForm />
        </section>
      </main>

      <footer className={styles.footer}>
        <a href="#inicio" className={styles.brand}>SODI <span>Bodas</span></a>
        <p>Invitaciones personalizadas y lista de invitados ordenada.</p>
        <Link href="/boda/privacidad">Privacidad de la boda</Link>
        <a href="mailto:hola@sodi.com.ar">hola@sodi.com.ar</a>
      </footer>
    </div>
  );
}
