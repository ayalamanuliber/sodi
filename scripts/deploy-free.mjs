import {readFile} from 'node:fs/promises';
import {spawnSync,execFileSync} from 'node:child_process';
import {RECORD,validateCI,verifyRecord,deploymentEnvironment} from './free-ci-contract.mjs';
if(process.argv.slice(2).some(x=>x!=='--dry-run'))throw Error('Only --dry-run is supported; target overrides are not allowed');
const account='835bcafab8d90df2d0fb6c9b8fa095e3';
const config=JSON.parse(await readFile('wrangler.jsonc','utf8'));
if(config.account_id!==account||config.main!=='cf/free-worker.ts'||config.name!=='sodi'||config.r2_buckets?.length||config.workers_dev!==false)throw Error('Production must use the reviewed Free-only config');
if(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_ACCOUNT_ID!==account)throw Error('Conflicting account selection; refusing deployment');
const ci=process.env.WORKERS_CI!==undefined;
if(ci) {
 const git=(...args)=>execFileSync('git',args,{encoding:'utf8',timeout:30000}).trim();
 const head=git('rev-parse','HEAD');
 verifyRecord('.',process.env,head,JSON.parse(await readFile(RECORD,'utf8')));
 git('diff','--exit-code','HEAD');
 // Last check before deploy: never let an older queued build replace current main.
 validateCI(process.env,head,git('ls-remote','origin','refs/heads/main').split(/\s/)[0]);
}
const env=deploymentEnvironment(process.env,ci);
const r=spawnSync('./node_modules/.bin/wrangler',['deploy','-c','wrangler.jsonc',...process.argv.slice(2)],{env,stdio:'inherit'});
process.exit(r.status??1);
