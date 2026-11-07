export default async function verifyRouseBrand(page) {
 const base='http://127.0.0.1:4235';
 const report={environment:'LOCAL BRAND ASSETS; product specimen is not deployed UI',checks:{},exports:[]};
 await page.goto(base+'/index.html');
 await page.evaluate(()=>document.fonts.ready);
 const fontChecks=await page.evaluate(()=>Object.fromEntries(['Rouse Heading','Rouse Body','Rouse Mono'].map(name=>[name,document.fonts.check('16px "'+name+'"')])));
 if(Object.values(fontChecks).some(value=>!value))throw new Error('A brand font failed to load');
 report.checks.fonts=fontChecks;
 if((await page.locator('svg').count())<10)throw new Error('Brand board not loaded');
 await page.setViewportSize({width:1440,height:1100});
 await page.screenshot({path:'evidence/brand-rouse/brand-board-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 report.checks.mobileNoOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
 if(!report.checks.mobileNoOverflow)throw new Error('Brand board has mobile overflow');
 await page.screenshot({path:'evidence/brand-rouse/brand-board-mobile.png',fullPage:true});
 for(const [file,width,height] of [['mark-dark',512,512],['mark-light',512,512],['wordmark-dark',660,144],['wordmark-light',660,144],['avatar',512,512]]){
  await page.goto(base+'/'+file+'.svg');
  const root=page.locator('svg').first();
  if(await page.locator('text').count())throw new Error('Logo depends on a live text font');
  await root.evaluate((node,size)=>{node.setAttribute('width',String(size.width));node.setAttribute('height',String(size.height));},{width,height});
  await root.screenshot({path:'web/public/brand/rouse/'+file+'.png',omitBackground:true});
  report.exports.push({file:file+'.png',width,height});
 }
 for(const size of [16,32]){
  await page.goto(base+'/favicon.svg');
  const root=page.locator('svg').first();
  await root.evaluate((node,size)=>{node.setAttribute('width',String(size));node.setAttribute('height',String(size));},size);
  await root.screenshot({path:'web/public/brand/rouse/favicon-'+size+'.png'});
  report.exports.push({file:'favicon-'+size+'.png',width:size,height:size});
 }
 await page.setViewportSize({width:1200,height:630});
 await page.goto(base+'/social-preview.html');
 await page.evaluate(()=>document.fonts.ready);
 report.checks.socialNoOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight);
 if(!report.checks.socialNoOverflow)throw new Error('Social card overflows its target crop');
 await page.screenshot({path:'web/public/brand/rouse/social-card.png'});
 report.exports.push({file:'social-card.png',width:1200,height:630});
 report.checks.outlinedLogos=true;
 report.passed=true;
 return report;
}
