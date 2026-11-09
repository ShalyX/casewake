"""Build reproducible successor wrappers; preserve historical QA contracts/evidence."""
from pathlib import Path
import re
import argparse
p=argparse.ArgumentParser();p.add_argument('--base',default='http://127.0.0.1:4242');a=p.parse_args()
r=Path(__file__).resolve().parents[1];out=r/'output/playwright';out.mkdir(parents=True,exist_ok=True)
names=['phase25-receipt-accessibility','phase25-browser-adversarial','phase25-workflow-attack','phase22-states-qa','phase22-library-states-qa','phase22-keyboard-qa','phase22-static-audit','phase22-motion-qa','phase23-review-joins','discoverability-live-browser']
for name in names:
 s=(r/'web/scripts'/(name+'.mjs')).read_text(encoding='utf-8')
 s=re.sub(r'export default async function \w+\(page\)\s*\{','async (page) => {',s,count=1)
 s=s.replace('evidence/phase22/','evidence/phase25/').replace('evidence/phase23/','evidence/phase25/').replace('evidence/discoverability/','evidence/phase25/discovery-')
 s=s.replace('http://127.0.0.1:4242',a.base).replace("const base='https://casewake.vercel.app'","const base='"+a.base+"'")
 if name=='phase22-states-qa':
  s=s.replace("data={error:'CONTROLLED FIXTURE storage job failed'}","data={code:'storage-job-failed',error:'CONTROLLED FIXTURE storage job failed'}")
  s=s.replace("await check('completed receipt survives reload',(await text()).includes('Mainnet write confirmed. Recall pending verification.'));","await check('completed receipt survives reload as saved/unverified metadata',(await text()).includes('Saved receipt requires server verification.'));")
  needle="await page.getByPlaceholder('Digest of a comparable later failed incident').fill(second);"
  s=s.replace(needle,"await page.getByRole('button',{name:'Verify saved receipt',exact:false}).click();await page.getByText('Mainnet write confirmed. Recall pending verification.',{exact:true}).waitFor();"+needle)
 if name=='discoverability-live-browser':
  marker=" check(writes===0,'No recording request attempted');"
  extra="""
 await page.goto(base+'/workspace?digest=HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV');await page.locator('.exact-blob code').filter({hasText:blob}).waitFor({timeout:120000});
 check(await page.locator('.reviewed-by').innerText().then(t=>t.includes('ShalyX')),'Distinct actual failure recalls the same reviewed procedure and blob');
 await page.screenshot({path:'evidence/phase25/live-recurrence.png',fullPage:true});
 await page.locator('#digest').fill('DmskUFSYixcpEcNgJyyquQH6q8t7fA856Y6rzZuVbBQv');await page.getByRole('button',{name:'Inspect transaction',exact:false}).click();await page.getByText('Successful execution.',{exact:true}).waitFor({timeout:90000});
 check(await page.locator('.match-card').count()===0,'Actual successful inspection clears the prior reviewed recommendation');
"""
  assert marker in s;s=s.replace(marker,extra+marker)
 (out/('phase25-'+name+'.js')).write_text(s.rstrip().removesuffix(';'),encoding='utf-8')
print('Prepared Phase25 wrappers for '+a.base+'; controlled tests retain fixture labels.')
