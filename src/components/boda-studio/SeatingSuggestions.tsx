"use client";

import {ArrowRight,Check,ClipboardList,Users} from 'lucide-react';
import type {EventView} from '@/lib/boda-service/types';
import {seatingSuggestions,serviceReview} from '@/lib/boda-service/seating-suggestions';
import type {Mutate} from './GuestManager';
import styles from './seating-service.module.css';

export function SeatingSuggestions({event,mutate,busy,layoutDirty}:{event:EventView;mutate:Mutate;busy:boolean;layoutDirty:boolean}) {
  const suggestions=seatingSuggestions(event);
  const review=serviceReview(event);
  return <section className={styles.root} aria-labelledby="seating-help-title">
    <header><p>Para revisar antes del gran día</p><h2 id="seating-help-title">Un lugar para cada persona.</h2><span>Las propuestas priorizan mantener juntos a quienes comparten invitación y usan los lugares disponibles. Ustedes deciden cómo sentarlos.</span></header>
    <div className={styles.grid}>
      <section className={styles.card} aria-label="Sugerencias de ubicación"><h3><Users size={19}/> Grupos por ubicar</h3>
        {suggestions.length?<><ul>{suggestions.slice(0,5).map(({group,people,required,option,existingTables})=><li key={group.id}><strong>{group.label}</strong><p>{people.length} {people.length===1?'persona confirmada':'personas confirmadas'} · {required} {required===1?'lugar necesario':'lugares necesarios'}.</p>{option?<><p>{option.withFamily?`En ${option.table.name} ya hay personas de esta invitación.`:`En ${option.table.name} hay ${option.free} lugares libres.`} {existingTables.length?'Entran todas las personas pendientes.':'El grupo entra completo.'}</p>{existingTables.some(table=>table.id!==option.table.id)&&<p className={styles.attention}>La invitación quedará repartida: hay familiares ya ubicados en {existingTables.filter(table=>table.id!==option.table.id).map(table=>table.name).join(', ')}. Esta propuesta mueve solo a quienes no tienen mesa.</p>}<button disabled={busy||layoutDirty} onClick={()=>mutate('assign',{personIds:people.map(person=>person.id),tableId:option.table.id})}>Ubicar en {option.table.name} <ArrowRight size={15}/></button></>:<p className={styles.attention}>No hay una mesa con lugar para este grupo completo. Pueden agregar una mesa o repartirlo desde la lista.</p>}</li>)}</ul>{suggestions.length>5&&<p>Hay {suggestions.length-5} grupos más. Las propuestas se actualizan a medida que ubican personas.</p>}</>:<p className={styles.empty}><Check size={17}/> {review.confirmed.length?'Todas las personas confirmadas tienen una mesa.':'Las propuestas aparecen cuando llegan las confirmaciones.'}</p>}
        <small>No se asigna a nadie automáticamente ni se decide por sus preferencias alimentarias o necesidades de accesibilidad.</small>
      </section>
      <section className={styles.card} aria-label="Revisión de menús y accesibilidad"><h3><ClipboardList size={19}/> Preparar el servicio</h3>
        <dl className={styles.metrics}><div><dt>{review.breakdown.ordinaryChairs}</dt><dd>sillas comunes a preparar</dd></div><div><dt>{review.breakdown.highchairs}</dt><dd>sillas altas</dd></div><div><dt>{review.breakdown.wheelchairs}</dt><dd>espacios para silla de ruedas</dd></div><div><dt>{review.breakdown.withoutPlace}</dt><dd>asistentes sin lugar propio</dd></div></dl>
        <ul className={styles.reviewList}><li><strong>{review.pendingMenu.length?`${review.pendingMenu.length} menús por confirmar`:review.confirmed.length?'Menús registrados':'Sin confirmaciones todavía'}</strong><p>{review.pendingMenu.length?'Completen la preferencia en la ficha de cada persona antes de enviar el listado al catering.':'La preferencia registrada acompaña a cada persona en el listado de catering.'}</p></li>
          {review.stepFree.length>0&&<li><strong>{review.stepFree.length} {review.stepFree.length===1?'persona solicita':'personas solicitan'} acceso sin escalones</strong><p>Coordinen el recorrido con el salón. El esquema no verifica entradas, desniveles ni circulación.</p></li>}
          {review.breakdown.wheelchairs+review.breakdown.highchairs>0&&<li><strong>Confirmar el equipamiento con el salón</strong><p>Los espacios para silla de ruedas y las sillas altas ocupan lugares de la mesa. No se suman a su capacidad.</p></li>}
          {review.withheld.length>0&&<li><strong>{review.withheld.length} {review.withheld.length===1?'indicación alimentaria sin permiso':'indicaciones alimentarias sin permiso'} para exportar</strong><p>Esas indicaciones quedan fuera del archivo de catering. Revisen con la persona cómo quiere comunicarlas.</p></li>}
        </ul>
      </section>
    </div>
  </section>;
}
