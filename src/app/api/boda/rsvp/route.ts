import { NextResponse } from 'next/server';
import {
  DEFAULT_WEDDING_SLUG,
  fetchWeddingGuests,
  saveWeddingGuests,
  type WeddingResponse,
} from '@/lib/boda-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = typeof body.slug === 'string' && body.slug ? body.slug : DEFAULT_WEDDING_SLUG;
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const { guests, etag } = await fetchWeddingGuests(slug);
    const guest = guests.find((item) => item.id.toLowerCase() === code.toLowerCase());

    if (!guest) {
      return NextResponse.json({ success: false, message: 'Invitación no encontrada' }, { status: 404 });
    }

    const asistencia = body.asistencia === 'confirmado' ? 'confirmado' : 'rechazado';
    const requestedPasses = Number.parseInt(String(body.pasesConfirmados), 10) || 0;
    const pasesConfirmados = asistencia === 'confirmado' ? requestedPasses : 0;
    const integrantes = asistencia === 'confirmado' && Array.isArray(body.integrantes)
      ? body.integrantes.map((name: unknown) => String(name).trim()).filter(Boolean)
      : [];

    if (asistencia === 'confirmado' && (
      pasesConfirmados < 1
      || pasesConfirmados > guest.pases
      || integrantes.length !== pasesConfirmados
    )) {
      return NextResponse.json({ success: false, message: 'La cantidad de asistentes no es válida' }, { status: 400 });
    }

    const responseData: WeddingResponse = {
      asistencia,
      pasesConfirmados,
      integrantes,
      menu: typeof body.menu === 'string' ? body.menu.slice(0, 80) : 'Tradicional',
      notas: typeof body.notas === 'string' ? body.notas.trim().slice(0, 600) : '',
      cancion: typeof body.cancion === 'string' ? body.cancion.trim().slice(0, 160) : '',
      fechaRespuesta: new Date().toISOString(),
    };

    guest.estado = asistencia;
    guest.respuesta = responseData;
    await saveWeddingGuests(slug, guests, etag);

    return NextResponse.json({ success: true, message: 'RSVP guardado correctamente' });
  } catch (error) {
    console.error('Wedding RSVP failed:', error);
    return NextResponse.json({ success: false, message: 'No se pudo guardar la confirmación' }, { status: 503 });
  }
}
