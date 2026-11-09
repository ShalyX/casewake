"""Record the bounded Phase25 acceptance from existing evidence, preserving Phase24."""
from pathlib import Path
from collections import Counter
import json,datetime,hashlib,subprocess
r=Path(__file__).resolve().parents[1];e=r/'evidence/phase25'
def read(name):return json.loads((e/name).read_text(encoding='utf-8-sig'))
def write(path,v):(r/path).write_text(json.dumps(v,indent=2)+'\n',encoding='utf-8')
def text(path,s):(r/path).write_text(s.rstrip()+'\n',encoding='utf-8')
now=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')
release=read('deployment.json');sha=release['appCommit'];assert release['state']=='READY' and release['aliasDeploymentId']==release['deploymentId']
live=read('production-acceptance.json');assert live['passed'] and len(live['checks'])==26 and live['memoryWrites']==0
assert live['responses']['completedInventoryBefore']['data']['allStoredMemories']==13==live['responses']['completedInventoryAfter']['data']['allStoredMemories']
assert live['catalog']['count']==1 and live['catalog']['coverageComplete']
api=read('production-api.json');assert api['passed'] and len(api['checks'])==33 and api['memoryWrites']==0
for n in ['public-browser.json','public-browser-repeat.json']:
 v=read(n);assert v['passed'] and len(v['checks'])==19 and v['memoryWrites']==0 and v['base']=='https://casewake.vercel.app'
workflow=read('production-workflow.json');assert workflow['passed'] and len(workflow['checks'])==21 and workflow['unexpectedMutationRequests']==0
receipt=read('receipt-accessibility.json');assert receipt['passed'] and len(receipt['runs'])==4 and all(not a['violations'] and a['overflow']==0 for x in receipt['runs'] for a in x['audits'])
static=read('production-static.json');assert len(static['results'])==20 and not static['errors'] and static['writes']==0 and all(not x['violations'] and x['scrollWidth']<=x['viewport'] for x in static['results'])
motion=read('motion.json');assert motion['passed'] and len(motion['runs'])==4 and sum(len(x['checks']) for x in motion['runs'])==98
assert read('states.json')['passed'] and len(read('states.json')['checks'])==29
assert read('library-states.json')['passed'] and len(read('library-states.json')['checks'])==10
assert read('keyboard.json')['passed'] and len(read('keyboard.json')['checks'])==28
assert read('review-joins.json')['passed'] and read('artifact-refresh.json')['passed'] and read('surfaces.json')['passed'] and read('public-assets.json')['passed']
baseline=read('baseline-api.json');assert sum(not x['passed'] for x in baseline['checks'])==6
assert read('baseline-browser.json')['forgedConfirmed'] and read('baseline-browser.json')['malformedAsEmpty']
for n in ['EVIDENCE.md','PROOF.md','SCORECARD.md','SUBMISSION.md']:
 p=r/'evidence/history'/(n.removesuffix('.md')+'-through-phase24.md')
 if not p.exists():p.write_bytes((r/n).read_bytes())
