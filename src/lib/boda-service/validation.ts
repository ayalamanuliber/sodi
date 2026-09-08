import type { WeddingTrialWorkspace } from '../boda-trial/schema.ts';
import { CHAIR_MARGIN, DEFAULT_FLOOR_PLAN, defaultTableGeometry, withinRoom } from './layout.ts';
import type { FloorPlan, FloorFeature, TableGeometry, Business, Person } from './types.ts';
import { ServiceError } from './types.ts';
export function fail(message: string): never { throw new ServiceError(400, message); }
export function object(v: unknown): Record<string, unknown> { if (!v || typeof v !== 'object' || Array.isArray(v))
    fail('Objeto inválido.'); return v as Record<string, unknown>; }
export function text(v: unknown, max = 200, empty = false): string { if (typeof v !== 'string' || v.length > max || (!empty && !v.trim()) || v.includes('\0'))
    fail('Texto inválido.'); return v.trim(); }
export function integer(v: unknown, min = 0, max = 10000): number { if (!Number.isSafeInteger(v) || Number(v) < min || Number(v) > max)
    fail('Número inválido.'); return Number(v); }
export function boolean(v: unknown): boolean { if (typeof v !== 'boolean')
    fail('Valor booleano inválido.'); return v; }
export function choice<T extends string>(v: unknown, options: readonly T[]): T { if (!options.includes(v as T))
    fail('Opción inválida.'); return v as T; }
export function array(v: unknown, max = 600): unknown[] { if (!Array.isArray(v) || v.length > max)
    fail('Lista inválida.'); return v; }
export function keys(o: Record<string, unknown>, allowed: string[]) { if (Object.keys(o).some(k => !allowed.includes(k)))
    fail('Campo desconocido.'); }
export function identifier(v: unknown): string { const s = text(v, 100); if (!/^[a-zA-Z0-9_-]+$/.test(s))
    fail('Identificador inválido.'); return s; }
export function photos(v: unknown): string[] { return array(v, 6).map(item => { const s = text(item, 480000); const match = s.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/); if (!match)
    fail('Sólo fotos JPEG, PNG o WebP.'); const b = Buffer.from(match[2], 'base64'); if (b.length > 350 * 1024 || b.length < 12)
    fail('Foto demasiado grande o inválida.'); const valid = match[1] === 'jpeg' ? b[0] === 255 && b[1] === 216 && b[2] === 255 : match[1] === 'png' ? b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP'; if (!valid)
    fail('La firma de la foto no coincide.'); return s; }); }
export function workspace(v: unknown): WeddingTrialWorkspace {
    const w = object(v), c = object(w.content), d = object(w.design), e = object(w.event), a = object(w.account);
    const contentKeys = ['partnerOne', 'partnerTwo', 'date', 'ceremonyLocation', 'celebrationLocation', 'ceremonyAddress', 'celebrationAddress', 'message', 'story', 'ceremonyTime', 'celebrationTime', 'dressCode'];
    const content: Record<string, string> = { eventId: identifier(e.id) };
    for (const k of contentKeys)
        content[k] = text(c[k] ?? '', k === 'story' || k === 'message' ? 4000 : 250, true);
    if (!content.partnerOne || !content.partnerTwo)
        fail('Completá los nombres de la pareja.');
    if (content.date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(content.date))
            fail('Fecha inválida.');
        const date = new Date(content.date + 'T12:00:00.000Z');
        if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== content.date)
            fail('Fecha de calendario inválida.');
    }
    for (const key of ['ceremonyTime', 'celebrationTime'])
        if (content[key] && !/^([01]\d|2[0-3]):[0-5]\d$/.test(content[key]))
            fail('Horario inválido. Usá HH:mm.');
    const design = { paletteId: choice(d.paletteId, ['forest-gold', 'olive-clay', 'cobalt-ivory', 'ink-silver'] as const), typographyId: choice(d.typographyId, ['editorial', 'contemporary', 'romantic'] as const), coverId: choice(d.coverId, ['cinematic', 'split'] as const), monogramId: choice(d.monogramId, ['seal', 'initials', 'wordmark'] as const), galleryId: choice(d.galleryId, ['mosaic', 'film'] as const), ornamentId: choice(d.ornamentId, ['quiet', 'balanced', 'ceremonial'] as const), textPlacementId: choice(d.textPlacementId ?? 'left', ['left', 'center', 'right'] as const), photoFocusId: choice(d.photoFocusId ?? 'right', ['left', 'center', 'right'] as const), contrastId: choice(d.contrastId ?? 'balanced', ['soft', 'balanced', 'strong'] as const), samplePhotosEnabled: false };
    return { version: 3, account: { id: identifier(a.id), kind: 'anonymous_trial' }, event: { id: identifier(e.id), accountId: identifier(a.id), slug: text(e.slug, 100), themeId: choice(e.themeId, ['cobalto', 'bosque', 'nocturno', 'clasico', 'romantico', 'campestre'] as const), status: 'active', publicationStatus: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), expiresAt: '2099-01-01T00:00:00.000Z' }, content: content as unknown as WeddingTrialWorkspace['content'], design, guests: [], rsvps: [], publication: { eventId: identifier(e.id), status: 'locked', publicUrl: null, exportStatus: 'locked' } };
}

