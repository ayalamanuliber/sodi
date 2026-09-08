"use client";

import Link from 'next/link';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowRight,Check,Copy,LockKeyhole,RefreshCw} from 'lucide-react';
import {createWeddingTrial,isWeddingTrialWorkspace,type WeddingTrialWorkspace} from '@/lib/boda-trial/schema';
import {BODA_START_SEED} from '@/lib/boda-trial/start-seed';
import {isGuestWeddingReferral} from '@/lib/boda-referral';
import type {EventView} from '@/lib/boda-service/types';
import {studioRequest} from './client';
import {useBodaCapabilities} from './useBodaCapabilities';
import {rememberedWedding,rememberWedding,panelPath} from './access-receipt';
import {WeddingAccessReceipt} from './WeddingAccessReceipt';
import styles from './studio.module.css';
const CREATED_SPACE='sodi:boda-created:v1',START_REQUEST='sodi:boda-start-request:v1';
export function WeddingFreeStart(){
 const {capabilities,error:availabilityError,loading:checking,reload:retryAvailability}=useBodaCapabilities();
 const [workspace,setWorkspace]=useState<WeddingTrialWorkspace|null>(null),[photos,setPhotos]=useState<string[]>([]);
 const [acquisitionSource,setAcquisitionSource]=useState<'direct'|'guest_attribution'>('direct');
 const [password,setPassword]=useState(''),[repeat,setRepeat]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [created,setCreated]=useState<EventView|null>(null),[returnPath,setReturnPath]=useState(''),[restoring,setRestoring]=useState(true),[photosPending,setPhotosPending]=useState(false);
 const [recoveryKey,setRecoveryKey]=useState(''),[acknowledged,setAcknowledged]=useState(false);
 const requestId=useRef('');const [pendingAttempt,setPendingAttempt]=useState(false);
 const canStart=capabilities?.selfServeEnabled===true||(pendingAttempt&&['full','paused'].includes(capabilities?.availability??''));
 function clearSeed(){try{sessionStorage.removeItem(BODA_START_SEED);}catch{/* The panel is already stored. */}}
 function receipt(id:string,pending:boolean){rememberWedding(id);try{sessionStorage.setItem(CREATED_SPACE,JSON.stringify({id,at:Date.now(),photosPending:pending}));}catch{/* The access download and visible URL remain available. */}}
 async function savePhotos(event:EventView){
  setError('');try{
   const latest=await studioRequest<{event:EventView}>(`/events/${event.id}`),combined=[...new Set([...latest.event.photos,...photos])];
   if(combined.length>(capabilities?.limits?.photos??6)){setPhotosPending(true);setError('Entre las fotos del panel y las pendientes se supera el límite. Abran el panel para elegir cuáles conservar. No se reemplazó ninguna foto; las pendientes siguen en esta pestaña.');return;}
   const saved=await studioRequest<{event:EventView}>(`/events/${event.id}`,{revision:latest.event.revision,action:'photos',photos:combined},'PATCH');setCreated(saved.event);setPhotosPending(false);receipt(event.id,false);clearSeed();setMessage('El diseño y las fotos propias quedaron guardados.');
  }catch{setPhotosPending(true);setMessage('La boda quedó creada. Las fotos siguen en esta pestaña: pueden volver a guardarlas sin crear otra boda. Si venció la sesión, ingresen al panel y vuelvan a esta página.');}
 }
 useEffect(()=>{
  let alive=true;
  setAcquisitionSource(isGuestWeddingReferral(window.location.search)?'guest_attribution':'direct');
  const blank=createWeddingTrial();blank.guests=[];blank.rsvps=[];blank.content={...blank.content,partnerOne:'',partnerTwo:'',date:'',ceremonyLocation:'',celebrationLocation:'',ceremonyAddress:'',celebrationAddress:'',message:'',story:''};
  let previous:{id:string;photosPending?:boolean}|null=null;
  try{const saved=sessionStorage.getItem(CREATED_SPACE);const value=saved?JSON.parse(saved):null;if(value&&panelPath(value.id))previous=value;}catch{/* Fall back to the ID-only persistent receipt. */}
  try{const raw=sessionStorage.getItem(BODA_START_SEED),seed=raw?JSON.parse(raw):null;
   if(seed&&Number.isFinite(seed.at)&&(Date.now()-seed.at<3_600_000||previous?.photosPending)&&isWeddingTrialWorkspace(seed.workspace)){
    setWorkspace({...seed.workspace,guests:[],rsvps:[]});setPhotos(Array.isArray(seed.photos)?seed.photos.filter((p:unknown)=>typeof p==='string'&&p.startsWith('data:image/')).slice(0,6):[]);if(seed.acquisitionSource==='guest_attribution')setAcquisitionSource('guest_attribution');setMessage('Recuperamos sus textos, diseño y fotos propias. La lista de ejemplo queda afuera. Revisen sus nombres y la fecha.');
   }else setWorkspace(blank);
  }catch{setWorkspace(blank);setMessage('No pudimos recuperar el diseño anterior. La prueba se conserva; pueden volver a ella o empezar acá.');}
  try{const saved=sessionStorage.getItem(START_REQUEST);if(saved&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(saved)){requestId.current=saved;setPendingAttempt(true);}}catch{/* An in-memory request ID still protects retries in this page. */}
  const known=previous??rememberedWedding();
  if(known){setReturnPath(panelPath(known.id));studioRequest<{event:EventView}>(`/events/${known.id}`).then(result=>{if(!alive)return;setCreated(result.event);setPhotosPending(Boolean(previous?.photosPending));setMessage(previous?.photosPending?'Recuperamos su espacio. Pueden volver a guardar las fotos pendientes.':'Su espacio ya está creado. Pueden continuar desde el panel.');}).catch(()=>{if(alive)setMessage('Este navegador recuerda el panel de una boda. Ingresen con su contraseña o con la clave de recuperación.');}).finally(()=>{if(alive)setRestoring(false);});}
  else setRestoring(false);
  return()=>{alive=false;};
 },[]);
 async function create(event:FormEvent){
  event.preventDefault();if(!workspace||!canStart||busy)return;setError('');if(password!==repeat){setError('Las contraseñas no coinciden.');return;}setBusy(true);
  try{
   if(!requestId.current)requestId.current=crypto.randomUUID();try{if(sessionStorage.getItem(START_REQUEST)!==requestId.current)sessionStorage.setItem(START_REQUEST,requestId.current);if(sessionStorage.getItem(START_REQUEST)!==requestId.current)throw new Error('No se conservó el intento.');}catch{throw new Error('No pudimos guardar el intento en este navegador. No enviamos la creación. Habiliten el almacenamiento o liberen espacio y vuelvan a intentar; sus datos siguen en el formulario.');}setPendingAttempt(true);
   const result=await studioRequest<{event:EventView;recoveryKey:string}>('/start',{workspace,password,acquisitionSource,requestId:requestId.current});setCreated(result.event);setRecoveryKey(result.recoveryKey??'');setAcknowledged(false);setPassword('');setRepeat('');receipt(result.event.id,photos.length>0);try{sessionStorage.removeItem(START_REQUEST);}catch{/* Receipt already records the created event. */}requestId.current='';setPendingAttempt(false);
   if(photos.length)await savePhotos(result.event);else{clearSeed();setMessage('Su espacio quedó creado. Agreguen sus fotos y revisen la invitación antes de publicarla.');}
  }catch(error){setError(`${(error as Error).message} Si reintentan esta creación, conserven la misma contraseña.`);}finally{setBusy(false);}
 }
 const panel=created?panelPath(created.id):'',accessReady=!recoveryKey||acknowledged;
 return <div className={styles.page}><header className={styles.topbar}><Link className={styles.brand} href="/boda" prefetch={false} onClick={e=>{if(recoveryKey&&!acknowledged&&!window.confirm('Todavía no confirmaron que guardaron su clave. ¿Salir igualmente?'))e.preventDefault();}}>SODI <span>Bodas</span></Link><small>Una invitación para encontrarse.</small></header>
 <main className={styles.gate} style={{width:'min(740px,100%)'}}><p className={styles.eyebrow}>{created?'Su boda, en un solo lugar':'Empiecen con lo que importa'}</p><h1>{created?'Ya tienen su espacio.':'Su boda empieza acá.'}</h1>
 {restoring?<p role="status">Buscando su acceso en este navegador…</p>:created?<><section className={styles.card}><Check size={28}/><h2 style={{marginTop:16}}>{created.draft.content.partnerOne} y {created.draft.content.partnerTwo}</h2><p role="status">{message}</p><div className={styles.notice}>El panel es privado. A los invitados se les entrega otro enlace. {recoveryKey?'Guarden la clave antes de continuar.':'Si necesitan una nueva clave de recuperación, pueden generarla desde Actividad y copias en el panel.'}</div><div className={styles.secret}>{typeof window!=='undefined'?window.location.origin:''}{panel}</div><div className={styles.actions}><button className={styles.secondary} onClick={async()=>{try{await navigator.clipboard.writeText(window.location.origin+panel);setMessage('Enlace del panel copiado.');}catch{setMessage('Seleccionen el enlace visible y cópienlo manualmente.');}}}><Copy size={16}/> Copiar enlace del panel</button><a className={styles.button} href={panel} aria-disabled={busy||!accessReady} onClick={e=>{if(busy||!accessReady)e.preventDefault();}}>{busy?'Guardando fotos…':'Abrir nuestro panel'} <ArrowRight size={16}/></a></div>{!accessReady&&<p className={styles.muted}>Descarguen o copien el acceso y marquen que lo guardaron.</p>}</section>{recoveryKey&&<WeddingAccessReceipt eventId={created.id} recoveryKey={recoveryKey} acknowledged={acknowledged} onAcknowledge={setAcknowledged}/>}</>:<>
 {returnPath&&<section className={styles.card} style={{marginBottom:20}}><h2>Ya tienen un panel.</h2><p>{message}</p><Link className={styles.button} href={returnPath}>Volver a mi boda <ArrowRight size={16}/></Link><button type="button" className={styles.secondary} style={{marginTop:16}} onClick={()=>{setReturnPath('');setMessage('Van a crear una boda distinta. La anterior sigue disponible con su enlace privado.');}}>Crear otra boda</button></section>}
 {!returnPath&&(checking?<p role="status">Comprobando disponibilidad…</p>:availabilityError?<section className={styles.card}><h2>No pudimos comprobar el acceso.</h2><p role="alert">{availabilityError}</p><button className={styles.button} onClick={retryAvailability}><RefreshCw size={16}/> Reintentar disponibilidad</button><Link className={styles.secondary} href="/boda/prueba">Volver a la prueba</Link></section>:!canStart?<section className={styles.card}><h2>{capabilities?.availability==='full'?'Las nuevas altas están completas por ahora.':'Estamos preparando el acceso gratuito.'}</h2><p>Si ya crearon su boda, su panel sigue disponible con el enlace privado. Mientras tanto pueden diseñar una invitación de prueba.</p><Link className={styles.button} href="/boda/prueba">Probar la invitación <ArrowRight size={16}/></Link><button className={styles.secondary} style={{marginTop:16}} onClick={retryAvailability}>Volver a comprobar</button></section>:<>
 {pendingAttempt&&<div role="status" className={styles.notice}>Hay una creación pendiente de comprobar. Reintenten con la misma contraseña: si la boda ya se creó, recuperaremos ese espacio, sin crear otro.</div>}<p>{pendingAttempt&&!capabilities?.selfServeEnabled?'Están recuperando una creación anterior; las nuevas altas siguen pausadas. ':capabilities?.beta?'Beta gratuita. ':''}Preparen su invitación, reciban confirmaciones y organicen las mesas, con una firma discreta de SODI Bodas. Sin tarjeta.{capabilities?.limits&&` Hasta ${capabilities.limits.people} personas y ${capabilities.limits.photos} fotos propias por boda.`}</p>{message&&<div className={styles.notice} role="status">{message}</div>}
 <form onSubmit={create} className={`${styles.card} ${styles.form}`}><fieldset disabled={busy} className={styles.editing} style={{display:'grid',gap:18}}><div className={styles.fields}>{(['partnerOne','partnerTwo'] as const).map((key,i)=><label className={styles.field} key={key}>Nombre {i+1}<input required maxLength={80} autoComplete="off" value={workspace?.content[key]??''} onChange={e=>setWorkspace(w=>w?{...w,content:{...w.content,[key]:e.target.value}}:w)}/></label>)}</div><label className={styles.field}>Fecha de la boda<input required type="date" value={workspace?.content.date??''} onChange={e=>setWorkspace(w=>w?{...w,content:{...w.content,date:e.target.value}}:w)}/></label><label className={styles.field}>Elegí una contraseña<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/><small>Al menos 12 caracteres. Guarden una frase que puedan recordar.</small></label><label className={styles.field}>Repetí la contraseña<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={repeat} onChange={e=>setRepeat(e.target.value)}/></label><label className={styles.check}><input required type="checkbox"/> Voy a guardar el enlace privado, la contraseña y la clave de recuperación. Leí cómo se usan los datos en la explicación de privacidad.</label><button className={styles.button} disabled={!workspace||busy}><LockKeyhole size={16}/>{busy?'Comprobando su espacio…':pendingAttempt?'Recuperar intento anterior':'Crear nuestra boda gratis'}</button><Link href="/boda/privacidad" target="_blank" rel="noopener noreferrer">Cómo se usan los datos de la boda</Link><small className={styles.muted}>Crear el espacio no publica la invitación ni envía mensajes. Ustedes deciden qué compartir. La asistencia y los detalles especiales se consultan por separado.</small></fieldset></form></>)}
 </>}
 {error&&<div role="alert" className={styles.error} style={{marginTop:20}}>{error}</div>}{created&&photosPending&&<button className={styles.button} disabled={busy||!photos.length} onClick={async()=>{setBusy(true);try{await savePhotos(created);}finally{setBusy(false);}}}>{busy?'Guardando fotos…':'Volver a guardar mis fotos'}</button>}
 </main></div>;
}
