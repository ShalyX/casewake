export default async function phase21ConfigBrowser(page){
 const checks=[];let memory=true,chain=true,inventory=true,partial=false,publicMode=false,writes=0,reads=0,recalls=0;
 const assert=(v,m)=>{if(!v)throw new Error(m);checks.push(m);};
 await page.unrouteAll();
 await page.route('**/api/**',async r=>{
  const u=new URL(r.request().url());let data={};
  if(u.pathname==='/api/status')data={tatumConfigured:chain,walrusConfigured:memory,reviewerWritesEnabled:true,publicDemoMode:publicMode,network:'sui-mainnet'};
  else if(u.pathname==='/api/memories'){if(!inventory)return r.fulfill({status:503,json:{error:'CONTROLLED FIXTURE inventory unavailable'}});data={allStoredMemories:7,namespace:'fixture',complete:!partial};}
  else if(u.pathname==='/api/transaction'){reads++;data={transaction:{digest:'4'.repeat(43),network:'sui-mainnet',source:'CONTROLLED FIXTURE',outcome:'failed',observedAt:'2026-11-08T12:00:00Z',errorText:'CONTROLLED FIXTURE failure'}};}
  else if(u.pathname==='/api/recall'){recalls++;data={candidates:[],reason:'CONTROLLED FIXTURE no match'};}
  else{writes++;return r.abort();}
  return r.fulfill({status:200,json:data});
 });
 const fresh=async()=>{await page.goto('http://127.0.0.1:4242/workspace');await page.evaluate(()=>sessionStorage.clear());await page.reload();await page.waitForFunction(()=>document.querySelector('.access-content')?.textContent.includes('Guarded'));};
 await page.setViewportSize({width:390,height:844});
 memory=false;await fresh();assert(await page.getByRole('button',{name:'Inspect transaction',exact:false}).isEnabled(),'Walrus missing preserves configured Tatum lookup');
 await page.locator('#digest').fill('4'.repeat(43));await page.getByRole('button',{name:'Inspect transaction',exact:false}).click();await page.getByRole('heading',{name:'Chain evidence',exact:true}).waitFor();
 assert(reads===1&&recalls===0,'Missing memory performs chain read without recall');
 assert(await page.getByRole('heading',{name:'Memory is not configured.',exact:true}).isVisible(),'Memory configuration has a distinct result');
 chain=false;await fresh();assert(await page.getByRole('button',{name:'Inspect transaction',exact:false}).isDisabled(),'Missing Tatum disables transaction lookup');
 memory=true;chain=true;inventory=false;await fresh();await page.getByText('Inventory unavailable — no completed-count conclusion.').waitFor();assert(!(await page.locator('.inventory-strip').innerText()).includes('0 completed'),'Unavailable inventory is not zero');
 inventory=true;partial=true;await fresh();await page.getByText('At least 7 completed memories · all types · fixture · incomplete inventory').waitFor();assert(true,'Incomplete inventory is labelled with lower bound');
 publicMode=true;await fresh();assert(await page.getByText('Public example mode:',{exact:false}).count()===0&&await page.getByRole('button',{name:'Inspect transaction',exact:false}).isEnabled(),'Legacy example-mode flag does not restrict public reads');
 await page.locator('.access-disclosure').evaluate(e=>e.open=true);await page.getByPlaceholder('Enter the private workspace key').fill('fixture-key');await page.locator('.access-disclosure').evaluate(e=>e.open=false);
 assert(await page.getByText('Public example mode:',{exact:false}).count()===0,'Reviewer access leaves public read access unchanged');
 await page.locator('#digest').fill('4'.repeat(43));await page.getByRole('button',{name:'Inspect transaction',exact:false}).click();await page.getByRole('heading',{name:'Chain evidence',exact:true}).waitFor();
 await page.getByRole('button',{name:'Record a reviewed resolution',exact:false}).click();await page.locator('.editor-panel').waitFor();
 await page.getByLabel('Confirmation method',{exact:false}).selectOption('onchain-successor');
 assert(await page.locator('#review-successor').isVisible()&&await page.locator('#review-url').count()===0,'Successor proof method exposes correct fields');
 await page.getByLabel('Confirmation method',{exact:false}).selectOption('reviewed-evidence');
 assert(await page.locator('#review-url').isVisible()&&await page.locator('#review-successor').count()===0,'Artifact proof method restores correct fields');
 assert(await page.locator('.editor-panel input[type=checkbox]').evaluateAll(a=>a.every(i=>!i.checked)),'Human approvals remain explicit and unchecked');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile reviewer has no horizontal overflow');
 await page.screenshot({path:'evidence/phase21/controlled-review-mobile.png',fullPage:true});
 assert(writes===0,'Configuration/field checks never submit a write');
 await page.unrouteAll();await page.evaluate(()=>sessionStorage.clear());
 return {passed:true,checks,fixtureWrites:writes,realMemoryWrites:0,scope:'Controlled configuration and form states'};
}
