// Controlled browser responses, not Mainnet proof. All API calls are intercepted.
export default async function phase22StateQA(page){
  const base='http://127.0.0.1:4242';
  const source='4'.repeat(43),second='5'.repeat(43),job='22222222-2222-4222-8222-222222222222';
  const blob='fixture-completed-blob-not-mainnet';
  let outcome='failed',recall='empty',configured=true,chainError=false,delay=0,jobState='pending',verifyPass=false,writes=0,lookupRecalls=0,lastRequest=null,submissionFails=false;
  const checks=[];
  const stateAudits=[];
  async function auditState(stage){
    if(!await page.evaluate(()=>!!window.axe))await page.addScriptTag({path:'../qa-tools/node_modules/axe-core/axe.min.js'});
    await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
    const a=await page.evaluate(async()=>{const a=await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']},resultTypes:['violations']});return {violations:a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),overflow:document.documentElement.scrollWidth-innerWidth,statuses:[...document.querySelectorAll('[role=status]')].map(e=>e.textContent),width:innerWidth};});
    stateAudits.push({stage,...a});
    if(a.violations.length||a.overflow>0)throw new Error('Accessibility failure '+stage+': '+JSON.stringify(a));
  }

  const tx=digest=>({digest,network:'sui-mainnet',source:'Tatum Sui gRPC',observedAt:'2026-11-07T17:00:00Z',outcome,errorText:outcome==='failed'?'CONTROLLED FIXTURE failure':null,outcomeReason:outcome==='unknown'?'CONTROLLED FIXTURE: execution unavailable':null,fingerprint:'fixture-error',packageId:'0x'+'1'.repeat(64),checkpoint:'342680926'});
  const candidate={record:{id:'fixture-case',digest:source,diagnosis:'CONTROLLED FIXTURE reviewed diagnosis',resolutionSteps:'CONTROLLED FIXTURE procedure; this is not Mainnet evidence.',evidenceUrl:'https://github.com/example/fixture/commit/'+'a'.repeat(40),reviewer:'Fixture reviewer',verifiedAt:'2026-11-07T17:00:00Z'},verdict:'eligible-for-review',distance:0,reasons:[],matchReasons:['Same Sui network.','Different source transaction; this is not a self-match.'],walrusReceipt:{blobId:blob,namespace:'fixture',verifiedThrough:'signed-walrus-recall'}};
  const runbook={record:{id:'fixture-runbook',failure:{secondSplitMist:'20'},corrected:{secondSplitMist:'5'},safeProcedure:'CONTROLLED FIXTURE runbook',proofPath:'/proof/splitcoins',evidenceDigest:'a'.repeat(64)},matchReason:'CONTROLLED FIXTURE simulation',verdict:'simulation-tested-review-only'};
  await page.unroute('**/api/**');
  await page.route('**/api/**',async route=>{
    const request=route.request(),url=new URL(request.url());
    const body=request.method()==='POST'?request.postDataJSON():{};
    let data={},status=200;
    if(url.pathname==='/api/status')data={tatumConfigured:configured,walrusConfigured:configured,reviewerWritesEnabled:true,publicDemoMode:false,network:'sui-mainnet'};
    else if(url.pathname==='/api/memories')data={allStoredMemories:13,namespace:'fixture',complete:true};
    else if(url.pathname==='/api/transaction'){
      if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
      if(chainError){status=502;data={error:'CONTROLLED FIXTURE gateway unavailable'};}else data={transaction:tx(body.digest)};
    }else if(url.pathname==='/api/recall'){
      lookupRecalls++;
      data={transaction:tx(body.digest),candidates:recall==='reviewed'?[candidate]:[],observedPrecedents:recall==='observation'?[{case:{digest:second,errorText:'CONTROLLED FIXTURE observation',sourceUrl:'https://suivision.xyz/txblock/'+second,resolutionVerified:false},distance:0}]:[],simulationRunbooks:recall==='runbook'?[runbook]:[],recallDegraded:recall==='unavailable',reason:recall==='unavailable'?'CONTROLLED FIXTURE relayer unavailable':'CONTROLLED FIXTURE recall'};
    }else if(url.pathname==='/api/remember'||url.pathname==='/api/observations'){
      writes++;lastRequest=body;status=202;data={pending:{jobId:job,namespace:'fixture',status:'pending'}};
      if(submissionFails){status=502;data={error:'CONTROLLED FIXTURE storage response unavailable'};}
    }else if(url.pathname==='/api/memory-job'){
      if(jobState==='failed'){status=409;data={error:'CONTROLLED FIXTURE storage job failed'};}
      else if(jobState==='done')data={proof:{jobId:job,blobId:blob,namespace:'fixture',status:'mainnet-stored'}};
      else{status=202;data={pending:{jobId:job,status:'running'}};}
    }else if(url.pathname==='/api/verify-recall'){
      if(!verifyPass){status=409;data={error:'CONTROLLED FIXTURE incompatible recurrence'};}
      else data={secondTransaction:{...tx(body.secondDigest),outcome:'failed'},matchedCandidate:candidate,note:'CONTROLLED FIXTURE exact-blob verification'};
    }else{status=500;data={error:'Unexpected controlled-fixture route: '+url.pathname};}
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
  });
  async function text(){return page.locator('body').innerText();}
  async function check(name,condition){if(!condition)throw new Error('FAILED '+name);checks.push(name);if(!name.startsWith('loading:'))await auditState(name);}
  async function fresh(){await page.goto(base+'/workspace');await page.evaluate(()=>sessionStorage.clear());await page.reload();await page.waitForFunction(()=>document.querySelector('.access-content')?.textContent.includes('Guarded'));await page.locator('.access-disclosure').evaluate(e=>e.open=true);}
  async function inspect(digest=source){await page.getByLabel('Sui transaction digest',{exact:true}).fill(digest);await page.locator('.access-disclosure').evaluate(e=>e.open=false);await page.getByRole('button',{name:'Inspect transaction',exact:false}).click();await page.getByRole('heading',{name:'Chain evidence',exact:true}).waitFor();await page.locator('.memory-panel[aria-busy="false"]').waitFor();}
  await page.setViewportSize({width:1440,height:1100});
  await fresh();await check('empty workspace', (await text()).includes('The chain tells us what happened.'));
  configured=false;await fresh();await check('missing keys: clear setup state and disabled lookup',await page.getByRole('button',{name:'Inspect transaction',exact:false}).isDisabled());
  await page.screenshot({path:'evidence/phase22/final-controlled-controlled-missing-keys.png',fullPage:true});
  configured=true;await fresh();delay=600;
  await page.getByLabel('Sui transaction digest',{exact:true}).fill(source);await page.locator('.access-disclosure').evaluate(e=>e.open=false);await page.getByRole('button',{name:'Inspect transaction',exact:false}).click();
  await check('loading: lookup disabled during chain read',await page.getByRole('button',{name:'Reading…',exact:false}).isDisabled());
  await page.getByRole('heading',{name:'Chain evidence',exact:true}).waitFor();delay=0;
  recall='runbook';await inspect();await check('simulation tier visible',(await text()).includes('SIMULATION-TESTED · HISTORICAL REPAIR NOT VERIFIED'));
  outcome='succeeded';const beforeSuccess=lookupRecalls;await inspect(second);await check('successful lookup clears old runbook and performs no recall',!(await text()).includes('SIMULATION-TESTED · HISTORICAL REPAIR NOT VERIFIED')&&lookupRecalls===beforeSuccess);
  outcome='unknown';await inspect();await check('unknown outcome is not called confirmed and performs no recall',(await text()).includes('Execution outcome unknown')&&lookupRecalls===beforeSuccess);
  await page.screenshot({path:'evidence/phase22/final-controlled-controlled-unknown.png',fullPage:true});
  outcome='failed';recall='unavailable';await inspect();await check('degraded recall is not presented as a verified no-match',(await text()).includes('Memory lookup unavailable.')&&!(await text()).includes('No eligible precedent.'));
  await page.screenshot({path:'evidence/phase22/final-controlled-controlled-recall-unavailable.png',fullPage:true});
  recall='empty';await inspect();await check('no eligible precedent remains unresolved',(await text()).includes('No eligible precedent.'));
  recall='observation';await inspect();await check('observation is explicitly unverified',(await text()).includes('PREVIOUSLY OBSERVED · RESOLUTION UNVERIFIED'));
  recall='reviewed';await inspect(second);await check('reviewed case includes positive matching rationale',(await text()).includes('Why it matches:'));
  chainError=true;await page.locator('.access-disclosure').evaluate(e=>e.open=false);await page.getByRole('button',{name:'Inspect transaction',exact:false}).click();await page.getByRole('alert').filter({hasText:'gateway unavailable'}).waitFor();await check('lookup error clears old recommendations',await page.locator('.match-card').count()===0);chainError=false;
  recall='empty';await inspect(source);
  await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('fixture-reviewer-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);
  await page.getByRole('button',{name:'Record a reviewed resolution ↗',exact:true}).click();
  await check('editor starts without invented diagnosis',(await page.locator('#review-diagnosis').inputValue())==='');
  await page.locator('.editor-panel input[type=checkbox]').nth(0).check();await page.locator('.editor-panel input[type=checkbox]').nth(1).check();
  await page.getByRole('button',{name:'Verify artifact, then store ↗',exact:true}).click();
  await page.locator('.review-error-summary').waitFor();
  await check('invalid reviewed case never submits and correction summary receives focus',writes===0&&await page.locator('.review-error-summary').evaluate(e=>e===document.activeElement));
  await page.locator('.review-error-summary a').first().click();
  await check('correction link focuses matching input with inline error',await page.locator('#review-diagnosis').evaluate(e=>e===document.activeElement&&document.getElementById(e.getAttribute('aria-describedby'))?.textContent.includes('specific diagnosis')));
  await page.locator('.editor-panel input[type=checkbox]').nth(0).uncheck();await page.locator('.editor-panel input[type=checkbox]').nth(1).uncheck();

  await page.locator('#review-diagnosis').fill('CONTROLLED FIXTURE: already-completed operation');
  await page.locator('#review-steps').fill('CONTROLLED FIXTURE: reconcile exact earlier effects; no actual write.');
  await page.getByPlaceholder('https://github.com/owner/repo/pull/123 or /commit/40-character-sha').fill('https://github.com/example/fixture/commit/'+'a'.repeat(40));
  await page.locator('#review-change').fill('CONTROLLED FIXTURE: corrected the local interpretation of completed effects.');
  await page.locator('#review-name').fill('Fixture reviewer');
  await check('write disabled without human approval',await page.getByRole('button',{name:'Verify artifact, then store ↗',exact:true}).isDisabled());
  await page.locator('.editor-panel input[type=checkbox]').nth(0).check();await page.locator('.editor-panel input[type=checkbox]').nth(1).check();
  await page.getByRole('button',{name:'Verify artifact, then store ↗',exact:true}).click();
  await page.getByText('STORAGE JOB ACCEPTED · NOT YET A COMPLETED MEMORY',{exact:true}).waitFor();
  await check('accepted job is not claimed as a completed memory',!(await text()).includes('Mainnet write confirmed. Recall pending verification.'));
  await page.waitForFunction(()=>document.activeElement?.classList.contains('storage-section'));
  await check('accepted storage retains keyboard focus in its status region',await page.locator('.storage-section').evaluate(e=>e===document.activeElement));
  await check('one fixture submission; explicit attestations and stable request ID sent',writes===1&&lastRequest.verified&&lastRequest.confirmedCausalLink&&lastRequest.requestId&&lastRequest.asyncWrite);
  await page.screenshot({path:'evidence/phase22/final-controlled-controlled-pending-job.png',fullPage:true});
  await page.reload();await page.getByText('STORAGE JOB ACCEPTED · NOT YET A COMPLETED MEMORY',{exact:true}).waitFor();
  await check('pending job survives reload without storing reviewer secret',!(await page.evaluate(()=>sessionStorage.getItem('casewake-storage-v1'))).includes('fixture-reviewer-key')&&(await page.getByPlaceholder('Enter the private workspace key').inputValue())==='');
  await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('fixture-reviewer-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);jobState='done';
  await page.getByRole('button',{name:'Check storage status ↗',exact:true}).click();await page.getByText(blob,{exact:true}).first().waitFor();
  await check('job read recovers completed receipt with no second write',writes===1&&(await text()).includes('Mainnet write confirmed. Recall pending verification.'));
  outcome='succeeded';await inspect(second);await check('completed receipt survives inspecting another incident',(await text()).includes(blob));
  await page.reload();await page.getByText(blob,{exact:true}).first().waitFor();await check('completed receipt survives reload',(await text()).includes('Mainnet write confirmed. Recall pending verification.'));
  await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('fixture-reviewer-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);
  await page.getByPlaceholder('Digest of a comparable later failed incident').fill(second);
  await page.getByRole('button',{name:'Verify exact-blob recurrence — no new Walrus write ↗',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'incompatible recurrence'}).waitFor();await check('recurrence mismatch preserves storage receipt',(await text()).includes(blob)&&writes===1);
  verifyPass=true;await page.getByRole('button',{name:'Verify exact-blob recurrence — no new Walrus write ↗',exact:true}).click();
  await page.getByText('Human-reviewed resolution recalled across incidents.',{exact:true}).waitFor();await check('recurrence success reuses receipt without another write',writes===1);
  await page.screenshot({path:'evidence/phase22/final-controlled-controlled-receipt-and-recurrence.png',fullPage:true});
  await page.setViewportSize({width:320,height:900});await check('mobile receipt/recurrence has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'evidence/phase22/final-controlled-controlled-mobile-receipt.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1100});
  await fresh();outcome='failed';recall='empty';await inspect(source);
  await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('fixture-reviewer-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);
  await page.getByRole('button',{name:'Record a reviewed resolution ↗',exact:true}).click();
  await page.locator('#review-diagnosis').fill('CONTROLLED FIXTURE: already-completed operation');
  await page.locator('#review-steps').fill('CONTROLLED FIXTURE: reconcile earlier effects; no actual write.');
  await page.getByPlaceholder('https://github.com/owner/repo/pull/123 or /commit/40-character-sha').fill('https://github.com/example/fixture/commit/'+'a'.repeat(40));
  await page.locator('#review-change').fill('CONTROLLED FIXTURE: corrected interpretation of completed effects.');
  await page.locator('#review-name').fill('Fixture reviewer');
  await page.locator('.editor-panel input[type=checkbox]').nth(0).check();await page.locator('.editor-panel input[type=checkbox]').nth(1).check();
  submissionFails=true;
  await page.getByRole('button',{name:'Verify artifact, then store ↗',exact:true}).click();
  await page.getByText('STORAGE RESPONSE UNCONFIRMED · DO NOT RESUBMIT',{exact:true}).waitFor();
  await check('ambiguous write response blocks a second submission',writes===2&&await page.getByRole('button',{name:'Verify artifact, then store ↗',exact:true}).isDisabled());
  await page.reload();await page.getByText('STORAGE RESPONSE UNCONFIRMED · DO NOT RESUBMIT',{exact:true}).waitFor();
  await check('ambiguous storage attempt survives reload',writes===2);
  await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('fixture-reviewer-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);
  await page.getByLabel('Recover storage job ID',{exact:true}).fill(job);jobState='failed';
  await page.getByRole('button',{name:'Check storage status ↗',exact:true}).click();
  await page.getByRole('button',{name:'Dismiss failed storage job',exact:true}).waitFor();
  await page.getByRole('button',{name:'Dismiss failed storage job',exact:true}).click();
  await check('confirmed failed job can be dismissed without retrying a write',writes===2&&!((await text()).includes('STORAGE RESPONSE UNCONFIRMED')));
  submissionFails=false;jobState='done';await fresh();await inspect(source);
  await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('fixture-reviewer-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);
  await page.getByRole('button',{name:'Record a reviewed resolution ↗',exact:true}).click();
  await page.getByRole('button',{name:'Save onchain observation to Walrus ↗',exact:true}).click();
  await page.getByText('Observation stored. No resolution claimed.',{exact:true}).first().waitFor();
  await check('completed observation receipt never becomes a reviewed resolution',writes===3&&lastRequest.verified===undefined&&(await text()).includes('No resolution claimed.'));
  return {stateAudits,evidenceType:'CONTROLLED BROWSER RESPONSES; not Mainnet writes',checks,fixtureSubmissions:writes,realMemoryWrites:0,passed:true};
}