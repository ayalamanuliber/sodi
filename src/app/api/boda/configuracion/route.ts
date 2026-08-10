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
    const whatsappMessage = typeof body.whatsappMessage === 'string' ? body.whatsappMessage.trim() : '';
    if (whatsappMessage.length < 20 || whatsappMessage.length > 1200) {
      return NextResponse.json({ success: false, message: 'El mensaje debe tener entre 20 y 1200 caracteres' }, { status: 400 });
    }
    if (!whatsappMessage.includes('{enlace}')) {
      return NextResponse.json({ success: false, message: 'El mensaje debe incluir la variable {enlace}' }, { status: 400 });
    }

    const settings = {
      whatsappMessage,
      updatedAt: new Date().toISOString(),
    };
    await saveWeddingSettings(normalizeSlug(body.slug), settings);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Wedding settings POST failed:', error);
    return NextResponse.json({ success: false, message: 'No se pudo guardar la configuración' }, { status: 503 });
  }
}
