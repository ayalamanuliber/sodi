import {durableStoreConfigured, readStore, writeStore} from './store.ts';
import {ServiceError} from './types.ts';

const cohortKey = 'selfserve_cohort';
type Cohort = {version:1; reservations:{eventId:string;at:string;deleted?:true}[]};

export function pilotLimit():number|null {
    const configured=process.env.BODA_STUDIO_PILOT_MAX_EVENTS;
    if(configured===undefined)return process.env.NODE_ENV==='development'?100:null;
    if(!/^[1-9]\d{0,3}$/.test(configured)||Number(configured)>1000)return null;
    return Number(configured);
}

export function selfServeEnabled() {
    if(process.env.BODA_STUDIO_SELF_SERVE_ENABLED==='false')return false;
    if(process.env.NODE_ENV==='development')return pilotLimit()!==null;
    return process.env.NODE_ENV==='production'&&process.env.BODA_STUDIO_SELF_SERVE_ENABLED==='true'&&pilotLimit()!==null&&durableStoreConfigured();
}

function checkedCohort(value:Cohort|undefined):Cohort {
    if(value===undefined)return {version:1,reservations:[]};
    if(value.version!==1||!Array.isArray(value.reservations)||value.reservations.length>1000||value.reservations.some(r=>!/^evt_[a-f0-9]{24}$/.test(r.eventId)||typeof r.at!=='string')||new Set(value.reservations.map(r=>r.eventId)).size!==value.reservations.length)
        throw new ServiceError(503,'No se pudo comprobar la disponibilidad de la beta.');
    return value;
}

export async function capabilities() {
    const common={limits:{people:200,photos:6},recoveryEnabled:true,beta:true};
    if(!selfServeEnabled())return {...common,selfServeEnabled:false,availability:'paused' as const};
    const stored=await readStore<Cohort>(cohortKey);
    const full=checkedCohort(stored?.value).reservations.length>=pilotLimit()!;
    return {...common,selfServeEnabled:!full,availability:full?'full' as const:'open' as const};
}

/** A reservation is never refunded automatically: an uncertain write may have created the event. */
export async function reservePilotSlot(eventId:string) {
    if(!selfServeEnabled())throw new ServiceError(503,'Las nuevas altas están pausadas. Los espacios ya creados siguen disponibles.');
    for(let attempt=0;attempt<5;attempt++) {
        const stored=await readStore<Cohort>(cohortKey);
        const cohort=checkedCohort(stored?.value);
        const existing=cohort.reservations.find(reservation=>reservation.eventId===eventId);
        if(existing?.deleted)throw new ServiceError(409,'Ese espacio fue eliminado. Para otra boda, iniciá un nuevo intento.');
        if(existing)return;
        if(cohort.reservations.length>=pilotLimit()!)throw new ServiceError(503,'Se completó el cupo de esta beta. Los espacios ya creados siguen disponibles.');
        cohort.reservations.push({eventId,at:new Date().toISOString()});
        try{await writeStore(cohortKey,cohort,stored?.etag??null);return;}
        catch(error){if(!(error instanceof ServiceError)||error.status!==409||attempt===4)throw error;}
    }
}

export async function markPilotDeleted(eventId:string) {
    for(let attempt=0;attempt<5;attempt++){
        const stored=await readStore<Cohort>(cohortKey);
        const cohort=checkedCohort(stored?.value);
        const reservation=cohort.reservations.find(r=>r.eventId===eventId);
        if(!reservation||reservation.deleted)return;
        reservation.deleted=true;
        try{await writeStore(cohortKey,cohort,stored!.etag);return;}
        catch(error){if(!(error instanceof ServiceError)||error.status!==409||attempt===4)throw error;}
    }
}