reg=json.loads((r/'evidence/phase24/claim-registry.json').read_text());reg.update(date='2026-11-09',checkedAt=now,baseAuditCommit=sha,deployment=release,successorOf='evidence/phase24/claim-registry.json')
current={'C01','C02','C05','C06','C07','C08','C09','C10','C11','C12','C13','C14','C15','C16','C17','C18','C19','C27','C29','C32'}
mapping={'evidence/phase23/states.json':'evidence/phase25/states.json','evidence/phase23/library-states.json':'evidence/phase25/library-states.json','evidence/phase23/production-review.json':'evidence/phase25/review-joins.json','evidence/phase23/review-joins.json':'evidence/phase25/review-joins.json','evidence/phase23/production-static.json':'evidence/phase25/production-static.json'}
for x in reg['claims']:
 x['artifacts']=[mapping.get(p,p.replace('evidence/phase24/','evidence/phase25/') if (r/p.replace('evidence/phase24/','evidence/phase25/')).is_file() else p) for p in x['artifacts']]
 x['artifacts']=list(dict.fromkeys(x['artifacts']))
 x['environment']=x['environment'].replace('e4c8bcc',sha[:7]);x['freshness']['checked_at']=now
 if x['status']!='BLOCKED':x['last_verified_at']=now
 else:x['reviewed_at']=now
 if x['id'] in current:x['observed_at']=live['completedAt'] if x['freshness']['kind']=='live-snapshot' else now
 if x['id']=='C03':x['observed_at']=read('artifact-refresh.json')['checkedAt']
 if x['id']=='C11':
  x['artifacts']=['PRODUCT-COVERAGE.md','evidence/phase23/acceptance.json','evidence/phase25/acceptance.json','evidence/phase25/production-acceptance.json']
  x['limitations']+=' Phase25 verifies the changed receipt/discovery surfaces on the new release; Phase23 remains the original all-eight-P0 acceptance.'
 if x['id']=='C14':
  x['claim']='The bounded public Red Team audit passes; tested recording/recovery rejections and client trust boundaries hold.'
  x['proof_standard']='Thirty-three actual public rejection/read probes,26 integration/access checks and21 controlled deployed-frontend attacks pass; exact scope and known limitations are recorded.'
  x['method']=x['proof_standard'];x['artifacts']=['evidence/phase25/production-api.json','evidence/phase25/production-acceptance.json','evidence/phase25/production-workflow.json','RED_TEAM_REVIEW_ROUSE_2026-11-09.md']
  x['limitations']='A bounded owned-app audit, not an independent pentest, load/DoS test or exhaustive DLP/history scan. Rejected requests are real; forged cache/service responses are explicitly controlled. No new Mainnet write or chain execution.'
 if x['id']=='C16':x['artifacts']=['evidence/phase25/deployment.json','evidence/phase25/acceptance.json','evidence/phase25/surfaces.json']
 if x['id']=='C18':x['limitations']='Default master differs from the pinned release (61 commits ahead at the recorded GitHub comparison). Use the pinned source; no merge/default-branch change occurred.'
 if x['id']=='C25':
  x['claim']='Canonical Product Hygiene and tracked-history gates have passed.'
  x['proof_standard']='Run Phase26 Product Hygiene on the released repository and history; close findings and record independent checks.';x['method']=x['proof_standard']
  x['dependency']='Phase26 Product Hygiene has not been completed for the current release.'
  x['next_action']='Run the canonical Product Hygiene workflow on the current release and tracked history.'
  x['limitations']='Phase25 Red Team passes. Phase26 remains open; bounded public-asset secret checks do not substitute for canonical Product Hygiene or a tracked-history scan.'
 if x['id']=='C27':
  x['artifacts']=['evidence/phase25/production-static.json','evidence/phase25/receipt-accessibility.json','evidence/phase25/keyboard.json','evidence/phase25/states.json','evidence/phase25/library-states.json','evidence/phase25/motion.json']
  x['limitations']='Chromium only;20 public viewport scans,8 controlled receipt-state scans,29 workspace/10 library/28 keyboard checks and4 local normal/reduced recordings (98 assertions). Automated Axe is not screen-reader certification. Decorative arrow contrast is an automated incomplete result, retained from the existing design; no app violation/overflow detected.'
 if x['id']=='C29':x['claim']='This Red Team audit performs no new chain execution or Mainnet memory write.';x['artifacts']=['evidence/phase25/production-acceptance.json','evidence/phase25/production-api.json','evidence/phase25/public-browser.json','evidence/phase25/production-workflow.json']
 if x['id']=='C32':x['artifacts']=['evidence/phase25/states.json','web/src/lib/unified-recall.ts']
