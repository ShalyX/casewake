"""Validate the asset strategy; this does not accept the production app."""
from pathlib import Path
import json,struct,xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'design/phase18/assets.json').read_text())
checks=[]
def check(value,label):
    if not value: raise AssertionError(label)
    checks.append(label)
check(len(data['assets'])==12,'All 12 planned asset groups present')
check(len({a['id'] for a in data['assets']})==12,'Asset identifiers unique')
required=['surface','purpose','story_mode','priority','owner','status','format','responsive_variants','fallback','acceptance','alt']
for a in data['assets']:
    check(all(a.get(k) for k in required),a['id']+': required strategy fields complete')
    check(a['status'] in ['READY','IMPLEMENTATION_REQUIRED','CAPTURE_AFTER_INTEGRATION','OMITTED'],a['id']+': explicit delivery status')
    check(a['priority'] in ['MUST','SHOULD','NICE'],a['id']+': valid priority')
    for p in a['source']:check((root/p).exists(),a['id']+': source exists '+p)
    if a['status']=='READY':check(all(p.startswith('web/public/brand/rouse/') for p in a['source']),a['id']+': ready status bound to canonical identity files')
    if a['preview']:check((root/a['preview']).exists(),a['id']+': preview is an existing file')
sizes={}
for p in (root/'web/public/brand/rouse').glob('*.svg'):
    ET.parse(p)
    sizes[p.name]=p.stat().st_size
    check(p.stat().st_size<=10000,p.name+': valid SVG within identity budget')
def pngsize(p):
    b=p.read_bytes();check(b[:8]==b'\x89PNG\r\n\x1a\n',p.name+': PNG signature')
    return struct.unpack('>II',b[16:24])
brand=root/'web/public/brand/rouse'
for name,dim in [('social-card.png',(1200,630)),('avatar.png',(512,512)),('favicon-16.png',(16,16)),('favicon-32.png',(32,32))]:
    check(pngsize(brand/name)==dim,name+': intended pixel dimensions')
    sizes[name]=(brand/name).stat().st_size
check(sizes['social-card.png']<=150000,'Existing social PNG within strategy budget')
fonts=list((brand/'fonts').glob('*.ttf'))
check(len(fonts)==3,'Three canonical TTF font sources present; delivery optimization pending')
check(any((brand/'fonts').rglob('*OFL*')) or (brand/'FONT-LICENSE.txt').exists(),'Font licensing retained')
check(data['case']['blob']=='KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY','Exact reviewed blob bound to strategy')
check(data['case']['source']!=data['case']['recurrence'],'Source and recurrence distinct')
out=root/'evidence/phase18';out.mkdir(exist_ok=True,parents=True)
result=dict(passed=True,scope='Strategy inventory validation; final app captures and production QA not accepted',checks=checks,ready_file_bytes=sizes,available_font_bytes=sum(p.stat().st_size for p in fonts),font_budget_note='Available inventory, not transferred subset; measure used fonts after integration',memoryWrites=0)
(out/'asset-validation.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'passed':True,'checks':len(checks),'available_font_bytes':result['available_font_bytes']}))
