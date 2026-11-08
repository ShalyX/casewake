export default async function phase22MotionQA(page){
 const browser=page.context().browser(),base='http://127.0.0.1:4242';const runs=[];
 for(const [viewport,width,height]of[['desktop',1440,900],['mobile',390,844]])for(const mode of ['no-preference','reduce']){
  const label=viewport+'-'+(mode==='reduce'?'reduced':'normal');
  const ctx=await browser.newContext({viewport:{width,height},reducedMotion:mode,isMobile:viewport==='mobile',hasTouch:viewport==='mobile',recordVideo:{dir:'evidence/phase22/recordings/'+label,size:{width,height}}});
  const p=await ctx.newPage();await p.bringToFront();const video=p.video();const checks=[],errors=[];let writes=0,jobDone=false,outcome='failed',searchFails=false;const marks=[];
  const check=(v,m)=>{if(!v)throw new Error(label+': '+m);checks.push(m);};
  const source='4'.repeat(43),second='5'.repeat(43),job='22222222-2222-4222-8222-222222222222',blob='CONTROLLED-QA-fixture-blob-not-Mainnet';
  const tx=digest=>({digest,network:'sui-mainnet',source:'CONTROLLED QA service fixture',outcome,observedAt:'2026-11-08T12:00:00Z',errorText:outcome==='failed'?'CONTROLLED QA MoveAbort':null,checkpoint:'342680926',fingerprint:'fixture-class',packageId:null});
  const record={id:'fixture-reviewed-case',digest:source,diagnosis:'CONTROLLED QA reviewed resolution. Reconcile an earlier operation.',resolutionSteps:'CONTROLLED QA: inspect the exact prior operation and its authenticated evidence before retrying. This is a simulated service response, not a real Mainnet resolution.',evidenceUrl:'https://github.com/example/qa/commit/'+'a'.repeat(40),reviewer:'QA Fixture Reviewer',verifiedAt:'2026-11-08T12:00:00Z',errorText:'CONTROLLED QA MoveAbort',sdkVersion:null};
  const candidate={record,verdict:'eligible-for-review',distance:0,reasons:[],matchReasons:['CONTROLLED QA matching network.','Distinct source execution.'],walrusReceipt:{blobId:blob,namespace:'qa-fixture',verifiedThrough:'signed-walrus-recall'}};
  const libraryRecord={id:blob,blobId:blob,namespace:'qa-fixture',sourceDigest:source,network:'sui-mainnet',title:record.diagnosis,diagnosis:record.diagnosis,procedure:record.resolutionSteps,errorText:record.errorText,packageId:null,sdkVersion:null,reviewer:record.reviewer,reviewedAt:record.verifiedAt,evidenceUrl:record.evidenceUrl,evidenceScope:'human-reviewed-engineering-artifact'};
  const catalog={cases:[libraryRecord],namespace:'qa-fixture',checkedAt:'2026-11-08T12:00:00Z',coverageComplete:false,completedRecordsExamined:2,recordsNotRetrieved:1};
  await p.addInitScript(()=>{
   window.__qaEvents=[];window.__qaStatuses=[];
   for(const type of ['animationstart','animationend'])document.addEventListener(type,e=>{if(e.animationName==='rouse-result'){const s=getComputedStyle(e.target);window.__qaEvents.push({type,t:performance.now(),name:e.animationName,elapsed:e.elapsedTime,duration:s.animationDuration,transform:s.transform,opacity:s.opacity});}},true);
   document.addEventListener('DOMContentLoaded',()=>{
    const badge=document.createElement('div');badge.id='qa-fixture-label';badge.setAttribute('aria-hidden','true');badge.textContent='CONTROLLED QA · simulated service responses · no Mainnet writes';badge.style.cssText='position:fixed;bottom:8px;right:12px;z-index:9999;max-width:calc(100vw - 24px);padding:6px 10px;background:#f5f5ef;color:#0e1212;font:11px/1.4 monospace;pointer-events:none';document.body.append(badge);
    let last='';new MutationObserver(()=>{const text=document.querySelector('.sr-only[role=status],.library-status')?.textContent||'';if(text!==last){window.__qaStatuses.push({t:performance.now(),text});last=text;}}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
   });
  });
  p.on('pageerror',e=>errors.push(e.message));
  const stamp=async name=>{marks.push({name,at:Date.now()});await p.evaluate(name=>window.__qaEvents.push({type:name,t:performance.now()}),name);};
  const hold=ms=>p.waitForTimeout(ms);
  await ctx.route('**/api/**',async r=>{
   const pathname=new URL(r.request().url()).pathname;const body=r.request().method()==='POST'?r.request().postDataJSON():{};let data={},status=200;
   if(pathname==='/api/status')data={tatumConfigured:true,walrusConfigured:true,reviewerWritesEnabled:true,publicInspectionEnabled:true,network:'sui-mainnet'};
   else if(pathname==='/api/memories')data={allStoredMemories:1,namespace:'qa-fixture',complete:true};
   else if(pathname==='/api/transaction'){await hold(900);await stamp('transaction-response');data={transaction:tx(body.digest)};}
   else if(pathname==='/api/recall'){await hold(800);await stamp('recall-response');data={candidates:[candidate],observedPrecedents:[],simulationRunbooks:[],recallDegraded:false,reason:'CONTROLLED QA reviewed candidate'};}
   else if(pathname==='/api/remember'){
    writes++;check(body.verified===true&&body.confirmedCausalLink===true,'Submission carries both explicit attestations');await hold(1000);data={pending:{jobId:job,namespace:'qa-fixture'}};
   }else if(pathname==='/api/memory-job'){await hold(400);data=jobDone?{proof:{jobId:job,blobId:blob,namespace:'qa-fixture',status:'mainnet-stored'}}:{pending:{jobId:job,status:'running'}};}
   else if(pathname==='/api/verify-recall'){await hold(700);data={secondTransaction:{...tx(second),outcome:'failed'},matchedCandidate:candidate,note:'CONTROLLED QA exact-blob result'};}
   else if(pathname==='/api/cases'){await hold(400);data=catalog;}
   else if(pathname==='/api/cases/search'){
    await hold(600);if(searchFails){status=503;data={error:'CONTROLLED QA search unavailable. Retry the read.'};}
    else data={...catalog,cases:undefined,results:String(body.query).includes('CORS')?[]:[{record:libraryRecord,matchedTerms:['moveabort'],relationship:'related-only'}]};
   }else throw new Error('Unexpected controlled API '+pathname);
   return r.fulfill({status,json:data});
  });
  let workspace,library;
  try{
   await p.goto(base+'/workspace');await p.evaluate(()=>document.fonts.ready);await hold(500);
   await p.locator('#digest').fill(source);await p.getByRole('button',{name:'Inspect transaction',exact:false}).click();await hold(150);
   check(await p.getByRole('button',{name:'Reading…',exact:false}).evaluate(e=>e===document.activeElement),'Transaction read preserves initiator focus');
   check(await p.locator('.match-card').count()===0,'No candidate while transaction is pending');
   await p.locator('.match-card').waitFor();await hold(450);
   await p.locator('.match-card summary').focus();await p.keyboard.press('Enter');check(await p.locator('.match-card summary').evaluate(e=>e===document.activeElement),'Provenance toggle keeps keyboard focus');
   check(await p.locator('.exact-blob code').isVisible(),'Essential blob stays outside disclosure');await hold(400);
   await p.locator('.access-disclosure').evaluate(e=>e.open=true);await p.getByPlaceholder('Enter the private workspace key').fill('qa-fixture-key');await p.locator('.access-disclosure').evaluate(e=>e.open=false);
   await p.getByRole('button',{name:'Record a reviewed resolution',exact:false}).click();await p.locator('#review-diagnosis').fill('CONTROLLED QA: prior authenticated operation was already complete.');await p.locator('#review-steps').fill(record.resolutionSteps);await p.locator('#review-url').fill(record.evidenceUrl);await p.locator('#review-change').fill('CONTROLLED QA: reconcile the exact operation before issuing another retry.');await p.locator('#review-name').fill(record.reviewer);
   check(await p.getByRole('button',{name:'Verify artifact, then store',exact:false}).isDisabled(),'No submission without human approval');check(writes===0,'No pre-approval write request');
   await p.locator('.editor-panel input[type=checkbox]').nth(0).check();await p.locator('.editor-panel input[type=checkbox]').nth(1).check();await p.getByRole('button',{name:'Verify artifact, then store',exact:false}).click();
   await p.getByText('STORAGE JOB ACCEPTED · NOT YET A COMPLETED MEMORY',{exact:true}).waitFor();await p.waitForFunction(()=>document.querySelector('.sr-only[role=status]')?.textContent==='Storage accepted; completion pending.');
   check(await p.locator('.storage-section').evaluate(e=>e===document.activeElement),'Accepted status receives focus from replaced editor');check(!(await p.locator('.storage-section').innerText()).includes(blob),'Pending storage has no completed blob');await hold(900);
   jobDone=true;await p.getByRole('button',{name:'Check storage status',exact:false}).click();await p.locator('.storage-section code').filter({hasText:blob}).waitFor();await hold(500);
   check(await p.locator('.sr-only[role=status]').innerText()==='Memory stored.','Completion announced only after actual result state');
   outcome='succeeded';await p.locator('#digest').fill(second);await p.getByRole('button',{name:'Inspect transaction',exact:false}).click();await p.getByText('Successful execution.',{exact:true}).waitFor();
   check((await p.locator('.sr-only[role=status]').innerText()).startsWith('Transaction succeeded.'),'New lookup announces its result rather than old receipt');check(await p.locator('.storage-section code').filter({hasText:blob}).isVisible(),'Completed receipt survives another lookup');await hold(500);
   await p.getByPlaceholder('Digest of a comparable later failed incident').fill(second);await p.getByRole('button',{name:'Verify exact-blob recurrence',exact:false}).click();await p.getByText('Human-reviewed resolution recalled across incidents.',{exact:true}).waitFor();await hold(500);
   workspace=await p.evaluate(()=>({events:window.__qaEvents,statuses:window.__qaStatuses,activeAnimations:document.getAnimations().length}));
   const starts=workspace.events.filter(e=>e.type==='animationstart');check(mode==='reduce'?starts.length===0:starts.length>=1,'Normal/reduced reveal follows preference');
   if(mode!=='reduce')check(starts.every(e=>e.duration==='0.18s'),'Result reveal configured at180ms');
   check(workspace.statuses.filter(s=>s.text).every(s=>s.text.length<160&&!s.text.includes('22222222')),'Live announcements are concise and do not read job IDs');
   await p.screenshot({path:'evidence/phase22/motion-'+label+'-workspace.png'});
   await p.goto(base+'/cases');await p.locator('.library-card').waitFor();await hold(400);
   await p.locator('#case-query').fill('MoveAbort');const search=p.getByRole('button',{name:'Search reviewed cases',exact:false});await search.click();await hold(100);check(await search.evaluate(e=>e===document.activeElement),'Search retains focus while reading');check(await p.locator('.library-card').count()===0,'Search clears stale cards before response');await p.locator('.library-card').waitFor();check(await search.evaluate(e=>e===document.activeElement),'Search retains focus after response');await hold(400);
   await p.locator('.submitted-query summary').focus();await p.keyboard.press('Enter');check(await p.locator('.submitted-query pre').innerText()==='MoveAbort','Results retain explicit submitted-query context');await hold(300);
   await p.locator('#case-query').fill('browser CORS');await search.click();await p.getByRole('heading',{name:'No related reviewed cases found.',exact:true}).waitFor();await hold(400);
   searchFails=true;await p.locator('#case-query').fill('MoveAbort');await search.click();await p.getByText('CONTROLLED QA search unavailable. Retry the read.',{exact:true}).waitFor();check(await p.locator('.library-empty').count()===0,'Outage is distinct from no result');await hold(400);
   searchFails=false;await p.getByRole('button',{name:'Retry case discovery',exact:true}).click();check(await p.locator('.library-results').evaluate(e=>e===document.activeElement),'Retry hands focus to stable result region');await p.locator('.library-card').waitFor();check(await p.locator('.library-results').evaluate(e=>e===document.activeElement),'Retry completion does not steal focus');await hold(450);
   library=await p.evaluate(()=>({events:window.__qaEvents,statuses:window.__qaStatuses,activeAnimations:document.getAnimations().length}));
   check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Library has no horizontal overflow');check(writes===1,'Exactly one controlled reviewed submission');check(errors.length===0,'No JavaScript errors');
   await p.screenshot({path:'evidence/phase22/motion-'+label+'-library.png'});
  }finally{await ctx.close();}
  runs.push({label,mode,viewport,checks,workspace,library,fixtureSubmissions:writes,realMemoryWrites:0,video:await video.path(),marks});
 }
 return {passed:true,scope:'Actual UI with clearly labelled simulated service responses; not Mainnet write proof',runs,realMemoryWrites:0};
}
