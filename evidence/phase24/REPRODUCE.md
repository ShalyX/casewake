# Proof Engine refresh / read-only

Authority: PRODUCT.md Lock1, Design Lock2, explicit ShalyX approval at evidence/real-case/human-approval.json. Start with PROOF.md and claim-registry.json. Registry closure does not satisfy the BLOCKED dependencies or create permission for another memory write.

Fresh actual public suite:

```powershell
$env:ROUSE_ACCEPTANCE_BASE='https://casewake.vercel.app'
$env:ROUSE_ACCEPTANCE_OUTPUT='evidence/phase24/production-acceptance.json'
node --env-file=<private-existing-env-path> web/scripts/verify-phase23-live.mjs
```

This reads the existing approved job and tests known pre-write rejections. It never submits an approved resolution. Do not print or copy environment values into output. Retain original observation timestamps and a separate current check date.

Run `node --conditions=react-server --experimental-strip-types web/scripts/verify-phase24-artifacts.mjs` to validate the immutable public GitHub evidence snapshot and replay recorded history. It checks the17-file stored evidence hash, four raw-history hashes against the pinned commit, both genuine reconciliations, two history controls and seven synthetic mutation controls. This is not a new Mainnet history fetch, causal review, operator deployment or write. The old artifact's pre-approval status is historical; the later explicit approval/receipt is separate proof. Never overwrite the immutable evidence/real-case files.

Run `node web/scripts/verify-phase24-surfaces.mjs` for public GET/article markers and unauthenticated GitHub visibility/default-branch comparison. Independently use authenticated Vercel get_alias/get_deployment, retaining only safe identity/READY/source metadata. Do not retrieve environment values or assume build READY means the UI/SDK works.

The Playwright public live-browser function used in Phase23 was reused with the same public base and captures redirected to phase24. It runs19 actual assertions with storage calls intercepted/aborted, including library/search → own digest → distinct exact-blob recall → clearing old results after a successful inspection. Wrapper/result is in the raw local output; the canonical public-browser.json records the returned checks. CLI0.1.23 was invoked from its existing cache. No screenshot was manufactured or used as proof of a new write.

For recorded consistency, run `python scripts/verify-proof-registry.py --require-fresh`, `python scripts/verify-phase23-qa.py` and `python scripts/verify-design-lock.py`. The registry verifier checks dispositions, owners, standards, dependencies, links, evidence/source hashes and recorded live age. It makes no live calls, cannot discover a deployment/storage change on its own and cannot clear blockers. Relevant source, dependency, environment or account changes require fresh scoped acceptance; do not merely replace hashes.

Freshness: volatile snapshots expire for a current-value claim after24hours and whenever the relevant environment/release/storage changes. Refresh before recording/submitting. Immutable evidence retains its actual old observation/approval dates; carried Phase23 UI/motion checks remain source-bound and are not described as rerun. Missing external evidence has no fabricated observation date. C21 is an inactive historical timing sample; C18/C30 are excluded claims. No new Mainnet write, chain execution, human approval, organizer message or submission occurred in Phase24.
