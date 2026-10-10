import { StoragePreconditionFailedError, getObject, putObject } from './storage/objects.ts';

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
  const result = await getObject(guestPath(slug));

  if (!result) return { guests: [] as WeddingGuest[], etag: undefined };

  const guests: unknown = JSON.parse(result.text);
  if (!Array.isArray(guests)) throw new Error('Wedding guest storage returned invalid data');
  return { guests: guests as WeddingGuest[], etag: result.etag };
}

export async function saveWeddingGuests(slug: string, guests: WeddingGuest[], etag?: string) {
  await putObject(guestPath(slug), JSON.stringify(guests), { overwrite: true, ...(etag ? { ifMatch: etag } : {}) });
}

export async function fetchWeddingSettings(slug: string): Promise<WeddingSettings> {
  const result = await getObject(settingsPath(slug));

  if (!result) return { whatsappMessage: DEFAULT_WHATSAPP_MESSAGE, guestGoal: 0, updatedAt: null };

  const settings: unknown = JSON.parse(result.text);
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
  await putObject(settingsPath(slug), JSON.stringify(settings), { overwrite: true });
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
      const isConflict = error instanceof StoragePreconditionFailedError
        || errorMessage.includes('ETag mismatch')
        || errorMessage.includes('conflicting operation');

      if (!isConflict || attempt === maxAttempts - 1) throw error;

      const retryDelay = Math.min(75 * (2 ** attempt), 350) + Math.floor(Math.random() * 100);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error('Wedding guest mutation exhausted all retries');
}