counts=dict(Counter(x['status'] for x in reg['claims']));blocked=[x['id'] for x in reg['claims'] if x['status']=='BLOCKED' and x['criticality']=='CRITICAL']
write('evidence/phase25/claim-registry.json',reg)
accept={'passed':True,'date':'2026-11-09','checkedAt':now,'appCommit':sha,'deploymentId':release['deploymentId'],'claims':32,'statusCounts':counts,'criticalClaims':22,'unresolvedCriticalIds':blocked,'unclosedCriticalIds':[],'newMainnetWrites':0,'actualPublicAdversarialChecks':33,'freshLiveReadChecks':26,'freshBrowserChecks':19,'freshBrowserRepeatedRuns':2,'controlledDeployedAttackChecks':21,'workspaceChecks':29,'libraryChecks':10,'keyboardChecks':28,'publicViewportScans':20,'controlledReceiptStateScans':8,'normalReducedRuns':4,'motionAssertions':98,'openP0P1Findings':0,'nextPhase':'PRODUCT_HYGIENE','scope':'Approved single-operator namespace and one reviewed cancellation case; bounded audit, not security certification.'}
write('evidence/phase25/acceptance.json',accept)
state=json.loads((r/'.hackathon/state.json').read_text());state['revision']=41;state['phase']='PRODUCT_HYGIENE';state['active_specialist']='QA / Product Hygiene';state['red_team_complete']=True
state['evidence_status']='PHASE25_RED_TEAM_PASS: four findings closed; fixed public release,33 actual adversarial +26 integration/access +19 browser checks repeated twice. Inventory13/one reviewed case; no new Mainnet writes. Phase26 hygiene remains.'
state['milestones']['RED_TEAM']='PASS - BOUNDED PUBLIC RELEASE: four findings fixed;33 real API probes,26 integration/access,19 browser checks repeated twice and21 controlled UI attacks. RED_TEAM_REVIEW_ROUSE_2026-11-09.md.'
state['milestones']['PROOF_ENGINE']='PASS - SUCCESSOR DISPOSITION:32 claims/22 critical; Phase25 registry/source binding refreshed. Five critical blockers remain, with C25 narrowed to Phase26 hygiene.'
state['proof_engine'].update(registry='evidence/phase25/claim-registry.json',manifest='evidence/phase25/proof-manifest.json',review='RED_TEAM_REVIEW_ROUSE_2026-11-09.md',current_deployment_unchanged=False,blocked_critical_ids=blocked)
state['red_team']={'status':'PASS_BOUNDED_PUBLIC_RELEASE','review':'RED_TEAM_REVIEW_ROUSE_2026-11-09.md','acceptance':'evidence/phase25/acceptance.json','app_commit':sha,'new_mainnet_writes':0,'open_p0_p1_findings':0}
state['visual_qa'].update(status='PASS_PHASE25_SOURCE_BOUND_REGRESSION',review='RED_TEAM_REVIEW_ROUSE_2026-11-09.md',acceptance='evidence/phase25/acceptance.json')
state['visual_qa']['score_scope']='Carried Phase22 internal visual heuristic; not rescored in Phase25.'
state['discoverability']['public_evidence']='evidence/phase25/public-browser.json'
state['production_release_history']=[x for x in state['production_release_history'] if x['app_commit']!=sha]
state['production_release_history'].append({'app_commit':sha,'deployment_id':release['deploymentId'],'url':'https://casewake.vercel.app','status':'READY_AND_RED_TEAM_ACCEPTED','evidence':'evidence/phase25/acceptance.json'})
state['production_release']={'app_commit':sha,'deployment_id':release['deploymentId'],'url':'https://casewake.vercel.app','status':'READY_AND_RED_TEAM_ACCEPTED','evidence':'evidence/phase25/deployment.json'}
state['next_action']='Phase26 PRODUCT_HYGIENE: run canonical repository/history hygiene against the released source; retain scoped case limits and explicit downstream blockers.'
state['updated_at']='2026-11-09'
write('.hackathon/state.json',state)
header='''# Rouse — current claim registry / Phase25 / 2026-11-09

This ledger supersedes the Phase24 snapshot. Product Lock1 and Design Lock2 remain unchanged. [Machine registry](evidence/phase25/claim-registry.json), [judge packet](PROOF.md), [Red Team review](RED_TEAM_REVIEW_ROUSE_2026-11-09.md). The [previous ledger](evidence/history/EVIDENCE-through-phase24.md) and Phase24 certificate are historical after the source change.

**Approved evidence ceiling:** one ShalyX-approved independently tested DeepBook cancellation integration procedure, one existing completed Mainnet blob and distinct signed exact-blob recall. Original operator deployment is unknown; no historical onchain repair.13 completed memories means all types, including one reviewed resolution. Discovery is related reading within one operator-managed namespace. This audit adds no human approval, memory write, wallet signing or chain execution.

ENG, QA and PROOF are Codex responsibility roles; REVIEW and OPS identify ShalyX's existing approval or follow-up ownership. These are not additional people or evidence of completed follow-ups. Each claim records its standard, evidence, observation/check dates, owner and invalidation rule. Live snapshots must be refreshed within24hours and before final recording/submission or after deployment/storage/account changes. Historical approval retains its original date. Controlled responses remain SIMULATED; BLOCKED is a closed disposition, not successful proof.

32 claims:16 VERIFIED,3 MEASURED,4 SIMULATED,2 REMOVED,1 inactive STALE,6 BLOCKED. Five critical dependencies remain: external utility, organizer track confirmation, final film, Phase26 hygiene and readiness/submission. Phase25 passes only within its bounded scope.

|ID|Claim|Status|Owner|Primary evidence|Limits or missing dependency|
|---|---|---|---|---|---|
'''
for x in reg['claims']:
 links='; '.join('['+Path(p).name+']('+p+')' for p in x['artifacts'][:2]);header+='|'+ '|'.join([x['id'],x['claim'],x['status'],x['owner'],links,x['limitations'].replace('|','/')])+'|\n'
