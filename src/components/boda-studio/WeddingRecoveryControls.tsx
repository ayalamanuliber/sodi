"use client";
import {useEffect,useState} from 'react';
import type {EventView} from '@/lib/boda-service/types';
import {studioRequest} from './client';
import {WeddingAccessReceipt} from './WeddingAccessReceipt';
import styles from './studio.module.css';
export function WeddingRecoveryControls({event,busy,onEvent,onBusyChange,onPendingChange}:{event:EventView;busy:boolean;onEvent:(event:EventView)=>void;onBusyChange:(busy:boolean)=>void;onPendingChange:(pending:boolean)=>void}){
 const [key,setKey]=useState(''),[acknowledged,setAcknowledged]=useState(false),[error,setError]=useState('');
 useEffect(()=>{onPendingChange(Boolean(key&&!acknowledged));},[key,acknowledged,onPendingChange]);useEffect(()=>()=>onPendingChange(false),[onPendingChange]);
 async function generate(){if(busy)return;if(!window.confirm('Se generará una clave nueva. Cualquier clave de recuperación anterior dejará de funcionar. ¿Continuar?'))return;onBusyChange(true);setError('');try{const result=await studioRequest<{event:EventView;recoveryKey:string}>(`/events/${event.id}`,{revision:event.revision,action:'recovery_rotate'},'PATCH');onEvent(result.event);setKey(result.recoveryKey);setAcknowledged(false);}catch(error){setError((error as Error).message);}finally{onBusyChange(false);}}
 return <section className={styles.card} style={{marginTop:24}}><h2>Su clave de recuperación</h2><p>Si todavía no guardaron una clave o necesitan reemplazarla, pueden generar una nueva. No cambia su contraseña ni los invitados.</p><button className={styles.secondary} disabled={busy||Boolean(key&&!acknowledged)} onClick={generate}>Generar nueva clave de recuperación</button>{error&&<p role="alert" className={styles.error}>{error}</p>}{key&&<WeddingAccessReceipt eventId={event.id} recoveryKey={key} acknowledged={acknowledged} onAcknowledge={setAcknowledged}/>}</section>;
}
