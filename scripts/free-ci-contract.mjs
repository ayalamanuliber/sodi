import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {homedir} from 'node:os';
export const ACCOUNT='835bcafab8d90df2d0fb6c9b8fa095e3';
export const RECORD='.wrangler/sodi-ci-build.json';
const CONFIG_SHA='cbcf9e026849b75a25b8327de8ca5dbcb8623f637dcfe7ceaf09fc3b945ac275';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
export function validateCI(env,head,remote=head) {
 if(env.WORKERS_CI!=='1'||!env.WORKERS_CI_BUILD_UUID)throw Error('Cloudflare Builds identity required');
 if(env.CLOUDFLARE_ACCOUNT_ID!==ACCOUNT)throw Error('Exact Free account environment required');
 if(env.WORKERS_CI_BRANCH!=='main'||!/^[a-f0-9]{40}$/.test(head)||head!==env.WORKERS_CI_COMMIT_SHA||head!==remote)throw Error('Stale or non-main CI revision');
 if(env.NEXT_PUBLIC_SITE_URL!=='https://sodi.com.ar'||env.SODI_RELEASE_TARGET!=='production')throw Error('Production build environment required');
}
export function assertFreeConfig(root='.') {
 if(hash(fs.readFileSync(path.join(root,'wrangler.jsonc')))!==CONFIG_SHA)throw Error('Free production config changed: explicit review required');
}
export function digestTree(directory) {
 const h=crypto.createHash('sha256');let files=0;
 function visit(dir){for(const name of fs.readdirSync(dir).sort()){
  const p=path.join(dir,name),st=fs.lstatSync(p);
  if(st.isSymbolicLink())throw Error('Release output contains symlink');
  if(st.isDirectory())visit(p);else {files++;h.update(path.relative(directory,p));h.update('\0');h.update(fs.readFileSync(p));h.update('\0');}
 }}visit(directory);if(!files)throw Error('Empty build output');return h.digest('hex');
}
export function runtimeDigest(root='.') {
 const h=crypto.createHash('sha256');
 for(const file of ['wrangler.jsonc','package.json','package-lock.json','open-next.config.ts']){h.update(file);h.update(fs.readFileSync(path.join(root,file)));}
 h.update(digestTree(path.join(root,'cf')));return h.digest('hex');
}
export function makeRecord(root,env,head) {
 validateCI(env,head);assertFreeConfig(root);
 for(const f of ['worker.js','assets'])if(!fs.existsSync(path.join(root,'.open-next',f)))throw Error('OpenNext build incomplete');
 return {version:1,head,buildUuid:env.WORKERS_CI_BUILD_UUID,output:digestTree(path.join(root,'.open-next')),runtime:runtimeDigest(root)};
}
export function verifyRecord(root,env,head,record) {
 validateCI(env,head);assertFreeConfig(root);
 if(record.version!==1||record.head!==head||record.buildUuid!==env.WORKERS_CI_BUILD_UUID)throw Error('Build receipt belongs to another revision or build UUID');
 if(record.output!==digestTree(path.join(root,'.open-next'))||record.runtime!==runtimeDigest(root))throw Error('Output/runtime changed since CI build');
}
export function deploymentEnvironment(input,ci) {
 const env={...input,CLOUDFLARE_ACCOUNT_ID:ACCOUNT};
 delete env.CLOUDFLARE_API_KEY;delete env.CLOUDFLARE_EMAIL;
 if(ci){
  if(!env.CLOUDFLARE_API_TOKEN)throw Error('Workers Builds API token missing');
  // Avoid OpenNext's deploy hook regenerating assets after receipt validation.
  env.OPEN_NEXT_DEPLOY='true';
 }
 else {env.XDG_CONFIG_HOME=homedir()+'/.config/wrangler-aivortex-free';delete env.CLOUDFLARE_API_TOKEN;}
 return env;
}
