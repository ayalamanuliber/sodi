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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || DEFAULT_SLUG;
  const code = searchParams.get('code');

  const guests = await fetchGuestsFromCloud(slug);

  if (code) {
    const found = guests.find((g: any) => g.id.toLowerCase() === code.toLowerCase());
    if (found) {
      if (!found.vistoEn) {
        found.vistoEn = new Date().toISOString();
        await saveGuestsToCloud(slug, guests);
      }
      return NextResponse.json({ success: true, guest: found });
    }
    return NextResponse.json({ success: false, message: 'Invitación no encontrada' }, { status: 404 });
  }

  return NextResponse.json({ success: true, guests });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = body.slug || DEFAULT_SLUG;
    const guests = await fetchGuestsFromCloud(slug);

    if (body.action === 'add') {
      const { nombre, pases, telefono, tipo, estilo } = body;
      if (!nombre || !pases) {
        return NextResponse.json({ success: false, message: 'Nombre y pases requeridos' }, { status: 400 });
      }

      const idSlug = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      let uniqueId = idSlug;
      let counter = 1;
      while (guests.some((g: any) => g.id === uniqueId)) {
        uniqueId = `${idSlug}-${counter}`;
        counter++;
      }

      const newGuest = {
        id: uniqueId,
        nombre: nombre.trim(),
        pases: parseInt(pases, 10) || 1,
        telefono: (telefono || '').trim(),
        estado: 'pendiente',
        enviado: false,
        enviadoEn: null,
        creadoEn: new Date().toISOString(),
        vistoEn: null,
        tipo: tipo || 'completo',
        estilo: estilo || 'oro',
        respuesta: null
      };

      guests.unshift(newGuest);
      await saveGuestsToCloud(slug, guests);

      return NextResponse.json({ success: true, guest: newGuest, guests });
    }

    if (body.action === 'toggleEnviado') {
      const { id, enviado } = body;
      const guest = guests.find((g: any) => g.id === id);
      if (guest) {
        guest.enviado = typeof enviado === 'boolean' ? enviado : !guest.enviado;
        if (guest.enviado && !guest.enviadoEn) {
          guest.enviadoEn = new Date().toISOString();
        }
        await saveGuestsToCloud(slug, guests);
      }
      return NextResponse.json({ success: true, guests });
    }

    if (body.action === 'delete') {
      const { id } = body;
      const filtered = guests.filter((g: any) => g.id !== id);
      await saveGuestsToCloud(slug, filtered);
      return NextResponse.json({ success: true, guests: filtered });
    }

    return NextResponse.json({ success: false, message: 'Acción no válida' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
