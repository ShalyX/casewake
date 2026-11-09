"""Validate Phase23 recorded acceptance and current source; does not run a fresh browser audit."""
from pathlib import Path
import json,hashlib,subprocess
r=Path(__file__).resolve().parents[1];e=r/'evidence/phase23'
def read(name):return json.loads((e/name).read_text(encoding='utf-8-sig'))
a=read('acceptance.json');assert a['passed'] and a['p0Verified']==8 and a['p0Missing']==[] and a['newMainnetWrites']==0
for name,h in a['sourceSha256'].items():
    assert hashlib.sha256((r/name).read_text(encoding='utf-8').encode()).hexdigest()==h,f'Changed reviewed source: {name}'
    deployed=subprocess.check_output(['git','show',a['appCommit']+':'+name],cwd=r).decode().replace('\r\n','\n')
    assert hashlib.sha256(deployed.encode()).hexdigest()==h,f'Current source differs from released source: {name}'
for name in ['live-acceptance.json','production-acceptance.json']:
    j=read(name);assert j['passed'] and j['memoryWrites']==0 and len(j['checks'])==26
    assert j['responses']['completedInventoryBefore']['data']['allStoredMemories']==j['responses']['completedInventoryAfter']['data']['allStoredMemories']
for name in ['static.json','production-static.json']:
    j=read(name);assert len(j['results'])==20 and j['writes']==0 and not j['errors']
    assert all(not x['violations'] and x['scrollWidth']==x['width'] and x['skipLinks']==1 and not x['smallTargets'] for x in j['results'])
for name in ['states.json','library-states.json','keyboard.json','unconfigured.json','review-joins.json','production-review.json','live-browser.json','production-browser.json','inventory-regression.json']:
    j=read(name);assert j['passed'] and j.get('memoryWrites',j.get('realMemoryWrites',0))==0
    for state in j.get('stateAudits',[]):assert not state['violations'] and state['overflow']==0
m=read('motion.json');assert m['passed'] and len(m['runs'])==4 and sum(len(x['checks']) for x in m['runs'])==98
for run in m['runs']:
    assert (r/run['video']).is_file() and run['fixtureSubmissions']==1 and run['realMemoryWrites']==0
    starts=[x for x in run['workspace']['events'] if x['type']=='animationstart']
    assert not starts if run['mode']=='reduce' else bool(starts)
release=read('release.json');assert release['deploymentId']==a['productionDeployment'] and release['appCommit']==a['appCommit'] and release['status']=='READY_AND_PUBLICLY_ACCEPTED'
state=json.loads((r/'.hackathon/state.json').read_text());assert state['phase']=='PROOF_ENGINE' and state['build_loop_complete'] and not state['submission_ready']
print('PASS: Phase23 eight-P0 coverage, discovery, current/released source and recorded local/public acceptance. No fresh network or storage test performed by this verifier.')
