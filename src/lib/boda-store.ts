import { get, put } from '@vercel/blob';

export interface WeddingResponse {
  asistencia: 'confirmado' | 'rechazado';
  pasesConfirmados: number;
  integrantes: string[];
  menu: string;
  notas: string;
  cancion: string;
  fechaRespuesta: string;
}

export interface WeddingGuest {
  id: string;
  nombre: string;
  pases: number;
  telefono: string;
  estado: 'pendiente' | 'confirmado' | 'rechazado';
  enviado?: boolean;
  enviadoEn?: string | null;
  creadoEn: string;
  vistoEn: string | null;
  tipo?: 'completo' | 'solo-after' | 'solo-ceremonia';
  estilo?: 'oro' | 'esmeralda' | 'borgoña';
  cancionSugerida?: string;
  respuesta?: WeddingResponse | null;
}

export const DEFAULT_WEDDING_SLUG = 'mirta-y-guillermo';

function safeSlug(slug: string) {
  return (slug || DEFAULT_WEDDING_SLUG).replace(/[^a-z0-9-]/g, '');
}

function guestPath(slug: string) {
  return `weddings/${safeSlug(slug)}/guests.json`;
}

export async function fetchWeddingGuests(slug: string) {
  const result = await get(guestPath(slug), {
    access: 'private',
    useCache: false,
  });

  if (!result) return { guests: [] as WeddingGuest[], etag: undefined };
  if (result.statusCode !== 200) throw new Error('Wedding guest storage returned no content');

  const guests: unknown = await new Response(result.stream).json();
  if (!Array.isArray(guests)) throw new Error('Wedding guest storage returned invalid data');
  return { guests: guests as WeddingGuest[], etag: result.blob.etag };
}

export async function saveWeddingGuests(slug: string, guests: WeddingGuest[], etag?: string) {
  await put(guestPath(slug), JSON.stringify(guests), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
    ...(etag ? { ifMatch: etag } : {}),
  });
}
