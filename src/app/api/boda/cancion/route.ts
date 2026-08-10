import { NextResponse } from 'next/server';
import {
  DEFAULT_WEDDING_SLUG,
  mutateWeddingGuests,
  WeddingGuestMutationError,
} from '@/lib/boda-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = typeof body.slug === 'string' && body.slug ? body.slug : DEFAULT_WEDDING_SLUG;
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const cancion = typeof body.cancion === 'string' ? body.cancion.trim().slice(0, 160) : '';

    if (cancion.length < 2) {
      return NextResponse.json({ success: false, message: 'Escribí el nombre de la canción y el artista.' }, { status: 400 });
    }

    const updated = await mutateWeddingGuests(slug, (guests) => {
      const guest = guests.find((item) => item.id.toLowerCase() === code.toLowerCase());
      if (!guest) throw new WeddingGuestMutationError('Invitación no encontrada', 404);

      if (guest.cancionSugerida === cancion && (!guest.respuesta || guest.respuesta.cancion === cancion)) {
        return { result: { alreadySaved: true }, changed: false };
      }

      guest.cancionSugerida = cancion;
      if (guest.respuesta) guest.respuesta.cancion = cancion;
      return { result: { alreadySaved: false } };
    });

    if (updated.result.alreadySaved) {
      return NextResponse.json({ success: true, alreadySaved: true, message: 'Canción ya recibida' });
    }

    return NextResponse.json({ success: true, message: 'Canción enviada a Mirta y Guillermo' });
  } catch (error) {
    if (error instanceof WeddingGuestMutationError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error('Wedding song suggestion failed:', error);
    return NextResponse.json({ success: false, message: 'No pudimos enviar la canción. Intentá nuevamente.' }, { status: 503 });
  }
}
