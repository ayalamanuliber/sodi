"use client";

import { useEffect, useId, useImperativeHandle, useRef, useState, type KeyboardEvent, type PointerEvent, type Ref } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, DoorOpen, Grid2X2, Minus, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import type { EventView, Table } from '@/lib/boda-service/types';
import { CHAIR_MARGIN, clampPosition, geometryOf, overlapping, withinRoom } from '@/lib/boda-service/layout';
import type { Mutate } from './GuestManager';
import styles from './floor-plan.module.css';

export type FloorPlanHandle = { selectTable:(id:string)=>void };
type Geometry = { capacity?:number; label:string; shape:'round'|'rectangular'; x:number; y:number; width:number; height:number; rotation:number };
type Item = { id:string; kind:'table'|'feature'; value:Geometry; table?:Table; number?:number };
type Edit = {base:string; value:Geometry};
const fingerprint = (value:Geometry) => JSON.stringify(value);
const roomFingerprint = (room:{width:number;height:number}) => `${room.width}:${room.height}`;
const format = (value:number) => value.toLocaleString('es-AR',{maximumFractionDigits:2});

function seatPositions(table:Geometry,count:number) {
  if(table.shape==='round')return Array.from({length:count},(_,i)=>({x:Math.cos(i*Math.PI*2/count-Math.PI/2)*(table.width/2+0.32),y:Math.sin(i*Math.PI*2/count-Math.PI/2)*(table.height/2+0.32)}));
  const positions:{x:number;y:number}[]=[];
  for(let side=0;side<4;side++) {
    const n=Math.floor(count/4)+(side<count%4?1:0);
    for(let index=0;index<n;index++) {
      const fraction=(index+1)/(n+1)-0.5;
      positions.push(side===0?{x:fraction*table.width,y:-table.height/2-0.32}:side===1?{x:table.width/2+0.32,y:fraction*table.height}:side===2?{x:-fraction*table.width,y:table.height/2+0.32}:{x:-table.width/2-0.32,y:-fraction*table.height});
    }
  }
  return positions;
}

