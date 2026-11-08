from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
lock=json.loads((root/'design/phase20/lock.json').read_text(encoding='utf-8'))
current_path=root/'design/current-lock.json'
current=json.loads(current_path.read_text(encoding='utf-8')) if current_path.exists() else None
checks=[]
def check(v,label):
    if not v:raise AssertionError(label)
    checks.append(label)
for name,expected in lock['files'].items():
    p=root/('design/phase20/DESIGN.locked.md' if current and name=='DESIGN.md' else name);b=p.read_bytes()
    if p.suffix.lower() in ['.md','.html','.css','.js','.json','.mjs','.txt','.svg']:b=b.decode('utf-8-sig').replace('\r\n','\n').encode('utf-8')
    check(hashlib.sha256(b).hexdigest()==expected,'Frozen dependency unchanged: '+name)
if current:
    check(current['revision']>=2 and current['base_manifest']=='design/phase20/lock.json','Current revision extends the archived base explicitly')
    for name,expected in current['files'].items():
        b=(root/name).read_text(encoding='utf-8-sig').replace('\r\n','\n').encode('utf-8')
        check(hashlib.sha256(b).hexdigest()==expected,'Current contract unchanged: '+name)
else:
    check((root/'DESIGN.md').read_text(encoding='utf-8')==(root/'design/phase20/DESIGN.locked.md').read_text(encoding='utf-8'),'Live design spec equals revision1 snapshot')
check([p['id'] for p in lock['p0_groups']]==list(range(1,9)),'All eight original P0 groups mapped')
check(sum(v for k,v in lock['target_assessment'].items() if k not in ['scope','total','hard_vetoes'])==lock['target_assessment']['total'],'Target-level assessment arithmetic consistent')
check(lock['target_assessment']['total']>=20 and lock['target_assessment']['hard_vetoes']==0,'Static target assessment meets documented threshold')
for name in ['evidence/phase16/target-qa.json','evidence/phase17/board-qa.json','evidence/phase18/asset-validation.json','evidence/phase18/map-qa.json','evidence/phase19/contract-qa.json','evidence/phase19/browser-qa.json','evidence/phase20/browser-qa.json']:
    d=json.loads((root/name).read_text(encoding='utf-8-sig'))
    check(d['passed'] is True,'Prerequisite scope passed: '+name)
    check(d['memoryWrites']==0,'No design memory writes: '+name)
check(len(json.loads((root/'design/phase18/assets.json').read_text())['assets'])==12,'Twelve asset groups linked')
check(len(json.loads((root/'design/phase19/motion.json').read_text())['transitions'])==14,'Fourteen motion contracts linked')
check(len(json.loads((root/'design/phase20/supplements.json').read_text())['pages'])==9,'Nine supplemental targets linked')
revision=current['revision'] if current else 1
result=dict(passed=True,revision=revision,scope='Design contract consistency; not production acceptance',checks=checks,memoryWrites=0)
out=root/('evidence/discoverability/design-lock-qa.json' if current else 'evidence/phase20/lock-qa.json')
out.write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({'passed':True,'revision':revision,'checks':len(checks),'frozen_dependencies':len(lock['files'])}))
