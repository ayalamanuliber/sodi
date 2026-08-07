import { NextResponse } from 'next/server';
import {
  DEFAULT_WEDDING_SLUG,
  fetchWeddingGuests,
  saveWeddingGuests,
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

    const { guests, etag } = await fetchWeddingGuests(slug);
    const guest = guests.find((item) => item.id.toLowerCase() === code.toLowerCase());

    if (!guest) {
      return NextResponse.json({ success: false, message: 'Invitación no encontrada' }, { status: 404 });
    }

    guest.cancionSugerida = cancion;
    if (guest.respuesta) guest.respuesta.cancion = cancion;
    await saveWeddingGuests(slug, guests, etag);

    return NextResponse.json({ success: true, message: 'Canción enviada a Mirta y Guillermo' });
  } catch (error) {
    console.error('Wedding song suggestion failed:', error);
    return NextResponse.json({ success: false, message: 'No pudimos enviar la canción. Intentá nuevamente.' }, { status: 503 });
  }
}