export function decimal(value: unknown, min: number, max: number): number {
    if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||Math.abs(value*100-Math.round(value*100))>0.00001)fail(`Medida inválida. Usá entre ${min} y ${max}, con hasta dos decimales.`);
    return Math.round(value*100)/100;
}
export function tableGeometry(input: Record<string,unknown>): TableGeometry {
    const shape=choice(input.shape,['round','rectangular'] as const);
    const geometry={shape,x:decimal(input.x,0,80),y:decimal(input.y,0,80),width:decimal(input.width,0.8,6),height:decimal(input.height,0.8,6),rotation:integer(input.rotation,0,359)};
    if(shape==='round'&&geometry.width!==geometry.height)fail('Una mesa redonda debe tener el mismo diámetro en ambos ejes.');
    return geometry;
}
export function floorFeature(input:unknown):FloorFeature {
    const f=object(input);keys(f,['id','kind','label','x','y','width','height','rotation']);
    return {id:identifier(f.id),kind:choice(f.kind,['entrance','dancefloor'] as const),label:text(f.label,60),x:decimal(f.x,0,80),y:decimal(f.y,0,80),width:decimal(f.width,0.3,12),height:decimal(f.height,0.3,12),rotation:integer(f.rotation,0,359)};
}
export function floorPlan(input:unknown):FloorPlan {
    if(input===undefined)return structuredClone(DEFAULT_FLOOR_PLAN);
    const f=object(input);keys(f,['width','height','features']);
    return {width:decimal(f.width,4,80),height:decimal(f.height,4,80),features:array(f.features,12).map(floorFeature)};
}

