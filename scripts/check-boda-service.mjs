import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const dir=await mkdtemp(join(tmpdir(),'sodi-boda-service-'));
process.env.BODA_STUDIO_DATA_DIR=dir;
process.env.NODE_ENV='development';
const svc=await import('../src/lib/boda-service/service.ts');
const store=await import('../src/lib/boda-service/store.ts');
const {assertMutationOrigin}=await import('../src/lib/boda-service/http.ts');
const {createWeddingTrial}=await import('../src/lib/boda-trial/schema.ts');
let checks=0;
async function test(name,fn){await fn();checks++;console.log('PASS',name);}
async function rejected(promise,status){await assert.rejects(promise,e=>e.status===status);}
const clean=()=>{const w=createWeddingTrial();w.guests=[];w.rsvps=[];return w;};
const pass='Synthetic password 2026!';
const syntheticPhoto='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';
let a,b,tokenA,tokenB,invitationToken,tableId,groupId;
const current=async event=>svc.view((await svc.loadEvent(event.id)).value);
async function command(action,data={},operator=false){a=await current(a);const r=await svc.mutate(a.id,{revision:a.revision,action,...data},tokenA,operator);a=r.event;return r;}
try{
await test('Create isolated events and session hashes only',async()=>{a=await svc.createEvent(clean(),pass);b=await svc.createEvent(clean(),pass);tokenA=(await svc.login(a.id,pass,'a')).token;tokenB=(await svc.login(b.id,pass,'b')).token;assert.notEqual(a.id,b.id);assert.ok(!JSON.stringify(a).includes('passwordHash'));const e=(await svc.loadEvent(a.id)).value;assert.ok(!JSON.stringify(e.sessions).includes(tokenA));});
await test('Session from event B cannot read/mutate A',async()=>{const e=(await svc.loadEvent(a.id)).value;assert.throws(()=>svc.authenticate(e,tokenB),x=>x.status===401);await rejected(svc.mutate(a.id,{revision:a.revision,action:'table_add',name:'A',capacity:4},tokenB),401);});
await test('Expired session denied',async()=>{const loaded=await svc.loadEvent(b.id);loaded.value.sessions.forEach(s=>s.expiresAt=Date.now()-1);await store.writeStore(b.id,loaded.value,loaded.etag);assert.throws(()=>svc.authenticate(loaded.value,tokenB),e=>e.status===401);});
await test('Strict validation and atomic import',async()=>{await rejected(command('group_import',{groups:[{label:'Family',people:[{name:'Ana',kind:'adult',seatRequired:true}]},{label:'Broken',people:[]}]}),400);assert.equal((await current(a)).people.length,0);await command('group_add',{label:'Familia Ríos',people:[{name:'Ana',kind:'adult',seatRequired:true},{name:'Bruno',kind:'adult',seatRequired:true},{name:'Nina',kind:'child',seatRequired:true},{name:'Bebé',kind:'baby',seatRequired:false}]});groupId=a.groups[0].id;await rejected(command('table_add',{name:'Unknown',capacity:6,unexpected:'field'}),400);});
await test('Private token hashed, no RSVP before publication',async()=>{const r=await command('invitation_rotate',{groupId});invitationToken=r.invitationToken;const stored=(await svc.loadEvent(a.id)).value;assert.equal(stored.invitations[groupId],svc.hash(invitationToken));await rejected(svc.rsvp(a.id,{action:'get',token:invitationToken}),404);await rejected(command('publish'),400);await command('photos',{photos:[syntheticPhoto]});await command('publish');const publicData=await svc.publicEvent(a.id);assert.equal(publicData.workspace.guests.length,0);assert.equal(publicData.people,undefined);});
await test('RSVP preserves explicit people IDs, baby requires no place',async()=>{const get=await svc.rsvp(a.id,{action:'get',token:invitationToken});const people=get.people.map(({id,name,kind,seatRequired})=>({id,name,kind,seatRequired,attendance:'confirmed',menu:kind==='baby'?'No requiere':'General',note:''}));const result=await svc.rsvp(a.id,{action:'submit',token:invitationToken,revision:get.revision,people});assert.equal(result.people.filter(p=>p.attendance==='confirmed').length,4);assert.equal(result.people.filter(p=>p.seatRequired).length,3);a=await current(a);});
await test('RSVP stale repeat and foreign identity cannot change data',async()=>{const get=await svc.rsvp(a.id,{action:'get',token:invitationToken});const people=get.people.map(({id,name,kind,seatRequired,attendance,menu,note})=>({id,name,kind,seatRequired,attendance,menu,note}));await rejected(svc.rsvp(a.id,{action:'submit',token:invitationToken,revision:get.revision-1,people}),409);people[0].id='per_foreign';await rejected(svc.rsvp(a.id,{action:'submit',token:invitationToken,revision:get.revision,people}),400);assert.equal((await current(a)).people.length,4);});
await test('Capacity, uniqueness, baby and entire group move validated',async()=>{await command('table_add',{name:'Almendro',capacity:3});tableId=a.tables[0].id;const seatPeople=a.people.filter(p=>p.seatRequired).map(p=>p.id);await command('assign',{personIds:seatPeople,tableId});const baby=a.people.find(p=>!p.seatRequired);await command('assign',{personIds:[baby.id],tableId});await rejected(command('person_update',{personId:baby.id,seatRequired:true}),400);await rejected(command('table_update',{tableId,capacity:2}),400);await rejected(command('assign',{personIds:[seatPeople[0],seatPeople[0]],tableId}),400);await command('review',{ready:true});assert.equal(a.assignments.length,4);});
await test('Decline frees seat and invalidates ready plan; reconfirm does not reseat',async()=>{const p=a.people[0];await command('person_update',{personId:p.id,attendance:'declined'});assert.equal(a.assignments.length,3);assert.equal(a.review,'needs_review');await command('person_update',{personId:p.id,attendance:'confirmed'});assert.equal(a.assignments.length,3);await rejected(command('review',{ready:true}),400);});
await test('Concurrent same-revision writes: exactly one wins',async()=>{a=await current(a);const jobs=[1,2].map(n=>svc.mutate(a.id,{revision:a.revision,action:'table_add',name:'Concurrent '+n,capacity:2},tokenA));const results=await Promise.allSettled(jobs);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);});
await test('CSV formulas neutralized; private notes absent',async()=>{await command('person_update',{personId:a.people[0].id,name:' =HYPERLINK("bad")',note:'PRIVATE MEDICAL NOTE',menu:'=1+1'});await command('table_add',{name:'Mesa 10',capacity:2});const ten=a.tables.find(t=>t.name==='Mesa 10').id;await command('table_add',{name:'Mesa 2',capacity:2});const two=a.tables.find(t=>t.name==='Mesa 2').id;await command('assign',{personIds:[a.people[0].id],tableId:ten});await command('assign',{personIds:[a.people[1].id],tableId:two});const e=(await svc.loadEvent(a.id)).value;const originalPeople=JSON.stringify(e.people);const venue=svc.csv(e,'venue'),catering=svc.csv(e,'catering');assert.equal(JSON.stringify(e.people),originalPeople);for(const output of [venue,catering]){const second=output.indexOf('\r\n"Mesa 2"'),tenth=output.indexOf('\r\n"Mesa 10"');assert.ok(second>=0&&tenth>second);const baby=output.indexOf('\r\n"Almendro","Bebé"'),child=output.indexOf('\r\n"Almendro","Nina"');assert.ok(baby>=0&&child>baby);assert.equal(output.charCodeAt(0),65279);assert.ok(output.split('\r\n').length>10);}assert.ok(venue.includes("'=HYPERLINK"));assert.ok(catering.includes("'=1+1"));assert.ok(!venue.includes('PRIVATE MEDICAL NOTE'));assert.ok(!catering.includes('PRIVATE MEDICAL NOTE'));assert.ok(!catering.includes(invitationToken));});
await test('Payment verified requires operator; time and ledger survive rollback',async()=>{await rejected(command('ledger_add',{kind:'payment_verified',amount:100,currency:'ARS',reference:'Synthetic'}),403);await command('ledger_add',{kind:'payment_verified',amount:100,currency:'ARS',reference:'Synthetic'},true);await rejected(command('ledger_add',{kind:'payment_verified',amount:100,currency:'ARS',reference:'  SYNTHETIC  '},true),409);await command('ledger_add',{kind:'time',minutes:15,reference:'Synthetic work'},true);const snapshotId=a.revisions.at(-1).id;await command('table_add',{name:'To rollback',capacity:4});await command('rollback',{snapshotId});assert.ok(!a.tables.some(t=>t.name==='To rollback'));assert.equal(a.ledger.length,2);await rejected(svc.rsvp(a.id,{action:'get',token:invitationToken}),404);});
await test('Publication snapshot remains separate; content mutation does not republish',async()=>{await command('publish');const old=await svc.publicEvent(a.id);const draft=structuredClone(a.draft);draft.content.partnerOne='Nueva';await command('content',{workspace:draft});assert.equal((await svc.publicEvent(a.id)).workspace.content.partnerOne,old.workspace.content.partnerOne);});
await test('Backup restore same-event only, no credential injection, sessions revoked',async()=>{const saved=svc.backup((await svc.loadEvent(a.id)).value);await command('table_add',{name:'Temporary',capacity:2});await rejected(svc.restore(a.id,{revision:a.revision,backup:{...saved,eventId:b.id}},tokenA),400);const restored=await svc.restore(a.id,{revision:a.revision,backup:saved},tokenA);assert.ok(!restored.tables.some(t=>t.name==='Temporary'));assert.equal(restored.ledger.length,2);const after=(await svc.loadEvent(a.id)).value;assert.equal(after.sessions.length,0);tokenA=(await svc.login(a.id,pass,'restored')).token;});
await test('RSVP closure and invitation rotation revoke former token',async()=>{const r=await command('invitation_rotate',{groupId});invitationToken=r.invitationToken;await command('rsvp_close',{closed:true});const get=await svc.rsvp(a.id,{action:'get',token:invitationToken});assert.equal(get.rsvpClosed,true);await rejected(svc.rsvp(a.id,{action:'submit',token:invitationToken,revision:get.revision,people:get.people}),409);await command('invitation_rotate',{groupId});await rejected(svc.rsvp(a.id,{action:'get',token:invitationToken}),404);});
await test('Successful logins reset failures, global limit and password revocation persist',async()=>{for(let i=0;i<60;i++){const session=await svc.login(b.id,pass,'legitimate');assert.ok(session.token);await svc.logout(b.id,session.token);}await rejected(svc.login(b.id,pass,'legitimate'),429);for(let i=0;i<5;i++)await rejected(svc.login(b.id,'wrong','throttle'),401);await rejected(svc.login(b.id,pass,'throttle'),429);await command('password_reset',{password:'New synthetic password!'},true);await rejected(svc.login(a.id,pass,'reset'),401);const result=await svc.login(a.id,'New synthetic password!','reset');assert.ok(result.token);});
await test('Password leading/trailing spaces remain exact',async()=>{const password='  Synthetic spaced password!  ';const event=await svc.createEvent(clean(),password);assert.ok((await svc.login(event.id,password,'spaced')).token);await rejected(svc.login(event.id,password.trim(),'spaced'),401);});
await test('Impossible calendar dates, malformed hours and SVG rejected',async()=>{const w=clean();w.content.date='2027-02-30';await rejected(svc.createEvent(w,pass),400);w.content.date='2027-02-28';w.content.celebrationTime='25:99';await rejected(svc.createEvent(w,pass),400);tokenA=(await svc.login(a.id,'New synthetic password!','photo-tests')).token;await rejected(command('photos',{photos:['data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=']}),400);});
await test('Photo snapshot and deduplicated backup restore exact published bytes',async()=>{const photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';await command('photos',{photos:[photo]});await command('publish');const copy=svc.backup((await svc.loadEvent(a.id)).value);assert.equal(Object.values(copy.assets).length,1);assert.ok(copy.state.photos[0].startsWith('@photo:'));assert.equal(copy.state.photos[0],copy.state.published.photos[0]);await command('photos',{photos:[]});assert.equal((await svc.publicEvent(a.id)).photos[0],photo);await svc.restore(a.id,{revision:a.revision,backup:structuredClone(copy)},tokenA);assert.equal((await svc.publicEvent(a.id)).photos[0],photo);tokenA=(await svc.login(a.id,'New synthetic password!','photo-restored')).token;const bad=structuredClone(copy);bad.state.people.push(bad.state.people[0]);await rejected(svc.restore(a.id,{revision:(await current(a)).revision,backup:bad},tokenA),400);const incomplete=structuredClone(copy);incomplete.state.published.photos=[];await rejected(svc.restore(a.id,{revision:(await current(a)).revision,backup:incomplete},tokenA),400);const corrupt=structuredClone(copy);corrupt.assets[Object.keys(corrupt.assets)[0]]=photo+'bad';await rejected(svc.restore(a.id,{revision:(await current(a)).revision,backup:corrupt},tokenA),400);});
await test('RSVP limiter persists independently from arbitrary tokens',async()=>{const r=await command('invitation_rotate',{groupId});for(let n=0;n<60;n++)await rejected(svc.rsvp(a.id,{action:'get',token:'invalid-'+n},'abuse'),404);await rejected(svc.rsvp(a.id,{action:'get',token:r.invitationToken},'abuse'),429);});
await test('CSRF compares observed Host for 127/localhost and rejects foreign origins',async()=>{for(const host of ['127.0.0.1:3104','localhost:3104']){assertMutationOrigin(new Headers({host,origin:'http://'+host}));assertMutationOrigin(new Headers({host,origin:'http://'+host}),true);}assertMutationOrigin(new Headers({host:'sodi.example',origin:'https://sodi.example'}),true);for(const origin of ['https://other.example','http://sodi.example','null','ftp://sodi.example'])assert.throws(()=>assertMutationOrigin(new Headers({host:'sodi.example',origin}),true),e=>e.status===403);assert.throws(()=>assertMutationOrigin(new Headers({host:'127.0.0.1:3104',origin:'http://localhost:3104'})),e=>e.status===403);});
const layout=await import('../src/lib/boda-service/layout.ts');
const validation=await import('../src/lib/boda-service/validation.ts');
let spatial,spatialTable;
async function spatialCommand(action,data={}){spatial=await current(spatial);const result=await svc.mutate(spatial.id,{revision:spatial.revision,action,...data},undefined,true);spatial=result.event;return spatial;}
await test('Spatial room and rotated table persist without changing people or capacities',async()=>{
  spatial=await svc.createEvent(clean(),pass);
  await spatialCommand('group_add',{label:'Plano',people:[{name:'Adulto',kind:'adult',seatRequired:true},{name:'Bebé',kind:'baby',seatRequired:false}]});
  for(const p of spatial.people)await spatialCommand('person_update',{personId:p.id,attendance:'confirmed'});
  await spatialCommand('table_add',{name:'Mesa espacial',capacity:1});spatialTable=spatial.tables[0].id;
  await spatialCommand('assign',{personIds:spatial.people.map(p=>p.id),tableId:spatialTable});
  const assignments=structuredClone(spatial.assignments);
  await spatialCommand('room_update',{width:20,height:14});
  await spatialCommand('table_update',{tableId:spatialTable,shape:'rectangular',width:2.4,height:1.2,x:5,y:4,rotation:45});
  const persisted=await current(spatial);assert.deepEqual(persisted.floorPlan,{width:20,height:14,features:[]});assert.deepEqual(layout.geometryOf(persisted.tables[0]),{shape:'rectangular',width:2.4,height:1.2,x:5,y:4,rotation:45});assert.deepEqual(persisted.assignments,assignments);assert.equal(persisted.tables[0].capacity,1);
});
await test('Rotated chair envelope clamps inside every corner at centimetre precision',async()=>{
  const room={width:20,height:14},table={shape:'rectangular',width:2.4,height:1.2,rotation:45,x:5,y:4};
  for(const [x,y] of [[-100,-100],[-100,100],[100,-100],[100,100]]){const clamped={...table,...layout.clampPosition({...table,x,y},room,layout.CHAIR_MARGIN)};assert.ok(layout.withinRoom(clamped,room,layout.CHAIR_MARGIN));validation.tableGeometry(clamped);await spatialCommand('table_update',{tableId:spatialTable,...clamped});}
  await spatialCommand('table_update',{tableId:spatialTable,x:5,y:4});
});
await test('Invalid spatial transforms and room shrink reject atomically',async()=>{
  const before=await current(spatial);
  for(const data of [{x:-1},{x:NaN},{rotation:360},{rotation:0.5},{width:6.01},{x:1,y:1},{shape:'round',width:2,height:1}])await rejected(spatialCommand('table_update',{tableId:spatialTable,...data}),400);
  await rejected(spatialCommand('room_update',{width:4,height:4}),400);
  const after=await current(spatial);assert.equal(after.revision,before.revision);assert.deepEqual(after.tables,before.tables);assert.deepEqual(after.assignments,before.assignments);assert.deepEqual(after.floorPlan,before.floorPlan);
});
await test('References persist, overlap is advisory, backup and rollback recover geometry',async()=>{
  await spatialCommand('floor_feature_add',{kind:'entrance'});await spatialCommand('floor_feature_add',{kind:'dancefloor'});
  const feature=spatial.floorPlan.features[1];await spatialCommand('floor_feature_update',{featureId:feature.id,label:'Pista central',x:5,y:4,width:3,height:3,rotation:30});
  assert.ok(layout.overlapping(spatial.tables[0],spatial.floorPlan.features[1],layout.CHAIR_MARGIN,0));
  const state=(await svc.loadEvent(spatial.id)).value,saved=svc.backup(state),expected=structuredClone(state.floorPlan),assignments=structuredClone(state.assignments);
  await spatialCommand('floor_feature_delete',{featureId:feature.id});const snapshotId=spatial.revisions.at(-1).id;
  await spatialCommand('rollback',{snapshotId});assert.deepEqual(spatial.floorPlan,expected);
  await spatialCommand('table_update',{tableId:spatialTable,x:8});spatial=await svc.restore(spatial.id,{revision:spatial.revision,backup:structuredClone(saved)},undefined,true);
  assert.deepEqual(spatial.floorPlan,expected);assert.equal(spatial.tables[0].x,5);assert.deepEqual(spatial.assignments,assignments);
  for(let n=2;n<12;n++)await spatialCommand('floor_feature_add',{kind:'entrance'});
  const revision=spatial.revision;await rejected(spatialCommand('floor_feature_add',{kind:'entrance'}),400);assert.equal((await current(spatial)).revision,revision);
});
await test('Legacy geometry defaults require review and old backups remain recoverable',async()=>{
  const loaded=await svc.loadEvent(spatial.id);const legacy=loaded.value;delete legacy.floorPlan;legacy.tables=legacy.tables.map(({id,name,capacity})=>({id,name,capacity}));legacy.review='ready';await store.writeStore(legacy.id,legacy,loaded.etag);
  const hydrated=(await svc.loadEvent(spatial.id)).value;assert.equal(hydrated.review,'needs_review');assert.deepEqual(hydrated.assignments,spatial.assignments);assert.ok(layout.withinRoom(hydrated.tables[0],hydrated.floorPlan,layout.CHAIR_MARGIN));
  const oldBackup=svc.backup(hydrated);delete oldBackup.state.floorPlan;oldBackup.state.tables=oldBackup.state.tables.map(({id,name,capacity})=>({id,name,capacity}));oldBackup.state.review='ready';
  assert.equal(validation.business(structuredClone(oldBackup.state)).review,'needs_review');
  spatial=await svc.restore(spatial.id,{revision:hydrated.revision,backup:oldBackup},undefined,true);assert.equal(spatial.review,'needs_review');assert.deepEqual(spatial.assignments,hydrated.assignments);
});
await test('100 tables remain restorable and the 101st table cannot mutate storage',async()=>{
  const loaded=await svc.loadEvent(spatial.id),e=loaded.value;
  e.tables=[e.tables[0],...Array.from({length:99},(_,n)=>({id:'synthetic_table_'+n,name:'Synthetic '+n,capacity:1,...layout.defaultTableGeometry(n+1,e.floorPlan)}))];validation.validateBusiness(e);await store.writeStore(e.id,e,loaded.etag);
  const before=await current(spatial);await rejected(spatialCommand('table_add',{name:'One too many',capacity:1}),400);assert.equal((await current(spatial)).revision,before.revision);assert.equal((await current(spatial)).tables.length,100);
  const saved=svc.backup((await svc.loadEvent(spatial.id)).value);spatial=await svc.restore(spatial.id,{revision:before.revision,backup:saved},undefined,true);assert.equal(spatial.tables.length,100);assert.deepEqual(spatial.assignments,before.assignments);
});
await test('Concurrent spatial changes preserve one full version and all guests',async()=>{
  spatial=await current(spatial);const assignments=structuredClone(spatial.assignments),revision=spatial.revision;
  const results=await Promise.allSettled([5,6].map(x=>svc.mutate(spatial.id,{revision,action:'table_update',tableId:spatialTable,x,y:5},undefined,true)));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.status===409).length,1);const after=await current(spatial);assert.equal(after.revision,revision+1);assert.deepEqual(after.assignments,assignments);assert.ok([5,6].includes(after.tables[0].x));
});
let support,supportInvite;
async function supportCommand(action,data={}){support=await current(support);const result=await svc.mutate(support.id,{revision:support.revision,action,...data},undefined,true);support=result.event;return result;}
await test('Person support defaults and strict consent/needs reject invalid atomic updates',async()=>{
  support=await svc.createEvent(clean(),pass);await supportCommand('group_add',{label:'Necesidades',people:[{name:'Persona',kind:'adult',seatRequired:true},{name:'Bebé',kind:'baby',seatRequired:false}]});
  for(const p of support.people){assert.equal(p.dietaryRestriction,'');assert.equal(p.shareDietaryRestriction,false);assert.deepEqual(p.accessibilityNeeds,[]);await supportCommand('person_update',{personId:p.id,attendance:'confirmed'});}
  const before=await current(support);
  for(const fields of [{shareDietaryRestriction:'yes'},{dietaryRestriction:'x'.repeat(241)},{accessibilityNeeds:['diagnosis']},{accessibilityNeeds:['highchair','highchair']},{accessibilityNeeds:['highchair','wheelchair_space']},{accessibilityNeeds:null}])await rejected(supportCommand('person_update',{personId:support.people[0].id,...fields}),400);
  assert.equal((await current(support)).revision,before.revision);
});
await test('Highchair and wheelchair reserve an existing place without increasing capacity',async()=>{
  await supportCommand('table_add',{name:'Con un lugar',capacity:1});const tableId=support.tables[0].id,baby=support.people[1].id;
  await supportCommand('assign',{personIds:support.people.map(p=>p.id),tableId});
  for(const need of ['highchair','wheelchair_space']){await rejected(supportCommand('person_update',{personId:baby,accessibilityNeeds:[need]}),400);await rejected(supportCommand('person_update',{personId:baby,accessibilityNeeds:[need],seatRequired:true}),400);}
  assert.equal(support.tables[0].capacity,1);assert.equal(support.assignments.length,2);
  await supportCommand('person_update',{personId:baby,accessibilityNeeds:['step_free_access']});assert.equal(support.people[1].seatRequired,false);
  await supportCommand('table_update',{tableId,capacity:2});await supportCommand('person_update',{personId:baby,accessibilityNeeds:['highchair'],seatRequired:true});assert.equal(support.assignments.length,2);assert.equal(support.tables[0].capacity,2);
});
await test('Venue and catering export only their operational fields with explicit dietary consent',async()=>{
  const personId=support.people[0].id;await supportCommand('person_update',{personId,menu:'Vegetariano',dietaryRestriction:'=EVITAR("nueces")',shareDietaryRestriction:false,accessibilityNeeds:['wheelchair_space','step_free_access'],note:'STRICTLY PRIVATE NOTE'});
  let e=(await svc.loadEvent(support.id)).value;assert.ok(!svc.csv(e,'catering').includes('EVITAR'));const venue=svc.csv(e,'venue');assert.ok(venue.includes('Espacio para silla de ruedas; Acceso sin escalones'));assert.ok(!venue.includes('Vegetariano'));assert.ok(!venue.includes('EVITAR'));
  await supportCommand('person_update',{personId,shareDietaryRestriction:true});e=(await svc.loadEvent(support.id)).value;const catering=svc.csv(e,'catering');assert.ok(catering.includes("'=EVITAR"));assert.ok(catering.includes('Vegetariano'));assert.ok(!catering.includes('silla de ruedas'));
  for(const target of ['guests','venue','catering'])assert.ok(!svc.csv(e,target).includes('STRICTLY PRIVATE NOTE'));
  await supportCommand('person_update',{personId,shareDietaryRestriction:false});assert.ok(!svc.csv((await svc.loadEvent(support.id)).value,'catering').includes('EVITAR'));
});
await test('RSVP own-group support edits preserve private notes and legacy omitted fields',async()=>{
  await supportCommand('photos',{photos:[syntheticPhoto]});await supportCommand('publish');supportInvite=(await supportCommand('invitation_rotate',{groupId:support.groups[0].id})).invitationToken;
  let response=await svc.rsvp(support.id,{action:'get',token:supportInvite});assert.ok(!JSON.stringify(response).includes('STRICTLY PRIVATE NOTE'));
  const payload=response.people.map(({id,name,kind,attendance,seatRequired,menu})=>({id,name,kind,attendance,seatRequired,menu,note:'guest cannot change private note'}));
  response=await svc.rsvp(support.id,{action:'submit',token:supportInvite,revision:response.revision,people:payload});assert.equal(response.people[0].dietaryRestriction,'=EVITAR("nueces")');assert.deepEqual(response.people[0].accessibilityNeeds,['wheelchair_space','step_free_access']);assert.equal((await current(support)).people[0].note,'STRICTLY PRIVATE NOTE');
  const updated=response.people.map(p=>({...p,menu:p.id===response.people[0].id?'Vegano':p.menu}));updated[0].dietaryRestriction='Sin frutos secos';updated[0].shareDietaryRestriction=true;updated[0].accessibilityNeeds=['step_free_access'];
  const rows=updated.map(({id,name,kind,attendance,seatRequired,menu,dietaryRestriction,shareDietaryRestriction,accessibilityNeeds})=>({id,name,kind,attendance,seatRequired,menu,dietaryRestriction,shareDietaryRestriction,accessibilityNeeds}));
  response=await svc.rsvp(support.id,{action:'submit',token:supportInvite,revision:response.revision,people:rows});assert.equal(response.people[0].menu,'Vegano');assert.equal(response.people[0].shareDietaryRestriction,true);assert.deepEqual(response.people[0].accessibilityNeeds,['step_free_access']);assert.equal((await current(support)).people[0].note,'STRICTLY PRIVATE NOTE');
});
await test('Support fields restore exactly and old backups safely supply empty defaults',async()=>{
  const e=(await svc.loadEvent(support.id)).value,saved=svc.backup(e),expected=structuredClone(e.people);
  await supportCommand('person_update',{personId:e.people[0].id,menu:'Tradicional',accessibilityNeeds:[],dietaryRestriction:'',shareDietaryRestriction:false});
  support=await svc.restore(support.id,{revision:support.revision,backup:structuredClone(saved)},undefined,true);assert.deepEqual(support.people,expected);
  const legacy=structuredClone(saved);legacy.state.people.forEach(p=>{delete p.accessibilityNeeds;delete p.dietaryRestriction;delete p.shareDietaryRestriction;});support=await svc.restore(support.id,{revision:support.revision,backup:legacy},undefined,true);assert.deepEqual(support.people[0].accessibilityNeeds,[]);assert.equal(support.people[0].dietaryRestriction,'');assert.equal(support.people[0].shareDietaryRestriction,false);assert.equal(support.people[0].menu,'Vegano');assert.equal(support.people[0].note,'STRICTLY PRIVATE NOTE');
});
await test('Local self-serve starts empty with couple session and persistent five-per-hour limit',async()=>{
  assert.equal(svc.selfServeEnabled(),true);const trial=createWeddingTrial();assert.ok(trial.guests.length>0);
  for(let i=0;i<5;i++){const result=await svc.startEvent(trial,pass,'synthetic-self-serve');assert.equal(result.event.people.length,0);assert.equal(result.event.groups.length,0);assert.equal(result.event.draft.guests.length,0);assert.equal(result.event.draft.rsvps.length,0);assert.equal(result.event.audit[0].actor,'couple');svc.authenticate((await svc.loadEvent(result.event.id)).value,result.token);}
  const rate=await store.readStore('limit_'+svc.hash('self-serve-start:synthetic-self-serve'));assert.equal(rate.value.attempts,5);const before=(await store.eventKeys()).length;await rejected(svc.startEvent(trial,pass,'synthetic-self-serve'),429);assert.equal((await store.eventKeys()).length,before);
});
await test('Self-serve production and unspecified environments fail before creating any event',async()=>{
  const env=process.env.NODE_ENV;for(const mode of ['production','test',undefined]){if(mode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=mode;assert.equal(svc.selfServeEnabled(),false);await rejected(svc.startEvent(clean(),pass,'disabled'),503);}process.env.NODE_ENV=env;
});
let acquisition;
await test('Declared acquisition defaults, enum validation and private DTO separation persist',async()=>{
  const direct=await svc.startEvent(clean(),pass,'acquisition-default');assert.equal((await svc.loadEvent(direct.event.id)).value.acquisitionSource,'direct');
  acquisition=(await svc.startEvent(clean(),pass,'acquisition-guest','guest_attribution')).event;assert.equal((await svc.loadEvent(acquisition.id)).value.acquisitionSource,'guest_attribution');
  const before=(await store.eventKeys()).length;for(const invalid of ['https://example.com',null,'campaign',42])await rejected(svc.startEvent(clean(),pass,'acquisition-invalid',invalid),400);assert.equal((await store.eventKeys()).length,before);
  assert.ok(!('acquisitionSource' in acquisition));
  async function mutate(action,data={}){const r=await svc.mutate(acquisition.id,{revision:acquisition.revision,action,...data},undefined,true);acquisition=r.event;return r;}
  await mutate('group_add',{label:'Synthetic acquisition',people:[{name:'Synthetic guest',kind:'adult',seatRequired:true}]});await mutate('photos',{photos:[syntheticPhoto]});await mutate('publish');const invited=await mutate('invitation_rotate',{groupId:acquisition.groups[0].id});
  assert.ok(!JSON.stringify(await svc.publicEvent(acquisition.id)).includes('acquisitionSource'));assert.ok(!JSON.stringify(await svc.rsvp(acquisition.id,{action:'get',token:invited.invitationToken})).includes('acquisitionSource'));
  assert.equal((await svc.listEvents()).find(e=>e.id===acquisition.id).acquisitionSource,'guest_attribution');
});
await test('Acquisition metadata cannot be edited or replaced by backups and rollback',async()=>{
  const initial=(await svc.loadEvent(acquisition.id)).value,saved=svc.backup(initial);assert.ok(!JSON.stringify(saved).includes('acquisitionSource'));
  await rejected(svc.mutate(acquisition.id,{revision:initial.revision,action:'acquisitionSource',acquisitionSource:'direct'},undefined,true),400);
  const bad=structuredClone(saved);bad.state.acquisitionSource='direct';await rejected(svc.restore(acquisition.id,{revision:initial.revision,backup:bad},undefined,true),400);
  let result=await svc.mutate(acquisition.id,{revision:initial.revision,action:'table_add',name:'Temporary acquisition table',capacity:2},undefined,true);const snapshotId=result.event.revisions.at(-1).id;
  result=await svc.mutate(acquisition.id,{revision:result.event.revision,action:'rollback',snapshotId},undefined,true);assert.equal((await svc.loadEvent(acquisition.id)).value.acquisitionSource,'guest_attribution');
  await svc.restore(acquisition.id,{revision:result.event.revision,backup:saved},undefined,true);const restored=(await svc.loadEvent(acquisition.id)).value;assert.equal(restored.acquisitionSource,'guest_attribution');assert.equal(restored.createdAt,initial.createdAt);
});
await test('Production without private Blob fails closed even with local requested',async()=>{const env=process.env.NODE_ENV,token=process.env.BLOB_READ_WRITE_TOKEN;process.env.NODE_ENV='production';delete process.env.BLOB_READ_WRITE_TOKEN;await rejected(svc.loadEvent(a.id),503);process.env.BODA_STUDIO_STORAGE='local';process.env.BLOB_READ_WRITE_TOKEN='synthetic-not-used';await rejected(svc.loadEvent(a.id),503);process.env.NODE_ENV=env;if(token)process.env.BLOB_READ_WRITE_TOKEN=token;else delete process.env.BLOB_READ_WRITE_TOKEN;delete process.env.BODA_STUDIO_STORAGE;});
console.log(`Completed ${checks} meaningful synthetic service checks. No remote storage or real data used.`);
} finally {await rm(dir,{recursive:true,force:true});}
