import {readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import assert from 'node:assert/strict';

const buildDir=process.env.SODI_BODA_BUILD_DIR || '.next-boda-qa';
const manifests=[];
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isDirectory())await walk(path);else if(item.name.endsWith('.nft.json'))manifests.push(path);}}
await walk(join(buildDir,'server'));
const studioManifest=join(buildDir,'server/app/api/boda-studio/[[...path]]/route.js.nft.json');
assert.ok(manifests.includes(studioManifest),'The compiled studio API manifest must exist');
let files=0;
const forbidden=[];
for(const manifest of manifests){const trace=JSON.parse(await readFile(manifest,'utf8'));files+=trace.files.length;for(const file of trace.files){if(/(?:^|[/\\])(?:\.boda-studio-private|\.codex-tmp|artifacts)(?:[/\\]|$)/.test(file))forbidden.push({manifest,file});}}
assert.equal(forbidden.length,0,'Local event files and QA artifacts must never enter a deployment trace');
const result={checkedAt:new Date().toISOString(),buildDir,manifests:manifests.length,tracedReferences:files,studioReferences:JSON.parse(await readFile(studioManifest,'utf8')).files.length,privateOrQaFiles:forbidden.length,result:'PASS',scope:'Compiled output tracing; does not verify a production deployment'};
await mkdir('artifacts/bodas-system-2026-09-08',{recursive:true});
await writeFile('artifacts/bodas-system-2026-09-08/build-verification.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
