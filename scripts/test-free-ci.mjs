import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {ACCOUNT,validateCI,makeRecord,verifyRecord,deploymentEnvironment} from './free-ci-contract.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'sodi-ci-contract-'));
const head='a'.repeat(40), env={WORKERS_CI:'1',WORKERS_CI_BUILD_UUID:'fixture-build-uuid',WORKERS_CI_BRANCH:'main',WORKERS_CI_COMMIT_SHA:head,CLOUDFLARE_ACCOUNT_ID:ACCOUNT,NEXT_PUBLIC_SITE_URL:'https://sodi.com.ar',SODI_RELEASE_TARGET:'production',CLOUDFLARE_API_TOKEN:'synthetic-test-token'};
let checks=0;
function rejects(fn,pattern){assert.throws(fn,pattern);checks++;}
try {
 fs.mkdirSync(path.join(root,'.open-next/assets'),{recursive:true});fs.mkdirSync(path.join(root,'cf'));
 fs.copyFileSync('wrangler.jsonc',path.join(root,'wrangler.jsonc'));
 for(const file of ['package.json','package-lock.json','open-next.config.ts','cf/free-worker.ts','.open-next/worker.js','.open-next/assets/index.html'])fs.writeFileSync(path.join(root,file),'synthetic '+file);
 const receipt=makeRecord(root,env,head);verifyRecord(root,env,head,receipt);checks++;
 for(const changed of [{WORKERS_CI:'0'},{WORKERS_CI_BUILD_UUID:''},{WORKERS_CI_BRANCH:'feature'},{WORKERS_CI_COMMIT_SHA:'b'.repeat(40)},{CLOUDFLARE_ACCOUNT_ID:'old-paid-account'},{SODI_RELEASE_TARGET:'preview'},{NEXT_PUBLIC_SITE_URL:'https://example.com'}])rejects(()=>validateCI({...env,...changed},head),/required|revision/);
 rejects(()=>validateCI(env,head,'b'.repeat(40)),/Stale/);
 rejects(()=>verifyRecord(root,{...env,WORKERS_CI_BUILD_UUID:'other-build'},head,receipt),/UUID/);
 fs.appendFileSync(path.join(root,'.open-next/assets/index.html'),'tampered');rejects(()=>verifyRecord(root,env,head,receipt),/changed/);
 fs.writeFileSync(path.join(root,'.open-next/assets/index.html'),'synthetic .open-next/assets/index.html');
 fs.appendFileSync(path.join(root,'cf/free-worker.ts'),'tampered');rejects(()=>verifyRecord(root,env,head,receipt),/changed/);
 fs.writeFileSync(path.join(root,'cf/free-worker.ts'),'synthetic cf/free-worker.ts');
 const config=fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8');
 fs.writeFileSync(path.join(root,'wrangler.jsonc'),config.replace('"workers_dev": false','"workers_dev": true'));rejects(()=>verifyRecord(root,env,head,receipt),/config changed/);fs.writeFileSync(path.join(root,'wrangler.jsonc'),config);
 fs.symlinkSync('/tmp',path.join(root,'.open-next/assets/escape'));rejects(()=>makeRecord(root,env,head),/symlink/);fs.unlinkSync(path.join(root,'.open-next/assets/escape'));
 const manual=deploymentEnvironment({...env,CLOUDFLARE_API_KEY:'synthetic',CLOUDFLARE_EMAIL:'fixture'},false);
 assert.equal(manual.CLOUDFLARE_API_TOKEN,undefined);assert.equal(manual.CLOUDFLARE_API_KEY,undefined);assert.equal(manual.XDG_CONFIG_HOME,path.join(os.homedir(),'.config/wrangler-aivortex-free'));checks++;
 assert.equal(deploymentEnvironment(env,true).CLOUDFLARE_API_TOKEN,env.CLOUDFLARE_API_TOKEN);assert.equal(deploymentEnvironment(env,true).OPEN_NEXT_DEPLOY,'true');checks++;
 rejects(()=>deploymentEnvironment({...env,CLOUDFLARE_API_TOKEN:''},true),/token missing/);
 console.log(`SODI Free CI guard PASS (${checks} cases; fake output/env only, no deploy or credentials)`);
} finally {fs.rmSync(root,{recursive:true,force:true});}
