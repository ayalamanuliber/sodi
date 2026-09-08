"use client";
import {useState,type FormEvent} from 'react';
import type {EventView} from '@/lib/boda-service/types';
import {studioRequest} from './client';
import {forgetWedding} from './access-receipt';
import styles from './studio.module.css';
export function WeddingDeleteControls({event,busy,onBusyChange,onDeleted}:{event:EventView;busy:boolean;onBusyChange:(busy:boolean)=>void;onDeleted:()=>void}){
 const [open,setOpen]=useState(false),[confirmation,setConfirmation]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState('');
 const names=`${event.draft.content.partnerOne} y ${event.draft.content.partnerTwo}`;
 async function submit(e:FormEvent){e.preventDefault();if(busy||confirmation!==names)return;setError('');onBusyChange(true);try{await studioRequest(`/events/${event.id}/delete`,{revision:event.revision,password});setPassword('');forgetWedding(event.id);onDeleted();}catch(error){setError((error as Error).message);}finally{onBusyChange(false);}}
 return <section className={styles.card} style={{marginTop:24,borderColor:'#cba99b'}}><h2>Eliminar esta boda</h2><p>Elimina la invitación publicada, fotos, invitados, respuestas, mesas y copias guardadas en SODI. Los enlaces dejan de funcionar. Esta acción no se puede deshacer y no elimina los archivos que ustedes ya descargaron.</p>{!open?<button className={styles.danger} disabled={busy} onClick={()=>setOpen(true)}>Quiero eliminar esta boda</button>:<form className={styles.form} onSubmit={submit}><label className={styles.field}>Para confirmar, escribí: {names}<input aria-label="Nombres para confirmar la eliminación" required autoComplete="off" value={confirmation} disabled={busy} onChange={e=>setConfirmation(e.target.value)}/></label><label className={styles.field}>Contraseña actual para eliminar<input required type="password" maxLength={128} autoComplete="current-password" value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/></label>{error&&<p className={styles.error} role="alert">{error}</p>}<div className={styles.actions}><button className={styles.danger} disabled={busy||confirmation!==names}>{busy?'Eliminando…':'Eliminar definitivamente esta boda'}</button><button type="button" className={styles.secondary} disabled={busy} onClick={()=>{setOpen(false);setConfirmation('');setPassword('');setError('');}}>Cancelar eliminación</button></div></form>}</section>;
}
