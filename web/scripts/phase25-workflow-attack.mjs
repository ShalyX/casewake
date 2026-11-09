// Actual frontend with controlled service responses. Every submission is blocked.
export default async function phase25WorkflowAttack(page){
 const base='http://127.0.0.1:4242';const checks=[],errors=[];let catalogMode='bad',searchMode='ok',jobMode='conflict',writes=0,jobReads=0;
 const source='4'.repeat(43),job='22222222-2222-4222-8222-222222222222',blob='CONTROLLED-SERVER-VERIFIED-BLOB';
 const row={id:'fixture',blobId:blob,namespace:'fixture',sourceDigest:source,network:'sui-mainnet',title:'CONTROLLED QA reviewed procedure',diagnosis:'CONTROLLED QA case context',procedure:'CONTROLLED QA inspect exact authenticated effects before considering a retry.',errorText:'MoveAbort',packageId:null,sdkVersion:null,reviewer:'QA fixture',reviewedAt:'2026-11-09T00:00:00Z',evidenceUrl:'https://github.com/example/fixture',evidenceScope:'human-reviewed-engineering-artifact'};
 const meta={namespace:'fixture',checkedAt:'2026-11-09T00:00:00Z',coverageComplete:true,completedRecordsExamined:1,recordsNotRetrieved:0};
 const check=(v,m)=>{if(!v)throw new Error(m);checks.push(m);};
 await page.setViewportSize({width:390,height:844});await page.unrouteAll();page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const b=document.createElement('p');b.textContent='CONTROLLED QA · simulated services · no Mainnet writes';b.style.cssText='padding:8px;background:#f5f5ef;color:#0e1212;font:12px monospace';document.body.prepend(b);}));
 await page.route('**/api/**',async r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/api/status')return r.fulfill({json:{tatumConfigured:true,walrusConfigured:true,reviewerWritesEnabled:true,network:'sui-mainnet'}});
  if(path==='/api/memories')return r.fulfill({json:{allStoredMemories:13,namespace:'fixture',complete:true}});
  if(path==='/api/cases')return r.fulfill({json:catalogMode==='bad'?{}:{...meta,cases:[row]}});
  if(path==='/api/cases/search'){
   if(searchMode==='html')return r.fulfill({status:502,contentType:'text/html',body:'<html>CONTROLLED proxy failure</html>'});
   if(searchMode==='slow')await new Promise(resolve=>setTimeout(resolve,800));
   return r.fulfill({json:{...meta,results:[{record:row,matchedTerms:['moveabort'],relationship:'related-only'}]}});
  }
  if(path==='/api/memory-job'){
   jobReads++;
   if(jobMode==='conflict')return r.fulfill({status:409,json:{error:'CONTROLLED unexplained conflict'}});
   if(jobMode==='bad-proof')return r.fulfill({json:{proof:{blobId:{wrong:'type'},jobId:job,namespace:'fixture'}}});
   if(jobMode==='pending')return r.fulfill({status:202,json:{pending:{jobId:job,status:'identity-check-pending'}}});
   if(jobMode==='failed')return r.fulfill({status:409,json:{code:'storage-job-failed',error:'CONTROLLED known failed job'}});
   return r.fulfill({json:{proof:{blobId:blob,jobId:job,namespace:'fixture',status:'mainnet-stored'}}});
  }
  writes++;return r.abort();
 });
 await page.goto(base+'/cases');await page.locator('.library-results .inline-error').waitFor();check(await page.locator('.library-empty').count()===0,'Malformed catalogue is unavailable, never a verified empty library');
 catalogMode='ok';await page.getByRole('button',{name:'Retry case discovery',exact:true}).click();await page.locator('.library-card').waitFor();check(await page.locator('.library-results').evaluate(e=>e===document.activeElement),'Malformed-read retry retains stable focus');
 const injection='<img src=x onerror="window.__rouseAttack=1"> MoveAbort';await page.locator('#case-query').fill(injection);await page.getByRole('button',{name:'Search reviewed cases',exact:false}).click();await page.locator('.submitted-query').waitFor();await page.locator('.submitted-query summary').click();
 check(await page.locator('.submitted-query pre').innerText()===injection,'Submitted error text is rendered literally');check(await page.evaluate(()=>window.__rouseAttack!==1)&&await page.locator('.submitted-query img').count()===0,'Error-text markup never executes or creates an image');
 searchMode='html';await page.getByRole('button',{name:'Search reviewed cases',exact:false}).click();await page.locator('.library-results .inline-error').waitFor();check(await page.locator('.library-card,.library-empty').count()===0,'HTML gateway failure clears stale cases without a no-match claim');check(!(await page.locator('.inline-error').innerText()).includes('Unexpected token'),'Malformed response has a usable read-error message');
 searchMode='slow';await page.getByRole('button',{name:'Retry case discovery',exact:true}).click();await page.getByRole('link',{name:'Open workspace',exact:false}).first().click();await page.waitForURL('**/workspace');await page.waitForTimeout(900);await page.getByRole('link',{name:'Reviewed cases',exact:true}).click();await page.locator('.library-card').waitFor();check(await page.locator('.submitted-query').count()===0,'Late search response cannot populate a remounted library');
 await page.goto(base+'/workspace');await page.evaluate(({source,job})=>sessionStorage.setItem('casewake-storage-v1',JSON.stringify({sourceDigest:source,kind:'resolution',requestId:'11111111-1111-4111-8111-111111111111',jobId:job,namespace:'fixture',receipt:{blobId:'CONTROLLED-FORGED-CACHE',jobId:job,namespace:'fixture',status:'mainnet-stored'}})),{source,job});await page.reload();await page.getByText('CONTROLLED-FORGED-CACHE',{exact:true}).waitFor();
 check(await page.getByRole('heading',{name:'Saved receipt requires server verification.',exact:true}).count()===1,'Altered cache is not Mainnet completion proof');
 const verify=page.getByRole('button',{name:'Verify saved receipt',exact:false});check(await verify.isDisabled(),'Reverification requires reviewer access');check(await page.getByPlaceholder('Digest of a comparable later failed incident').count()===0,'Unverified cache cannot enter exact-blob recurrence');
 await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('CONTROLLED-QA-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);
 await verify.click();await page.getByRole('alert').filter({hasText:'unexplained conflict'}).waitFor();check(await page.getByRole('button',{name:'Dismiss failed storage job',exact:true}).count()===0,'An unexplained409 cannot discard an uncertain job');
 jobMode='bad-proof';await verify.click();await page.getByRole('alert').filter({hasText:'invalid receipt'}).waitFor();check(await page.getByRole('heading',{name:'Saved receipt requires server verification.',exact:true}).count()===1,'Malformed server receipt cannot claim completion or crash');
 jobMode='pending';await verify.click();await page.waitForFunction(()=>!document.querySelector('.storage-section button')?.disabled);check(await page.getByRole('heading',{name:'Saved receipt requires server verification.',exact:true}).count()===1,'Identity-check pending is not completion');
 jobMode='done';await verify.click();await page.getByText(blob,{exact:true}).waitFor();check(await page.getByRole('heading',{name:'Mainnet write confirmed. Recall pending verification.',exact:true}).count()===1,'Only the verified server receipt replaces cached metadata');
 await page.reload();await page.getByRole('heading',{name:'Saved receipt requires server verification.',exact:true}).waitFor();check(await page.getByPlaceholder('Enter the private workspace key').inputValue()==='','Reviewer credential never survives reload');check(await page.getByText(blob,{exact:true}).count()===1,'Receipt metadata survives reload with an honest verification boundary');
 await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('CONTROLLED-QA-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);jobMode='failed';await verify.click();await page.getByRole('button',{name:'Dismiss failed storage job',exact:true}).waitFor();check(await page.getByText('STORAGE JOB FAILED · NO COMPLETED MEMORY',{exact:true}).count()===1,'Only a coded confirmed failure enables safe dismissal');await page.getByRole('button',{name:'Dismiss failed storage job',exact:true}).click();
 check(await page.locator('.storage-section').count()===0,'Confirmed failed job dismisses without another write');check(writes===0,'No mutation endpoint was called');check(errors.length===0,'No client JavaScript errors');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Adversarial mobile states have no horizontal overflow');
 await page.screenshot({path:'evidence/phase25/controlled-adversarial-mobile.png',fullPage:true});await page.evaluate(()=>sessionStorage.clear());await page.unrouteAll();return {passed:true,checks,jobReads,unexpectedMutationRequests:writes,errors,memoryWrites:0,scope:'Actual UI with labelled controlled backend/cache attacks; no Mainnet submissions'};
}
