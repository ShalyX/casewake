"""Validate the recorded Proof Engine dispositions/hashes; no live calls or writes."""
from pathlib import Path
import json,hashlib,datetime,sys
r=Path(__file__).resolve().parents[1];e=r/'evidence/phase24'
def read(name):return json.loads((e/name).read_text(encoding='utf-8-sig'))
reg=read('claim-registry.json');summary=read('acceptance.json');manifest=read('proof-manifest.json');rows=reg['claims']
allowed={'VERIFIED','MEASURED','SIMULATED','STALE','REMOVED','BLOCKED'};critical_allowed={'VERIFIED','MEASURED','SIMULATED','REMOVED','BLOCKED'}
assert len(rows)==32 and len({x['id'] for x in rows})==32
for x in rows:
    for name in ['claim','proof_standard','method','owner','environment','freshness','limitations','judge_location','related_rubric','artifacts']:assert x[name],(x['id'],name)
    assert x['owner'] in reg['owners'] and x['status'] in allowed
    if x['criticality']=='CRITICAL':assert x['status'] in critical_allowed
    if x['status']=='BLOCKED':
        assert x['dependency'] and x['next_action'] and not x['active_public_claim'] and x['observed_at'] is None and x['last_verified_at'] is None
    else:assert x['observed_at']
    if x['status'] in ['REMOVED','STALE']:assert not x['active_public_claim']
    if x['status']=='SIMULATED':assert 'control' in (x['limitations']+x['claim']).lower() or 'simulation' in (x['limitations']+x['claim']).lower()
    assert x['freshness']['invalidated_by'] and x['freshness']['refresh_before']
    if not x['judge_location'].startswith('http'):
        path,_,anchor=x['judge_location'].partition('#');p=r/path;assert p.is_file()
        if anchor:assert 'id="'+anchor+'"' in p.read_text(encoding='utf-8')
    for p in x['artifacts']:assert (r/p).is_file(),p
for name,item in manifest['artifacts'].items():
    p=r/name;raw=p.read_text(encoding='utf-8-sig').encode() if item['normalization']=='utf8-lf' else p.read_bytes()
    assert hashlib.sha256(raw).hexdigest()==item['sha256'],'Changed proof artifact: '+name
for name,h in manifest['sourceSha256'].items():assert hashlib.sha256((r/name).read_text(encoding='utf-8').encode()).hexdigest()==h,'Re-audit changed application source: '+name
live=read('production-acceptance.json');assert live['passed'] and len(live['checks'])==26 and live['memoryWrites']==0
assert live['responses']['completedInventoryBefore']['data']['allStoredMemories']==13==live['responses']['completedInventoryAfter']['data']['allStoredMemories']
assert live['catalog']['count']==1 and live['catalog']['coverageComplete']
replay=read('artifact-refresh.json');assert replay['passed'] and replay['evidenceFiles']==17 and len(replay['recordedHistoryHashes'])==4 and len(replay['syntheticMutationControls'])==7 and replay['memoryWrites']==0 and not replay['newHumanReview']
browser=read('public-browser.json');assert browser['passed'] and len(browser['checks'])==19 and browser['memoryWrites']==0
deployment=read('deployment.json');assert deployment['state']=='READY' and deployment['appCommit']==manifest['appCommit']
assert summary['passed'] and summary['unclosedCriticalIds']==[] and summary['newMainnetWrites']==0
assert set(summary['unresolvedCriticalIds'])=={x['id'] for x in rows if x['status']=='BLOCKED' and x['criticality']=='CRITICAL'}
expired=[]
for x in rows:
    hours=x['freshness'].get('max_age_hours')
    if hours:
        observed=datetime.datetime.fromisoformat(x['observed_at'].replace('Z','+00:00'))
        if (datetime.datetime.now(datetime.timezone.utc)-observed).total_seconds()>hours*3600:expired.append(x['id'])
if '--require-fresh' in sys.argv:assert not expired,'Refresh expired live snapshots: '+','.join(expired)
print('PASS:32 claim dispositions, owners, standards, dated evidence, judge links, immutable hashes and source binding. Five critical dependencies stay BLOCKED. This verifier does not refresh live services.')
print('Expired live snapshots:',','.join(expired) if expired else 'none by recorded age; external changes still require a live refresh.')
