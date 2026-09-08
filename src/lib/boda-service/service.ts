import { DEFAULT_FLOOR_PLAN, defaultTableGeometry, defaultFeature, ensureLayout } from './layout.ts';
import { safeCsvCell } from '../safe-csv.ts';
import { randomBytes, createHash, scryptSync, timingSafeEqual } from 'node:crypto';
import { readStore, writeStore, deleteStore, eventKeys } from './store.ts';
import { ServiceError } from './types.ts';
import type { Business, StoredEvent, EventView, Person } from './types.ts';
import * as v from './validation.ts';
import {selfServeEnabled, reservePilotSlot, markPilotDeleted} from './pilot.ts';
export {selfServeEnabled, capabilities} from './pilot.ts';
const id = (prefix: string) => `${prefix}_${randomBytes(12).toString('hex')}`;
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const now = () => new Date().toISOString();
export const SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_STORED_EVENT_BYTES=8*1024*1024;
async function writeEvent(e:StoredEvent,etag:string|null) {
    e.audit=e.audit.slice(-500);
    e.snapshots=e.snapshots.slice(-30);
    const collectAssets=()=>{
        const used=new Set(e.snapshots.flatMap(s=>[...s.state.photos,...(s.state.published?.photos??[])]).filter(p=>p.startsWith('@photo:')).map(p=>p.slice(7)));
        for(const asset of Object.keys(e.assets))if(!used.has(asset))delete e.assets[asset];
    };
    collectAssets();
    while(Buffer.byteLength(JSON.stringify(e),'utf8')>MAX_STORED_EVENT_BYTES&&e.snapshots.length>1){e.snapshots.shift();collectAssets();}
    if(Buffer.byteLength(JSON.stringify(e),'utf8')>MAX_STORED_EVENT_BYTES)throw new ServiceError(400,'El evento supera el tamaño permitido. Descargá una copia y reducí el peso de las fotos.');
    await writeStore(e.id,e,etag);
}
export async function throttle(scope: string, key: string, limit: number, windowMs: number) { const rateKey = 'limit_' + hash(scope + ':' + key); const stored = await readStore<{
    start: number;
    attempts: number;
}>(rateKey); const rate = stored && stored.value.start > Date.now() - windowMs ? stored.value : { start: Date.now(), attempts: 0 }; if (rate.attempts >= limit)
    throw new ServiceError(429, 'Demasiados intentos. Esperá unos minutos.'); rate.attempts++; await writeStore(rateKey, rate, stored?.etag ?? null); }
function passwordHash(password: unknown) { if (typeof password !== 'string' || password.length < 12 || password.length > 128 || /[\u0000-\u001F\u007F]/.test(password))
    v.fail('La contraseña debe tener entre 12 y 128 caracteres, sin caracteres de control.'); const p = password; const salt = randomBytes(16).toString('hex'); return salt + ':' + scryptSync(p, salt, 32).toString('hex'); }
function passwordMatches(password: unknown, stored: string) { if (typeof password !== 'string' || password.length > 128)
    return false; const [salt, h] = stored.split(':'); const got = scryptSync(password, salt, 32); const expected = Buffer.from(h, 'hex'); return got.length === expected.length && timingSafeEqual(got, expected); }
export function businessState(e: StoredEvent): Business { return structuredClone({ floorPlan: e.floorPlan, draft: e.draft, photos: e.photos, rsvpClosed: e.rsvpClosed, published: e.published, groups: e.groups, people: e.people, tables: e.tables, assignments: e.assignments, review: e.review }); }
export function view(e: StoredEvent): EventView { return { ...businessState(e), id: e.id, revision: e.revision, createdAt: e.createdAt, updatedAt: e.updatedAt, ledger: e.ledger, audit: e.audit, revisions: e.snapshots.map(({ id, at, action }) => ({ id, at, action })) }; }
export async function loadEvent(eventId: string) { if (!/^evt_[a-f0-9]{24}$/.test(eventId))
    throw new ServiceError(404, 'Evento no encontrado.'); const result = await readStore<StoredEvent>(eventId); if (!result)
    throw new ServiceError(404, 'Evento no encontrado.'); ensureLayout(result.value); result.value.people=result.value.people.map(p=>({...p,...v.personSupport({...p})})); return result; }
export function authenticate(e: StoredEvent, token: string | undefined, operator = false) { if (operator)
    return; const h = token ? hash(token) : ''; if (!e.sessions.some(s => s.hash === h && s.expiresAt > Date.now()))
    throw new ServiceError(401, 'Ingresá para acceder a este evento.'); }
