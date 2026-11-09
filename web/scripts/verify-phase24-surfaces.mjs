// Public GETs and GitHub metadata only. No credentials, storage or publication.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='https://casewake.vercel.app',out=new URL('../../evidence/phase24/',import.meta.url);
const paths=['/','/workspace','/cases','/journal/casewake','/proof/splitcoins'];
const all=await Promise.allSettled(paths.map(async path=>{const r=await fetch(base+path,{signal:AbortSignal.timeout(60000)});const text=await r.text();assert.equal(r.status,200,path);return {url:base+path,status:r.status,title:text.match(/<title>(.*?)<\/title>/s)?.[1],sha256:createHash('sha256').update(text).digest('hex'),reviewedCaseLimit:path.includes('/journal/')?text.includes('application change remains unknown'):undefined,historicalLabel:path.includes('/journal/')?text.includes('as of November 4, 2026'):undefined};}));
for(const result of all)if(result.status==='rejected')throw result.reason;
const surfaces=all.map(x=>x.value);assert.ok(surfaces.every(x=>x.reviewedCaseLimit!==false&&x.historicalLabel!==false));
const github=await fetch('https://api.github.com/repos/ShalyX/casewake',{headers:{'user-agent':'Rouse-Proof-Refresh'},signal:AbortSignal.timeout(30000)});assert.equal(github.status,200);const repo=await github.json();assert.equal(repo.private,false);
const compareResponse=await fetch('https://api.github.com/repos/ShalyX/casewake/compare/master...e4c8bcc36a8a2fdc1656467e1e776602bf34169c',{headers:{'user-agent':'Rouse-Proof-Refresh'},signal:AbortSignal.timeout(30000)});assert.equal(compareResponse.status,200);const compare=await compareResponse.json();
const result={passed:true,checkedAt:new Date().toISOString(),surfaces,repository:{url:repo.html_url,public:!repo.private,defaultBranch:repo.default_branch,releaseRelativeToDefault:{status:compare.status,aheadBy:compare.ahead_by,behindBy:compare.behind_by}},sourceLink:'https://github.com/ShalyX/casewake/tree/e4c8bcc36a8a2fdc1656467e1e776602bf34169c',memoryWrites:0};fs.writeFileSync(new URL('surfaces.json',out),JSON.stringify(result,null,2)+'\n');console.log('PASS:5 public surfaces, historical limits, public repository and explicit release/default-branch difference.');
