import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'boda-invitados.json');

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
    console.warn('Filesystem write skipped (read-only environment):', e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, asistencia, pasesConfirmados, integrantes, menu, notas, cancion } = body;

    const guests = readGuests();
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
      // Create ad-hoc entry if guest searched by name
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

    writeGuests(guests);

    return NextResponse.json({
      success: true,
      message: 'RSVP guardado correctamente',
      guest
    });
  } catch (e: any) {
    console.error('Error processing RSVP:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
