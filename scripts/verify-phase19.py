"""Check storyboard completeness and source binding; not runtime motion QA."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'design/phase19/motion.json').read_text())
checks=[]
def check(value,label):
    if not value:raise AssertionError(label)
    checks.append(label)
check(len(data['transitions'])==14,'14 significant transition contracts present')
check(len({m['id'] for m in data['transitions']})==14,'Transition IDs unique')
fields=['name','start','end','trigger','meaning','pacing','interaction','mobile','reduced_motion','performance','risk','implementation_source']
for m in data['transitions']:
    check(all(m.get(k) for k in fields),m['id']+': all contract fields present')
    check('Instant' in m['reduced_motion'],m['id']+': reduced motion has an immediate equivalent')
    check('No new animation library' in m['performance'],m['id']+': performance/side-effect constraint')
workspace=(root/'web/src/app/workspace/page.tsx').read_text(encoding='utf-8')
for anchor in ['async function inspect(', 'async function loadRecall(', 'async function remember(', 'async function checkStorage(', 'async function verifySavedRecall(', 'retainStorage(', 'failedStorageJob', 'recoveryJobId']:
    check(anchor in workspace,'Actual handler/state binding exists: '+anchor)
check(data['case']==json.loads((root/'design/phase16/case-data.json').read_text()),'Recorded case unchanged from composition source')
check(data['budgets']['minimum_wait_ms']==0,'No artificial minimum wait')
check(data['budgets']['animation_library_bytes']==0,'No new animation runtime dependency')
check(data['budgets']['maximum_translation_px']<=4,'Translation restrained to at most 4px')
check(len(data['production_qa'])>=10,'Actual runtime acceptance remains explicit')
for phrase in ['response-unconfirmed','unknown','no-match','unavailable','receipt','review','unconfigured']:
    check(any(phrase in m['end'] for m in data['transitions']),'Branch covered: '+phrase)
out=root/'evidence/phase19';out.mkdir(exist_ok=True,parents=True)
(out/'contract-qa.json').write_text(json.dumps(dict(passed=True,scope='Static storyboard contract only; runtime motion NOT VERIFIED',checks=checks,memoryWrites=0),indent=2),encoding='utf-8')
print(json.dumps({'passed':True,'checks':len(checks)}))
