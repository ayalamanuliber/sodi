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

  // Fallback initial sample data if file doesn't exist yet
  if (!memoryStores[safeSlug]) {
    memoryStores[safeSlug] = [
      {
        id: "fam-perez",
        nombre: "Familia Pérez",
        pases: 3,
        telefono: "",
        estado: "pendiente",
        creadoEn: new Date().toISOString(),
        vistoEn: null,
        respuesta: null
      },
      {
        id: "tio-carlos",
        nombre: "Tío Carlos y Acompañante",
        pases: 2,
        telefono: "",
        estado: "pendiente",
        creadoEn: new Date().toISOString(),
        vistoEn: null,
        respuesta: null
      }
    ];
  }
  return memoryStores[safeSlug];
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || DEFAULT_SLUG;
  const code = searchParams.get('code');

  const guests = readGuests(slug);

  if (code) {
    const found = guests.find((g: any) => g.id.toLowerCase() === code.toLowerCase());
    if (found) {
      if (!found.vistoEn) {
        found.vistoEn = new Date().toISOString();
        writeGuests(slug, guests);
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
    const guests = readGuests(slug);

    if (body.action === 'add') {
      const { nombre, pases, telefono } = body;
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
        creadoEn: new Date().toISOString(),
        vistoEn: null,
        respuesta: null
      };

      guests.unshift(newGuest);
      writeGuests(slug, guests);

      return NextResponse.json({ success: true, guest: newGuest, guests });
    }

    if (body.action === 'delete') {
      const { id } = body;
      const filtered = guests.filter((g: any) => g.id !== id);
      writeGuests(slug, filtered);
      return NextResponse.json({ success: true, guests: filtered });
    }

    return NextResponse.json({ success: false, message: 'Acción no válida' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
