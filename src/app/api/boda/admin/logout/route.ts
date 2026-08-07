import { NextResponse } from 'next/server';
import { WEDDING_ADMIN_COOKIE } from '@/lib/boda-auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(WEDDING_ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
