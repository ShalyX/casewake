"""Prepare temporary CLI wrappers without changing historical Phase22 artifacts."""
from pathlib import Path
import re
r=Path(__file__).resolve().parents[1];out=r/'output/playwright';out.mkdir(parents=True,exist_ok=True)
names=['phase22-states-qa','phase22-library-states-qa','phase22-keyboard-qa','phase22-static-audit','phase22-motion-qa','phase23-review-joins','discoverability-live-browser']
for name in names:
    s=(r/'web/scripts'/(name+'.mjs')).read_text()
    s=re.sub(r'export default async function \w+\(page\)\s*\{','async (page) => {',s,count=1)
    s=s.replace('evidence/phase22/','evidence/phase23/').replace('evidence/discoverability/','evidence/phase23/discovery-')
    if name=='discoverability-live-browser':
        marker=" check(writes===0,'No recording request attempted');"
        extra="""
 await page.goto(base+'/workspace?digest=HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV');await page.locator('.exact-blob code').filter({hasText:blob}).waitFor({timeout:120000});
 check(await page.locator('.reviewed-by').innerText().then(t=>t.includes('ShalyX')),'Distinct actual failure recalls the same reviewed procedure and blob');
 await page.screenshot({path:'evidence/phase23/live-recurrence.png',fullPage:true});
 await page.locator('#digest').fill('DmskUFSYixcpEcNgJyyquQH6q8t7fA856Y6rzZuVbBQv');await page.getByRole('button',{name:'Inspect transaction',exact:false}).click();await page.getByText('Successful execution.',{exact:true}).waitFor({timeout:90000});
 check(await page.locator('.match-card').count()===0,'Actual successful inspection clears the prior reviewed recommendation');
"""
        assert marker in s;s=s.replace(marker,extra+marker)
    (out/(name+'.js')).write_text(s.rstrip().removesuffix(';'),encoding='utf-8')
print('Prepared7 wrappers in output/playwright; result JSON and captures belong to evidence/phase23.')
