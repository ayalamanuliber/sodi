import { ArrowRight, Check } from "lucide-react";
import { TrackedLink } from "./TrackedLink";
import styles from "./landing.module.css";

export function WeddingOfferLadder({selfServe=false,beta=false,limits}:{selfServe?:boolean;beta?:boolean;limits?:{people:number;photos:number}}) {
  return (
    <section className={styles.model} id="publicar" data-wedding-reveal>
      <article className={styles.modelMain}>
        <span className={styles.modelStatus}>{selfServe ? beta?"Beta gratuita":"Lo esencial, gratis" : "Prueba gratuita"}</span>
        <h2>{selfServe ? "Inviten a los suyos. Lo esencial está incluido." : "Vean cómo quedaría. Después, decidimos cómo ponerla en marcha."}</h2>
        <p>
          {selfServe ? "Invitación con sus fotos, respuestas por persona y mesas en un mismo espacio. Con una firma discreta de SODI Bodas, sin tarjeta." : "Elijan un estilo, cambien los nombres y prueben una confirmación. Van a ver la invitación y cómo se actualiza la lista de invitados."}
        </p>
        {selfServe&&limits&&<p>Hasta {limits.people} personas y {limits.photos} fotos propias por boda. La asistencia y los detalles especiales se consultan aparte.</p>}
        <div className={styles.modelChecklist}>
          <span><Check size={17} /> {selfServe ? "Invitación, confirmaciones y lista de personas" : "Datos ficticios listos para empezar"}</span>
          <span><Check size={17} /> {selfServe ? "Mesas, menús y necesidades de accesibilidad" : "Textos y estilo guardados siete días en este navegador"}</span>
          <span><Check size={17} /> {selfServe ? "Su panel privado y un enlace para cada grupo" : "Prueba privada, sin cuenta ni tarjeta"}</span>
        </div>
        <TrackedLink
          href={selfServe ? "/boda/empezar" : "/boda/prueba"}
          className={styles.primaryButton}
          eventName="trial_start"
          eventLocation="offer_ladder"
        >
          {selfServe ? "Crear boda gratis" : "Probar invitación"} <ArrowRight size={18} strokeWidth={1.8} />
        </TrackedLink>
      </article>

      <div className={styles.modelSide}>
        <article data-recommended="true">
          <span>Ayuda opcional</span>
          <h3>Si prefieren delegar</h3>
          <p>
            Podemos ayudarlos a preparar la invitación y ordenar la lista. La asistencia se contrata por separado; acordamos alcance, precio y entrega antes de empezar.
          </p>
          <a href="#consulta">Consultar para mi boda</a>
        </article>
        <article>
          <span>Si necesitan algo especial</span>
          <h3>Hablemos de esos detalles</h3>
          <p>
            Un diseño desde cero, más momentos del festejo o ayuda con una lista
            que todavía está por ordenar. Lo revisamos antes de presupuestar.
          </p>
          <a href="#opcionales">Contar qué necesitamos</a>
        </article>
      </div>
    </section>
  );
}
