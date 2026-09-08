import assert from 'node:assert/strict';
import {mkdtemp,rm,mkdir,readdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import * as svc from '../src/lib/boda-service/service.ts';
import * as store from '../src/lib/boda-service/store.ts';
import {createWeddingTrial} from '../src/lib/boda-trial/schema.ts';

const dir=await mkdtemp(join(tmpdir(),'sodi-launch-'));
process.env.NODE_ENV='development';
process.env.BODA_STUDIO_DATA_DIR=dir;
process.env.BODA_STUDIO_PILOT_MAX_EVENTS='10';
delete process.env.BODA_STUDIO_SELF_SERVE_ENABLED;
const pass='Synthetic recovery password 2026!';
const nextPass='Different synthetic password 2026!';
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
const clean=()=>{const w=createWeddingTrial();w.guests=[];w.rsvps=[];return w;};
const reject=(promise,status)=>assert.rejects(promise,error=>error.status===status);
const results=[];
async function test(name,run){process.env.BODA_STUDIO_STORE_PREFIX='boda-studio/qa-'+results.length;await run();results.push({name,passed:true});console.log('PASS',name);}

try{
await test('Production admission requires explicit flag, finite cohort and durable Blob; defaults stay closed',async()=>{
  const token=process.env.BLOB_READ_WRITE_TOKEN,storage=process.env.BODA_STUDIO_STORAGE;
  process.env.NODE_ENV='production';delete process.env.BODA_STUDIO_SELF_SERVE_ENABLED;delete process.env.BLOB_READ_WRITE_TOKEN;
  assert.equal(svc.selfServeEnabled(),false);await reject(svc.startEvent(clean(),pass,'closed'),503);
  process.env.BODA_STUDIO_SELF_SERVE_ENABLED='true';assert.equal(svc.selfServeEnabled(),false);
  process.env.BLOB_READ_WRITE_TOKEN='synthetic-not-used-for-network';delete process.env.BODA_STUDIO_PILOT_MAX_EVENTS;assert.equal(svc.selfServeEnabled(),false);
  for(const invalid of ['0','-1','10.5','1001','ten']){process.env.BODA_STUDIO_PILOT_MAX_EVENTS=invalid;assert.equal(svc.selfServeEnabled(),false);}
  process.env.BODA_STUDIO_PILOT_MAX_EVENTS='10';process.env.BODA_STUDIO_STORAGE='local';assert.equal(svc.selfServeEnabled(),false);
  process.env.BODA_STUDIO_STORAGE='blob';assert.equal(svc.selfServeEnabled(),true);
  process.env.NODE_ENV='development';delete process.env.BODA_STUDIO_SELF_SERVE_ENABLED;
  if(token===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;else process.env.BLOB_READ_WRITE_TOKEN=token;
  if(storage===undefined)delete process.env.BODA_STUDIO_STORAGE;else process.env.BODA_STUDIO_STORAGE=storage;
});
await test('Store namespaces isolate identical keys and reject path traversal',async()=>{
  const prefix=process.env.BODA_STUDIO_STORE_PREFIX;await store.writeStore('synthetic',{value:'A'},null);
  process.env.BODA_STUDIO_STORE_PREFIX=prefix+'-other';assert.equal(await store.readStore('synthetic'),null);await store.writeStore('synthetic',{value:'B'},null);
  process.env.BODA_STUDIO_STORE_PREFIX=prefix;assert.equal((await store.readStore('synthetic')).value.value,'A');
  for(const bad of ['../private','boda-studio/../v1','boda-studio//v1','boda-studio/v1/']){process.env.BODA_STUDIO_STORE_PREFIX=bad;assert.throws(()=>store.storePrefix(),e=>e.status===503);}
  process.env.BODA_STUDIO_STORE_PREFIX=prefix;
});
await test('Missing or broken storage cannot advertise open capabilities or create success',async()=>{
  const previous=process.env.BODA_STUDIO_DATA_DIR;const blocked=join(dir,'blocked-root');await writeFile(blocked,'synthetic');process.env.BODA_STUDIO_DATA_DIR=blocked;
  await assert.rejects(svc.capabilities());await assert.rejects(svc.startEvent(clean(),pass,'failed-store'));process.env.BODA_STUDIO_DATA_DIR=previous;
  assert.equal((await store.eventKeys()).length,0);
});
await test('One atomic start persists session and only recovery hash; DTO and backup exclude credentials',async()=>{
  const started=await svc.startEvent(createWeddingTrial(),pass,'atomic','guest_attribution',randomUUID());const e=(await svc.loadEvent(started.event.id)).value;
  assert.equal(e.people.length,0);assert.equal(e.groups.length,0);assert.equal(e.sessions.length,1);svc.authenticate(e,started.token);
  assert.match(started.recoveryKey,/^[A-Za-z0-9_-]{43}$/);assert.equal(e.recoveryKeyHash,svc.hash(started.recoveryKey));
  for(const value of [started.event,svc.view(e),svc.backup(e)]){const json=JSON.stringify(value);assert.ok(!json.includes(started.recoveryKey));assert.ok(!json.includes(e.recoveryKeyHash));assert.ok(!json.includes(e.creationRequestHash));}
  assert.equal(JSON.stringify(e).includes(started.recoveryKey),false);
});
await test('Lost-response retry uses same event and slot, preserves content and rotates previous credentials',async()=>{
  const requestId=randomUUID();const first=await svc.startEvent(clean(),pass,'retry-first','direct',requestId);
  const changed=clean();changed.content.partnerOne='Must not replace stored content';
  const second=await svc.startEvent(changed,pass,'retry-second','direct',requestId);assert.equal(second.event.id,first.event.id);assert.equal(second.event.draft.content.partnerOne,first.event.draft.content.partnerOne);
  assert.equal((await store.eventKeys()).length,1);assert.equal((await store.readStore('selfserve_cohort')).value.reservations.length,1);
  const e=(await svc.loadEvent(first.event.id)).value;assert.throws(()=>svc.authenticate(e,first.token),x=>x.status===401);svc.authenticate(e,second.token);
  await reject(svc.recover(e.id,first.recoveryKey,nextPass,'old-key'),401);
  const before=e.revision;await reject(svc.startEvent(clean(),'Wrong synthetic password!','retry-wrong','direct',requestId),401);assert.equal((await svc.loadEvent(e.id)).value.revision,before);
});
await test('Paused admissions recover only an authenticated persisted attempt and never reserve a new UUID',async()=>{
  const requestId=randomUUID();const first=await svc.startEvent(clean(),pass,'before-pause','direct',requestId);
  process.env.BODA_STUDIO_SELF_SERVE_ENABLED='false';
  try{
    assert.equal((await svc.capabilities()).availability,'paused');
    // Recovery must not depend on the stale client draft still passing current validation.
    const retried=await svc.startEvent(null,pass,'paused-retry','direct',requestId);
    assert.equal(retried.event.id,first.event.id);assert.deepEqual(retried.event.draft,first.event.draft);
    const e=(await svc.loadEvent(first.event.id)).value;svc.authenticate(e,retried.token);assert.throws(()=>svc.authenticate(e,first.token),x=>x.status===401);
    await reject(svc.startEvent(null,'Wrong synthetic password!','paused-wrong','direct',requestId),401);
    const cohort=await store.readStore('selfserve_cohort');const root=join(dir,'namespaces',process.env.BODA_STUDIO_STORE_PREFIX.slice('boda-studio/'.length));const keys=(await readdir(root)).sort();
    await reject(svc.startEvent(clean(),pass,'paused-new','direct',randomUUID()),503);
    assert.deepEqual((await readdir(root)).sort(),keys);assert.deepEqual(await store.readStore('selfserve_cohort'),cohort);assert.equal((await store.eventKeys()).length,1);
    process.env.NODE_ENV='production';const oldToken=process.env.BLOB_READ_WRITE_TOKEN;delete process.env.BLOB_READ_WRITE_TOKEN;
    try{await reject(svc.startEvent(null,pass,'missing-storage','direct',requestId),503);}finally{process.env.NODE_ENV='development';if(oldToken!==undefined)process.env.BLOB_READ_WRITE_TOKEN=oldToken;}
  }finally{delete process.env.BODA_STUDIO_SELF_SERVE_ENABLED;}
});
await test('Concurrent same-attempt creation never duplicates event or admission slot',async()=>{
  const requestId=randomUUID();const responses=await Promise.allSettled([svc.startEvent(clean(),pass,'same-a','direct',requestId),svc.startEvent(clean(),pass,'same-b','direct',requestId)]);
  assert.ok(responses.some(r=>r.status==='fulfilled'));assert.equal((await store.eventKeys()).length,1);assert.equal((await store.readStore('selfserve_cohort')).value.reservations.length,1);
  const retried=await svc.startEvent(clean(),pass,'same-retry','direct',requestId);assert.equal(retried.event.id,(await store.eventKeys())[0]);
});
await test('Concurrent admissions cannot exceed explicit cohort; full stops new IDs but permits recovery of an existing attempt',async()=>{
  const ids=Array.from({length:12},()=>randomUUID());const responses=await Promise.allSettled(ids.map((requestId,i)=>svc.startEvent(clean(),pass,'cohort-'+i,'direct',requestId)));
  let count=(await store.readStore('selfserve_cohort')).value.reservations.length;assert.ok(count<=10);
  for(let n=count;n<10;n++)await svc.startEvent(clean(),pass,'fill-'+n,'direct',randomUUID());
  count=(await store.readStore('selfserve_cohort')).value.reservations.length;assert.equal(count,10);
  assert.deepEqual(await svc.capabilities(),{limits:{people:200,photos:6},recoveryEnabled:true,beta:true,selfServeEnabled:false,availability:'full'});
  const before=(await store.eventKeys()).length;await reject(svc.startEvent(clean(),pass,'over-cap','direct',randomUUID()),503);assert.equal((await store.eventKeys()).length,before);
  const index=responses.findIndex(r=>r.status==='fulfilled');const retry=await svc.startEvent(clean(),pass,'full-retry','direct',ids[index]);assert.equal(retry.event.id,responses[index].value.event.id);
});
await test('Failed event write keeps conservative reservation and retry recovers it without another slot',async()=>{
  const requestId=randomUUID(),eventId='evt_'+svc.hash(requestId).slice(0,24);const root=join(dir,'namespaces',process.env.BODA_STUDIO_STORE_PREFIX.slice('boda-studio/'.length));
  // EISDIR after reservation simulates a definite storage failure; no backend success is returned.
  // First attempt without requestId pre-read obstruction: reserve through direct pilot API.
  const {reservePilotSlot}=await import('../src/lib/boda-service/pilot.ts');await reservePilotSlot(eventId);await mkdir(join(root,eventId+'.json'));
  await assert.rejects(svc.startEvent(clean(),pass,'storage-failure','direct',requestId));assert.equal((await store.readStore('selfserve_cohort')).value.reservations.length,1);
  await rm(join(root,eventId+'.json'),{recursive:true});const restored=await svc.startEvent(clean(),pass,'storage-retry','direct',requestId);assert.equal(restored.event.id,eventId);assert.equal((await store.readStore('selfserve_cohort')).value.reservations.length,1);
});
await test('Recovery rejects wrong/foreign keys and invalid passwords atomically; valid recovery revokes sessions and old key',async()=>{
  const first=await svc.startEvent(clean(),pass,'recover-a'),foreign=await svc.startEvent(clean(),pass,'recover-b');const before=(await svc.loadEvent(first.event.id)).value;
  await reject(svc.recover(first.event.id,foreign.recoveryKey,nextPass,'foreign-key'),401);await reject(svc.recover(first.event.id,first.recoveryKey,'short','bad-password'),400);assert.equal((await svc.loadEvent(first.event.id)).value.recoveryKeyHash,before.recoveryKeyHash);
  const recovered=await svc.recover(first.event.id,first.recoveryKey,nextPass,'valid-recovery');const e=(await svc.loadEvent(first.event.id)).value;assert.throws(()=>svc.authenticate(e,first.token),x=>x.status===401);svc.authenticate(e,recovered.token);
  assert.notEqual(recovered.recoveryKey,first.recoveryKey);await reject(svc.recover(first.event.id,first.recoveryKey,pass,'reuse-key'),401);await reject(svc.login(first.event.id,pass,'old-password'),401);assert.ok((await svc.login(first.event.id,nextPass,'new-password')).token);
});
await test('Legacy event gets recovery by authorized rotation; unauthorized, stale and restored backups cannot replace the key',async()=>{
  const e=await svc.createEvent(clean(),pass),session=await svc.login(e.id,pass,'legacy');assert.equal((await svc.loadEvent(e.id)).value.recoveryKeyHash,undefined);
  await reject(svc.mutate(e.id,{revision:e.revision,action:'recovery_rotate'},undefined),401);
  const rotated=await svc.mutate(e.id,{revision:e.revision,action:'recovery_rotate'},session.token);assert.ok(rotated.recoveryKey);
  await reject(svc.mutate(e.id,{revision:e.revision,action:'recovery_rotate'},session.token),409);
  const current=(await svc.loadEvent(e.id)).value,backup=svc.backup(current);await svc.restore(e.id,{revision:current.revision,backup},session.token);assert.equal((await svc.loadEvent(e.id)).value.recoveryKeyHash,svc.hash(rotated.recoveryKey));
});
await test('Unknown event IDs cannot create unbounded event-specific login or RSVP rate keys',async()=>{
  for(let i=0;i<8;i++){const unknown='evt_'+svc.hash('unknown'+i).slice(0,24);await reject(svc.login(unknown,pass,'unknown-client'),401);await reject(svc.rsvp(unknown,{action:'get',token:'invalid'},'unknown-client'),404);}
  const root=join(dir,'namespaces',process.env.BODA_STUDIO_STORE_PREFIX.slice('boda-studio/'.length));const keys=(await readdir(root)).filter(k=>k.endsWith('.json'));assert.equal(keys.length,2);
});
await test('Event write throttle and bounded audit do not alter current people or commercial ledger',async()=>{
  const started=await svc.startEvent(clean(),pass,'audit');const loaded=await svc.loadEvent(started.event.id);loaded.value.audit=Array.from({length:600},()=>({at:new Date().toISOString(),action:'synthetic',actor:'couple'}));await store.writeStore(loaded.value.id,loaded.value,loaded.etag);
  const changed=await svc.mutate(started.event.id,{revision:started.event.revision,action:'table_add',name:'Synthetic',capacity:8},started.token);const current=(await svc.loadEvent(started.event.id)).value;assert.equal(current.audit.length,500);assert.equal(current.tables.length,1);assert.deepEqual(current.ledger,[]);
  await store.writeStore('limit_'+svc.hash('event-write:'+started.event.id),{start:Date.now(),attempts:300},(await store.readStore('limit_'+svc.hash('event-write:'+started.event.id))).etag);
  await reject(svc.mutate(started.event.id,{revision:changed.event.revision,action:'table_add',name:'Denied',capacity:8},started.token),429);assert.equal((await svc.loadEvent(started.event.id)).value.tables.length,1);
});
await test('Historical activation is set once and cannot leak to guests or be overwritten by backups',async()=>{
  let event=await svc.createEvent(clean(),pass);const change=async(action,data={})=>{const result=await svc.mutate(event.id,{revision:event.revision,action,...data},undefined,true);event=result.event;return result;};
  await change('group_add',{label:'Synthetic',people:[{name:'Synthetic',kind:'adult',seatRequired:true}]});const before=svc.backup((await svc.loadEvent(event.id)).value);await change('photos',{photos:[png]});await change('publish');const invite=await change('invitation_rotate',{groupId:event.groups[0].id});
  let response=await svc.rsvp(event.id,{action:'get',token:invite.invitationToken},'activation');response=await svc.rsvp(event.id,{action:'submit',token:invite.invitationToken,revision:response.revision,people:response.people.map(({id,name,kind,seatRequired,menu})=>({id,name,kind,seatRequired,menu,attendance:'confirmed'}))},'activation');
  const activation=structuredClone((await svc.loadEvent(event.id)).value.activation);assert.ok(activation.firstPublishedAt);assert.ok(activation.firstRsvpAt);assert.ok(!JSON.stringify(await svc.publicEvent(event.id)).includes('firstPublishedAt'));assert.ok(!JSON.stringify(response).includes('firstRsvpAt'));
  await svc.restore(event.id,{revision:response.revision,backup:before},undefined,true);assert.deepEqual((await svc.loadEvent(event.id)).value.activation,activation);assert.deepEqual((await svc.listEvents()).find(e=>e.id===event.id).activation,activation);
});
await test('Delete requires current password/session/revision; removes whole event without touching another namespace or reopening its request',async()=>{
  const requestId=randomUUID(),started=await svc.startEvent(clean(),pass,'delete','direct',requestId),foreign=await svc.startEvent(clean(),pass,'delete-other');
  await reject(svc.deleteEvent(started.event.id,{revision:1,password:pass},foreign.token),401);await reject(svc.deleteEvent(started.event.id,{revision:0,password:pass},started.token),409);await reject(svc.deleteEvent(started.event.id,{revision:1,password:'wrong'},started.token),401);
  const loaded=await svc.loadEvent(started.event.id);await reject(store.deleteStore(started.event.id,'stale-etag'),409);assert.ok(await svc.loadEvent(started.event.id));
  await svc.deleteEvent(started.event.id,{revision:loaded.value.revision,password:pass},started.token);await reject(svc.loadEvent(started.event.id),404);assert.ok(await svc.loadEvent(foreign.event.id));
  assert.equal((await store.readStore('selfserve_cohort')).value.reservations.find(r=>r.eventId===started.event.id).deleted,true);await reject(svc.startEvent(clean(),pass,'deleted-retry','direct',requestId),409);
});
const evidence={testedAt:new Date().toISOString(),scope:'Synthetic isolated local storage and pure production configuration checks. No network, deployment or real events.',checks:results.length,results};
await mkdir('artifacts/bodas-launch-2026-09-08',{recursive:true});await writeFile('artifacts/bodas-launch-2026-09-08/backend-tests.json',JSON.stringify(evidence,null,2)+'\n');console.log(`Completed ${results.length} launch checks.`);
}finally{await rm(dir,{recursive:true,force:true});}
