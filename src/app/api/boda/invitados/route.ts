import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'boda-invitados.json');

// Memory store fallback for serverless environments if filesystem is read-only
let memoryStore: any[] | null = null;

function readGuests() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (!memoryStore) memoryStore = parsed;
      return parsed;
    }
  } catch (e) {
    console.error('Error reading guests file:', e);
  }
  return memoryStore || [];
}

function writeGuests(guests: any[]) {
  memoryStore = guests;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(guests, null, 2), 'utf8');
  } catch (e) {
    console.warn('Filesystem write skipped (running in read-only environment):', e);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const guests = readGuests();

  if (code) {
    const found = guests.find((g: any) => g.id.toLowerCase() === code.toLowerCase());
    if (found) {
      // Mark as viewed if not already
      if (!found.vistoEn) {
        found.vistoEn = new Date().toISOString();
        writeGuests(guests);
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
    const guests = readGuests();

    if (body.action === 'add') {
      const { nombre, pases, telefono } = body;
      if (!nombre || !pases) {
        return NextResponse.json({ success: false, message: 'Nombre y pases son requeridos' }, { status: 400 });
      }

      // Generate slug id
      const slug = nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      let uniqueId = slug;
      let counter = 1;
      while (guests.some((g: any) => g.id === uniqueId)) {
        uniqueId = `${slug}-${counter}`;
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
      writeGuests(guests);

      return NextResponse.json({ success: true, guest: newGuest, guests });
    }

    if (body.action === 'delete') {
      const { id } = body;
      const filtered = guests.filter((g: any) => g.id !== id);
      writeGuests(filtered);
      return NextResponse.json({ success: true, guests: filtered });
    }

    return NextResponse.json({ success: false, message: 'Acción no válida' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
