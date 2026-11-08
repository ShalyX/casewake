export default async function verifyPhase18Map(page) {
 const checks=[];const errors=[];let apiCalls=0;
 const assert=(v,m)=>{if(!v)throw new Error(m);checks.push(m)};
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().includes('/api/'))apiCalls++});
 for(const [name,width,height]of[['desktop',1440,1000],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4239');
  await page.locator('img').last().waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+': no horizontal overflow');
  assert(await page.locator('h1').count()===1,name+': one main heading');
  assert(await page.locator('article').count()===7,name+': seven attributed previews');
  assert(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0&&i.alt.length>0)),name+': all images loaded with alternatives');
  assert(await page.locator('article .label').filter({hasText:'NOT A LIVE CAPTURE'}).count()===5,name+': all design targets explicitly qualified');
  assert(await page.locator('form').count()===0,name+': no submitting form');
  for(const file of ['assets.json','STRATEGY.md'])assert((await page.request.get('http://127.0.0.1:4239/'+file)).ok(),name+': '+file+' available');
  await page.screenshot({path:'evidence/phase18/asset-map-'+name+'.png',fullPage:true});
 }
 assert(apiCalls===0,'No API calls');assert(errors.length===0,'No JavaScript errors');
 return {passed:true,checks,apiCalls,memoryWrites:0,scope:'Static asset map only'};
}
