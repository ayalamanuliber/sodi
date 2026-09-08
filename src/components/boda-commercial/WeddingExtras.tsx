"use client";

import Image from "next/image";
import { ArrowUpRight, Check, ClipboardList, Images, Link2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import styles from "./extras.module.css";

const EXTRAS = [
  { id: "custom_design", title: "Un diseño desde cero", detail: "Colores, tipografías y composición pensados para ustedes, más allá de los seis estilos.", category: "Su invitación, a su manera", event: "custom_design_interest", image: "/invitaciones-boda/services/design-materials.webp", alt: "Papeles de algodón, cinta verde y relieves botánicos para explorar una dirección visual.", icon: null },
  { id: "extra_locations", title: "Más lugares o momentos", detail: "Sumar a la invitación el civil, un brunch u otro encuentro, con sus horarios e indicaciones.", category: "Todo el festejo en un enlace", event: "extra_location_interest", image: "/invitaciones-boda/services/garden-brunch.webp", alt: "Una mesa de brunch preparada en un jardín, con vajilla clara, frutas y flores.", icon: null },
  { id: "setup", title: "Ayuda para ordenar la lista", detail: "Reunir los nombres y las confirmaciones que tienen repartidos en varios lugares.", category: "Empezar con la lista clara", event: "setup_help_interest", image: null, alt: "", icon: ClipboardList },
  { id: "custom_url", title: "Una dirección web propia", detail: "Consultar una dirección elegida por ustedes para compartir su invitación.", category: "Un enlace fácil de recordar", event: "custom_url_interest", image: null, alt: "", icon: Link2 },
  { id: "expanded_gallery", title: "Más fotos o una sección especial", detail: "Dar espacio a más recuerdos, contenido o una parte de la historia que quieran contar.", category: "Lo que también quieren compartir", event: "expanded_gallery_interest", image: null, alt: "", icon: Images },
] as const;

export function WeddingExtras() {
  const [selected, setSelected] = useState<string[]>([]);
  const requestUrl = useMemo(() => {
    const names = EXTRAS.filter((item) => selected.includes(item.id)).map((item) => item.title);
    return `https://wa.me/5491138696958?text=${encodeURIComponent(`Hola SODI, queremos consultar estas ideas para nuestra invitación: ${names.join(", ")}.`)}`;
  }, [selected]);

  function toggle(item: typeof EXTRAS[number]) {
    const active = selected.includes(item.id);
    setSelected((current) => active ? current.filter((id) => id !== item.id) : [...current, item.id]);
    if (!active) trackEvent(item.event, { surface: "wedding_extras" });
  }

  return (
    <section className={styles.extras} id="opcionales" data-wedding-reveal aria-labelledby="extras-title">
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Detalles para hacerla suya</p>
        <h2 id="extras-title">¿Su boda necesita algo más?</h2>
        <p>Hay ideas que no entran en una plantilla. Marquen qué les gustaría sumar a su invitación digital y preparemos una consulta.</p>
      </div>
      <div className={styles.grid}>
        {EXTRAS.map((item, index) => {
          const active = selected.includes(item.id);
          const Icon = item.icon;
          return (
            <button className={item.image ? styles.visualCard : styles.detailCard} type="button" key={item.id} data-selected={active} aria-label={item.title} aria-describedby={`extra-detail-${item.id}`} aria-pressed={active} onClick={() => toggle(item)}>
              {item.image ? <span className={styles.media}><Image src={item.image} alt={item.alt} width={1200} height={800} sizes="(max-width: 700px) 100vw, 50vw"/><span className={styles.photoIndex} aria-hidden="true">0{index + 1}</span></span> : <span className={styles.symbol} aria-hidden="true">{Icon && <Icon size={29} strokeWidth={1.35}/>}<span>0{index + 1}</span></span>}
              <span className={styles.cardBody}>
                <span className={styles.category}>{item.category}</span>
                <strong>{item.title}</strong>
                <span className={styles.description} id={`extra-detail-${item.id}`}>{item.detail}</span>
                <span className={styles.selection}><span className={styles.check} aria-hidden="true">{active ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={1.7}/>}</span><span>{active ? "Seleccionado" : "Sumar a la consulta"}</span></span>
              </span>
            </button>
          );
        })}
      </div>
      <div className={styles.request}>
        <div><strong>De una idea a una propuesta.</strong><p>Revisamos qué podemos hacer, el trabajo que requiere y su presupuesto antes de avanzar.</p><p className={styles.selectionStatus} role="status" aria-live="polite">{selected.length ? `${selected.length} ${selected.length === 1 ? "detalle seleccionado" : "detalles seleccionados"}. La consulta se abre preparada, pero no se envía sola.` : "Marquen uno o más detalles para preparar la consulta."}</p></div>
        <a href={selected.length ? requestUrl : "#opcionales"} aria-disabled={!selected.length} target={selected.length ? "_blank" : undefined} rel={selected.length ? "noopener noreferrer" : undefined} onClick={(event) => { if (!selected.length) event.preventDefault(); else trackEvent("extras_request", { extras: selected.join(",") }); }}>
          Preparar consulta <ArrowUpRight size={17} strokeWidth={1.8} />
        </a>
      </div>
    </section>
  );
}
