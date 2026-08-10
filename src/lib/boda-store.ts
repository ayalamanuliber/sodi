import { BlobPreconditionFailedError, get, put } from '@vercel/blob';

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

export interface WeddingSettings {
  whatsappMessage: string;
  guestGoal: number;
  updatedAt: string | null;
}

export const DEFAULT_WHATSAPP_MESSAGE = 'Hola, {nombre}. Nos encantaría que nos acompañes en nuestro casamiento. Reservamos {pases} para vos.\n\nEn este enlace podés ver la invitación y confirmar tu asistencia:\n{enlace}';

export const DEFAULT_WEDDING_SLUG = 'mirta-y-guillermo';

function safeSlug(slug: string) {
  return (slug || DEFAULT_WEDDING_SLUG).replace(/[^a-z0-9-]/g, '');
}

function guestPath(slug: string) {
  return `weddings/${safeSlug(slug)}/guests.json`;
}

function settingsPath(slug: string) {
  return `weddings/${safeSlug(slug)}/settings.json`;
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
  // Private Blob reads can return a weak ETag (`W/"..."`), while `ifMatch`
  // requires the equivalent strong ETag value.
  const etag = result.blob.etag?.replace(/^W\//, '');
  return { guests: guests as WeddingGuest[], etag };
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

export async function fetchWeddingSettings(slug: string): Promise<WeddingSettings> {
  const result = await get(settingsPath(slug), {
    access: 'private',
    useCache: false,
  });

  if (!result) return { whatsappMessage: DEFAULT_WHATSAPP_MESSAGE, guestGoal: 0, updatedAt: null };
  if (result.statusCode !== 200) throw new Error('Wedding settings storage returned no content');

  const settings: unknown = await new Response(result.stream).json();
  if (!settings || typeof settings !== 'object') throw new Error('Wedding settings storage returned invalid data');
  const stored = settings as Partial<WeddingSettings>;
  return {
    whatsappMessage: typeof stored.whatsappMessage === 'string' && stored.whatsappMessage.trim()
      ? stored.whatsappMessage
      : DEFAULT_WHATSAPP_MESSAGE,
    guestGoal: Number.isInteger(stored.guestGoal) && Number(stored.guestGoal) > 0
      ? Number(stored.guestGoal)
      : 0,
    updatedAt: typeof stored.updatedAt === 'string' ? stored.updatedAt : null,
  };
}

export async function saveWeddingSettings(slug: string, settings: WeddingSettings) {
  await put(settingsPath(slug), JSON.stringify(settings), {
    access: 'private',
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}

export class WeddingGuestMutationError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'WeddingGuestMutationError';
    this.status = status;
  }
}

type WeddingGuestMutationResult<T> = {
  result: T;
  changed?: boolean;
};

export async function mutateWeddingGuests<T>(
  slug: string,
  mutate: (guests: WeddingGuest[]) => WeddingGuestMutationResult<T> | Promise<WeddingGuestMutationResult<T>>,
) {
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { guests, etag } = await fetchWeddingGuests(slug);
    const mutation = await mutate(guests);

    if (mutation.changed === false) {
      return { guests, result: mutation.result };
    }

    try {
      await saveWeddingGuests(slug, guests, etag);
      return { guests, result: mutation.result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      const isConflict = error instanceof BlobPreconditionFailedError
        || errorMessage.includes('ETag mismatch')
        || errorMessage.includes('conflicting operation');

      if (!isConflict || attempt === maxAttempts - 1) throw error;

      const retryDelay = Math.min(75 * (2 ** attempt), 350) + Math.floor(Math.random() * 100);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error('Wedding guest mutation exhausted all retries');
}
