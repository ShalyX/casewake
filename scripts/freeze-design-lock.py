"""Record the reviewed contract and reproducible dependency hashes."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1];dest=root/'design/phase20'
if (dest/'lock.json').exists():
    raise SystemExit('Revision1 already exists. Record a new explicit lock revision and its review instead of overwriting it.')
def digest(p):
    b=p.read_bytes()
    if p.suffix.lower() in ['.md','.html','.css','.js','.json','.mjs','.txt','.svg']:
        b=b.decode('utf-8-sig').replace('\r\n','\n').encode('utf-8')
    return hashlib.sha256(b).hexdigest()
(dest/'DESIGN.locked.md').write_text((root/'DESIGN.md').read_text(encoding='utf-8'),encoding='utf-8')
paths=[root/p for p in ['DESIGN.md','PRODUCT.md','NAME_LOCK.md','design/phase20/CONTRACT.md','design/phase20/DESIGN.locked.md','design/phase17/references.json','design/phase18/assets.json','design/phase19/motion.json','evidence/phase16/target-qa.json','evidence/phase17/board-qa.json','evidence/phase18/asset-validation.json','evidence/phase18/map-qa.json','evidence/phase19/contract-qa.json','evidence/phase19/browser-qa.json','evidence/phase20/browser-qa.json']]
for folder in ['design/phase16','design/phase20','web/public/brand/rouse']:
    for p in (root/folder).rglob('*'):
        if p.is_file() and p.suffix.lower() in ['.html','.css','.js','.svg','.ttf','.txt','.json'] and p.name!='lock.json':paths.append(p)
paths=sorted(set(paths))
lock=dict(revision=1,date='2026-11-08',status='LOCKED_FOR_IMPLEMENTATION',review='DESIGN_LOCK_REVIEW_ROUSE_2026-11-08.md',scope='Approved design contract; actual application and motion acceptance pending',hash_method='SHA-256; UTF-8 text normalized to LF without BOM, binary bytes unchanged',files={p.relative_to(root).as_posix():digest(p) for p in paths},p0_groups=[dict(id=i,title=t) for i,t in enumerate(['Tatum provenance','Outcome distinctions','Human review and durable receipt','Compatible recall and exact/mismatch reasons','Completed inventory','Workspace states','Separate landing and workspace','Server secrets and protected writes'],1)],target_assessment=dict(scope='Static targets and documented interaction contract; not actual app QA or official hackathon score',product_awareness=4,originality=3,composition=4,brand_fit=4,meaningful_interaction=3,completeness_accessibility=3,total=21,hard_vetoes=0),remaining=['Design Engineering implementation','Font delivery optimization and measurement','Actual application static/motion QA','Current-release capture and deployment acceptance'])
(dest/'lock.json').write_text(json.dumps(lock,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'revision':1,'frozen_dependencies':len(paths)}))