function snapshot(e: StoredEvent, action: string) {
    const state = businessState(e);
    const pack = (photos: string[]) => photos.map(photo => { const h = hash(photo); e.assets[h] = photo; return '@photo:' + h; });
    state.photos = pack(state.photos);
    if (state.published)
        state.published.photos = pack(state.published.photos);
    e.snapshots.push({ id: id('rev'), at: now(), action, state });
    e.snapshots = e.snapshots.slice(-30);
    const used = new Set(e.snapshots.flatMap(s => [...s.state.photos, ...(s.state.published?.photos ?? [])]).map(p => p.replace('@photo:', '')));
    for (const h of Object.keys(e.assets))
        if (!used.has(h))
            delete e.assets[h];
    while (Object.values(e.assets).reduce((n, p) => n + p.length, 0) > 8000000 && e.snapshots.length > 1) {
        e.snapshots.shift();
        const retained = new Set(e.snapshots.flatMap(s => [...s.state.photos, ...(s.state.published?.photos ?? [])]).map(p => p.replace('@photo:', '')));
        for (const h of Object.keys(e.assets))
            if (!retained.has(h))
                delete e.assets[h];
    }
}
function unpack(e: StoredEvent, b: Business): Business { const result = structuredClone(b); const unpackPhotos = (photos: string[]) => photos.map(p => p.startsWith('@photo:') ? e.assets[p.slice(7)] ?? v.fail('Foto histórica no disponible.') : p); result.photos = unpackPhotos(result.photos); if (result.published)
    result.published.photos = unpackPhotos(result.published.photos); result.people=result.people.map(p=>({...p,...v.personSupport({...p})})); return ensureLayout(result); }
