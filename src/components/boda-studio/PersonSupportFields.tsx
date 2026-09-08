"use client";
import type { AccessibilityNeed, Person } from '@/lib/boda-service/types';
import styles from './studio.module.css';
import supportStyles from './person-support.module.css';
export const menuOptions=['Tradicional','Vegetariano','Vegano','Infantil','Sin menú'];
export const accessibilityLabels:Record<AccessibilityNeed,string>={wheelchair_space:'Espacio para silla de ruedas',step_free_access:'Acceso sin escalones',highchair:'Silla alta'};
export function PersonSupportFields({person,onChange,disabled=false}:{person:Person;onChange:(person:Person)=>void;disabled?:boolean}) {
 const needs=person.accessibilityNeeds??[];
 const reservesPlace=needs.some(n=>n==='wheelchair_space'||n==='highchair');
 const menu=person.menu??'';
 return <fieldset className={supportStyles.root} disabled={disabled}>
  <legend>Comida y preparación del lugar</legend>
  <label className={styles.field}>Menú<select aria-label="Menú" value={menu} onChange={e=>onChange({...person,menu:e.target.value})}><option value="">Pendiente</option>{menuOptions.map(option=><option key={option} value={option}>{option}</option>)}{menu&&!menuOptions.includes(menu)&&<option value={menu}>Actual: {menu}</option>}</select><small>Elegí lo que necesita esta persona; no se deduce por edad.</small></label>
  <label className={styles.field}>Restricción alimentaria (opcional)<input aria-label="Restricción alimentaria (opcional)" maxLength={240} value={person.dietaryRestriction??''} placeholder="Por ejemplo: preparar sin nueces" onChange={e=>onChange({...person,dietaryRestriction:e.target.value,shareDietaryRestriction:false})}/><small>Indicá sólo qué debe preparar o evitar catering, sin diagnósticos ni historia médica.</small></label>
  <label className={styles.check}><input type="checkbox" disabled={!person.dietaryRestriction?.trim()} checked={person.shareDietaryRestriction??false} onChange={e=>onChange({...person,shareDietaryRestriction:e.target.checked})}/> Esta información fue compartida por la persona y autorizo incluirla en la lista para catering.</label>
  <p className={supportStyles.hint}>La pareja puede ver la restricción. Sólo se exporta a catering cuando marcás la autorización; podés retirarla desmarcando esta casilla.</p>
  <fieldset className={supportStyles.needs}><legend>Necesidades para preparar el lugar (opcionales)</legend>{(Object.entries(accessibilityLabels) as [AccessibilityNeed,string][]).map(([value,label])=><label className={styles.check} key={value}><input type="checkbox" checked={needs.includes(value)} onChange={e=>{const next=e.target.checked?[...needs.filter(n=>value==='highchair'?n!=='wheelchair_space':value==='wheelchair_space'?n!=='highchair':true),value]:needs.filter(n=>n!==value);onChange({...person,accessibilityNeeds:next,seatRequired:e.target.checked&&(value==='wheelchair_space'||value==='highchair')?true:person.seatRequired});}}/>{label}</label>)}</fieldset>
  <label className={styles.check}><input type="checkbox" checked={person.seatRequired} disabled={reservesPlace} onChange={e=>onChange({...person,seatRequired:e.target.checked})}/> Reserva un lugar en la mesa</label>
  <p className={supportStyles.hint}>{reservesPlace?'La silla alta o el espacio para silla de ruedas reserva un lugar; no agrega sillas ni aumenta la capacidad de la mesa.':'Un bebé en brazos puede quedar sin lugar propio. Si necesita silla alta, marcala: ocupa una plaza. Acceso sin escalones no cambia la cantidad de lugares.'} Silla alta y espacio para silla de ruedas son alternativas para esta persona. Las necesidades declaradas se incluyen en la lista para el salón. La pareja debe confirmar su preparación con el lugar.</p>
 </fieldset>;
}
