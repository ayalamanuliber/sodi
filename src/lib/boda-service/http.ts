import { ServiceError } from './types.ts';

/** Browser Host and Origin describe the public request; Next's URL may use an internal localhost host. */
export function assertMutationOrigin(headers: Headers, production = process.env.NODE_ENV === 'production') {
  if (headers.get('sec-fetch-site') === 'cross-site') throw new ServiceError(403, 'Origen no permitido.');
  const originHeader = headers.get('origin');
  if (!originHeader) return; // Non-browser clients must still prove their operator/session/invitation credential.
  try {
    const origin = new URL(originHeader);
    const host = headers.get('host');
    if (!host || !['http:', 'https:'].includes(origin.protocol)) throw new Error('Invalid host or scheme');
    const requested = new URL(`${origin.protocol}//${host}`);
    const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(requested.hostname);
    if (requested.username || requested.password || requested.pathname !== '/' || requested.search || requested.hash
      || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash
      || origin.host !== requested.host || (production && !loopback && origin.protocol !== 'https:')) {
      throw new Error('Origin mismatch');
    }
  } catch {
    throw new ServiceError(403, 'Origen no permitido.');
  }
}
