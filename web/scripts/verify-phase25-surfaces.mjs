// Public page GETs; GitHub metadata is independently recorded via its connected tools.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='https://casewake.vercel.app',out=new URL('../../evidence/phase25/',import.meta.url);
const all=await Promise.allSettled(['/','/workspace','/cases','/journal/casewake','/proof/splitcoins'].map(async path=>{
 const r=await fetch(base+path,{signal:AbortSignal.timeout(60000)}),text=await r.text();assert.equal(r.status,200,path);
 return {url:base+path,status:r.status,title:text.match(/<title>(.*?)<\/title>/s)?.[1],sha256:createHash('sha256').update(text).digest('hex'),reviewedCaseLimit:path.includes('/journal/')?text.includes('application change remains unknown'):undefined,historicalLabel:path.includes('/journal/')?text.includes('as of November 4, 2026'):undefined};
}));
for(const r of all)if(r.status==='rejected')throw r.reason;
const surfaces=all.map(x=>x.value);assert.ok(surfaces.every(x=>x.reviewedCaseLimit!==false&&x.historicalLabel!==false));
const repository=JSON.parse(fs.readFileSync(new URL('repository.json',out),'utf8'));assert.ok(repository.repository.public&&repository.repository.releaseRelativeToDefault.aheadBy>0);
fs.writeFileSync(new URL('surfaces.json',out),JSON.stringify({passed:true,checkedAt:new Date().toISOString(),surfaces,repository:repository.repository,sourceLink:repository.sourceLink,sourceFile:repository.sourceFile,repositoryCheckedAt:repository.checkedAt,repositoryMethod:repository.method,memoryWrites:0},null,2)+'\n');
console.log('PASS5 public pages, article limits and separately checked public/pinned source; no publication or writes.');
