// Public GETs; exact known secret values are scanned in memory and never printed or stored.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const base=process.env.ROUSE_ACCEPTANCE_BASE||'https://casewake.vercel.app';
const output=process.env.ROUSE_ASSET_OUTPUT||'evidence/phase25/public-assets.json';
const secrets=['TATUM_API_KEY','MEMWAL_PRIVATE_KEY','WORKSPACE_WRITE_KEY'].map(n=>process.env[n]).filter(v=>typeof v==='string'&&v.length>8);assert.equal(secrets.length,3,'Private local environment is required; values are never logged.');
const landing=await fetch(base,{signal:AbortSignal.timeout(60000)});assert.equal(landing.status,200);const html=await landing.text();
const urls=[...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>new URL(m[1].replaceAll('&amp;','&'),base)).filter(u=>u.origin===new URL(base).origin).map(u=>u.href))].slice(0,16);assert.ok(urls.length>0);
const results=await Promise.allSettled(urls.map(async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(60000)});assert.equal(r.status,200,url);const body=await r.text();return {url,bytes:Buffer.byteLength(body),sha256:createHash('sha256').update(body).digest('hex'),containsKnownSecret:secrets.some(s=>body.includes(s))};}));
for(const r of results)if(r.status==='rejected')throw r.reason;const assets=results.map(r=>r.value);assert.ok(!assets.some(x=>x.containsKnownSecret),'A known secret value was found in a public asset; no asset content is saved.');assert.ok(!secrets.some(s=>html.includes(s)),'A known secret value was found in public HTML; no content is saved.');
const blocked=[];for(const path of ['/.env.local','/.git/config','/_next/server/app/api/remember/route.js']){const r=await fetch(base+path,{signal:AbortSignal.timeout(60000)});blocked.push({path,status:r.status});assert.equal(r.status,404,path);}
fs.writeFileSync(output,JSON.stringify({passed:true,checkedAt:new Date().toISOString(),base,assets,blocked,secretValuesPrinted:false,scope:'Bounded exact-value checks in fetched public HTML/JS and three private-path probes; not a history scan or exhaustive DLP/security certification',memoryWrites:0},null,2)+'\n');console.log('PASS',assets.length,'public scripts without known raw secrets;3 private paths404; zero writes.');
