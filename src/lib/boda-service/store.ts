import { get, put, list, del, BlobPreconditionFailedError } from '@vercel/blob';
import { mkdir, readFile, writeFile, rename, rm, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ServiceError } from './types.ts';
export function storePrefix() {
    const prefix = process.env.BODA_STUDIO_STORE_PREFIX ?? 'boda-studio/v1';
    if (!/^boda-studio\/[a-z0-9][a-z0-9/_-]{0,79}$/.test(prefix) || prefix.includes('//') || prefix.endsWith('/'))
        throw new ServiceError(503, 'El espacio de almacenamiento no está configurado correctamente.');
    return prefix;
}
export function durableStoreConfigured() {
    storePrefix();
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN && (!process.env.BODA_STUDIO_STORAGE || process.env.BODA_STUDIO_STORAGE === 'blob'));
}
function root() {
    // Constant-fold the development-only path out of production bundles. Otherwise
    // dynamic filesystem tracing can package the local event files with the API.
    const dir = process.env.NODE_ENV === 'production' ? null : resolve(process.env.BODA_STUDIO_DATA_DIR || join(process.cwd(), '.boda-studio-private'));
    if (!dir)
        throw new ServiceError(503, 'El almacenamiento local no está disponible en producción.');
    const publicDir = resolve(process.cwd(), 'public');
    if (dir === publicDir || dir.startsWith(publicDir + '/'))
        throw new ServiceError(503, 'El almacenamiento debe estar fuera de public.');
    const prefix = storePrefix();
    return prefix === 'boda-studio/v1' ? dir : join(dir, 'namespaces', prefix.slice('boda-studio/'.length));
}
function mode() { if (process.env.NODE_ENV !== 'production')
    return 'file'; if (!durableStoreConfigured())
    throw new ServiceError(503, 'Almacenamiento privado no configurado.'); return 'blob'; }
function keyPath(key: string) { if (!/^[a-z0-9_-]{1,160}$/.test(key))
    throw new ServiceError(400, 'Identificador inválido.'); return `${storePrefix()}/${key}.json`; }
export async function readStore<T>(key: string): Promise<{
    value: T;
    etag: string;
} | null> {
    const path = keyPath(key);
    if (mode() === 'blob') {
        const result = await get(path, { access: 'private', useCache: false });
        if (!result)
            return null;
        if (result.statusCode !== 200)
            throw new ServiceError(503, 'No se pudo leer almacenamiento.');
        return { value: await new Response(result.stream).json() as T, etag: result.blob.etag.replace(/^W\//, '') };
    }
    try {
        const raw = await readFile(join(root(), `${key}.json`), 'utf8');
        return JSON.parse(raw) as {
            value: T;
            etag: string;
        };
    }
    catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT')
            return null;
        throw e;
    }
}
export async function writeStore<T>(key: string, value: T, etag: string | null) {
    const path = keyPath(key);
    if (mode() === 'blob') {
        try {
            await put(path, JSON.stringify(value), { access: 'private', addRandomSuffix: false, allowOverwrite: etag !== null, contentType: 'application/json', cacheControlMaxAge: 60, ...(etag ? { ifMatch: etag } : {}) });
            return;
        }
        catch (e) {
            if (e instanceof BlobPreconditionFailedError || /already exists|ETag mismatch|conflicting operation/i.test(String(e)))
                throw new ServiceError(409, 'Los datos cambiaron. Recargá y volvé a intentar.');
            throw e;
        }
    }
    await mkdir(root(), { recursive: true, mode: 0o700 });
    const lock = join(root(), `${key}.lock`);
    let acquired = false;
    for (let i = 0; i < 30; i++) {
        try {
            await mkdir(lock);
            acquired = true;
            break;
        }
        catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'EEXIST')
                throw e;
            await new Promise(r => setTimeout(r, 20));
        }
    }
    if (!acquired)
        throw new ServiceError(409, 'Hay otra operación en curso.');
    try {
        const current = await readStore<T>(key);
        if ((current?.etag ?? null) !== etag)
            throw new ServiceError(409, 'Los datos cambiaron. Recargá y volvé a intentar.');
        const target = join(root(), `${key}.json`);
        const tmp = target + '.' + randomUUID();
        await writeFile(tmp, JSON.stringify({ etag: randomUUID(), value }), { mode: 0o600 });
        await rename(tmp, target);
    }
    finally {
        await rm(lock, { recursive: true, force: true });
    }
}
export async function eventKeys(): Promise<string[]> { if (mode() === 'file') {
    try {
        return (await readdir(root())).filter(x => /^evt_[a-f0-9]+\.json$/.test(x)).map(x => x.slice(0, -5));
    }
    catch (e) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT')
            return [];
        throw e;
    }
} const keys: string[] = []; let cursor: string | undefined; do {
    const page = await list({ prefix: `${storePrefix()}/evt_`, cursor, limit: 1000 });
    keys.push(...page.blobs.map(b => b.pathname.split('/').at(-1)!.replace(/\.json$/, '')));
    cursor = page.hasMore ? page.cursor : undefined;
} while (cursor); return keys; }

export async function deleteStore(key:string,etag:string) {
    const path=keyPath(key);
    if(!etag)throw new ServiceError(409,'Se requiere la versión actual para eliminar.');
    if(mode()==='blob'){
        try{await del(path,{ifMatch:etag});return;}
        catch(error){if(error instanceof BlobPreconditionFailedError)throw new ServiceError(409,'Los datos cambiaron. Recargá antes de eliminar.');throw error;}
    }
    await mkdir(root(),{recursive:true,mode:0o700});
    const lock=join(root(),`${key}.lock`);
    let acquired=false;
    for(let i=0;i<30;i++){
        try{await mkdir(lock);acquired=true;break;}
        catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;await new Promise(resolve=>setTimeout(resolve,20));}
    }
    if(!acquired)throw new ServiceError(409,'Hay otra operación en curso.');
    try{
        const current=await readStore(key);
        if(!current||current.etag!==etag)throw new ServiceError(409,'Los datos cambiaron. Recargá antes de eliminar.');
        await rm(join(root(),`${key}.json`));
    }finally{await rm(lock,{recursive:true,force:true});}
}
