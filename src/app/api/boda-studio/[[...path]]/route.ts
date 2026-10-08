import { assertMutationOrigin } from '@/lib/boda-service/http';
import { isIP } from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
import { isWeddingAdminAuthenticated, secureCompare } from '@/lib/boda-auth';
import * as service from '@/lib/boda-service/service';
import * as v from '@/lib/boda-service/validation';
import type { EventView } from '@/lib/boda-service/types';
import { ServiceError } from '@/lib/boda-service/types';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const cookieName = (id: string) => 'boda_studio_' + id;
function clientIdentity(req: NextRequest) { const ip = process.env.VERCEL === '1' ? req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() : req.headers.get('cf-connecting-ip')?.trim(); return ip && isIP(ip) ? ip : 'shared'; }
async function body(req: NextRequest, max = 3 * 1024 * 1024) { if (Number(req.headers.get('content-length') || 0) > max)
    throw new ServiceError(413, 'El contenido supera el límite de esta solicitud.'); if (!req.headers.get('content-type')?.includes('application/json'))
    throw new ServiceError(415, 'Se requiere JSON.'); const reader = req.body?.getReader(); if (!reader)
    throw new ServiceError(400, 'Falta el contenido.'); const chunks: Uint8Array[] = []; let size = 0; while (true) {
    const { done, value } = await reader.read();
    if (done)
        break;
    size += value.length;
    if (size > max) {
        await reader.cancel();
        throw new ServiceError(413, 'El contenido supera el límite de esta solicitud.');
    }
    chunks.push(value);
} try {
    return v.object(JSON.parse(Buffer.concat(chunks).toString('utf8')));
}
catch (e) {
    if (e instanceof ServiceError)
        throw e;
    throw new ServiceError(400, 'JSON inválido.');
} }
async function operator(req: NextRequest) { const configured = process.env.BODA_STUDIO_OPERATOR_TOKEN; const received = req.headers.get('authorization')?.replace(/^Bearer /, '') || ''; return Boolean(configured && received && secureCompare(received, configured)) || await isWeddingAdminAuthenticated(); }
function forViewer(event: EventView, isOperator: boolean): EventView { return { ...event, viewerRole: isOperator ? 'operator' : 'couple', ledger: isOperator ? event.ledger : [], audit: isOperator ? event.audit : event.audit.filter(item => !['ledger_add', 'password_reset', 'sessions_revoke'].includes(item.action)).map(({ at, action }) => ({ at, action, actor: 'organización' })), revisions: isOperator ? event.revisions : event.revisions.filter(item => !['ledger_add', 'password_reset', 'sessions_revoke'].includes(item.action)) }; }
function response(data: unknown, status = 200) { return NextResponse.json(data, { status, headers }); }
function sessionCookie(res: NextResponse, eventId: string, token: string, expires = service.SESSION_MS) { res.cookies.set(cookieName(eventId), token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: `/api/boda-studio/events/${eventId}`, maxAge: Math.floor(expires / 1000) }); return res; }
async function handle(req: NextRequest, context: {
    params: Promise<{
        path?: string[];
    }>;
}) {
    try {
        const path = (await context.params).path ?? [];
        const [area, eventId, operation] = path;
        if (req.method !== 'GET') assertMutationOrigin(req.headers);
        if(area==='capabilities'&&path.length===1&&req.method==='GET')return response(await service.capabilities());
        if(area==='start'&&path.length===1&&req.method==='POST'){
            if(!req.headers.get('origin'))throw new ServiceError(403,'Abrí el formulario desde este sitio para crear la boda.');
            const b=await body(req,64*1024);v.keys(b,['workspace','password','acquisitionSource','requestId']);
            const session=await service.startEvent(b.workspace,b.password,clientIdentity(req),b.acquisitionSource,b.requestId);
            return sessionCookie(response({event:forViewer(session.event,false),recoveryKey:session.recoveryKey},201),session.event.id,session.token);
        }
        if (area === 'public' && eventId && path.length === 2 && req.method === 'GET')
            return response(await service.publicEvent(eventId));
        if (area === 'rsvp' && eventId && path.length === 2 && req.method === 'POST')
            return response(await service.rsvp(eventId, await body(req, 128 * 1024), clientIdentity(req)));
        if (area !== 'events')
            throw new ServiceError(404, 'Ruta no encontrada.');
        const isOperator = await operator(req);
        if (path.length === 1) {
            if (!isOperator)
                throw new ServiceError(401, 'Se requiere acceso de operación.');
            if (req.method === 'GET')
                return response({ events: await service.listEvents() });
            if (req.method === 'POST') {
                const b = await body(req);
                v.keys(b, ['workspace', 'password']);
                const event = await service.createEvent(b.workspace, b.password);
                const session = await service.login(event.id, b.password, 'creation');
                return sessionCookie(response({ event: forViewer(session.event, isOperator) }, 201), event.id, session.token);
            }
        }
        if (!eventId || path.length > 3)
            throw new ServiceError(404, 'Ruta no encontrada.');
        const token = req.cookies.get(cookieName(eventId))?.value;
        if(operation==='recover'&&req.method==='POST') {
            const b=await body(req,2048);v.keys(b,['recoveryKey','password']);
            const session=await service.recover(eventId,b.recoveryKey,b.password,clientIdentity(req));
            return sessionCookie(response({event:forViewer(session.event,false),recoveryKey:session.recoveryKey}),eventId,session.token);
        }
        if (operation === 'login' && req.method === 'POST') {
            const b = await body(req, 1024);
            v.keys(b, ['password']);
            const client = clientIdentity(req);
            const session = await service.login(eventId, b.password, client);
            return sessionCookie(response({ event: forViewer(session.event, isOperator) }), eventId, session.token);
        }
        if (operation === 'logout' && req.method === 'POST') {
            await service.logout(eventId, token);
            return sessionCookie(response({ ok: true }), eventId, '', 0);
        }
        if (!operation && req.method === 'PATCH') {
            const result = await service.mutate(eventId, await body(req), token, isOperator);
            return response({ ...result, event: forViewer(result.event, isOperator) });
        }
        if (operation === 'restore' && req.method === 'POST')
            return sessionCookie(response({ event: forViewer(await service.restore(eventId, await body(req), token, isOperator), isOperator) }), eventId, '', 0);
        if(operation==='delete'&&req.method==='POST'){
            await service.deleteEvent(eventId,await body(req,2048),token,isOperator);
            return sessionCookie(response({ok:true}),eventId,'',0);
        }
        const { value: e } = await service.loadEvent(eventId);
        service.authenticate(e, token, isOperator);
        if (!operation && req.method === 'GET')
            return response({ event: forViewer(service.view(e), isOperator) });
        if (operation === 'backup' && req.method === 'GET')
            return response({ backup: { ...service.backup(e), ledger: isOperator ? e.ledger : [] } });
        if (operation === 'export' && req.method === 'GET') {
            const target = v.choice(req.nextUrl.searchParams.get('target') ?? 'venue', ['venue', 'catering', 'guests'] as const);
            if (target !== 'guests' && e.review !== 'ready')
                throw new ServiceError(409, 'Revisá las mesas antes de exportar para proveedores.');
            return new NextResponse(service.csv(e, target), { headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="boda-${eventId}-${target}-r${e.revision}.csv"` } });
        }
        throw new ServiceError(404, 'Ruta no encontrada.');
    }
    catch (error) {
        if (error instanceof ServiceError)
            return response({ error: error.message }, error.status);
        return response({ error: 'No se pudo completar la operación. Volvé a intentar.' }, 503);
    }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
