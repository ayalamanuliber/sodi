import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Test-only worker, never deployed. Exercise real SQLite DO transactions and limits.
const result = await build({stdin:{contents:`
import { DurableObject } from 'cloudflare:workers';
import { durableStore } from './cf/durable-store';
export class StoreTest extends DurableObject {
  async fetch(request) {
    const {method,args}=await request.json();
    const store=durableStore(this.ctx.storage);
    try {
      let result=await store[method](...args);
      if(method==='get' && result) result={etag:result.etag,text:await result.text()};
      return Response.json({result});
    } catch(error) { return Response.json({error:String(error)}, {status:400}); }
  }
}
export default {fetch(request,env){return env.STORE.get(env.STORE.idFromName('test')).fetch(request)}};
`,resolveDir:process.cwd(),loader:'ts'},bundle:true,format:'esm',platform:'neutral',external:['cloudflare:workers'],write:false});
const persist=await mkdtemp(join(tmpdir(),'sodi-do-test-'));
const options=convertV4MiniflareOptions({name:"sodi-storage-test",modules:true,script:result.outputFiles[0].text,compatibilityDate:'2026-09-01',durableObjects:{STORE:{className:'StoreTest',useSQLite:true}},durableObjectsPersist:persist});
options.resourcePersistencePath=persist;
let mf=new Miniflare(options);
async function call(method,...args) {
  const res=await mf.dispatchFetch('http://local.test/',{method:'POST',body:JSON.stringify({method,args})});
  const json=await res.json(); if(json.error) throw new Error(json.error); return json.result;
}
try {
  assert.equal(await call('get','missing'),null);
  const first=await call('put','event','old',{onlyIf:{etagDoesNotMatch:'*'}});
  assert.equal(await call('put','event','duplicate',{onlyIf:{etagDoesNotMatch:'*'}}),null);
  const concurrent=await Promise.all(Array.from({length:12},(_,n)=>call('put','event',String(n),{onlyIf:{etagMatches:first.etag}})));
  assert.equal(concurrent.filter(Boolean).length,1,'CAS must have exactly one winner');
  assert.equal(await call('deleteIfMatch','event',first.etag),false);
  const latest=await call('get','event');
  assert.ok(latest);
  assert.equal(await call('deleteIfMatch','event',latest.etag),true);
  assert.equal(await call('get','event'),null);
  console.log('PASS create-only, concurrent CAS, atomic conditional delete');
  const unicode='á🙂'.repeat(1048576); // 6MiB, UTF-8 sequences cross 1MiB chunk boundaries.
  await call('put','large',unicode);
  assert.equal((await call('get','large')).text,unicode);
  await call('put','exact','x'.repeat(8*1024*1024));
  assert.equal((await call('get','exact')).text.length,8*1024*1024);
  await assert.rejects(call('put','exact','x'.repeat(8*1024*1024+1)),/exceeds 8MiB/);
  assert.equal((await call('get','exact')).text.length,8*1024*1024,'rejected replacement must preserve old bytes');
  console.log('PASS UTF-8 chunking, exact 8MiB, oversized overwrite preserves old data');
  for(let n=0;n<5;n++) await call('put',`prefix/${n}`,String(n));
  const seen=[];let cursor;
  do {const page=await call('list',{prefix:'prefix/',limit:2,cursor});seen.push(...page.objects.map(x=>x.key));cursor=page.truncated?page.cursor:undefined;} while(cursor);
  assert.deepEqual(seen,Array.from({length:5},(_,n)=>`prefix/${n}`));
  await mf.dispose(); mf=new Miniflare(options);
  assert.equal((await call('get','large')).text,unicode);
  await call('put','large','small');
  assert.equal((await call('get','large')).text,'small');
  console.log('PASS pagination, restart persistence, shrinking replacement');
} finally {await mf.dispose();await rm(persist,{recursive:true,force:true});}
