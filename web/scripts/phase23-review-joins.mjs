// Actual browser UI; service responses are controlled and no storage is performed.
export default async function phase23ReviewJoins(page){
 const source='4'.repeat(43),second='5'.repeat(43);let writes=0;const stateAudits=[];
 await page.setViewportSize({width:390,height:844});
 async function audit(stage){
  await page.addScriptTag({path:'../qa-tools/node_modules/axe-core/axe.min.js'});
  const result=await page.evaluate(async()=>{const a=await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']},resultTypes:['violations']});return {violations:a.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),overflow:document.documentElement.scrollWidth-innerWidth};});
  stateAudits.push({stage,...result});if(result.violations.length||result.overflow)throw new Error('Review accessibility failure '+JSON.stringify(result));
 }
 await page.unrouteAll();await page.route('**/api/**',async r=>{
  const p=new URL(r.request().url()).pathname;let data;
  if(p==='/api/status')data={tatumConfigured:true,walrusConfigured:true,reviewerWritesEnabled:true,network:'sui-mainnet'};
  else if(p==='/api/memories')data={allStoredMemories:13,namespace:'fixture',complete:true};
  else if(p==='/api/transaction')data={transaction:{digest:r.request().postDataJSON().digest,network:'sui-mainnet',source:'CONTROLLED QA fixture',outcome:'failed',errorText:'CONTROLLED QA MoveAbort',fingerprint:'fixture',packageId:null,observedAt:'2026-11-08T23:00:00Z'}};
  else if(p==='/api/recall')data={candidates:[],observedPrecedents:[],simulationRunbooks:[],recallDegraded:false};
  else if(p==='/api/remember'){writes++;return r.fulfill({status:503,json:{error:'CONTROLLED QA storage service response unavailable'}});}
  else {writes++;return r.abort();}
  return r.fulfill({json:data});
 });
 await page.goto('http://127.0.0.1:4242/workspace');await page.evaluate(()=>sessionStorage.clear());await page.reload();
 await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('CONTROLLED-QA-fixture-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);
 async function inspect(digest){await page.locator('#digest').fill(digest);await page.getByRole('button',{name:'Inspect transaction',exact:false}).click();await page.locator('.memory-panel[aria-busy=false]').waitFor();await page.getByRole('button',{name:'Record a reviewed resolution',exact:false}).click();}
 const approvals=page.locator('.editor-panel input[type=checkbox]');
 const approve=async()=>{await approvals.nth(0).check();await approvals.nth(1).check();};
 const checked=async()=>[await approvals.nth(0).isChecked(),await approvals.nth(1).isChecked()];
 await inspect(source);await page.locator('#review-diagnosis').fill('CONTROLLED QA: a specific reviewed diagnosis.');await page.locator('#review-steps').fill('CONTROLLED QA: inspect exact prior effects before retrying.');await page.locator('#review-url').fill('https://github.com/example/qa/commit/'+'a'.repeat(40));await page.locator('#review-change').fill('CONTROLLED QA: reconcile the exact earlier authenticated result.');await page.locator('#review-name').fill('QA reviewer');await page.getByPlaceholder('2.x',{exact:true}).fill('sdk-for-first-incident');
 await approve();await page.getByLabel('Confirmation method',{exact:false}).selectOption('onchain-successor');
 const afterMethodChange=await checked();
 await page.getByLabel('Confirmation method',{exact:false}).selectOption('reviewed-evidence');await approve();await page.locator('#review-url').fill('https://github.com/example/qa/commit/'+'b'.repeat(40));const afterArtifactChange=await checked();
 await approve();await page.locator('#review-steps').fill('CONTROLLED QA: a changed procedure requires a new human decision.');const afterProcedureChange=await checked();
 await audit('Changed evidence requires new approvals');await page.screenshot({path:'evidence/phase23/review-approval-state.png',fullPage:true});
 await inspect(second);const nextIncidentSdk=await page.getByPlaceholder('2.x',{exact:true}).inputValue();const nextIncidentDiagnosis=await page.locator('#review-diagnosis').inputValue();
 await page.locator('#review-diagnosis').fill('CONTROLLED QA: a specific diagnosis for the second incident.');await page.locator('#review-steps').fill('CONTROLLED QA: preserve the uncertain job; no duplicate submission.');await page.locator('#review-url').fill('https://github.com/example/qa/commit/'+'c'.repeat(40));await page.locator('#review-change').fill('CONTROLLED QA: corroborated the exact earlier operation before retrying.');await approve();
 const submit=page.getByRole('button',{name:'Verify artifact, then store',exact:false});await submit.click();await page.getByRole('alert').filter({hasText:'CONTROLLED QA storage service response unavailable'}).waitFor();
 const unconfirmedStorage=await page.getByText('STORAGE RESPONSE UNCONFIRMED · DO NOT RESUBMIT',{exact:true}).count()===1;
 const duplicateBlocked=await submit.isDisabled();await page.reload();await page.getByText('STORAGE RESPONSE UNCONFIRMED · DO NOT RESUBMIT',{exact:true}).waitFor();
 const survivesReload=await page.getByText('STORAGE RESPONSE UNCONFIRMED · DO NOT RESUBMIT',{exact:true}).count()===1;
 await audit('Unconfirmed503 survives reload');await page.screenshot({path:'evidence/phase23/unconfirmed-503-storage.png',fullPage:true});
 await page.unrouteAll();
 return {scope:'Controlled reviewer transitions on actual UI; one intercepted submission, no Mainnet writes',stateAudits,afterMethodChange,afterArtifactChange,afterProcedureChange,nextIncidentSdk,nextIncidentDiagnosis,unconfirmedStorage,duplicateBlocked,survivesReload,writeRequests:writes,realMemoryWrites:0,passed:!afterMethodChange.some(Boolean)&&!afterArtifactChange.some(Boolean)&&!afterProcedureChange.some(Boolean)&&nextIncidentSdk===''&&nextIncidentDiagnosis===''&&writes===1&&unconfirmedStorage&&duplicateBlocked&&survivesReload};
}
