import { NextResponse } from 'next/server';
import {
  DEFAULT_WEDDING_SLUG,
  mutateWeddingGuests,
  WeddingGuestMutationError,
  type WeddingResponse,
} from '@/lib/boda-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = typeof body.slug === 'string' && body.slug ? body.slug : DEFAULT_WEDDING_SLUG;
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const asistencia = body.asistencia === 'confirmado' ? 'confirmado' : 'rechazado';
    const requestedPasses = Number.parseInt(String(body.pasesConfirmados), 10) || 0;
    const pasesConfirmados = asistencia === 'confirmado' ? requestedPasses : 0;
    const integrantes = asistencia === 'confirmado' && Array.isArray(body.integrantes)
      ? body.integrantes.map((name: unknown) => String(name).trim()).filter(Boolean)
      : [];

    await mutateWeddingGuests(slug, (guests) => {
      const guest = guests.find((item) => item.id.toLowerCase() === code.toLowerCase());
      if (!guest) throw new WeddingGuestMutationError('Invitación no encontrada', 404);

      if (asistencia === 'confirmado' && (
        pasesConfirmados < 1
        || pasesConfirmados > guest.pases
        || integrantes.length !== pasesConfirmados
      )) {
        throw new WeddingGuestMutationError('La cantidad de asistentes no es válida', 400);
      }

      const responseData: WeddingResponse = {
        asistencia,
        pasesConfirmados,
        integrantes,
        menu: typeof body.menu === 'string' ? body.menu.slice(0, 80) : 'Tradicional',
        notas: typeof body.notas === 'string' ? body.notas.trim().slice(0, 600) : '',
        cancion: typeof body.cancion === 'string' && body.cancion.trim()
          ? body.cancion.trim().slice(0, 160)
          : guest.cancionSugerida || '',
        fechaRespuesta: new Date().toISOString(),
      };

      guest.estado = asistencia;
      guest.respuesta = responseData;
      return { result: guest };
    });

    return NextResponse.json({ success: true, message: 'RSVP guardado correctamente' });
  } catch (error) {
    if (error instanceof WeddingGuestMutationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error('Wedding RSVP failed:', error);
    return NextResponse.json({ success: false, message: 'No se pudo guardar la confirmación' }, { status: 503 });
  }
}
