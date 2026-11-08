export default async function phase22LiveFold(page){
 await page.unrouteAll();await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:4242');await page.evaluate(()=>sessionStorage.clear());
 const arrow=await page.locator('.hero-actions .text-link span').evaluate(e=>({foreground:getComputedStyle(e).color,background:getComputedStyle(document.body).backgroundColor,hiddenFromAT:e.getAttribute('aria-hidden')}));
 await page.goto('http://127.0.0.1:4242/workspace?digest=HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV');await page.locator('.exact-blob code').waitFor({timeout:120000});
 await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
 const result=await page.locator('.exact-blob').evaluate(e=>({bottom:e.getBoundingClientRect().bottom,text:e.textContent,procedure:document.querySelector('.resolution-steps')?.textContent,reviewer:document.querySelector('.reviewed-by')?.textContent,chainWidth:document.querySelector('.evidence-panel')?.getBoundingClientRect().width,memoryWidth:document.querySelector('.memory-panel')?.getBoundingClientRect().width}));
 if(result.bottom>900||!result.text.includes('KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY')||!result.reviewer.includes('ShalyX'))throw new Error('Real reviewed fold failed '+JSON.stringify(result));
 await page.screenshot({path:'evidence/phase22/live-reviewed-first-fold.png'});
 const skip=await page.locator('.skip-link').evaluate(e=>({focused:e===document.activeElement,top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}));
 await page.evaluate(()=>window.scrollTo(0,400));const scrolledSkip=await page.locator('.skip-link').evaluate(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}));
 return {passed:true,scope:'Actual anonymous Mainnet recurrence and signed exact-blob recall; no writes',result,arrow,skip,scrolledSkip,realMemoryWrites:0};
}
