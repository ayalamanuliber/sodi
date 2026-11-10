// R2-shaped private object adapter backed exclusively by a SQLite Durable Object.
// Chunking preserves the app's 8MiB event allowance including revision history.
const CHUNK_BYTES = 1024 * 1024;
const MAX_BYTES = 8 * 1024 * 1024;
type Meta = { etag: string; parts: number };
export function durableStore(storage: DurableObjectStorage) {
  const metaKey = (key: string) => `object:${key}`;
  const partKey = (key: string, etag: string, n: number) => `part:${etag}:${n}:${key}`;
  return {
    async get(key: string) {
      // Read metadata and bytes in one transaction so a replacement cannot remove parts midway.
      return storage.transaction(async tx => {
        const meta = await tx.get<Meta>(metaKey(key));
        if (!meta) return null;
        const keys = Array.from({length:meta.parts}, (_,n) => partKey(key,meta.etag,n));
        const parts = await tx.get<ArrayBuffer>(keys);
        const arrays = keys.map(k => { const part = parts.get(k); if (!part) throw new Error('Incomplete private object'); return new Uint8Array(part); });
        const bytes = new Uint8Array(arrays.reduce((n,a) => n+a.length,0));
        let offset=0; for(const a of arrays) {bytes.set(a,offset);offset+=a.length;}
        const text = new TextDecoder().decode(bytes);
        return {etag:meta.etag,text:async()=>text};
      });
    },
    async head(key: string) { const meta = await storage.get<Meta>(metaKey(key)); return meta ? {etag:meta.etag} : null; },
    async put(key: string, text: string, options?: {onlyIf?: {etagMatches?:string;etagDoesNotMatch?:string}}) {
      const bytes = new TextEncoder().encode(text);
      if (bytes.byteLength > MAX_BYTES) throw new Error('Private object exceeds 8MiB');
      return storage.transaction(async tx => {
        const old = await tx.get<Meta>(metaKey(key));
        const cond = options?.onlyIf;
        if (cond?.etagMatches && old?.etag !== cond.etagMatches) return null;
        if (cond?.etagDoesNotMatch === '*' && old) return null;
        const etag = crypto.randomUUID();
        const parts = Math.max(1,Math.ceil(bytes.byteLength/CHUNK_BYTES));
        for(let i=0;i<parts;i++) await tx.put(partKey(key,etag,i),bytes.slice(i*CHUNK_BYTES,(i+1)*CHUNK_BYTES).buffer);
        await tx.put(metaKey(key),{etag,parts});
        if(old) await tx.delete(Array.from({length:old.parts},(_,i)=>partKey(key,old.etag,i)));
        return {etag};
      });
    },
    async delete(key: string) {
      await storage.transaction(async tx => {
        const old=await tx.get<Meta>(metaKey(key));
        if (!old) return;
        await tx.delete([...Array.from({length:old.parts},(_,i)=>partKey(key,old.etag,i)),metaKey(key)]);
      });
    },
    async deleteIfMatch(key: string, etag: string) {
      return storage.transaction(async tx => {
        const old = await tx.get<Meta>(metaKey(key));
        if (!old || old.etag !== etag) return false;
        await tx.delete([...Array.from({length:old.parts},(_,i)=>partKey(key,old.etag,i)),metaKey(key)]);
        return true;
      });
    },
    async list(options?:{prefix?:string;cursor?:string;limit?:number}) {
      const rows=await storage.list<Meta>({prefix:metaKey(options?.prefix??''),limit:options?.limit??1000,...(options?.cursor?{startAfter:options.cursor}:{})});
      const keys=[...rows.keys()];
      return {objects:keys.map(k=>({key:k.slice('object:'.length)})),truncated:keys.length===(options?.limit??1000),cursor:keys.at(-1)};
    },
  };
}
