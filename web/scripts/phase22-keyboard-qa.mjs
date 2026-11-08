// Read-only actual pages. This checks browser semantics, not a screen-reader certification.
export default async function phase22KeyboardQA(page){
 const base='http://127.0.0.1:4242',checks=[],pages=[];
 const check=(v,m)=>{if(!v)throw new Error(m);checks.push(m);};
 await page.unrouteAll();await page.goto(base);await page.evaluate(()=>sessionStorage.clear());
 for(const path of ['/','/workspace','/cases','/journal/casewake','/proof/splitcoins']){
  await page.setViewportSize({width:390,height:844});await page.goto(base+path);await page.evaluate(()=>document.fonts.ready);
  await page.keyboard.press('Tab');
  check(await page.getByRole('link',{name:'Skip to main content',exact:true}).evaluate(e=>e===document.activeElement&&e.getBoundingClientRect().top>=0),'Visible first-tab skip link '+path);
  await page.keyboard.press('Enter');check(await page.locator('#main').evaluate(e=>e===document.activeElement),'Skip focuses main '+path);
  check(await page.locator('h1').count()===1,'One primary heading '+path);
  await page.addStyleTag({content:'*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Text spacing reflows '+path);
  pages.push({path,textSpacingOverflow:await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)});
 }
 await page.goto(base+'/workspace');await page.locator('.access-disclosure summary').focus();await page.keyboard.press('Enter');
 check(await page.locator('.access-disclosure').evaluate(e=>e.open),'Reviewer disclosure works with keyboard');
 const key=page.getByPlaceholder('Enter the private workspace key');await key.focus();
 check(await key.evaluate(e=>{const s=getComputedStyle(e);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2;}),'Reviewer key has a visible focus outline');
 const client=await page.context().newCDPSession(page);const tree=await client.send('Accessibility.getFullAXTree');
 check(tree.nodes.some(n=>n.role?.value==='main'),'Accessibility tree exposes main landmark');
 check(tree.nodes.some(n=>n.role?.value==='textbox'&&n.name?.value==='Sui transaction digest'),'Accessibility tree names digest input');
 await client.detach();
 await page.goto(base+'/cases');await page.locator('#case-query').focus();
 check(await page.locator('#case-query').evaluate(e=>{const s=getComputedStyle(e);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2;}),'Error-text search has a visible focus outline');
 await page.screenshot({path:'evidence/phase22/keyboard-search-focus.png',fullPage:true});
 const fallback=await page.context().browser().newContext({viewport:{width:390,height:844}});const p=await fallback.newPage();
 await p.route('**/*',r=>/\.(woff2|svg)(\?|$)/.test(r.request().url())?r.abort():r.continue());
 await p.goto(base);check(await p.getByRole('img',{name:'Rouse',exact:true}).first().getAttribute('alt')==='Rouse','Wordmark failure retains product alt text');
 check(await p.getByRole('link',{name:'Inspect a transaction',exact:false}).isVisible(),'Font and image failure retains primary action');
 check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Fallback fonts retain mobile reflow');await p.screenshot({path:'evidence/phase22/asset-fallback-mobile.png',fullPage:true});await fallback.close();
 return {passed:true,checks,pages,realMemoryWrites:0,scope:'Chromium keyboard, accessibility tree, focus, text-spacing and blocked local asset fallback; no Narrator/NVDA or Safari/Firefox certification'};
}
