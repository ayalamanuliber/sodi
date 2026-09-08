const RETURN_KEY='sodi:boda-return:v1';
export function panelPath(id:string){return /^evt_[a-f0-9]{24}$/.test(id)?`/boda/panel/${id}`:'';}
export function rememberWedding(id:string){const path=panelPath(id);if(!path)return;try{localStorage.setItem(RETURN_KEY,JSON.stringify({id,panelPath:path}));}catch{/* The downloaded access file remains the durable return path. */}}
export function rememberedWedding(){try{const raw=localStorage.getItem(RETURN_KEY);if(!raw)return null;const value=JSON.parse(raw),path=panelPath(value.id);return path&&value.panelPath===path?{id:value.id as string,panelPath:path}:null;}catch{return null;}}
export function forgetWedding(id:string){try{if(rememberedWedding()?.id===id)localStorage.removeItem(RETURN_KEY);const saved=sessionStorage.getItem('sodi:boda-created:v1');if(saved&&JSON.parse(saved).id===id)sessionStorage.removeItem('sodi:boda-created:v1');}catch{/* Server deletion already completed; no credentials were stored here. */}}
