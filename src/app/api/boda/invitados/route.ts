import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { isWeddingAdminAuthenticated } from '@/lib/boda-auth';
import {
  DEFAULT_WEDDING_SLUG,
  fetchWeddingGuests,
  saveWeddingGuests,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = normalizeSlug(searchParams.get('slug'));
    const code = searchParams.get('code')?.trim();
    const { guests, etag } = await fetchWeddingGuests(slug);

    if (code) {
      const found = guests.find((guest) => guest.id.toLowerCase() === code.toLowerCase());
      if (!found) {
        return NextResponse.json({ success: false, message: 'Invitación no encontrada' }, { status: 404 });
      }

      if (!found.vistoEn) {
        found.vistoEn = new Date().toISOString();
        await saveWeddingGuests(slug, guests, etag);
      }
      return NextResponse.json({ success: true, guest: publicGuest(found) });
    }

    if (!(await isWeddingAdminAuthenticated())) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
    }

    return NextResponse.json({ success: true, guests });
  } catch (error) {
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
    const { guests, etag } = await fetchWeddingGuests(slug);

    if (body.action === 'add') {
      const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
      const pases = Number.parseInt(String(body.pases), 10);
      if (!nombre || !Number.isInteger(pases) || pases < 1 || pases > 20) {
        return NextResponse.json({ success: false, message: 'Nombre o pases inválidos' }, { status: 400 });
      }

      const idSlug = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'invitacion';

      const newGuest: WeddingGuest = {
        id: `${idSlug}-${randomBytes(6).toString('hex')}`,
        nombre,
        pases,
        telefono: typeof body.telefono === 'string' ? body.telefono.trim() : '',
        estado: 'pendiente',
        enviado: false,
        enviadoEn: null,
        creadoEn: new Date().toISOString(),
        vistoEn: null,
        tipo: body.tipo || 'completo',
        estilo: body.estilo || 'oro',
        respuesta: null,
      };

      guests.unshift(newGuest);
      await saveWeddingGuests(slug, guests, etag);
      return NextResponse.json({ success: true, guest: newGuest, guests });
    }

    if (body.action === 'toggleEnviado') {
      const guest = guests.find((item) => item.id === body.id);
      if (!guest) return NextResponse.json({ success: false, message: 'Invitado no encontrado' }, { status: 404 });

      guest.enviado = typeof body.enviado === 'boolean' ? body.enviado : !guest.enviado;
      guest.enviadoEn = guest.enviado ? (guest.enviadoEn || new Date().toISOString()) : null;
      await saveWeddingGuests(slug, guests, etag);
      return NextResponse.json({ success: true, guests });
    }

    if (body.action === 'delete') {
      const filtered = guests.filter((guest) => guest.id !== body.id);
      if (filtered.length === guests.length) {
        return NextResponse.json({ success: false, message: 'Invitado no encontrado' }, { status: 404 });
      }
      await saveWeddingGuests(slug, filtered, etag);
      return NextResponse.json({ success: true, guests: filtered });
    }

    return NextResponse.json({ success: false, message: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Wedding guests POST failed:', error);
    return NextResponse.json({ success: false, message: 'No se pudo guardar el cambio' }, { status: 503 });
  }
}
