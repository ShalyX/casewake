"""Check the recorded Phase22 acceptance against current reviewed source files.

This validates evidence consistency; it does not replace a fresh browser audit.
"""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
e=root/'evidence/phase22'
a=json.loads((e/'acceptance.json').read_text())
assert a['passed'] and a['designRevision']==2 and a['realMemoryWrites']==0
assert min(a['score'])>=3 and sum(a['score'])>=20 and not a['hardVetoes']
for name,digest in a['sourceSha256'].items():
    assert hashlib.sha256((root/name).read_text(encoding='utf-8').encode()).hexdigest()==digest, f'Re-audit changed source: {name}'
s=json.loads((e/'final-static-audit.json').read_text())
assert len(s['results'])==20 and s['writes']==0 and not s['errors']
assert all(not x['violations'] and x['scrollWidth']==x['width'] and x['skipLinks']==1 and not x['smallTargets'] for x in s['results'])
for name in ['state-accessibility.json','library-state-accessibility.json','keyboard-qa.json','motion-qa.json','live-fold.json']:
    result=json.loads((e/name).read_text());assert result['passed'] and result['realMemoryWrites']==0
    for state in result.get('stateAudits',[]):assert not state['violations'] and state['overflow']==0
m=json.loads((e/'motion-qa.json').read_text());assert len(m['runs'])==4
assert sum(len(x['checks']) for x in m['runs'])==98
for run in m['runs']:
    assert (root/run['video']).is_file() and run['fixtureSubmissions']==1
    starts=[x for x in run['workspace']['events'] if x['type']=='animationstart']
    assert not starts if run['mode']=='reduce' else bool(starts)
print('PASS: Phase22 recorded acceptance and reviewed source hashes; local production scope only.')
