import { NextResponse } from 'next/server';
import { isWeddingAdminAuthenticated } from '@/lib/boda-auth';
import {
  DEFAULT_WEDDING_SLUG,
  DEFAULT_WHATSAPP_MESSAGE,
  fetchWeddingSettings,
  saveWeddingSettings,
} from '@/lib/boda-store';

function normalizeSlug(value: unknown) {
  return typeof value === 'string' && value ? value : DEFAULT_WEDDING_SLUG;
}

export async function GET(request: Request) {
  if (!(await isWeddingAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const settings = await fetchWeddingSettings(normalizeSlug(searchParams.get('slug')));
    return NextResponse.json({ success: true, settings, defaultMessage: DEFAULT_WHATSAPP_MESSAGE });
  } catch (error) {
    console.error('Wedding settings GET failed:', error);
    return NextResponse.json({ success: false, message: 'No se pudo cargar la configuración' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isWeddingAdminAuthenticated())) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const slug = normalizeSlug(body.slug);
    const current = await fetchWeddingSettings(slug);
    let whatsappMessage = current.whatsappMessage;
    let guestGoal = current.guestGoal;

    if (body.whatsappMessage !== undefined) {
      whatsappMessage = typeof body.whatsappMessage === 'string' ? body.whatsappMessage.trim() : '';
      if (whatsappMessage.length < 20 || whatsappMessage.length > 1200) {
        return NextResponse.json({ success: false, message: 'El mensaje debe tener entre 20 y 1200 caracteres' }, { status: 400 });
      }
      if (!whatsappMessage.includes('{enlace}')) {
        return NextResponse.json({ success: false, message: 'El mensaje debe incluir la variable {enlace}' }, { status: 400 });
      }
    }

    if (body.guestGoal !== undefined) {
      guestGoal = Number(body.guestGoal);
      if (!Number.isInteger(guestGoal) || guestGoal < 1 || guestGoal > 2000) {
        return NextResponse.json({ success: false, message: 'El cupo total debe ser un número entre 1 y 2000' }, { status: 400 });
      }
    }

    const settings = {
      whatsappMessage,
      guestGoal,
      updatedAt: new Date().toISOString(),
    };
    await saveWeddingSettings(slug, settings);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Wedding settings POST failed:', error);
    return NextResponse.json({ success: false, message: 'No se pudo guardar la configuración' }, { status: 503 });
  }
}
