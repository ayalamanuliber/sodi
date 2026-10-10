// Private object storage used by the Bodas store (guests/settings) and Boda Studio (events, rate limits).
// Backends: Cloudflare R2 (binding `SODI_STORAGE`, when running on Workers) or Vercel Blob (default, unchanged).
// Everything stored is private: nothing is ever served by URL, only read through these functions.
import { BlobPreconditionFailedError, del, get, list, put } from '@vercel/blob';

export class StoragePreconditionFailedError extends Error {
  constructor(message = 'Storage precondition failed') {
    super(message);
    this.name = 'StoragePreconditionFailedError';
  }
}

type R2Like = {
  get(key: string): Promise<null | { etag: string; text(): Promise<string> }>;
  head(key: string): Promise<null | { etag: string }>;
  put(key: string, value: string, options?: Record<string, unknown>): Promise<null | { etag: string }>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; cursor?: string; limit?: number }): Promise<{ objects: { key: string }[]; truncated: boolean; cursor?: string }>;
};

const CF_CONTEXT = Symbol.for('__cloudflare-context__');

function r2(): R2Like | null {
  const ctx = (globalThis as Record<symbol, unknown>)[CF_CONTEXT] as { env?: Record<string, unknown> } | undefined;
  const bucket = ctx?.env?.SODI_STORAGE as R2Like | undefined;
  return bucket ?? null;
}

export function r2Configured() {
  return r2() !== null;
}

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** True when some durable private backend is available (R2 binding wins over Blob). */
export function objectStorageConfigured() {
  return r2Configured() || blobConfigured();
}

export interface StoredObject {
  text: string;
  etag: string;
}

export async function getObject(path: string): Promise<StoredObject | null> {
  const bucket = r2();
  if (bucket) {
    const obj = await bucket.get(path);
    if (!obj) return null;
    return { text: await obj.text(), etag: obj.etag };
  }
  const result = await get(path, { access: 'private', useCache: false });
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error('Storage returned no content');
  // Private Blob reads can return a weak ETag (`W/"..."`), while `ifMatch` requires the strong value.
  return { text: await new Response(result.stream).text(), etag: result.blob.etag.replace(/^W\//, '') };
}

export interface PutOptions {
  /** Overwrite an existing object. false = create only (fails if it exists). */
  overwrite: boolean;
  /** Only write if the current object has this etag. */
  ifMatch?: string;
}

export async function putObject(path: string, body: string, options: PutOptions): Promise<void> {
  const bucket = r2();
  if (bucket) {
    let onlyIf: Record<string, unknown> | undefined;
    if (options.ifMatch) onlyIf = { etagMatches: options.ifMatch };
    else if (!options.overwrite) onlyIf = { etagDoesNotMatch: '*' };
    const res = await bucket.put(path, body, {
      httpMetadata: { contentType: 'application/json' },
      ...(onlyIf ? { onlyIf } : {}),
    });
    if (res === null) throw new StoragePreconditionFailedError('ETag mismatch');
    return;
  }
  try {
    await put(path, body, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: options.overwrite,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
      ...(options.ifMatch ? { ifMatch: options.ifMatch } : {}),
    });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError || /already exists|ETag mismatch|conflicting operation/i.test(String(error))) {
      throw new StoragePreconditionFailedError(error instanceof Error ? error.message : undefined);
    }
    throw error;
  }
}

export async function listPaths(prefix: string): Promise<string[]> {
  const bucket = r2();
  const out: string[] = [];
  let cursor: string | undefined;
  if (bucket) {
    do {
      const page = await bucket.list({ prefix, cursor, limit: 1000 });
      out.push(...page.objects.map((o) => o.key));
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
    return out;
  }
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    out.push(...page.blobs.map((b) => b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

export async function deleteObject(path: string, etag: string): Promise<void> {
  const bucket = r2();
  if (bucket) {
    // R2 bindings have no conditional delete: check then delete (small race window, event deletion is an admin-only, rare action).
    const head = await bucket.head(path);
    if (!head || head.etag !== etag) throw new StoragePreconditionFailedError('ETag mismatch');
    await bucket.delete(path);
    return;
  }
  try {
    await del(path, { ifMatch: etag });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError) throw new StoragePreconditionFailedError();
    throw error;
  }
}
