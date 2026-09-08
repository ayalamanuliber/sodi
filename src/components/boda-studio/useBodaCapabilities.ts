"use client";
import {useCallback,useEffect,useState} from 'react';
import {studioRequest} from './client';
export type BodaCapabilities={selfServeEnabled:boolean;availability?:'open'|'paused'|'full';limits?:{people:number;photos:number};recoveryEnabled?:boolean;beta?:boolean};
export function useBodaCapabilities(){
 const [capabilities,setCapabilities]=useState<BodaCapabilities|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const reload=useCallback(async()=>{setLoading(true);setError('');try{setCapabilities(await studioRequest<BodaCapabilities>('/capabilities'));}catch{setError('No pudimos comprobar la disponibilidad. Intentá nuevamente.');}finally{setLoading(false);}},[]);
 useEffect(()=>{void reload();},[reload]);
 return {capabilities,error,loading,reload};
}
