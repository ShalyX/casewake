export default async function verifyPhase19Storyboard(page) {
 const checks=[];const errors=[];let apiCalls=0;
 const assert=(v,m)=>{if(!v)throw new Error(m);checks.push(m);};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().includes('/api/'))apiCalls++;});
 for(const [name,width,height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4240');
  await page.locator('img').last().waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+': no horizontal overflow');
  assert(await page.locator('h1').count()===1,name+': one main heading');
  assert(await page.locator('article').count()===6,name+': six paired storyboard beats');
  assert(await page.locator('img').count()===12,name+': twelve target frame placements');
  assert(await page.locator('img').evaluateAll(a=>a.every(i=>i.complete&&i.naturalWidth>0&&i.alt.startsWith('Recorded design target:'))),name+': targets loaded and explicitly qualified');
  assert(await page.locator('tbody tr').count()===14,name+': all fourteen contracts visible');
  assert(await page.locator('aside').innerText().then(t=>t.includes('Static storyboard')),name+': static/nonoperational scope visible');
  assert(await page.locator('form,script,video').count()===0,name+': no forms, script runtime or autoplay media');
  const first=page.locator('aside a').first();await first.focus();
  assert(await first.evaluate(e=>e===document.activeElement),name+': keyboard-accessible contract link');
  for(const file of ['STORYBOARD.md','motion.json'])assert((await page.request.get('http://127.0.0.1:4240/'+file)).ok(),name+': '+file+' available');
  await page.screenshot({path:'evidence/phase19/storyboard-'+name+'.png',fullPage:true});
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 assert(await page.evaluate(()=>document.getAnimations().length===0),'Reduced motion: static sheet has no animations');
 assert(apiCalls===0,'No API calls');assert(errors.length===0,'No JavaScript errors');
 return {passed:true,checks,apiCalls,memoryWrites:0,scope:'Static storyboard rendering, not real application motion acceptance'};
}
