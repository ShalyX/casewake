export default async function phase21LiveBrowser(page) {
 const base='http://127.0.0.1:4242',blob='KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY';
 const checks=[],errors=[];let writes=0;
 page.on('pageerror',e=>errors.push(e.message));
 await page.unrouteAll();
 await page.route('**/api/remember',r=>{writes++;return r.abort();});
 await page.route('**/api/observations',r=>{writes++;return r.abort();});
 const check=(v,m)=>{if(!v)throw new Error(m);checks.push(m);};
 await page.setViewportSize({width:1440,height:900});await page.goto(base);await page.evaluate(()=>sessionStorage.clear());await page.evaluate(()=>document.fonts.ready);
 check((await page.title()).startsWith('Rouse'),'Rouse metadata');
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Landing desktop has no overflow');
 check(await page.locator('.primary-button').first().boundingBox().then(b=>b.y+b.height<900),'Landing action above fold');
 await page.screenshot({path:'evidence/phase21/landing-desktop.png',fullPage:true});
 await page.screenshot({path:'evidence/phase21/landing-first-fold.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'evidence/phase21/landing-mobile.png',fullPage:true});
 check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Landing mobile has no overflow');
 await page.setViewportSize({width:1440,height:900});await page.goto(base+'/workspace?digest=HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV');
 await page.locator('.exact-blob code').filter({hasText:blob}).waitFor({timeout:120000});
 check(await page.locator('.match-card').count()>0,'Actual local server recalls reviewed case');
 check(await page.locator('.reviewed-by').innerText().then(t=>t.includes('ShalyX')),'Actual reviewer visible');
 check(await page.locator('.exact-blob code').innerText()===blob,'Actual exact reviewed blob visible in full');
 const fold=await page.locator('.exact-blob').boundingBox();check(fold.y+fold.height<=900,'Entire recalled blob strip is above desktop fold');
 await page.screenshot({path:'evidence/phase21/workspace-live-desktop.png',fullPage:true});
 for(const [name,width,height]of[['tablet',768,1024],['mobile',390,844]]){
  await page.setViewportSize({width,height});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' workspace no overflow');
  check(await page.locator('.exact-blob code').isVisible(),name+' full blob stays visible');
  await page.screenshot({path:'evidence/phase21/workspace-live-'+name+'.png',fullPage:true});
 }
 await page.locator('.match-card summary').click();check(await page.locator('.match-card details').getAttribute('open')!==null,'Native provenance disclosure opens');
 await page.emulateMedia({reducedMotion:'reduce'});check(await page.locator('.match-card').evaluate(e=>getComputedStyle(e).animationName==='none'),'Reduced motion disables result reveal');
 for(const [path,name]of[['/journal/casewake','journal'],['/proof/splitcoins','proof']]){
  await page.goto(base+path);check(await page.locator('h1').count()===1,name+' route works');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' mobile no overflow');
  await page.screenshot({path:'evidence/phase21/'+name+'-mobile.png',fullPage:true});
 }
 check(writes===0,'No write request attempted');check(errors.length===0,'No JavaScript errors');
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.includes('/fonts/')).map(r=>({name:r.name.split('/').pop(),bytes:r.encodedBodySize})));
 return {passed:true,checkedAt:new Date().toISOString(),base,checks,fold,fontResources:resources,memoryWrites:0,scope:'Actual local Rouse app, real server Mainnet reads; production deployment unchanged'};
}
