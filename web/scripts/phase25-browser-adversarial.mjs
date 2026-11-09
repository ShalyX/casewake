// Owned public frontend; all service responses here are controlled. No live memory write.
export default async function phase25BrowserAttack(page){
 const base='https://casewake.vercel.app';let mode='missing',writes=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.unrouteAll();await page.route('**/api/**',async r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/api/status')return r.fulfill({json:{tatumConfigured:true,walrusConfigured:true,reviewerWritesEnabled:true,network:'sui-mainnet'}});
  if(path==='/api/memories')return r.fulfill({json:{allStoredMemories:13,complete:true,namespace:'fixture'}});
  if(path==='/api/cases')return r.fulfill({json:mode==='missing'?{}:{cases:{unexpected:true},namespace:'fixture',checkedAt:'2026-11-09T00:00:00Z',coverageComplete:true,completedRecordsExamined:13,recordsNotRetrieved:0}});
  writes++;return r.abort();
 });
 await page.goto(base+'/cases',{waitUntil:'domcontentloaded'});await page.waitForTimeout(600);
 const malformedAsEmpty=await page.getByRole('heading',{name:'No reviewed resolutions retrieved.',exact:true}).count()===1;
 mode='wrong-array';await page.reload();await page.waitForTimeout(600);const malformedUnavailable=await page.locator('.library-results .inline-error').count()===1;
 await page.goto(base+'/workspace',{waitUntil:'domcontentloaded'});await page.evaluate(()=>{
  sessionStorage.setItem('casewake-storage-v1',JSON.stringify({sourceDigest:'4'.repeat(43),requestId:'11111111-1111-4111-8111-111111111111',kind:'resolution',jobId:'22222222-2222-4222-8222-222222222222',namespace:'fixture',receipt:{jobId:'22222222-2222-4222-8222-222222222222',namespace:'fixture',blobId:'FORGED-CONTROLLED-CLIENT-CACHE',status:'mainnet-stored'}}));
 });await page.reload();await page.getByText('FORGED-CONTROLLED-CLIENT-CACHE',{exact:true}).waitFor();
 const forgedConfirmed=await page.getByText('Mainnet write confirmed. Recall pending verification.',{exact:true}).count()===1;
 await page.screenshot({path:'evidence/phase25/restored-receipt.png',fullPage:true});
 await page.evaluate(()=>sessionStorage.clear());await page.unrouteAll();
 return {scope:'Controlled malformed services and altered client cache on public frontend',malformedAsEmpty,malformedUnavailable,forgedConfirmed,errors,unexpectedApiRequests:writes,realMemoryWrites:0,passed:!malformedAsEmpty&&malformedUnavailable&&!forgedConfirmed};
}
