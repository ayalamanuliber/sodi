import { timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const WEDDING_ADMIN_COOKIE = 'sodi_boda_admin';

export function secureCompare(value: string, expected: string) {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  return valueBuffer.length === expectedBuffer.length
    && timingSafeEqual(valueBuffer, expectedBuffer);
}

export async function isWeddingAdminAuthenticated() {
  const expected = process.env.WEDDING_ADMIN_SESSION_TOKEN;
  if (!expected) return false;

  const cookieStore = await cookies();
  const received = cookieStore.get(WEDDING_ADMIN_COOKIE)?.value || '';
  return secureCompare(received, expected);
}
