export default async function verifyPhase17Board(page) {
 const base='http://127.0.0.1:4238';
 const checks=[];const errors=[];let apiCalls=0;
 const assert=(test,label)=>{if(!test)throw new Error(label);checks.push(label);};
 page.on('pageerror',error=>errors.push(error.message));
 page.on('request',request=>{if(request.url().includes('/api/'))apiCalls++;});
 for(const [name,width,height]of[['desktop',1440,1000],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.goto(base+'/index.html');
  await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+': no horizontal overflow');
  assert(await page.locator('h1').count()===1,name+': one primary heading');
  const loaded=await page.locator('img').evaluateAll(nodes=>nodes.every(node=>node.complete&&node.naturalWidth>0));
  assert(loaded,name+': all source/target images loaded');
  assert(await page.evaluate(()=>['Head','Body','Mono'].every(font=>document.fonts.check('16px '+font))),name+': all Rouse type roles loaded');
  assert(await page.getByRole('link',{name:'Official source'}).count()===4,name+': four explicit official-source credits');
  assert(await page.locator('.reference').count()===5,name+': four functional studies and one combined Rouse target');
  const disclosure=page.locator('#extended-provenance');
  const essential=page.locator('.essential-blob');
  assert(await essential.isVisible(),name+': exact record visible before disclosure');
  await disclosure.locator('summary').focus();
  await disclosure.locator('summary').press('Enter');
  await page.getByText('Secondary details open. Essential record stays visible.',{exact:true}).waitFor();
  assert(await disclosure.evaluate(node=>node.open),name+': keyboard opens supporting provenance');
  assert(await essential.isVisible(),name+': exact record remains visible with details open');
  await page.locator('#details').screenshot({path:'evidence/phase17/disclosure-'+name+'.png'});
  await disclosure.locator('summary').press('Enter');
  await page.getByText('Secondary details closed. Essential record stays visible.',{exact:true}).waitFor();
  assert(!(await disclosure.evaluate(node=>node.open)),name+': keyboard closes disclosure');
  assert(await page.evaluate(()=>document.activeElement.tagName==='SUMMARY'),name+': disclosure retains keyboard focus');
  await page.getByRole('link',{name:'Enter a reviewer name',exact:true}).click();
  assert(await page.locator('#board-reviewer').evaluate(node=>document.activeElement===node),name+': correction link focuses reviewer input');
  const linked=await page.locator('#reviewer-correction').innerText(),inline=await page.locator('#reviewer-field-error').innerText();
  assert(linked===inline,name+': summary and inline error wording agree');
  assert(await page.locator('#board-reviewer').getAttribute('aria-describedby')==='reviewer-field-error',name+': field is associated with its error');
  assert(await page.locator('form').count()===0,name+': specimen has no submitting form');
  await page.locator('#validation').screenshot({path:'evidence/phase17/validation-'+name+'.png'});
  await page.screenshot({path:'evidence/phase17/board-'+name+'.png',fullPage:true});
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 assert(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)==='auto','reduced motion removes smooth scroll');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'/index.html');await page.evaluate(()=>document.fonts.ready);
 await page.locator('#github').screenshot({path:'evidence/phase17/github-synthesis.png'});
 await page.screenshot({path:'evidence/phase17/board-first-fold.png'});
 assert(apiCalls===0,'board made zero API calls');
 assert(errors.length===0,'board has no JavaScript errors');
 return {environment:'REFERENCE BOARD AND TRANSLATION SPECIMENS; NOT PRODUCTION APP',checks,apiCalls,memoryWrites:0,passed:true};
}
