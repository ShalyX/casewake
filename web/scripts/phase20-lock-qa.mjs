export default async function verifyPhase20Targets(page) {
 const checks=[];const errors=[];let apiCalls=0;
 const assert=(v,m)=>{if(!v)throw new Error(m);checks.push(m);};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().includes('/api/'))apiCalls++;});
 const pages=['unconfirmed','rejected','failed-job','access','memory-unconfigured','tiers','inventory','proof','fieldnotes'];
 for(const [name,width,height]of[['desktop',1440,900],['tablet',768,1024],['mobile',390,844]]){
  await page.setViewportSize({width,height});
  for(const target of pages){
   await page.goto('http://127.0.0.1:4241/'+target+'.html');await page.evaluate(()=>document.fonts.ready);
   const label=name+': '+target;
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' has no horizontal overflow');
   assert(await page.locator('h1').count()===1,label+' has one primary heading');
   assert(await page.locator('.study').innerText().then(t=>t.includes('static target')),label+' clearly identifies static scope');
   assert(await page.locator('input,button').evaluateAll(items=>items.every(e=>e.disabled)),label+' cannot submit or receive credentials');
   assert(await page.locator('form,script').count()===0,label+' has no form/script runtime');
   if(['unconfirmed','failed-job','rejected'].includes(target))assert(!(await page.locator('body').innerText()).includes('KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY'),label+' has no completed resolution blob');
   if(target==='memory-unconfigured')assert(await page.locator('main').innerText().then(t=>t.includes('Transaction evidence can still be inspected')),label+' preserves chain access without memory');
   if(target==='inventory')assert(await page.locator('main').innerText().then(t=>t.includes('unavailable')&&t.includes('Never turn')),label+' does not replace unavailable inventory with zero');
   if(target==='proof')assert(await page.locator('main').innerText().then(t=>t.includes('SIMULATION')&&t.includes('Not the human-reviewed')),label+' keeps historical simulation separate');
   await page.screenshot({path:'evidence/phase20/'+target+'-'+name+'.png',fullPage:true});
  }
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 assert(await page.evaluate(()=>document.getAnimations().length===0),'Supplement targets have no reduced-motion animation');
 assert(apiCalls===0,'Zero API calls');assert(errors.length===0,'Zero JavaScript errors');
 return {passed:true,checks,apiCalls,memoryWrites:0,scope:'Supplementary static target rendering only'};
}
