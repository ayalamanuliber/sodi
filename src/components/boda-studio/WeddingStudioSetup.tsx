"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, Plus } from "lucide-react";
import { createWeddingTrial, isWeddingTrialWorkspace, loadWeddingTrial, type WeddingTrialWorkspace } from "@/lib/boda-trial/schema";
import type { EventView } from "@/lib/boda-service/types";
import { studioRequest } from "./client";
import styles from "./studio.module.css";

type ListedEvent = { id: string; updatedAt: string; names?: string; published?: unknown; draft?: WeddingTrialWorkspace };
export function WeddingStudioSetup() {
  const [password, setPassword] = useState("");
  const [couplePassword, setCouplePassword] = useState("");
  const [events, setEvents] = useState<ListedEvent[] | null>(null);
  const [workspace, setWorkspace] = useState<WeddingTrialWorkspace | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() { const result = await studioRequest<{events: ListedEvent[]}>("/events"); setEvents(result.events); }
  useEffect(() => { refresh().catch(() => undefined); }, []);
  async function login(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/boda/admin/login", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "No pudimos iniciar sesión.");
      setPassword(""); await refresh();
    } catch(e) { setError((e as Error).message); } finally {setBusy(false);}
  }
  function start(useDraft: boolean) {
    const next = useDraft ? loadWeddingTrial() : createWeddingTrial();
    setWorkspace({...next, guests:[], rsvps:[], content:{...next.content,...(!useDraft ? {partnerOne:"",partnerTwo:"",date:"",ceremonyLocation:"",celebrationLocation:"",ceremonyAddress:"",celebrationAddress:"",message:"",story:""} : {})}});
    setMessage(useDraft ? "Recuperamos el diseño y los textos. Los invitados y las fotos ficticias de la prueba no se incorporan a la nueva boda." : "Empezá con sus nombres. La invitación queda en borrador hasta que la revisen y publiquen.");
  }
  async function create(e:FormEvent) {
    e.preventDefault(); if(!workspace) return; setBusy(true); setError("");
    try {
      const {event} = await studioRequest<{event:EventView}>("/events",{workspace,password:couplePassword});
      setCouplePassword(""); window.location.assign(`/boda/panel/${event.id}`);
    } catch(e) {setError((e as Error).message);} finally {setBusy(false);}
  }
  return <div className={styles.page}><header className={styles.topbar}><Link className={styles.brand} href="/boda" prefetch={false}>SODI <span>Bodas</span></Link><small>Espacio de gestión · acceso privado</small></header>
    {events === null ? <main className={styles.gate}><p className={styles.eyebrow}>Gestión SODI</p><h1>Cada boda, en su lugar.</h1><p>Ingresá para preparar una boda y habilitar su panel. Las parejas acceden desde su propio enlace.</p><form className={`${styles.card} ${styles.form}`} onSubmit={login}><label className={styles.field}>Contraseña de gestión<input required autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className={styles.button} disabled={busy}><LockKeyhole size={16}/> {busy?"Ingresando…":"Ingresar"}</button>{error&&<div className={styles.error} role="alert">{error}</div>}</form></main> :
    <main className={styles.main}><header className={styles.hero}><div><p className={styles.eyebrow}>Gestión de bodas</p><h1>Preparar. Revisar. Compartir.</h1><p>Un espacio por pareja, con su diseño, sus respuestas y su organización.</p></div><button className={styles.secondary} onClick={async()=>{await fetch('/api/boda/admin/logout',{method:'POST'});setEvents(null);}}>Cerrar sesión</button></header>
    {error&&<div role="alert" className={styles.error}>{error}</div>}{message&&<div role="status" className={styles.notice}>{message}</div>}
    <div className={styles.grid}><section className={styles.card}><h2>Una nueva boda</h2><p>El alta prepara un borrador privado. No publica ni registra un pago.</p><div className={styles.actions}><button className={styles.button} onClick={()=>start(false)}><Plus size={16}/> Crear boda</button><button className={styles.secondary} onClick={()=>start(true)}>Continuar diseño de prueba</button></div>
    <label className={styles.field} style={{marginTop:20}}>O recuperar una copia del diseño<input type="file" accept=".json,application/json" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try {if(f.size>2_000_000)throw new Error('La copia supera el tamaño permitido.'); const x=JSON.parse(await f.text());if(!isWeddingTrialWorkspace(x))throw new Error('No reconocemos esta copia de diseño.');setWorkspace({...x,guests:[],rsvps:[]});setMessage('Diseño recuperado sin invitados de prueba.');setError('');}catch(e){setError((e as Error).message);}}}/></label>
    {workspace&&<form className={styles.form} onSubmit={create} style={{marginTop:28}}><div className={styles.fields}>{(['partnerOne','partnerTwo'] as const).map((key,i)=><label key={key} className={styles.field}>Nombre {i+1}<input maxLength={80} required value={workspace.content[key]} onChange={e=>setWorkspace({...workspace,content:{...workspace.content,[key]:e.target.value}})}/></label>)}</div><label className={styles.field}>Fecha<input type="date" required value={workspace.content.date} onChange={e=>setWorkspace({...workspace,content:{...workspace.content,date:e.target.value}})}/></label><label className={styles.field}>Contraseña para esta pareja<input autoComplete="new-password" type="password" minLength={12} maxLength={128} required value={couplePassword} onChange={e=>setCouplePassword(e.target.value)}/><small>Al menos 12 caracteres. Acordá una contraseña propia y compartila por un canal privado.</small></label><button disabled={busy} className={styles.button}>{busy?'Preparando…':'Crear el espacio de la pareja'} <ArrowRight size={16}/></button></form>}</section>
    <section className={styles.card}><h2>Bodas en preparación</h2>{events.length===0?<div className={styles.empty}>Todavía no hay bodas creadas.<br/>La primera empieza con un borrador.</div>:<ul className={styles.list}>{events.map(e=><li key={e.id}><div><strong>{e.names || (e.draft?`${e.draft.content.partnerOne} y ${e.draft.content.partnerTwo}`:'Boda guardada')}</strong><small>Actualizada {new Date(e.updatedAt).toLocaleDateString('es-AR')}</small></div><a className={styles.secondary} href={`/boda/panel/${e.id}`}>Abrir panel <ArrowRight size={15}/></a></li>)}</ul>}</section></div></main>}
  </div>;
}