export function personSupport(p: Record<string,unknown>) {
    const needs=array(p.accessibilityNeeds===undefined?[]:p.accessibilityNeeds,3).map(n=>choice(n,['wheelchair_space','step_free_access','highchair'] as const));
    if(new Set(needs).size!==needs.length)fail('Necesidades duplicadas.');
    if(needs.includes('wheelchair_space')&&needs.includes('highchair'))fail('Elegí silla alta o espacio para silla de ruedas para esta persona; el acceso sin escalones es independiente.');
    return {dietaryRestriction:text(p.dietaryRestriction===undefined?'':p.dietaryRestriction,240,true),shareDietaryRestriction:p.shareDietaryRestriction===undefined?false:boolean(p.shareDietaryRestriction),accessibilityNeeds:needs};
}
export function person(v: unknown): Person { const p = object(v); keys(p, ['id', 'groupId', 'name', 'namePending', 'kind', 'attendance', 'seatRequired', 'menu', 'note', 'dietaryRestriction', 'shareDietaryRestriction', 'accessibilityNeeds']); const name = text(p.name, 150, true); return { id: identifier(p.id), groupId: identifier(p.groupId), name, namePending: !name, kind: choice(p.kind, ['adult', 'child', 'baby', 'unknown'] as const), attendance: choice(p.attendance, ['pending', 'confirmed', 'declined'] as const), seatRequired: boolean(p.seatRequired), menu: text(p.menu, 120, true), ...personSupport(p), note: text(p.note, 300, true) }; }
export function business(v: unknown): Business {
    const b = object(v);
    keys(b, ['floorPlan', 'draft', 'photos', 'rsvpClosed', 'published', 'groups', 'people', 'tables', 'assignments', 'review']);
    const room=floorPlan(b.floorPlan);
    const result: Business = { floorPlan:room, draft: workspace(b.draft), photos: photos(b.photos), rsvpClosed: boolean(b.rsvpClosed), published: null, groups: array(b.groups, 100).map(g => { const o = object(g); keys(o, ['id', 'label', 'personIds', 'invitationVersion']); return { id: identifier(o.id), label: text(o.label, 150), personIds: array(o.personIds, 30).map(identifier), invitationVersion: integer(o.invitationVersion) }; }), people: array(b.people, 200).map(person), tables: array(b.tables, 100).map((t,index) => { const o = object(t); keys(o, ['id', 'name', 'capacity','shape','x','y','width','height','rotation']); return { id: identifier(o.id), name: text(o.name, 80), capacity: integer(o.capacity, 1, 100), ...tableGeometry({...defaultTableGeometry(index,room),...o}) }; }), assignments: array(b.assignments).map(x => { const o = object(x); keys(o, ['personId', 'tableId']); return { personId: identifier(o.personId), tableId: identifier(o.tableId) }; }), review: choice(b.review, ['draft', 'needs_review', 'ready'] as const) };
    if (b.published !== null) {
        const p = object(b.published);
        keys(p, ['revision', 'at', 'workspace', 'photos']);
        result.published = { revision: integer(p.revision), at: text(p.at, 50), workspace: workspace(p.workspace), photos: photos(p.photos) };
    }
    if(result.review==='ready'&&(b.floorPlan===undefined||array(b.tables,100).some(t=>object(t).shape===undefined)))result.review='needs_review';
    validateBusiness(result);
    return result;
}
export function validateBusiness(b: Business) {
    floorPlan(b.floorPlan);
    if(b.tables.length>100)fail('El plano admite hasta cien mesas.');
    if(new Set(b.floorPlan.features.map(f=>f.id)).size!==b.floorPlan.features.length)fail('Referencias del plano duplicadas.');
    for(const table of b.tables){tableGeometry({...table});if(!withinRoom(table,b.floorPlan,CHAIR_MARGIN))fail(`${table.name} y sus sillas quedan fuera del salón. Ajustá posición, tamaño o medidas del salón.`);}
    for(const feature of b.floorPlan.features)if(!withinRoom(feature,b.floorPlan))fail(`${feature.label} queda fuera del salón.`);
    if (b.published) {
        const c = b.published.workspace.content;
        if (!b.published.photos.length || !c.date || !c.celebrationLocation || !c.celebrationTime || Boolean(c.ceremonyLocation) !== Boolean(c.ceremonyTime)) fail('La versión publicada necesita foto, fecha y lugares/horarios completos.');
    }
    if ([...new Set([...b.photos, ...(b.published?.photos ?? [])])].reduce((n, p) => n + p.length, 0) > 2500000)
        fail('Las fotos únicas del borrador y la versión publicada superan 2,5 MB. Usá fotos más livianas.');
    for (const list of [b.groups, b.people, b.tables])
        if (new Set(list.map(x => x.id)).size !== list.length)
            fail('Identificadores duplicados.');
    if (new Set(b.tables.map(t => t.name.toLocaleLowerCase())).size !== b.tables.length)
        fail('Los nombres de mesa deben ser únicos.');
    for (const g of b.groups) {
        if (new Set(g.personIds).size !== g.personIds.length || g.personIds.some(id => !b.people.some(p => p.id === id && p.groupId === g.id)))
            fail('Grupo inconsistente.');
    }
    for(const p of b.people){const support=personSupport({...p});if(!p.seatRequired&&support.accessibilityNeeds.some(n=>n==='wheelchair_space'||n==='highchair'))fail('El espacio para silla de ruedas o silla alta requiere una plaza en la mesa. No se aumenta la capacidad automáticamente.');}
    for (const p of b.people)
        if (!b.groups.some(g => g.id === p.groupId && g.personIds.includes(p.id)))
            fail('Persona sin grupo.');
    if (new Set(b.assignments.map(a => a.personId)).size !== b.assignments.length)
        fail('Una persona no puede tener dos mesas.');
    for (const a of b.assignments) {
        const p = b.people.find(p => p.id === a.personId);
        if (!p || p.attendance !== 'confirmed' || !b.tables.some(t => t.id === a.tableId))
            fail('Asignación incompatible.');
    }
    for (const t of b.tables)
        if (b.assignments.filter(a => a.tableId === t.id && b.people.some(p => p.id === a.personId && p.seatRequired)).length > t.capacity)
            fail('La mesa no tiene suficientes lugares.');
    if (b.review === 'ready' && b.people.some(p => p.attendance === 'confirmed' && p.seatRequired && !b.assignments.some(a => a.personId === p.id)))
        fail('Todavía hay personas sin mesa.');
}