text('EVIDENCE.md',header)
proof=(r/'evidence/history/PROOF-through-phase24.md').read_text();intro=proof.split('<a id="c01">')[0]
intro=intro.replace('e4c8bcc36a8a2fdc1656467e1e776602bf34169c',sha)
for name in ['production-acceptance.json','artifact-refresh.json','deployment.json','surfaces.json','claim-registry.json']:intro=intro.replace('evidence/phase24/'+name,'evidence/phase25/'+name)
intro=intro.replace('External utility, organizer track confirmation, final red team/hygiene, final film and submission readiness remain blocked.','Phase25 Red Team passes within its bounded scope. External utility, organizer track confirmation, Phase26 hygiene, final film and submission readiness remain blocked.')
intro=intro.replace('[Phase24 review](PROOF_ENGINE_REVIEW_ROUSE_2026-11-09.md)','[Phase25 review](RED_TEAM_REVIEW_ROUSE_2026-11-09.md)')
intro+='Saved browser receipts require a protected server job check after reload before completion or recurrence is claimed. Malformed discovery is unavailable, never a verified empty library. [Public adversarial checks](evidence/phase25/production-api.json) are actual rejected requests; [client-cache/service attacks](evidence/phase25/production-workflow.json) are controlled fixtures.\n\n'
for x in reg['claims']:
 intro+=f'<a id="{x["id"].lower()}"></a>\n\n### {x["id"]} — {x["status"]}\n\n{x["claim"]} Owner: {reg["owners"][x["owner"]]["name"]}. {x["limitations"]}\n\n'+' · '.join('['+Path(p).name+']('+p+')' for p in x['artifacts'])+'\n\n'
text('PROOF.md',intro)
for n in ['SCORECARD.md','SUBMISSION.md']:
 s=(r/n).read_text().replace('e4c8bcc36a8a2fdc1656467e1e776602bf34169c',sha).replace('evidence/phase24/claim-registry.json','evidence/phase25/claim-registry.json')
 s=s.replace('C25 final red team/hygiene blocked.','Phase25 bounded Red Team passes; C25 Phase26 hygiene remains blocked.').replace('final red-team/hygiene/film','Phase26 hygiene/film')
 s=s.replace('Phase25 RED_TEAM is next.','Phase25 RED_TEAM passes; Phase26 PRODUCT_HYGIENE is next.')
 text(n,s)
audit=(r/'OPERATOR_PHASE_AUDIT_2026-11-07.md').read_text().replace('Updated 2026-11-09 through Phase24 Proof Engine.','Updated 2026-11-09 through Phase25 Red Team.')
audit=audit.replace('| 25 | RED_TEAM | PARTIAL | Auth/mismatch/tamper/chronology/failure tests pass; final pass remains. |','| 25 | RED_TEAM | PASS — BOUNDED PUBLIC RELEASE | Four findings fixed and deployed;33 real API probes,26 read/access checks,19 actual browser checks repeated twice,21 controlled UI attacks. No new Mainnet write; RED_TEAM_REVIEW_ROUSE_2026-11-09.md. |')
audit=audit.replace('Phases15–24 pass within their documented scopes; Phase25 RED_TEAM is next.','Phases15–25 pass within their documented scopes; Phase26 PRODUCT_HYGIENE is next.')
audit=audit.replace('Current release: evidence/phase23/release.json.','Current release: evidence/phase25/deployment.json. Prior accepted release: evidence/phase23/release.json.')
text('OPERATOR_PHASE_AUDIT_2026-11-07.md',audit)
checkpoint=f'''# Phase25 checkpoint — Rouse / 2026-11-09

Red Team PASS within the approved public single-operator scope. Four findings closed: altered cache claiming completion, malformed catalogue claiming empty, unexplained409 allowing job dismissal, and malformed authorized JSON returning502. The fixed release is {sha[:7]}, deployment {release['deploymentId']}.33 actual adversarial API probes,26 actual integration/access checks,19 actual browser checks repeated twice and21 controlled deployed-UI attacks pass.20 public viewport scans,8 controlled receipt-state scans,29 workspace/10 library/28 keyboard checks and4 normal/reduced recordings pass.13 completed memories include one reviewed resolution; no new Mainnet write, human approval or chain execution. Original operator deployment remains unknown; no historical onchain repair.

Review: RED_TEAM_REVIEW_ROUSE_2026-11-09.md. Current Phase26 PRODUCT_HYGIENE. Current registry/source certificate: evidence/phase25. Phase24 artifacts remain historical. External utility, track confirmation, final film, hygiene and readiness/submission remain blocked. Feature freeze and submission readiness remain false.

---

'''
old=(r/'PROJECT.md').read_text();text('PROJECT.md',checkpoint+old if not old.startswith('# Phase25 checkpoint') else checkpoint+old.split('---\n\n',1)[1])
s=(r/'README.md').read_text().replace('Final proof registry, red team, product hygiene, demo film, pitch, judge simulation and submission gates remain separate.','Phase25 bounded Red Team passes on the public release; see [the review](RED_TEAM_REVIEW_ROUSE_2026-11-09.md). Product hygiene, demo film, pitch, judge simulation and submission gates remain separate.')
text('README.md',s)
print('Recorded Phase25 successor:32 claims, five critical blockers, Phase26 next. Generate manifest only after final review files exist.')
