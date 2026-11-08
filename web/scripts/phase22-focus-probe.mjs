export default async function phase22FocusProbe(page){
 const live=await page.request.get('http://127.0.0.1:4242/api/cases');const catalog=await live.json();
 const record=catalog.cases[0];record.title='CONTROLLED FIXTURE — focus probe';
 await page.unrouteAll();await page.route('**/api/cases',r=>r.fulfill({status:200,json:{...catalog,cases:[record]}}));
 await page.route('**/api/cases/search',async r=>{await new Promise(resolve=>setTimeout(resolve,700));return r.fulfill({status:200,json:{...catalog,results:[{record,matchedTerms:['moveabort'],relationship:'related-only'}]}});});
 await page.goto('http://127.0.0.1:4242/cases');await page.locator('.library-card').waitFor();
 await page.locator('#case-query').fill('MoveAbort');const button=page.getByRole('button',{name:'Search reviewed cases',exact:false});await button.click();
 const during=await page.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent?.slice(0,80)}));
 await page.locator('.library-card').waitFor();const after=await button.evaluate(e=>({retained:e===document.activeElement,tag:document.activeElement.tagName}));
 await page.unrouteAll();return {scope:'Controlled response timing, actual search controls',during,after};
}
