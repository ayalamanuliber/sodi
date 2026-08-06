import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'bodas');
const DEFAULT_SLUG = 'mirta-y-guillermo';

const memoryStores: Record<string, any[]> = {};

function getFilePath(slug: string) {
  const safeSlug = (slug || DEFAULT_SLUG).replace(/[^a-z0-9-]/g, '');
  return path.join(DATA_DIR, `invitados-${safeSlug}.json`);
}

function readGuests(slug: string) {
  const safeSlug = (slug || DEFAULT_SLUG).replace(/[^a-z0-9-]/g, '');
  const filePath = getFilePath(safeSlug);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      memoryStores[safeSlug] = parsed;
      return parsed;
    }
  } catch (e) {
    console.error(`Error reading guests for ${safeSlug}:`, e);
  }
  return memoryStores[safeSlug] || [];
}

function writeGuests(slug: string, guests: any[]) {
  const safeSlug = (slug || DEFAULT_SLUG).replace(/[^a-z0-9-]/g, '');
  memoryStores[safeSlug] = guests;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = getFilePath(safeSlug);
    fs.writeFileSync(filePath, JSON.stringify(guests, null, 2), 'utf8');
  } catch (e) {
    console.warn('Filesystem write skipped (read-only environment):', e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body.slug || DEFAULT_SLUG;
    const { code, asistencia, pasesConfirmados, integrantes, menu, notas, cancion } = body;

    const guests = readGuests(slug);
    let guest = code ? guests.find((g: any) => g.id.toLowerCase() === code.toLowerCase()) : null;

    const responseData = {
      asistencia: asistencia === 'confirmado' ? 'confirmado' : 'rechazado',
      pasesConfirmados: parseInt(pasesConfirmados, 10) || 0,
      integrantes: Array.isArray(integrantes) ? integrantes : [],
      menu: menu || 'Tradicional',
      notas: notas || '',
      cancion: cancion || '',
      fechaRespuesta: new Date().toISOString()
    };

    if (guest) {
      guest.estado = responseData.asistencia;
      guest.respuesta = responseData;
    } else {
      const nombreInvitado = body.nombre || 'Invitado Web';
      guest = {
        id: 'web-' + Date.now(),
        nombre: nombreInvitado,
        pases: parseInt(pasesConfirmados, 10) || 1,
        telefono: '',
        estado: responseData.asistencia,
        creadoEn: new Date().toISOString(),
        vistoEn: new Date().toISOString(),
        respuesta: responseData
      };
      guests.unshift(guest);
    }

    writeGuests(slug, guests);

    return NextResponse.json({
      success: true,
      message: 'RSVP guardado correctamente',
      guest
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
