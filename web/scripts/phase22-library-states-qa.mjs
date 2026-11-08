export default async function phase22LibraryStateQA(page){

  const stateAudits=[];
  async function auditState(stage){
    if(!await page.evaluate(()=>!!window.axe))await page.addScriptTag({path:'../qa-tools/node_modules/axe-core/axe.min.js'});
    await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
    const a=await page.evaluate(async()=>{const a=await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']},resultTypes:['violations']});return {violations:a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),overflow:document.documentElement.scrollWidth-innerWidth,statuses:[...document.querySelectorAll('[role=status]')].map(e=>e.textContent),width:innerWidth};});
    stateAudits.push({stage,...a});
    if(a.violations.length||a.overflow>0)throw new Error('Accessibility failure '+stage+': '+JSON.stringify(a));
  }
 const checks=[];let available=false,coverage=false,empty=false,searchFails=false,delay=0,writes=0;
 const record={id:'fixture-reviewed-blob',blobId:'fixture-reviewed-blob',namespace:'fixture',sourceDigest:'4'.repeat(43),network:'sui-mainnet',title:'CONTROLLED FIXTURE reviewed procedure.',diagnosis:'CONTROLLED FIXTURE full diagnosis.',procedure:'CONTROLLED FIXTURE procedure, not real Mainnet evidence.',errorText:'CONTROLLED FIXTURE MoveAbort',packageId:null,sdkVersion:null,reviewer:'Fixture reviewer',reviewedAt:'2026-11-08T12:00:00Z',evidenceUrl:'https://github.com/example/fixture',evidenceScope:'human-reviewed-engineering-artifact'};
 const catalog=()=>({cases:empty?[]:[record],namespace:'fixture',checkedAt:'2026-11-08T12:00:00Z',coverageComplete:coverage,completedRecordsExamined:2,recordsNotRetrieved:coverage?0:1});
 const check=async(v,m)=>{if(!v)throw new Error(m);checks.push(m);await auditState(m);};
 await page.unrouteAll();await page.route('**/api/**',async r=>{
  const p=new URL(r.request().url()).pathname;
  if(!p.startsWith('/api/cases')){writes++;return r.abort();}
  if(!available)return r.fulfill({status:503,json:{error:'CONTROLLED FIXTURE library unavailable'}});
  if(p.endsWith('/search')){
   if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
   if(searchFails)return r.fulfill({status:503,json:{error:'CONTROLLED FIXTURE search unavailable'}});
   return r.fulfill({status:200,json:{...catalog(),cases:undefined,results:empty?[]:[{record,matchedTerms:['moveabort'],relationship:'related-only'}]}});
  }
  return r.fulfill({status:200,json:catalog()});
 });
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4242/cases');
 await page.getByText('CONTROLLED FIXTURE library unavailable',{exact:true}).waitFor();
 await check(await page.locator('.library-empty').count()===0,'Unavailable library never claims an empty result');
 available=true;await page.getByRole('button',{name:'Retry case discovery',exact:true}).click();await page.locator('.library-card').waitFor();
 await check(await page.getByText('Catalogue coverage is incomplete.',{exact:false}).isVisible(),'Incomplete catalogue exposes missing coverage');
 await check(!(await page.locator('.library-card').innerText()).includes('eligible-for-review'),'Library card has no transaction compatibility claim');
 await page.locator('#case-query').fill('MoveAbort');delay=500;searchFails=true;await page.getByRole('button',{name:'Search reviewed cases',exact:false}).click();
 await check(await page.locator('.library-card').count()===0,'Starting a new search clears old cases');
 await page.getByText('CONTROLLED FIXTURE search unavailable',{exact:true}).waitFor();
 await check(await page.locator('.library-empty').count()===0,'Search outage stays distinct from no result');
 searchFails=false;empty=true;await page.getByRole('button',{name:'Retry case discovery',exact:true}).click();await page.getByRole('heading',{name:'No related reviewed cases found.',exact:true}).waitFor();
 await check(await page.getByText('Catalogue coverage is incomplete.',{exact:false}).isVisible(),'No-result search retains partial-coverage qualification');
 empty=false;coverage=true;await page.getByRole('button',{name:'Browse reviewed cases',exact:true}).click();await page.locator('.library-card').waitFor();
 await page.locator('.library-card summary').focus();await page.keyboard.press('Enter');
 await check(await page.locator('.library-card details').getAttribute('open')!==null,'Keyboard opens original case context');
 await check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile case and expanded provenance no overflow');
 await page.emulateMedia({reducedMotion:'reduce'});await check(await page.evaluate(()=>document.getAnimations().length===0),'Library respects reduced motion');
 await page.screenshot({path:'evidence/phase22/final-controlled-library-mobile.png',fullPage:true});
 await check(writes===0,'Library state checks never submit a record');await page.unrouteAll();
 return {stateAudits,passed:true,checks,realMemoryWrites:0,scope:'Controlled availability, coverage, keyboard and search states'};
}
