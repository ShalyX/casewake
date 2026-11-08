// A second actual production server, launched with sponsor/reviewer variables removed.
export default async function phase23Unconfigured(page){
 const base='http://127.0.0.1:4243',checks=[];let writes=0;
 const check=(v,m)=>{if(!v)throw new Error(m);checks.push(m);};
 await page.unrouteAll();for(const path of ['remember','observations'])await page.route('**/api/'+path,r=>{writes++;return r.abort();});
 const status=await (await page.request.get(base+'/api/status')).json();check(status.tatumConfigured===false&&status.walrusConfigured===false&&status.reviewerWritesEnabled===false,'Actual missing environment disables providers and reviewer writes');
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/workspace');await page.getByText('Transaction lookup is not configured.',{exact:false}).waitFor();
 check(await page.getByRole('button',{name:'Inspect transaction',exact:false}).isDisabled(),'Lookup remains disabled without chain credentials');
 check(await page.getByText('Memory is not configured.',{exact:false}).isVisible(),'Memory setup state is explicit');
 check(!(await page.locator('body').innerText()).includes('0 completed memories'),'Unknown inventory is not a synthetic zero');
 await page.screenshot({path:'evidence/phase23/actual-unconfigured-workspace.png',fullPage:true});
 await page.goto(base+'/cases');await page.getByText('The reviewed-case library is temporarily unavailable.',{exact:false}).waitFor();
 check(await page.locator('.library-empty').count()===0,'Unconfigured library does not claim no cases');
 check(await page.getByRole('button',{name:'Retry case discovery',exact:true}).isVisible(),'Read retry stays available');
 await page.screenshot({path:'evidence/phase23/actual-unconfigured-library.png',fullPage:true});
 check(writes===0,'Setup checks never attempt storage');await page.unrouteAll();return {passed:true,checks,realMemoryWrites:0,scope:'Actual production process with credentials removed; no simulated API responses'};
}
