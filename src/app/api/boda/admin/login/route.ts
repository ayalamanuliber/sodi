import { NextResponse } from 'next/server';
import { secureCompare, WEDDING_ADMIN_COOKIE } from '@/lib/boda-auth';

export async function POST(request: Request) {
  const configuredPassword = process.env.WEDDING_ADMIN_PASSWORD;
  const sessionToken = process.env.WEDDING_ADMIN_SESSION_TOKEN;

  if (!configuredPassword || !sessionToken) {
    return NextResponse.json({ success: false, message: 'Panel no configurado' }, { status: 503 });
  }

  const body = await request.json();
  const password = typeof body.password === 'string' ? body.password.trim() : '';
  if (!secureCompare(password, configuredPassword)) {
    return NextResponse.json({ success: false, message: 'Contraseña incorrecta' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(WEDDING_ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}