export function FloorPlanEditor({event,mutate,busy,onUnsavedChange,ref}:{event:EventView;mutate:Mutate;busy:boolean;onUnsavedChange?:(dirty:boolean)=>void;ref?:Ref<FloorPlanHandle>}) {
  const room=event.floorPlan;
  const items:Item[]=[...event.tables.map((table,index)=>({id:table.id,kind:'table' as const,table,number:index+1,value:{label:table.name,capacity:table.capacity,...geometryOf(table)}})),...room.features.map(feature=>({id:feature.id,kind:'feature' as const,value:{label:feature.label,shape:'rectangular' as const,x:feature.x,y:feature.y,width:feature.width,height:feature.height,rotation:feature.rotation}}))];
  const [selected,setSelected]=useState('');
  const rootRef=useRef<HTMLElement>(null);const pickerRef=useRef<HTMLSelectElement>(null);
  useImperativeHandle(ref,()=>({selectTable(id:string){setSelected(id);rootRef.current?.scrollIntoView({block:'start',behavior:'instant'});requestAnimationFrame(()=>pickerRef.current?.focus({preventScroll:true}));}}),[]);
  const [edits,setEdits]=useState<Record<string,Edit>>({});
  const [roomEdit,setRoomEdit]=useState<{base:string;width:number;height:number}|null>(null);
  const [zoom,setZoom]=useState(1);
  const [message,setMessage]=useState('');
  const svgRef=useRef<SVGSVGElement>(null);
  const drag=useRef<{id:string;pointerId:number;startX:number;startY:number;value:Geometry}|null>(null);
  const patternId=useId().replaceAll(':','');
  const active=items.find(item=>item.id===selected)??items[0];
  const current=active?(edits[active.id]?.value??active.value):null;
  const currentEdit=active?edits[active.id]:undefined;
  const conflict=Boolean(active&&currentEdit&&currentEdit.base!==fingerprint(active.value));
  const dirty=Object.keys(edits).length>0||roomEdit!==null;
  const roomConflict=Boolean(roomEdit&&roomEdit.base!==roomFingerprint(room));
  const orphaned=Object.keys(edits).filter(id=>!items.some(item=>item.id===id));
  const displayed=items.map(item=>({...item,value:edits[item.id]?.value??item.value}));
  const overlaps:string[]=[];
  for(let a=0;a<displayed.length;a++)for(let b=a+1;b<displayed.length;b++){
    if(displayed[a].kind==='feature'&&displayed[b].kind==='feature')continue;
    if(overlapping(displayed[a].value,displayed[b].value,displayed[a].kind==='table'?CHAIR_MARGIN:0,displayed[b].kind==='table'?CHAIR_MARGIN:0))overlaps.push(`${displayed[a].value.label} y ${displayed[b].value.label}`);
  }
  const requiredPlaces=active?.table?event.assignments.filter(a=>a.tableId===active.id&&event.people.find(p=>p.id===a.personId)?.seatRequired).length:0;
  const invalidCapacity=Boolean(active?.table&&(!Number.isInteger(current?.capacity)||current!.capacity!<Math.max(1,requiredPlaces)||current!.capacity!>100));
  const invalidCurrent=Boolean(active&&current&&(!current.label.trim()||current.width<(active.kind==='table'?0.8:0.3)||current.height<(active.kind==='table'?0.8:0.3)||current.width>(active.kind==='table'?6:12)||current.height>(active.kind==='table'?6:12)||!withinRoom(current,room,active.kind==='table'?CHAIR_MARGIN:0)));
  useEffect(()=>{onUnsavedChange?.(dirty);},[dirty,onUnsavedChange]);
  useEffect(()=>()=>onUnsavedChange?.(false),[onUnsavedChange]);
  function edit(item:Item,next:Geometry) {
    setMessage('');
    setEdits(previous=>{
      const base=previous[item.id]?.base??fingerprint(item.value);
      if(fingerprint(next)===base){const copy={...previous};delete copy[item.id];return copy;}
      return {...previous,[item.id]:{base,value:next}};
    });
  }
  function discard(id:string){setEdits(previous=>{const copy={...previous};delete copy[id];return copy;});setMessage('Se conserva la posición guardada.');}
  function point(e:{clientX:number;clientY:number}) {
    const svg=svgRef.current, matrix=svg?.getScreenCTM();
    if(!svg||!matrix)return null;
    const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(matrix.inverse());
  }
  function startDrag(e:PointerEvent<SVGGElement>,item:Item) {
    if(busy||e.button!==0)return;
    const start=point(e);if(!start)return;
    setSelected(item.id);e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);
    drag.current={id:item.id,pointerId:e.pointerId,startX:start.x,startY:start.y,value:edits[item.id]?.value??item.value};
  }
  function moveDrag(e:PointerEvent<SVGGElement>,item:Item) {
    const moving=drag.current;if(!moving||moving.id!==item.id||moving.pointerId!==e.pointerId||busy)return;
    const position=point(e);if(!position)return;e.preventDefault();
    const value={...moving.value,x:moving.value.x+position.x-moving.startX,y:moving.value.y+position.y-moving.startY};
    edit(item,{...value,...clampPosition(value,room,item.kind==='table'?CHAIR_MARGIN:0)});
  }
  function endDrag(e:PointerEvent<SVGGElement>) {if(drag.current?.pointerId!==e.pointerId)return;drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}
  function nudge(item:Item,dx:number,dy:number) {
    if(busy)return;const value=edits[item.id]?.value??item.value;
    const next={...value,x:value.x+dx,y:value.y+dy};edit(item,{...next,...clampPosition(next,room,item.kind==='table'?CHAIR_MARGIN:0)});
  }
  function keyboard(e:KeyboardEvent<SVGGElement>,item:Item) {
    if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(item.id);return;}
    const moves:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if(!moves[e.key])return;e.preventDefault();setSelected(item.id);const step=e.shiftKey?0.5:0.1;nudge(item,moves[e.key][0]*step,moves[e.key][1]*step);
  }
  async function saveSelected() {
    if(!active||!current||!currentEdit||conflict||invalidCurrent||invalidCapacity)return;
    const payload=active.kind==='table'?{tableId:active.id,name:current.label,capacity:current.capacity,...geometryOf({...active.table!,...current})}:{featureId:active.id,label:current.label,x:current.x,y:current.y,width:current.width,height:current.height,rotation:current.rotation};
    const ok=await mutate(active.kind==='table'?'table_update':'floor_feature_update',payload);
    if(ok){discard(active.id);setMessage('Ubicación guardada. Las personas conservan su mesa.');}else setMessage('El cambio sigue acá sin guardar. Revisá el aviso del panel; si cambió la versión, pulsá Actualizar datos para comparar.');
  }
  async function saveRoom() {
    if(!roomEdit||roomConflict)return;
    if(await mutate('room_update',{width:roomEdit.width,height:roomEdit.height})){setRoomEdit(null);setMessage('Medidas del salón guardadas.');}
    else setMessage('Las medidas siguen pendientes. Las mesas y sus invitados se conservaron.');
  }
  const updateRoom=(key:'width'|'height',value:number)=>setRoomEdit(previous=>{const next={base:previous?.base??roomFingerprint(room),width:previous?.width??room.width,height:previous?.height??room.height,[key]:value};return roomFingerprint(next)===next.base?null:next;});
  return <section ref={rootRef} className={styles.root} aria-labelledby="floor-plan-title" data-floor-plan data-unsaved={dirty}>
    <header className={styles.heading}><div><p className={styles.eyebrow}>Esquema orientativo</p><h2 id="floor-plan-title">El plano de su salón</h2><p>Ubicá las mesas, la entrada y la pista. Verifiquen las medidas iniciales: las mesas y las sillas son orientativas. Revisen los espacios y la circulación con el salón.</p></div><span className={dirty?styles.pending:styles.saved}>{dirty?'Cambios sin guardar':'Plano guardado'}</span></header>
    <p className={styles.printUnsaved}>Hay cambios de plano sin guardar. El plano no se incluye en esta impresión. Guardá los cambios y revisá la distribución antes de entregar una copia al salón.</p>
    <form className={styles.roomForm} onSubmit={e=>{e.preventDefault();saveRoom();}}>
      <label>Ancho del salón <span>metros</span><input aria-label="Ancho del salón en metros" type="number" min={4} max={80} step={0.1} required disabled={busy} value={roomEdit?.width??room.width} onChange={e=>updateRoom('width',Number(e.target.value))}/></label>
      <label>Largo del salón <span>metros</span><input aria-label="Largo del salón en metros" type="number" min={4} max={80} step={0.1} required disabled={busy} value={roomEdit?.height??room.height} onChange={e=>updateRoom('height',Number(e.target.value))}/></label>
      <button className={styles.primary} disabled={busy||!roomEdit||roomConflict}><Save size={16}/> Guardar medidas</button>{roomEdit&&<button type="button" className={styles.secondary} disabled={busy} onClick={()=>setRoomEdit(null)}>Descartar medidas</button>}
    </form>
    {roomConflict&&<div className={styles.alert} role="alert">Las medidas cambiaron en otro dispositivo. Guardado: {format(room.width)} × {format(room.height)} m. Tu cambio: {format(roomEdit!.width)} × {format(roomEdit!.height)} m.<button className={styles.secondary} onClick={()=>setRoomEdit(previous=>previous?{...previous,base:roomFingerprint(room)}:null)}>Conservar mis medidas para revisar</button><button className={styles.secondary} onClick={()=>setRoomEdit(null)}>Usar medidas guardadas</button></div>}
    <div className={styles.layout}>
      <div className={styles.canvasColumn}>
        <div className={styles.canvasToolbar}><span>{format(room.width)} × {format(room.height)} m · cuadrícula de 1 m</span><div><button type="button" aria-label="Reducir plano" disabled={zoom<=1} onClick={()=>setZoom(Math.max(1,zoom-0.25))}><Minus size={16}/></button><button type="button" onClick={()=>setZoom(1)} aria-label="Ajustar plano al ancho">{Math.round(zoom*100)}%</button><button type="button" aria-label="Ampliar plano" disabled={zoom>=2.5} onClick={()=>setZoom(Math.min(2.5,zoom+0.25))}><Plus size={16}/></button></div></div>
        <div className={styles.viewport} data-zoomed={zoom>1} tabIndex={0} aria-label="Vista del salón; se puede desplazar al ampliar">
          <svg ref={svgRef} viewBox={`-1 -1 ${room.width+2} ${room.height+2}`} style={{width:`${zoom*100}%`}} role="group" aria-label="Plano del salón con mesas y referencias" aria-describedby="floor-plan-instructions">
            <defs><pattern id={patternId} width={1} height={1} patternUnits="userSpaceOnUse"><path d="M 1 0 L 0 0 0 1" fill="none" stroke="#dae2d8" strokeWidth={0.018}/></pattern></defs>
            <rect x={0} y={0} width={room.width} height={room.height} fill={`url(#${patternId})`} stroke="#778778" strokeWidth={0.055}/>
            <g transform="scale(0.01)"><text x={room.width*50} y={-40} textAnchor="middle" className={styles.measure}>{format(room.width)} m</text><text x={-45} y={room.height*50} transform={`rotate(-90 -45 ${room.height*50})`} textAnchor="middle" className={styles.measure}>{format(room.height)} m</text></g>
            {[...displayed.filter(i=>i.kind==='feature'),...displayed.filter(i=>i.kind==='table')].map(item=>{
              const g=item.value,isActive=item.id===active?.id,used=item.table?event.assignments.filter(a=>a.tableId===item.id&&event.people.find(p=>p.id===a.personId)?.seatRequired).length:0;
              const valid=withinRoom(g,room,item.kind==='table'?CHAIR_MARGIN:0);
              return <g key={item.id} role="button" tabIndex={0} aria-disabled={busy} aria-pressed={isActive} aria-label={`${item.kind==='table'?'Mesa':'Referencia'} ${g.label}. X ${format(g.x)}, Y ${format(g.y)} metros. Usá las flechas para mover.`} transform={`translate(${g.x} ${g.y}) rotate(${g.rotation})`} className={`${styles.object} ${isActive?styles.active:''} ${!valid?styles.outside:''}`} onPointerDown={e=>startDrag(e,item)} onPointerMove={e=>moveDrag(e,item)} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={e=>keyboard(e,item)} onClick={()=>setSelected(item.id)}>
                <title>{g.label}{item.table?` · ${used}/${g.capacity??item.table.capacity} asientos`:''}</title>
                <rect x={-g.width/2-(item.kind==='table'?0.5:0.08)} y={-g.height/2-(item.kind==='table'?0.5:0.08)} width={Math.max(0,g.width)+(item.kind==='table'?1:0.16)} height={Math.max(0,g.height)+(item.kind==='table'?1:0.16)} rx={0.18} className={styles.selection}/>
                {item.table&&seatPositions(g,Math.max(0,Math.min(100,g.capacity??item.table.capacity))).map((seat,index)=><circle key={index} cx={seat.x} cy={seat.y} r={0.12} className={index<used?styles.occupiedSeat:styles.emptySeat} aria-hidden="true"/>)}
                {g.shape==='round'&&item.kind==='table'?<ellipse cx={0} cy={0} rx={Math.max(0,g.width/2)} ry={Math.max(0,g.height/2)} className={styles.tableShape}/>:<rect x={-g.width/2} y={-g.height/2} width={Math.max(0,g.width)} height={Math.max(0,g.height)} rx={item.kind==='table'?0.12:0.04} className={item.kind==='table'?styles.tableShape:styles.featureShape}/>}
                <g transform={`rotate(${-g.rotation}) scale(0.01)`} pointerEvents="none">{item.kind==='table'?<><text y={-12} textAnchor="middle" className={styles.tableNumber}>{item.number}</text><text y={21} textAnchor="middle" className={styles.tableText}>{g.label.length>19?g.label.slice(0,18)+'…':g.label}</text><text y={46} textAnchor="middle" className={styles.seatCount}>{used}/{g.capacity??item.table!.capacity}</text></>:<text textAnchor="middle" dominantBaseline="middle" className={styles.featureText}>{g.label.length>22?g.label.slice(0,21)+'…':g.label}</text>}</g>
              </g>;
            })}
          </svg>
        </div>
        <p id="floor-plan-instructions" className={styles.instructions}>Arrastrá una mesa o elegila y usá los controles. Con una mesa enfocada, las flechas mueven 10 cm; Mayús + flecha, 50 cm. Las sillas muestran ocupación, no asientos numerados.</p>
        <ul className={styles.legend}>{displayed.filter(i=>i.kind==='table').map(item=><li key={item.id}><b>{item.number}</b><span>{item.value.label}</span><small>{event.assignments.filter(a=>a.tableId===item.id&&event.people.find(p=>p.id===a.personId)?.seatRequired).length}/{item.value.capacity??item.table!.capacity}</small></li>)}</ul>
        <p className={styles.printMeta}>Esquema orientativo · Revisión {event.revision} · {new Date(event.updatedAt).toLocaleString('es-AR')} · {format(room.width)} × {format(room.height)} m</p>
      </div>
      <aside className={styles.controls} aria-label="Controles del plano">
        <div className={styles.featureActions}><button className={styles.secondary} disabled={busy||room.features.length>=12} onClick={()=>mutate('floor_feature_add',{kind:'entrance'})}><DoorOpen size={16}/> Entrada</button><button className={styles.secondary} disabled={busy||room.features.length>=12} onClick={()=>mutate('floor_feature_add',{kind:'dancefloor'})}><Grid2X2 size={16}/> Pista</button></div>
        {active&&current?<><label className={styles.field}>Editar en el plano<select ref={pickerRef} value={active.id} onChange={e=>setSelected(e.target.value)}>{items.map(item=><option key={item.id} value={item.id}>{item.kind==='table'?`${item.number}. `:''}{item.value.label}{edits[item.id]?' · sin guardar':''}</option>)}</select></label>
          {conflict&&<div className={styles.alert} role="alert"><strong>Esta ubicación cambió en otro dispositivo.</strong><p>Guardada: X {format(active.value.x)}, Y {format(active.value.y)}. Tu cambio se conserva; revisalo antes de reemplazar la posición.</p><button className={styles.secondary} onClick={()=>discard(active.id)}>Usar ubicación guardada</button><button className={styles.secondary} onClick={()=>setEdits(previous=>({...previous,[active.id]:{...previous[active.id],base:fingerprint(active.value)}}))}>Conservar mi cambio para revisar</button></div>}
          <form className={styles.objectForm} onSubmit={e=>{e.preventDefault();saveSelected();}}>
            <label className={styles.field}>Nombre<input maxLength={active.kind==='table'?80:60} required value={current.label} disabled={busy} onChange={e=>edit(active,{...current,label:e.target.value})}/></label>
            {active.kind==='table'&&<div className={styles.capacityEditor}><label className={styles.field} htmlFor="table-capacity">Lugares en esta mesa</label><div className={styles.capacityStepper}><button type="button" aria-label="Quitar un lugar a esta mesa" disabled={busy||(current.capacity??1)<=Math.max(1,requiredPlaces)} onClick={()=>edit(active,{...current,capacity:(current.capacity??1)-1})}><Minus size={18}/></button><input id="table-capacity" aria-label="Lugares en esta mesa" type="number" min={Math.max(1,requiredPlaces)} max={100} step={1} required value={current.capacity??active.table!.capacity} disabled={busy} onChange={e=>edit(active,{...current,capacity:Number(e.target.value)})}/><button type="button" aria-label="Agregar un lugar a esta mesa" disabled={busy||(current.capacity??100)>=100} onClick={()=>edit(active,{...current,capacity:(current.capacity??0)+1})}><Plus size={18}/></button></div><p>{requiredPlaces} ocupados · {Math.max(0,(current.capacity??0)-requiredPlaces)} disponibles. La silla alta y el espacio para silla de ruedas cuentan como un lugar.</p>{invalidCapacity&&<p role="alert" className={styles.invalid}>No pueden quitar lugares que ya están ocupados. Muevan primero a esas personas a otra mesa.</p>}</div>}
            {active.kind==='table'&&<label className={styles.field}>Forma de la mesa<select aria-label="Forma de la mesa" value={current.shape} disabled={busy} onChange={e=>{const shape=e.target.value as Geometry['shape'];edit(active,{...current,shape,height:shape==='round'?current.width:current.height,rotation:shape==='round'?0:current.rotation});}}><option value="round">Redonda</option><option value="rectangular">Rectangular</option></select></label>}
            <div className={styles.inputPair}><label>{current.shape==='round'&&active.kind==='table'?'Diámetro':'Ancho'} <span>m</span><input aria-label={current.shape==='round'&&active.kind==='table'?'Diámetro de la mesa en metros':'Ancho del elemento en metros'} type="number" required min={active.kind==='table'?0.8:0.3} max={active.kind==='table'?6:12} step={0.1} disabled={busy} value={current.width} onChange={e=>{const width=Number(e.target.value);edit(active,{...current,width,height:current.shape==='round'&&active.kind==='table'?width:current.height});}}/></label>{(current.shape==='rectangular'||active.kind==='feature')&&<label>Largo <span>m</span><input aria-label="Largo del elemento en metros" type="number" required min={active.kind==='table'?0.8:0.3} max={active.kind==='table'?6:12} step={0.1} disabled={busy} value={current.height} onChange={e=>edit(active,{...current,height:Number(e.target.value)})}/></label>}</div>
            <div className={styles.inputPair}>{(['x','y'] as const).map(axis=><label key={axis}>Posición {axis.toUpperCase()} <span>m</span><input aria-label={`Posición ${axis.toUpperCase()} en metros`} type="number" required min={0} max={axis==='x'?room.width:room.height} step={0.01} disabled={busy} value={current[axis]} onChange={e=>edit(active,{...current,[axis]:Number(e.target.value)})}/></label>)}</div>
            <small className={styles.origin}>Desde la esquina superior izquierda hasta el centro del elemento.</small>
            {(current.shape==='rectangular'||active.kind==='feature')&&<label className={styles.field}>Rotación <span>grados</span><input aria-label="Rotación en grados" type="number" required min={0} max={359} step={1} disabled={busy} value={current.rotation} onChange={e=>edit(active,{...current,rotation:Number(e.target.value)})}/></label>}
            <div className={styles.nudges} aria-label="Mover de a 10 centímetros"><button type="button" aria-label="Mover 10 cm a la izquierda" disabled={busy} onClick={()=>nudge(active,-0.1,0)}><ArrowLeft size={17}/></button><button type="button" aria-label="Mover 10 cm hacia arriba" disabled={busy} onClick={()=>nudge(active,0,-0.1)}><ArrowUp size={17}/></button><button type="button" aria-label="Mover 10 cm hacia abajo" disabled={busy} onClick={()=>nudge(active,0,0.1)}><ArrowDown size={17}/></button><button type="button" aria-label="Mover 10 cm a la derecha" disabled={busy} onClick={()=>nudge(active,0.1,0)}><ArrowRight size={17}/></button></div>
            {invalidCurrent&&<p className={styles.invalid} role="alert">El elemento y sus sillas deben quedar dentro del salón, con medidas válidas. Ajustá tamaño o posición.</p>}
            <button className={styles.primary} disabled={busy||!currentEdit||conflict||invalidCurrent||invalidCapacity}><Save size={16}/>{busy?'Guardando…':'Guardar ubicación'}</button>
            {currentEdit&&<button type="button" className={styles.secondary} disabled={busy} onClick={()=>discard(active.id)}><RotateCcw size={15}/> Descartar este cambio</button>}
            {active.kind==='feature'&&<button type="button" className={styles.remove} disabled={busy} onClick={async()=>{if(window.confirm(`¿Quitar ${current.label} del plano?`)&&await mutate('floor_feature_delete',{featureId:active.id})){discard(active.id);setSelected('');}}}><Trash2 size={15}/> Quitar referencia</button>}
          </form>
        </>:<div className={styles.empty}><Grid2X2 size={30}/><h3>Empiecen por sus mesas</h3><p>Agreguen una mesa en el formulario de abajo. Aparecerá acá y podrán ubicarla en el salón.</p></div>}
      </aside>
    </div>
    {overlaps.length>0&&<div className={styles.overlap} role="status"><strong>Revisen el espacio entre elementos.</strong> Las áreas orientativas se superponen en {overlaps.slice(0,4).join('; ')}{overlaps.length>4?` y ${overlaps.length-4} combinaciones más`:''}. Pueden guardar el esquema y resolverlo con el salón; no se calculan pasillos ni distancias de seguridad.</div>}
    {orphaned.length>0&&<div className={styles.alert} role="alert">Un elemento con cambios pendientes fue eliminado en otra versión.{orphaned.map(id=><button className={styles.secondary} key={id} onClick={()=>discard(id)}>Descartar cambio de {edits[id].value.label}</button>)}</div>}
    <div className={styles.status} role="status" aria-live="polite">{message||(dirty?'Hay cambios preparados. Guardalos antes de imprimir o cambiar de sección.':<><Check size={14}/> Las posiciones están guardadas.</>)}</div>
  </section>;
}
