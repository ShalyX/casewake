// Controlled read fixtures on the deployed frontend; never a new Mainnet write.
export default async function phase25ReceiptAccessibility(page){
 const browser=page.context().browser(),base='https://casewake.vercel.app',runs=[];
 for(const width of [1440,320])for(const mode of ['no-preference','reduce']){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:mode});const p=await ctx.newPage();let writes=0,reads=0;const errors=[],audits=[];
  p.on('pageerror',e=>errors.push(e.message));
  const job='22222222-2222-4222-8222-222222222222',source='4'.repeat(43),receipt={jobId:job,namespace:'fixture',blobId:'CONTROLLED-SERVER-READ-FIXTURE',status:'mainnet-stored'};
  await p.route('**/api/**',async r=>{
   const path=new URL(r.request().url()).pathname;
   if(path==='/api/status')return r.fulfill({json:{tatumConfigured:true,walrusConfigured:true,reviewerWritesEnabled:true,network:'sui-mainnet'}});
   if(path==='/api/memories')return r.fulfill({json:{allStoredMemories:13,namespace:'fixture',complete:true}});
   if(path==='/api/memory-job'){reads++;return r.fulfill({json:{completed:true,proof:receipt}});}
   writes++;return r.abort();
  });
  async function audit(stage){await p.addScriptTag({path:'../qa-tools/node_modules/axe-core/axe.min.js'});await p.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));const a=await p.evaluate(async()=>({violations:(await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']},resultTypes:['violations']})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),overflow:document.documentElement.scrollWidth-innerWidth}));if(a.violations.length||a.overflow>0)throw new Error(JSON.stringify({stage,...a}));audits.push({stage,...a});}
  try{
   await p.goto(base+'/workspace');await p.evaluate(v=>sessionStorage.setItem('casewake-storage-v1',JSON.stringify(v)),{kind:'resolution',sourceDigest:source,requestId:'11111111-1111-4111-8111-111111111111',jobId:job,namespace:'fixture',receipt});await p.reload();
   await p.getByRole('heading',{name:'Saved receipt requires server verification.',exact:true}).waitFor();
   // Add the capture label only after hydration; an init-time body mutation creates a fixture-only React mismatch.
   await p.evaluate(()=>{const b=document.createElement('div');b.setAttribute('aria-hidden','true');b.textContent='CONTROLLED QA · simulated receipt read · no Mainnet writes';b.style.cssText='padding:8px;background:#f5f5ef;color:#0e1212;font:12px monospace';document.body.prepend(b);});await audit('unverified saved metadata');
   await p.locator('.access-disclosure').evaluate(e=>e.open=true);await p.getByPlaceholder('Enter the private workspace key').fill('CONTROLLED-QA-key');await p.locator('.access-disclosure').evaluate(e=>e.open=false);
   await p.getByRole('button',{name:'Verify saved receipt',exact:false}).focus();await p.keyboard.press('Enter');await p.getByRole('heading',{name:'Mainnet write confirmed. Recall pending verification.',exact:true}).waitFor();
   if(!await p.locator('.storage-section').evaluate(e=>e===document.activeElement))throw new Error('Receipt verification lost keyboard focus');await audit('controlled server-read completion');
   if(writes||reads!==1||errors.length)throw new Error(JSON.stringify({writes,reads,errors}));
   await p.screenshot({path:'evidence/phase25/controlled-receipt-'+width+'-'+mode+'.png',fullPage:true});runs.push({width,mode,audits,keyboardFocusRetained:true,jobReadFixtures:reads,mutationRequests:writes,errors});
  }finally{await ctx.close();}
 }
 return {passed:true,runs,memoryWrites:0,scope:'Deployed frontend, eight Axe/reflow state scans and four keyboard/normal-reduced runs with controlled receipt reads; not actual job proof or screen-reader certification'};
}
