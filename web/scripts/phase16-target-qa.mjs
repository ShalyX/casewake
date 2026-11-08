export default async function verifyPhase16Targets(page) {
 const base='http://127.0.0.1:4236';
 const states=['eligible','empty','unconfigured','loading','lookup-error','success','unknown','no-match','unavailable','pending','receipt','review'];
 const checks=[];const errors=[];let apiCalls=0;
 await page.emulateMedia({reducedMotion:'no-preference'});
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(request.url().includes('/api/'))apiCalls++;});
 const assert=(condition,message)=>{if(!condition)throw new Error(message);checks.push(message);};
 const noOverflow=()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
 for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  await page.setViewportSize({width,height});
  await page.goto(base+'/landing.html');await page.evaluate(()=>document.fonts.ready);
  assert(await noOverflow(),name+': landing has no horizontal overflow');
  assert(await page.locator('h1').count()===1,name+': landing has one primary heading');
  const cta=await page.getByRole('link',{name:'Inspect a transaction'}).boundingBox();
  assert(cta&&cta.y+cta.height<height,name+': primary action is above the fold');
  await page.screenshot({path:'evidence/phase16/landing-'+name+'.png',fullPage:true});
  for(const state of states){
   await page.goto(base+'/workspace.html?state='+state);
   await page.locator('#state-content > *').first().waitFor();
   await page.evaluate(()=>document.fonts.ready);
   assert(await noOverflow(),name+': '+state+' has no horizontal overflow');
   assert(await page.locator('h1').count()===1,name+': '+state+' has one primary heading');
   if(state==='eligible'){
    assert((await page.locator('.blob').innerText()).includes('KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY'),name+': exact reviewed blob shown');
    assert(!(await page.locator('.preview-nav').isVisible()),name+': study controls are outside the composition');
    if(name==='desktop'){
     const rect=await page.locator('.blob').boundingBox();
     assert(rect&&rect.y+rect.height<=900,'desktop: entire exact-blob strip is above the 900px fold');
    }
   }
   if(state==='pending')assert(!(await page.locator('#state-content').innerText()).includes('KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY'),name+': pending never claims a completed blob');
   if(state==='unknown'||state==='success')assert(await page.locator('.memory-panel').count()===0,name+': '+state+' never suggests a resolution');
   if(state==='unconfigured')assert(await page.locator('.intake button').isDisabled(),name+': missing configuration disables lookup');
   if(state==='review'){
    assert(await page.getByRole('button',{name:'Store reviewed resolution'}).isDisabled(),name+': review study cannot write');
    assert(await page.getByLabel('Exact engineering change').inputValue()==='',name+': review starts without invented engineering change');
    await page.locator('#proof-method').selectOption('onchain-successor');
    assert((await page.getByLabel('Distinct successful successor digest').isVisible())&&!(await page.getByLabel('Evidence URL').isVisible()),name+': successor method exposes its digest and hides artifact-only URL');
    await page.locator('#proof-method').selectOption('reviewed-evidence');
   }
   await page.screenshot({path:'evidence/phase16/workspace-'+state+'-'+name+'.png',fullPage:true});
  }
 }
 await page.setViewportSize({width:768,height:1024});
 await page.goto(base+'/workspace.html?state=eligible');await page.evaluate(()=>document.fonts.ready);
 assert(await noOverflow(),'tablet: eligible composition has no overflow');
 await page.screenshot({path:'evidence/phase16/workspace-tablet.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'/workspace.html?state=eligible');
 await page.getByText('Full case provenance',{exact:true}).click();
 assert(await page.getByText('8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA',{exact:true}).isVisible(),'provenance disclosure reveals original source');
 await page.screenshot({path:'evidence/phase16/provenance-expanded.png',fullPage:true});
 await page.goto(base+'/workspace.html?state=pending');
 await page.getByRole('link',{name:'Check storage status'}).click();
 assert(page.url().includes('state=receipt'),'controlled pending-to-receipt illustration is navigable');
 await page.goto(base+'/workspace.html?state=loading');
 await page.emulateMedia({reducedMotion:'reduce'});
 assert(await page.evaluate(()=>getComputedStyle(document.querySelector('.loading-line'),'::after').animationName)==='none','reduced motion removes loading movement');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto(base+'/index.html');await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:'evidence/phase16/territories.png',fullPage:true});
 assert(apiCalls===0,'composition targets issue zero API calls');
 assert(errors.length===0,'composition targets have no JavaScript errors');
 return {environment:'STATIC DESIGN TARGETS; NOT LIVE INTEGRATION',checks,apiCalls,memoryWrites:0,passed:true};
}
