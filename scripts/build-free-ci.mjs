import fs from 'node:fs';
import path from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {RECORD,validateCI,assertFreeConfig,makeRecord} from './free-ci-contract.mjs';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',timeout:30000}).trim();
const head=git('rev-parse','HEAD');
validateCI(process.env,head,git('ls-remote','origin','refs/heads/main').split(/\s/)[0]);
assertFreeConfig();git('diff','--exit-code','HEAD');
// Remove stale receipts before starting; a failed build can never reuse one.
fs.rmSync(RECORD,{force:true});
const built=spawnSync('npm',['run','cf:build'],{stdio:'inherit',env:process.env});
if(built.status!==0)process.exit(built.status??1);
git('diff','--exit-code','HEAD');
fs.mkdirSync(path.dirname(RECORD),{recursive:true});
fs.writeFileSync(RECORD,JSON.stringify(makeRecord('.',process.env,head),null,2)+'\n');
console.log(`Recorded SODI production artifact for ${head} and current Cloudflare build UUID`);
