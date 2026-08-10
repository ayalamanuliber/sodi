import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { isWeddingAdminAuthenticated } from '@/lib/boda-auth';
import {
  DEFAULT_WEDDING_SLUG,
  fetchWeddingGuests,
  mutateWeddingGuests,
  WeddingGuestMutationError,
  type WeddingGuest,
} from '@/lib/boda-store';

function normalizeSlug(value: unknown) {
  return typeof value === 'string' && value ? value : DEFAULT_WEDDING_SLUG;
}

function publicGuest(guest: WeddingGuest) {
  const { telefono: _telefono, creadoEn: _creadoEn, enviadoEn: _enviadoEn, ...safeGuest } = guest;
  void _telefono;
  void _creadoEn;
  void _enviadoEn;
  return safeGuest;
}

function createGuest(input: Record<string, unknown>): WeddingGuest {
  const nombre = typeof input.nombre === 'string' ? input.nombre.trim() : '';
  const pases = Number.parseInt(String(input.pases), 10);
  if (!nombre || !Number.isInteger(pases) || pases < 1 || pases > 20) {
    throw new WeddingGuestMutationError('Nombre o pases inválidos', 400);
  }

  const idSlug = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'invitacion';

  return {
    id: `${idSlug}-${randomBytes(6).toString('hex')}`,
    nombre,
    pases,
    telefono: typeof input.telefono === 'string' ? input.telefono.trim() : '',
    estado: 'pendiente',
    enviado: false,
    enviadoEn: null,
    creadoEn: new Date().toISOString(),
    vistoEn: null,
    tipo: 'completo',
    estilo: 'oro',
    respuesta: null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = normalizeSlug(searchParams.get('slug'));
    const code = searchParams.get('code')?.trim();
    const { guests } = await fetchWeddingGuests(slug);

    if (code) {
      const found = guests.find((guest) => guest.id.toLowerCase() === code.toLowerCase());
      if (!found) {
        return NextResponse.json({ success: false, message: 'Invitación no encontrada' }, { status: 404 });
      }

      if (!found.vistoEn) {
        const viewedAt = new Date().toISOString();
        const updated = await mutateWeddingGuests(slug, (currentGuests) => {
          const currentGuest = currentGuests.find((guest) => guest.id.toLowerCase() === code.toLowerCase());
          if (!currentGuest) throw new WeddingGuestMutationError('Invitación no encontrada', 404);
          if (currentGuest.vistoEn) return { result: currentGuest, changed: false };
          currentGuest.vistoEn = viewedAt;
          return { result: currentGuest };
        });
        return NextResponse.json({ success: true, guest: publicGuest(updated.result) });
      }
      return NextResponse.json({ success: true, guest: publicGuest(found) });
    }

    if (!(await isWeddingAdminAuthenticated())) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
    }

    return NextResponse.json({ success: true, guests });
  } catch (error) {
    if (error instanceof WeddingGuestMutationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error('Wedding guests GET failed:', error);
    return NextResponse.json({ success: false, message: 'No se pudo acceder a la lista' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isWeddingAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slug = normalizeSlug(body.slug);

    if (body.action === 'add') {
      const newGuest = createGuest(body);

      const updated = await mutateWeddingGuests(slug, (guests) => {
        guests.unshift(newGuest);
        return { result: newGuest };
      });
      return NextResponse.json({ success: true, guest: updated.result, guests: updated.guests });
    }

    if (body.action === 'addMany') {
      if (!Array.isArray(body.guests) || body.guests.length < 1 || body.guests.length > 100) {
        return NextResponse.json({ success: false, message: 'La lista debe tener entre 1 y 100 invitaciones' }, { status: 400 });
      }

      const newGuests = body.guests.map((guest: unknown) => createGuest(
        guest && typeof guest === 'object' ? guest as Record<string, unknown> : {},
      ));
      const updated = await mutateWeddingGuests(slug, (guests) => {
        guests.unshift(...newGuests);
        return { result: newGuests };
      });
      return NextResponse.json({ success: true, added: updated.result.length, guests: updated.guests });
    }

    if (body.action === 'toggleEnviado') {
      const updated = await mutateWeddingGuests(slug, (guests) => {
        const guest = guests.find((item) => item.id === body.id);
        if (!guest) throw new WeddingGuestMutationError('Invitado no encontrado', 404);
        guest.enviado = typeof body.enviado === 'boolean' ? body.enviado : !guest.enviado;
        guest.enviadoEn = guest.enviado ? (guest.enviadoEn || new Date().toISOString()) : null;
        return { result: guest };
      });
      return NextResponse.json({ success: true, guests: updated.guests });
    }

    if (body.action === 'delete') {
      const updated = await mutateWeddingGuests(slug, (guests) => {
        const index = guests.findIndex((guest) => guest.id === body.id);
        if (index === -1) throw new WeddingGuestMutationError('Invitado no encontrado', 404);
        guests.splice(index, 1);
        return { result: null };
      });
      return NextResponse.json({ success: true, guests: updated.guests });
    }

    return NextResponse.json({ success: false, message: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    if (error instanceof WeddingGuestMutationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error('Wedding guests POST failed:', error);
    return NextResponse.json({ success: false, message: 'No se pudo guardar el cambio' }, { status: 503 });
  }
}