function audit(e: StoredEvent, action: string, actor: string) { e.revision++; e.updatedAt = now(); e.audit.push({ at: e.updatedAt, action, actor }); e.audit=e.audit.slice(-500); }
function addGroup(e: StoredEvent, label: unknown, inputs: unknown) {
    if (e.groups.length >= 100)
        v.fail('Se permiten hasta 100 grupos.');
    const values = v.array(inputs, 30);
    if (!values.length || e.people.length + values.length > 200)
        v.fail('Se permiten entre 1 y 200 personas.');
    const group = { id: id('grp'), label: v.text(label, 150), personIds: [] as string[], invitationVersion: 0 };
    for (const input of values) {
        const p = v.object(input);
        v.keys(p, ['name', 'kind', 'seatRequired']);
        const name = v.text(p.name ?? '', 150, true);
        const person: Person = { id: id('per'), groupId: group.id, name, namePending: !name, kind: v.choice(p.kind ?? 'unknown', ['adult', 'child', 'baby', 'unknown'] as const), attendance: 'pending', seatRequired: p.seatRequired === undefined ? true : v.boolean(p.seatRequired), menu: '', dietaryRestriction:'', shareDietaryRestriction:false, accessibilityNeeds:[], note: '' };
        group.personIds.push(person.id);
        e.people.push(person);
    }
    e.groups.push(group);
    return group;
}
function assertBackupSize(e: StoredEvent) {
    if (Buffer.byteLength(JSON.stringify({ revision: e.revision, backup: backup(e) }), 'utf8') > 3 * 1024 * 1024 - 1024) v.fail('El evento supera el tamaño recuperable. Reducí el peso de las fotos antes de guardar.');
}
function buildEvent(input: unknown, password: unknown, actor:'operator'|'couple', acquisitionSource:'direct'|'guest_attribution', eventId = id('evt')) {
    const source = v.object(input), date = now();
    const draft = v.workspace(input);
    draft.event.id = eventId;
    draft.event.accountId = eventId;
    draft.account.id = eventId;
    draft.content.eventId = eventId;
    draft.publication.eventId = eventId;
    const e: StoredEvent = { acquisitionSource:v.choice(acquisitionSource,['direct','guest_attribution'] as const), floorPlan: structuredClone(DEFAULT_FLOOR_PLAN), schema: 1, id: eventId, revision: 1, createdAt: date, updatedAt: date, passwordHash: passwordHash(password), sessions: [], invitations: {}, assets: {}, draft, photos: [], rsvpClosed: false, published: null, groups: [], people: [], tables: [], assignments: [], review: 'draft', ledger: [], audit: [{ at: date, action: 'created', actor }], snapshots: [] };
    // Trial data is synthetic/aggregate. Preserve amounts, never infer who attended or copy a group menu to individuals.
    const guests = v.array(source.guests ?? [], 100), responses = v.array(source.rsvps ?? [], 200);
    for (const value of guests) {
        const g = v.object(value);
        const limit = v.integer(g.passLimit, 1, 30);
        const group = addGroup(e, g.name, Array.from({ length: limit }, () => ({ name: '', kind: 'unknown', seatRequired: true })));
        const matches = responses.map(v.object).filter(r => r.guestId === g.id);
        if (matches.length > 1)
            v.fail('Hay respuestas repetidas en el borrador.');
        const response = matches[0];
        if (response) {
            const attendance = v.choice(response.attendance, ['confirmed', 'declined'] as const);
            const passes = v.integer(response.passes, 0, limit);
            if ((attendance === 'declined' && passes !== 0) || (attendance === 'confirmed' && passes === 0))
                v.fail('Cantidad de respuesta inconsistente.');
            group.personIds.forEach((pid, index) => { const p = e.people.find(p => p.id === pid)!; p.attendance = attendance === 'declined' ? 'declined' : index < passes ? 'confirmed' : 'pending'; });
        }
    }
    v.validateBusiness(e);
    assertBackupSize(e);
    return e;
}
export async function createEvent(input: unknown, password: unknown, actor:'operator'|'couple'='operator', acquisitionSource:'direct'|'guest_attribution'='direct') {
    const e=buildEvent(input,password,actor,acquisitionSource);
    await writeEvent(e,null);
    return view(e);
}
function rotateRecovery(e:StoredEvent) {
    const recoveryKey=randomBytes(32).toString('base64url');
    e.recoveryKeyHash=hash(recoveryKey);
    return recoveryKey;
}
function replaceSession(e:StoredEvent) {
    const token=randomBytes(32).toString('base64url');
    e.sessions=[{hash:hash(token),expiresAt:Date.now()+SESSION_MS}];
    return token;
}
export async function startEvent(input:unknown,password:unknown,clientKey='shared',acquisitionSource:unknown='direct',requestId?:unknown) {
    const source=v.choice(acquisitionSource,['direct','guest_attribution'] as const);
    if(requestId!==undefined&&(typeof requestId!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId)))v.fail('Identificador de intento inválido.');
    const requestHash=requestId===undefined?undefined:hash(String(requestId).toLowerCase());
    const eventId=requestHash?'evt_'+requestHash.slice(0,24):id('evt');
    const previous=requestHash?await readStore<StoredEvent>(eventId):null;
    if(previous) {
        // A lost response must remain recoverable when admissions later pause.
        await throttle('self-serve-start',clientKey,5,60*60*1000);
        if(previous.value.creationRequestHash!==requestHash||!passwordMatches(password,previous.value.passwordHash))throw new ServiceError(401,'No se pudo recuperar ese intento con estas credenciales.');
        const e=previous.value;
        const token=replaceSession(e), recoveryKey=rotateRecovery(e);
        audit(e,'creation_recovered','couple');
        await writeEvent(e,previous.etag);
        return {event:view(e),token,recoveryKey};
    }
    if(!selfServeEnabled())throw new ServiceError(503,'Las nuevas altas están pausadas. Los espacios ya creados siguen disponibles.');
    await throttle('self-serve-start',clientKey,5,60*60*1000);
    // The self-serve path always starts with an empty real list, never trial identities.
    const workspace=v.workspace(input);
    const e=buildEvent(workspace,password,'couple',source,eventId);
    e.creationRequestHash=requestHash;
    const token=replaceSession(e), recoveryKey=rotateRecovery(e);
    await reservePilotSlot(e.id);
    // Credentials and business data become durable in the same conditional write.
    await writeEvent(e,null);
    return {event:view(e),token,recoveryKey};
}
export async function recover(eventId:string,recoveryKey:unknown,password:unknown,clientKey='shared') {
    await throttle('recovery-client',clientKey,20,15*60*1000);
    if(typeof recoveryKey!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(recoveryKey))throw new ServiceError(401,'No se pudo recuperar el acceso. Revisá el enlace y la clave de recuperación.');
    let loaded;
    try{loaded=await loadEvent(eventId);}catch(error){if(error instanceof ServiceError&&error.status===404)throw new ServiceError(401,'No se pudo recuperar el acceso. Revisá el enlace y la clave de recuperación.');throw error;}
    await throttle('recovery-event',eventId+':'+clientKey,5,15*60*1000);
    const {value:e,etag}=loaded;
    const expected=e.recoveryKeyHash;
    if(!expected||!/^[a-f0-9]{64}$/.test(expected)||!timingSafeEqual(Buffer.from(hash(recoveryKey),'hex'),Buffer.from(expected,'hex')))throw new ServiceError(401,'No se pudo recuperar el acceso. Revisá el enlace y la clave de recuperación.');
    e.passwordHash=passwordHash(password);
    const token=replaceSession(e),nextKey=rotateRecovery(e);
    audit(e,'access_recovered','couple');
    await writeEvent(e,etag);
    return {event:view(e),token,recoveryKey:nextKey};
}
export async function deleteEvent(eventId:string,input:unknown,token:string|undefined,operator=false) {
    const b=v.object(input);v.keys(b,['revision','password']);
    const {value:e,etag}=await loadEvent(eventId);
    authenticate(e,token,operator);
    if(v.integer(b.revision)!==e.revision)throw new ServiceError(409,'La versión cambió. Recargá antes de eliminar.');
    await throttle('delete-event',eventId,5,15*60*1000);
    if(!passwordMatches(b.password,e.passwordHash))throw new ServiceError(401,'La contraseña actual no coincide.');
    await markPilotDeleted(eventId);
    await deleteStore(eventId,etag);
}
export async function listEvents() { const keys = await eventKeys(); const result = []; for (const key of keys) {
    const { value: e } = await loadEvent(key);
    result.push({ id: e.id, acquisitionSource:e.acquisitionSource??null, activation:e.activation??{}, names: `${e.draft.content.partnerOne} y ${e.draft.content.partnerTwo}`, updatedAt: e.updatedAt, published: Boolean(e.published) });
} return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
export async function login(eventId: string, password: unknown, clientKey: string) {
    // Persisted limiter applies even to unknown IDs; no in-memory/server-instance bypass.
    const ipKey = 'rateip_' + hash(clientKey);
    const ipRate = await readStore<{
        start: number;
        attempts: number;
    }>(ipKey);
    const ipCurrent = ipRate && ipRate.value.start > Date.now() - 15 * 60 * 1000 ? ipRate.value : { start: Date.now(), attempts: 0 };
    if (ipCurrent.attempts >= 60)
        throw new ServiceError(429, 'Demasiados intentos. Esperá 15 minutos.');
    ipCurrent.attempts++;
    await writeStore(ipKey, ipCurrent, ipRate?.etag ?? null);
    let loaded;
    try { loaded=await loadEvent(eventId); }
    catch(error) {
        if(!(error instanceof ServiceError)||error.status!==404)throw error;
        passwordMatches(String(password ?? ''), '00000000000000000000000000000000:' + '0'.repeat(64));
        throw new ServiceError(401, 'Credenciales inválidas.');
    }
    const rateKey = 'rate_' + hash(eventId + ':' + clientKey);
    const rate = await readStore<{
        start: number;
        attempts: number;
    }>(rateKey);
    const windowMs = 15 * 60 * 1000;
    const current = rate && rate.value.start > Date.now() - windowMs ? rate.value : { start: Date.now(), attempts: 0 };
    if (current.attempts >= 5)
        throw new ServiceError(429, 'Demasiados intentos. Esperá 15 minutos.');
    current.attempts++;
    await writeStore(rateKey, current, rate?.etag ?? null);
    const { value: e, etag } = loaded;
    if (!passwordMatches(password, e.passwordHash))
        throw new ServiceError(401, 'Credenciales inválidas.');
    // A proven credential clears this event's consecutive failures. Keep the IP-wide attempt budget intact.
    const latestRate = await readStore<{start: number; attempts: number}>(rateKey);
    await writeStore(rateKey, { start: Date.now(), attempts: 0 }, latestRate?.etag ?? null);
    const token = randomBytes(32).toString('base64url');
    e.sessions = e.sessions.filter(s => s.expiresAt > Date.now()).slice(-19);
    e.sessions.push({ hash: hash(token), expiresAt: Date.now() + SESSION_MS });
    await writeEvent(e,etag);
    return { event: view(e), token };
}
export async function logout(eventId: string, token: string | undefined) { const { value: e, etag } = await loadEvent(eventId); if (!token || !e.sessions.some(s => s.hash === hash(token)))
    return; e.sessions = e.sessions.filter(s => s.hash !== hash(token ?? '')); await writeEvent(e,etag); }
const allowed: Record<string, string[]> = { recovery_rotate: [], content: ['workspace'], photos: ['photos'], rsvp_close: ['closed'], group_add: ['label', 'people'], group_import: ['groups'], person_update: ['personId', 'name', 'kind', 'seatRequired', 'attendance', 'menu', 'note', 'dietaryRestriction', 'shareDietaryRestriction', 'accessibilityNeeds'], invitation_rotate: ['groupId'], room_update:['width','height'],floor_feature_add:['kind'],floor_feature_update:['featureId','label','x','y','width','height','rotation'],floor_feature_delete:['featureId'],table_add: ['name', 'capacity','shape','x','y','width','height','rotation'], table_update: ['tableId', 'name', 'capacity','shape','x','y','width','height','rotation'], table_delete: ['tableId'], assign: ['personIds', 'tableId'], review: ['ready'], publish: [], unpublish: [], rollback: ['snapshotId'], ledger_add: ['kind', 'amount', 'currency', 'minutes', 'reference'], sessions_revoke: [], password_reset: ['password'] };
export async function mutate(eventId: string, input: unknown, token: string | undefined, operator = false) {
    const body = v.object(input);
    const action = v.text(body.action, 50);
    if (!allowed[action])
        v.fail('Acción desconocida.');
    v.keys(body, ['action', 'revision', ...allowed[action]]);
    const { value: e, etag } = await loadEvent(eventId);
    authenticate(e, token, operator);
    if (v.integer(body.revision) !== e.revision)
        throw new ServiceError(409, 'La versión cambió. Recargá antes de guardar.');
    await throttle('event-write',eventId,300,10*60*1000);
    snapshot(e, action);
    let invitationToken: string | undefined;
    let recoveryKey: string | undefined;
    if (!['ledger_add', 'sessions_revoke', 'password_reset', 'recovery_rotate'].includes(action))
        e.review = e.review === 'draft' ? 'draft' : 'needs_review';
    if (action === 'content') {
        const draft = v.workspace(body.workspace);
        draft.event.id = e.id;
        draft.event.accountId = e.id;
        draft.account.id = e.id;
        draft.content.eventId = e.id;
        draft.publication.eventId = e.id;
        e.draft = draft;
    }
    if (action === 'photos') {
        e.photos = v.photos(body.photos);
        if (e.photos.reduce((sum, p) => sum + p.length, 0) > 2500000)
            v.fail('Las fotos superan el límite total de 2,5 MB.');
    }
    if (action === 'rsvp_close')
        e.rsvpClosed = v.boolean(body.closed);
    if (action === 'group_add')
        addGroup(e, body.label, body.people);
    if (action === 'group_import') {
        for (const item of v.array(body.groups, 100)) {
            const g = v.object(item);
            v.keys(g, ['label', 'people']);
            addGroup(e, g.label, g.people);
        }
    }
    if (action === 'person_update') {
        const p = e.people.find(p => p.id === body.personId);
        if (!p)
            v.fail('Persona no encontrada.');
        if (body.name !== undefined) {
            p.name = v.text(body.name, 150, true);
            p.namePending = !p.name;
        }
        if (body.kind !== undefined)
            p.kind = v.choice(body.kind, ['adult', 'child', 'baby', 'unknown'] as const);
        if (body.attendance !== undefined)
            p.attendance = v.choice(body.attendance, ['pending', 'confirmed', 'declined'] as const);
        if (body.seatRequired !== undefined)
            p.seatRequired = v.boolean(body.seatRequired);
        if (body.menu !== undefined)
            p.menu = v.text(body.menu, 120, true);
        Object.assign(p,v.personSupport({...p,...Object.fromEntries(['dietaryRestriction','shareDietaryRestriction','accessibilityNeeds'].filter(key=>body[key]!==undefined).map(key=>[key,body[key]]))}));
        if (body.note !== undefined)
            p.note = v.text(body.note, 300, true);
        if (p.attendance !== 'confirmed')
            e.assignments = e.assignments.filter(a => a.personId !== p.id);
    }
    if (action === 'invitation_rotate') {
        const group = e.groups.find(g => g.id === body.groupId);
        if (!group)
            v.fail('Grupo no encontrado.');
        invitationToken = randomBytes(32).toString('base64url');
        e.invitations[group.id] = hash(invitationToken);
        group.invitationVersion++;
    }
    if(action==='room_update'){e.floorPlan.width=v.decimal(body.width,4,80);e.floorPlan.height=v.decimal(body.height,4,80);}
    if(action==='floor_feature_add'){
        if(e.floorPlan.features.length>=12)v.fail('El esquema admite hasta doce referencias.');
        const kind=v.choice(body.kind,['entrance','dancefloor'] as const);
        e.floorPlan.features.push({id:id('feature'),...defaultFeature(kind,e.floorPlan)});
    }
    if(action==='floor_feature_update'){
        const feature=e.floorPlan.features.find(f=>f.id===body.featureId);if(!feature)v.fail('Referencia del plano no encontrada.');
        const data={...feature};for(const key of ['label','x','y','width','height','rotation'] as const)if(body[key]!==undefined)Object.assign(data,{[key]:body[key]});Object.assign(feature,v.floorFeature(data));
    }
    if(action==='floor_feature_delete'){
        if(!e.floorPlan.features.some(f=>f.id===body.featureId))v.fail('Referencia del plano no encontrada.');
        e.floorPlan.features=e.floorPlan.features.filter(f=>f.id!==body.featureId);
    }
    if (action === 'table_add')
        e.tables.push({ id: id('tbl'), name: v.text(body.name, 80), capacity: v.integer(body.capacity, 1, 100), ...v.tableGeometry({...defaultTableGeometry(e.tables.length,e.floorPlan),...body}) });
    if (action === 'table_update') {
        const t = e.tables.find(t => t.id === body.tableId);
        if (!t)
            v.fail('Mesa no encontrada.');
        if (body.name !== undefined)
            t.name = v.text(body.name, 80);
        if (body.capacity !== undefined)
            t.capacity = v.integer(body.capacity, 1, 100);
        Object.assign(t,v.tableGeometry({...t,...body}));
    }
    if (action === 'table_delete') {
        if (!e.tables.some(t => t.id === body.tableId))
            v.fail('Mesa no encontrada.');
        if (e.assignments.some(a => a.tableId === body.tableId))
            v.fail('Quitá o mové las personas antes de eliminar esta mesa.');
        e.tables = e.tables.filter(t => t.id !== body.tableId);
    }
    if (action === 'assign') {
        const people = v.array(body.personIds, 200).map(v.identifier);
        if (!people.length || new Set(people).size !== people.length || people.some(pid => !e.people.some(p => p.id === pid)))
            v.fail('Selección inválida.');
        const tableId = body.tableId === null ? null : v.identifier(body.tableId);
        e.assignments = e.assignments.filter(a => !people.includes(a.personId));
        if (tableId)
            for (const personId of people)
                e.assignments.push({ personId, tableId });
    }
    if (action === 'review')
        e.review = v.boolean(body.ready) ? 'ready' : 'draft';
    if (action === 'publish') {
        if (!e.photos.length)
            v.fail('Agregá al menos una foto propia antes de publicar.');
        if (!e.draft.content.date || !e.draft.content.celebrationLocation || !e.draft.content.celebrationTime)
            v.fail('Completá fecha, lugar y hora de celebración.');
        if (Boolean(e.draft.content.ceremonyLocation) !== Boolean(e.draft.content.ceremonyTime))
            v.fail('La ceremonia necesita lugar y hora, o ambos vacíos.');
        e.published = { revision: e.revision + 1, at: now(), workspace: structuredClone(e.draft), photos: [...e.photos] };
        e.activation={...e.activation,firstPublishedAt:e.activation?.firstPublishedAt??now()};
    }
    if (action === 'unpublish')
        e.published = null;
    if (action === 'rollback') {
        const previous = e.snapshots.find(s => s.id === body.snapshotId);
        if (!previous)
            v.fail('Revisión no encontrada.');
        Object.assign(e, unpack(e, previous.state));
        e.review = 'needs_review';
        e.invitations = {};
        e.groups.forEach(g => g.invitationVersion++);
    }
    if (action === 'ledger_add') {
        if (!operator)
            throw new ServiceError(403, 'El registro operativo es privado de la organización.');
        const kind = v.choice(body.kind, ['payment_verified', 'time'] as const);
        const item = { id: id('log'), kind, reference: v.text(body.reference, 300), at: now() };
        if (kind === 'payment_verified') {
            if (!operator)
                throw new ServiceError(403, 'Sólo la operación puede verificar un pago.');
            if (body.minutes !== undefined)
                v.fail('Minutos no aplica a pagos.');
            const raw = body.amount;
            if (typeof raw !== 'number' || !Number.isFinite(raw) || raw <= 0 || raw > 1000000000 || Math.abs(raw * 100 - Math.round(raw * 100)) > 0.00001)
                v.fail('Importe inválido: hasta dos decimales.');
            const amount = Math.round(raw * 100) / 100;
            const currency = v.choice(body.currency, ['ARS', 'USD'] as const);
            const referenceKey = (value: string) => value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
            if (e.ledger.some(entry => entry.kind === 'payment_verified' && entry.amount === amount && entry.currency === currency && referenceKey(entry.reference) === referenceKey(item.reference))) throw new ServiceError(409, 'Ese pago ya está registrado con el mismo importe, moneda y referencia.');
            e.ledger.push({ ...item, amount, currency });
        }
        else {
            if (body.amount !== undefined || body.currency !== undefined)
                v.fail('Importe no aplica a tiempo.');
            e.ledger.push({ ...item, minutes: v.integer(body.minutes, 1, 1440) });
        }
    }
    if (action === 'sessions_revoke')
        e.sessions = [];
    if (action === 'recovery_rotate') recoveryKey=rotateRecovery(e);
    if (action === 'password_reset') {
        if (!operator)
            throw new ServiceError(403, 'Sólo la operación puede restablecer la contraseña.');
        e.passwordHash = passwordHash(body.password);
        e.sessions = [];
        delete e.recoveryKeyHash;
    }
    v.validateBusiness(e);
    assertBackupSize(e);
    audit(e, action, operator ? 'operator' : 'couple');
    await writeEvent(e,etag);
    return { event: view(e), ...(invitationToken ? { invitationToken } : {}), ...(recoveryKey ? { recoveryKey } : {}) };
}
export async function publicEvent(eventId: string) { const { value: e } = await loadEvent(eventId); if (!e.published)
    throw new ServiceError(404, 'Invitación no publicada.'); return { id: e.id, revision: e.published.revision, workspace: e.published.workspace, photos: e.published.photos, rsvpClosed: e.rsvpClosed }; }
function invitationGroup(e: StoredEvent, token: unknown) { if (typeof token !== 'string' || token.length > 100)
    throw new ServiceError(404, 'Invitación no disponible.'); const h = hash(token); const group = e.groups.find(g => e.invitations[g.id] === h); if (!group || !e.published)
    throw new ServiceError(404, 'Invitación no disponible.'); return group; }
export async function rsvp(eventId: string, input: unknown, clientKey = 'shared') {
    await throttle('rsvp-client', clientKey, 180, 5 * 60 * 1000);
    const b = v.object(input);
    const action = v.choice(b.action, ['get', 'submit'] as const);
    v.keys(b, action === 'get' ? ['token', 'action'] : ['token', 'action', 'revision', 'people']);
    const { value: e, etag } = await loadEvent(eventId);
    await throttle('rsvp', eventId + ':' + clientKey, 60, 5 * 60 * 1000);
    const group = invitationGroup(e, b.token);
    if (action === 'submit') {
        if (e.rsvpClosed)
            throw new ServiceError(409, 'Las confirmaciones están cerradas. Contactá a la pareja.');
        if (v.integer(b.revision) !== e.revision)
            throw new ServiceError(409, 'La respuesta cambió. Recargá para revisarla.');
        const rows = v.array(b.people, 30);
        if (rows.length !== group.personIds.length)
            v.fail('Respondé por todas las personas de esta invitación.');
        const seen = new Set<string>();
        snapshot(e, 'rsvp');
        for (const row of rows) {
            const value = v.object(row);
            v.keys(value, ['id', 'name', 'kind', 'attendance', 'seatRequired', 'menu', 'note', 'dietaryRestriction', 'shareDietaryRestriction', 'accessibilityNeeds']);
            const pid = v.identifier(value.id);
            if (seen.has(pid) || !group.personIds.includes(pid))
                v.fail('Persona fuera de esta invitación.');
            seen.add(pid);
            const p = e.people.find(p => p.id === pid)!;
            p.name = v.text(value.name, 150, true);
            p.namePending = !p.name;
            p.kind = v.choice(value.kind, ['adult', 'child', 'baby', 'unknown'] as const);
            p.attendance = v.choice(value.attendance, ['pending', 'confirmed', 'declined'] as const);
            p.seatRequired = v.boolean(value.seatRequired);
            p.menu = v.text(value.menu, 120, true);
            if(value.note!==undefined)v.text(value.note,300,true); // Legacy payload accepted; private couple notes stay private.
            Object.assign(p,v.personSupport({...p,...Object.fromEntries(['dietaryRestriction','shareDietaryRestriction','accessibilityNeeds'].filter(key=>value[key]!==undefined).map(key=>[key,value[key]]))}));
            if (p.attendance !== 'confirmed')
                e.assignments = e.assignments.filter(a => a.personId !== pid);
        }
        e.review = e.review === 'draft' ? 'draft' : 'needs_review';
        v.validateBusiness(e);
        assertBackupSize(e);
        e.activation={...e.activation,firstRsvpAt:e.activation?.firstRsvpAt??now()};
        audit(e, 'rsvp', 'invitation:' + group.id);
        await writeEvent(e,etag);
    }
    return { group, people: e.people.filter(p => p.groupId === group.id).map(p=>({...p,note:''})), revision: e.revision, rsvpClosed: e.rsvpClosed };
}
export function csv(e: StoredEvent, target: 'venue' | 'catering' | 'guests') {
    const escape = safeCsvCell;
    if (target === 'guests') {
        const rows: unknown[][] = [['SODI Bodas', e.draft.content.partnerOne + ' y ' + e.draft.content.partnerTwo], ['Revisión', e.revision], ['Generado', now()], ['Grupo', 'Persona', 'Estado', 'Requiere lugar']];
        for (const p of e.people) {
            const group = e.groups.find(g => g.id === p.groupId)!;
            rows.push([group.label, p.name || `Acompañante (${group.personIds.indexOf(p.id) + 1})`, ({ pending: 'Pendiente', confirmed: 'Confirma', declined: 'No asiste' })[p.attendance], p.seatRequired ? 'Sí' : 'No']);
        }
        return '\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n');
    }
    const rows: unknown[][] = [['SODI Bodas', e.draft.content.partnerOne + ' y ' + e.draft.content.partnerTwo], ['Sesión', 'Celebración'], ['Revisión', e.revision], ['Generado', now()], ['Revisión de mesas', e.review], ['Personas confirmadas', e.people.filter(p => p.attendance === 'confirmed').length], ['Lugares requeridos', e.people.filter(p => p.attendance === 'confirmed' && p.seatRequired).length], ['Lugares asignados', e.assignments.filter(a => e.people.some(p => p.id === a.personId && p.seatRequired)).length], [], target === 'venue' ? ['Mesa', 'Persona', 'Tipo', 'Requiere lugar', 'Necesidades declaradas'] : ['Mesa', 'Persona', 'Menú', 'Restricción compartida']];
    const collator = new Intl.Collator('es-AR', { numeric: true, sensitivity: 'base' });
    const ordered = e.people.filter(p => p.attendance === 'confirmed').map(p => {
        const group = e.groups.find(g => g.id === p.groupId)!;
        const assignment = e.assignments.find(a => a.personId === p.id);
        const table = e.tables.find(t => t.id === assignment?.tableId);
        const name = p.name || `Acompañante de ${group.label} (${group.personIds.indexOf(p.id) + 1})`;
        return { p, table, name };
    }).sort((a, b) => {
        if (!a.table && b.table) return 1;
        if (a.table && !b.table) return -1;
        return collator.compare(a.table?.name ?? '', b.table?.name ?? '') || collator.compare(a.name, b.name);
    });
    for (const { p, table, name } of ordered) {
        rows.push(target === 'venue' ? [table?.name ?? 'Sin mesa', name, ({ adult: 'Adulto', child: 'Niño', baby: 'Bebé', unknown: 'Sin indicar' })[p.kind], p.seatRequired ? 'Sí' : 'No',p.accessibilityNeeds.map(n=>({wheelchair_space:'Espacio para silla de ruedas',step_free_access:'Acceso sin escalones',highchair:'Silla alta'})[n]).join('; ')] : [table?.name ?? 'Sin mesa', name, p.menu || 'Pendiente',p.shareDietaryRestriction?p.dietaryRestriction:'']);
    }
    return '\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n');
}
export function backup(e: StoredEvent) { const state = businessState(e); const assets: Record<string, string> = {}; const pack = (photos: string[]) => photos.map(p => { const h = hash(p); assets[h] = p; return '@photo:' + h; }); state.photos = pack(state.photos); if (state.published)
    state.published.photos = pack(state.published.photos); return { format: 'sodi-boda-studio-backup-v1', eventId: e.id, at: now(), state, assets, ledger: e.ledger }; }
