"""Bind curated current evidence to the deployed Git source; no live calls."""
from pathlib import Path
import json,hashlib,subprocess
r=Path(__file__).resolve().parents[1];e=r/'evidence/phase25'
sha=json.loads((e/'deployment.json').read_text())['appCommit']
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',sha,'web/src','web/package.json','web/pnpm-lock.yaml','web/next.config.ts','web/tsconfig.json'],cwd=r,text=True).splitlines()
sources={}
for name in paths:
 current=(r/name).read_text(encoding='utf-8')
 released=subprocess.check_output(['git','show',sha+':'+name],cwd=r).decode('utf-8').replace('\r\n','\n')
 assert current==released,'Local source differs from deployed commit: '+name
 sources[name]=hashlib.sha256(current.encode()).hexdigest()
fixed=['.hackathon/state.json','PRODUCT.md','PRODUCT-COVERAGE.md','EVIDENCE.md','PROOF.md','PROJECT.md','SCORECARD.md','SUBMISSION.md','README.md','OPERATOR_PHASE_AUDIT_2026-11-07.md','RED_TEAM_REVIEW_ROUSE_2026-11-09.md','scripts/verify-proof-registry.py','scripts/prepare-phase25-browser.py','scripts/collect-phase25-browser.py','scripts/record-phase25-audit.py','scripts/freeze-phase25-proof.py','web/scripts/phase25-api-adversarial.mjs','web/scripts/phase25-workflow-attack.mjs','web/scripts/phase25-public-assets.mjs','web/scripts/phase25-receipt-accessibility.mjs','web/scripts/test-red-team.mjs','web/scripts/verify-phase23-live.mjs','web/scripts/verify-phase25-artifacts.mjs','web/scripts/verify-phase25-surfaces.mjs']
files=fixed+[str(p.relative_to(r)).replace('\\','/') for p in e.glob('*.json') if p.name!='proof-manifest.json']+['evidence/phase25/REVIEW.md','evidence/phase25/build.log','evidence/phase25/lint.log','evidence/phase25/unit-tests.log']
# Selected binary captures and actual QA video files are included; diagnostic logs are not certificates.
files += ['evidence/phase25/'+name for name in ['baseline-restored-receipt.png','restored-receipt.png','controlled-adversarial-mobile.png','controlled-receipt-320-reduce.png','controlled-receipt-1440-no-preference.png','discovery-library-desktop.png','discovery-search-mobile.png','discovery-own-digest-mobile.png','live-recurrence.png']]
files += [str(p.relative_to(r)).replace('\\','/') for p in e.glob('recordings/**/*.webm')]
artifacts={}
for name in sorted(set(files)):
 p=r/name
 if p.suffix in ['.png','.webm']:raw=p.read_bytes();normalization='binary'
 else:raw=p.read_text(encoding='utf-8-sig').encode();normalization='utf8-lf'
 artifacts[name]={'sha256':hashlib.sha256(raw).hexdigest(),'normalization':normalization}
manifest={'schema':'rouse-proof-manifest/v1','appCommit':sha,'registry':'evidence/phase25/claim-registry.json','supersedes':'evidence/phase24/proof-manifest.json','scope':'Current source/evidence binding only; live snapshots require refresh after invalidation. Phase24 certificate stays historical.','artifacts':artifacts,'sourceSha256':sources}
(e/'proof-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('Bound',len(sources),'released source files and',len(artifacts),'curated artifacts to',sha)
