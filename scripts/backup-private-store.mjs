import {list,get} from '@vercel/blob';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const base=process.argv[2];mkdirSync(base,{recursive:true,mode:0o700});
let cursor;let manifest=[];
do{const p=await list({cursor,limit:1000});for(const o of p.blobs){const r=await get(o.pathname,{access:'private',useCache:false});if(!r||r.statusCode!==200)throw Error('read failure');const b=Buffer.from(await new Response(r.stream).arrayBuffer());if(b.length!==o.size)throw Error('size mismatch');const hash=createHash('sha256').update(b).digest('hex');writeFileSync(base+'/'+hash,b,{mode:0o600});manifest.push({key:o.pathname,size:b.length,sha256:hash,etag:o.etag});}cursor=p.hasMore?p.cursor:undefined;}while(cursor);
writeFileSync(base+'/manifest.json',JSON.stringify(manifest,null,2),{mode:0o600});console.log(JSON.stringify({objects:manifest.length,bytes:manifest.reduce((a,o)=>a+o.size,0),backup:'private local state',verified:true}));