export async function restore(eventId: string, input: unknown, token: string | undefined, operator = false) { const b = v.object(input); v.keys(b, ['revision', 'backup']); const { value: e, etag } = await loadEvent(eventId); authenticate(e, token, operator); if (v.integer(b.revision) !== e.revision)
    throw new ServiceError(409, 'La versión cambió.'); const supplied = v.object(b.backup); v.keys(supplied, ['format', 'eventId', 'at', 'state', 'assets', 'ledger']); if (supplied.format !== 'sodi-boda-studio-backup-v1' || supplied.eventId !== e.id)
    v.fail('La copia no pertenece a este evento.'); const assetValues = v.object(supplied.assets); if (Object.keys(assetValues).length > 12)
    v.fail('Demasiadas fotos en la copia.'); const assets: Record<string, string> = {}; for (const [h, p] of Object.entries(assetValues)) {
    if (!/^[a-f0-9]{64}$/.test(h))
        v.fail('Referencia de foto inválida.');
    const photo = v.photos([p])[0];
    if (hash(photo) !== h)
        v.fail('La foto de la copia no coincide.');
    assets[h] = photo;
} const raw = v.object(supplied.state); const resolvePhotos = (input: unknown) => v.array(input, 6).map(p => { const key = v.text(p, 100); if (!key.startsWith('@photo:') || !assets[key.slice(7)])
    v.fail('Falta una foto de la copia.'); return assets[key.slice(7)]; }); raw.photos = resolvePhotos(raw.photos); if (raw.published) {
    const published = v.object(raw.published);
    published.photos = resolvePhotos(published.photos);
} const state = v.business(raw); if (state.draft.event.id !== e.id || state.published && state.published.workspace.event.id !== e.id)
    v.fail('La copia pertenece a otro evento.'); snapshot(e, 'restore'); Object.assign(e, state); e.review = 'needs_review'; e.invitations = {}; e.groups.forEach(g => g.invitationVersion++); e.sessions = []; assertBackupSize(e);
    audit(e, 'restore', operator ? 'operator' : 'couple'); await writeEvent(e,etag); return view(e); }
