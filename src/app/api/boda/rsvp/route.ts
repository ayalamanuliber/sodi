import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'bodas');
const DEFAULT_SLUG = 'mirta-y-guillermo';

const memoryStores: Record<string, any[]> = {};

function getWeddingConfig(slug: string) {
  const safeSlug = (slug || DEFAULT_SLUG).replace(/[^a-z0-9-]/g, '');
  const configPath = path.join(DATA_DIR, `${safeSlug}.json`);
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading wedding config:', e);
  }
  return null;
}

async function fetchGuestsFromCloud(slug: string) {
  const safeSlug = (slug || DEFAULT_SLUG).replace(/[^a-z0-9-]/g, '');
  const config = getWeddingConfig(safeSlug);
  const blobId = config?.jsonBlobId;

  if (blobId) {
    try {
      const res = await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const guests = await res.json();
        if (Array.isArray(guests)) {
          memoryStores[safeSlug] = guests;
          return guests;
        }
      }
    } catch (e) {
      console.error('Error reading from JSONBlob:', e);
    }
  }

  return memoryStores[safeSlug] || [];
}

async function saveGuestsToCloud(slug: string, guests: any[]) {
  const safeSlug = (slug || DEFAULT_SLUG).replace(/[^a-z0-9-]/g, '');
  memoryStores[safeSlug] = guests;

  const config = getWeddingConfig(safeSlug);
  const blobId = config?.jsonBlobId;

  if (blobId) {
    try {
      await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(guests)
      });
    } catch (e) {
      console.error('Error writing to JSONBlob:', e);
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body.slug || DEFAULT_SLUG;
    const { code, asistencia, pasesConfirmados, integrantes, menu, notas, cancion } = body;

    const guests = await fetchGuestsFromCloud(slug);
    let guest = code ? guests.find((g: any) => g.id.toLowerCase() === code.toLowerCase()) : null;

    const responseData = {
      asistencia: asistencia === 'confirmado' ? 'confirmado' : 'rechazado',
      pasesConfirmados: parseInt(pasesConfirmados, 10) || 0,
      integrantes: Array.isArray(integrantes) ? integrantes : [],
      menu: menu || 'Tradicional',
      notes: notas || '', // Map to notas / notes securely
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

    await saveGuestsToCloud(slug, guests);

    return NextResponse.json({
      success: true,
      message: 'RSVP guardado correctamente',
      guest
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
