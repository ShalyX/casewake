export default async function phase22StaticAudit(page){
 const base='http://127.0.0.1:4242',axePath='../qa-tools/node_modules/axe-core/axe.min.js';
 const results=[];let writes=0;const errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.unrouteAll();
 for(const route of ['remember','observations'])await page.route('**/api/'+route,r=>{writes++;return r.abort();});
 await page.goto(base);await page.evaluate(()=>sessionStorage.clear());
 for(const [name,path]of[['landing','/'],['workspace','/workspace?digest=HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV'],['library','/cases'],['journal','/journal/casewake'],['proof','/proof/splitcoins']]){
  await page.setViewportSize({width:1440,height:900});await page.goto(base+path);
  if(name==='workspace')await page.locator('.exact-blob code').waitFor({timeout:120000});
  if(name==='library'){
   await page.locator('.library-card,.library-results .inline-error').first().waitFor({timeout:120000});
   if(await page.locator('.library-results .inline-error').count())await page.getByRole('button',{name:'Retry case discovery',exact:true}).click();
   await page.locator('.library-card').first().waitFor({timeout:120000});
  }
  await page.evaluate(()=>document.fonts.ready);await page.addScriptTag({path:axePath});
  for(const [label,width,height]of[['desktop',1440,900],['tablet',768,1024],['mobile',390,844],['reflow',320,900]]){
   await page.setViewportSize({width,height});
   const audit=await page.evaluate(async()=>{
    const a=await window.axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']},resultTypes:['violations','incomplete']});
    const summarize=v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html}))});
    const targets=[...document.querySelectorAll('a,button,input,select,textarea,summary')].filter(e=>{const b=e.getBoundingClientRect();return b.width&&b.height&&getComputedStyle(e).visibility!=='hidden'&&!e.disabled;}).map(e=>{const b=e.getBoundingClientRect();return {label:(e.innerText||e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.tagName).slice(0,90),width:b.width,height:b.height,inline:!!e.closest('p')&&getComputedStyle(e).display==='inline'};});
    return {axeVersion:window.axe.version,violations:a.violations.map(summarize),incomplete:a.incomplete.map(summarize),scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,skipLinks:[...document.querySelectorAll('a')].filter(a=>a.textContent.toLowerCase().includes('skip')).length,smallTargets:targets.filter(t=>(t.width<24||t.height<24)&&!t.inline)};
   });
   await page.screenshot({path:'evidence/phase22/'+name+'-'+label+'.png',fullPage:true});
   results.push({page:name,viewportName:label,width,height,...audit});
  }
 }
 return {scope:'Actual local production app, read-only live pages; automated audit requires manual follow-up',results,writes,errors,browserSupportsVideo:!!page.context().browser(),checkedAt:new Date().toISOString()};
}
