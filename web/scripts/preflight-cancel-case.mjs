// Calls the real application's read/recall modules, never its write module.
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import assert from 'node:assert/strict';
registerHooks({resolve(specifier,context,next){
 if(context.parentURL?.includes('/web/src/')&&specifier.startsWith('.')&&!path.extname(specifier))return next(specifier+'.ts',context);
 return next(specifier,context);
}});
if(!process.env.CASEWAKE_ENV_FILE)throw new Error('CASEWAKE_ENV_FILE required');
const config=Object.fromEntries(fs.readFileSync(process.env.CASEWAKE_ENV_FILE,'utf8').split(/\r?\n/).filter(x=>/^[A-Z_]+=/.test(x)).map(x=>{const i=x.indexOf('=');return[x.slice(0,i),x.slice(i+1).trim().replace(/^['"]|['"]$/g,'')]}));
for(const [k,v]of Object.entries(config))if(!process.env[k])process.env[k]=v;
const {getTatumTransaction}=await import('../src/lib/tatum.ts');
const {recallAllPrecedents}=await import('../src/lib/unified-recall.ts');
const sourceDigest='8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA';
const secondDigest='HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV';
const observed=[];
for(const digest of [sourceDigest,secondDigest]){
 const tx=await getTatumTransaction(digest);observed.push(tx);
 assert.equal(tx.outcome,'failed');
 assert.equal(tx.packageId,'0xcaf6ba059d539a97646d47f0b9ddf843e138d215e2a12ca1f4585d386f7aec3a');
 console.log('APP_LOOKUP',JSON.stringify({digest,outcome:tx.outcome,checkpoint:tx.checkpoint,packageId:tx.packageId,fingerprint:tx.fingerprint}));
}
const result={checkedAt:new Date().toISOString(),readOnly:true,observed,
 compatibleFingerprint:observed[0].fingerprint===observed[1].fingerprint,
 recallBefore:null,walrusWrites:0};
try{
 const recall=await recallAllPrecedents(observed[1]);
 result.recallBefore={walrusHitsExamined:recall.walrusHitsExamined,eligibleCases:recall.candidates.filter(c=>c.verdict==='eligible-for-review').length,
  sourceCasePresent:recall.candidates.some(c=>c.record.digest===sourceDigest),observedPrecedents:recall.observedPrecedents.length,runbooks:recall.simulationRunbooks.length};
 console.log('REAL_WALRUS_BASELINE',JSON.stringify(result.recallBefore));
}catch(e){result.recallBefore={status:'unavailable',errorClass:e.name};console.log('RECALL_UNAVAILABLE',e.name);}
const file=path.resolve(import.meta.dirname,'../../evidence/real-case/app-preflight.json');
fs.writeFileSync(file,JSON.stringify(result,null,2)+'\n');
