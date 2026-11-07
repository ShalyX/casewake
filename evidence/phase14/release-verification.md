# Phase 14 production release and verification

Result: PASS. Checked 2026-11-07 against https://casewake.vercel.app.

- Deployed application commit: 76e7d736446577692a29910a0d260e6c90bae562.
- Deployment: dpl_6UiERmNMLMS8gb8qR9QrQpiCnobu; READY; casewake.vercel.app alias verified.
- Project: prj_viVxYiEfafnOv3xwmqVUWppPAupB, existing team/project.
- Previous production/rollback: dpl_DV38eu8MsyLF1jfAJVAMhjhUW3Eu at 35d28f3348b7a409c24daec38e4993aacd89f281.
- Source branch: codex/real-incident-loop. Master and draft PR#1 were not merged. Later evidence-only commit does not change deployed app code.

## Actual production checks

Protected completed-job recovery returned200 and the approved exact blob. Anonymous job read403, wrong-incident association withheld202, invalid digest400, recognized-credential submission rejected400, fresh inventory 13 active unique Mainnet blobs.

Guest source/recurrence Tatum reads passed. Signed public recall returned the exact ShalyX-reviewed blob KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY for a distinct failure. Self/unrelated candidates excluded. Protected verifier returned gate3=verified; self400/mismatch409. Unknown public digest and anonymous remember/observation/verifier requests403.

Fresh public browser session had no fixture interception and no reviewer key entered. Desktop 1440/mobile 390 screenshots were inspected: reviewer, procedure, limits, positive matching rationale, evidence link, exact blob and count visible; mobile has no horizontal overflow. Current field notes include the approved case. Console contained only a password-field form advisory, no runtime error observed.

Evidence: production-read-only-acceptance.json; public-reviewed-case/acceptance.json; production-browser.json; production-desktop.png; production-mobile.png; corresponding .log files.

## Verification boundaries

Memory writes during Phase 14:0. Existing inventory remains13 (ten observations, smoke, simulation runbook, one reviewed integration resolution). Real approved write/receipt remains in evidence/real-case/.

The 26 local controlled browser checks include three intercepted fixture submissions. They verify new async delayed/ambiguous/failure/reload UI without pretending to be new Mainnet writes. Production completion recovery uses the existing genuine Mainnet job. Lost initial job ID still requires operator recovery; writes are never automatically retried.

Local checks passed: nine test scripts (including five new workflow tests), ESLint with zero warnings/errors, TypeScript --noEmit, webpack production build. Vercel ordinary cloud build reached READY. Functional state QA is not final brand/design/motion signoff.

Phase 14 product review PASS; all eight original P0 groups reviewed. Final name remains provisional. Next: naming decision then Phase 15 brand acceptance. External utility/track fit, final design, hygiene, video, judge simulation and submission remain open.

## Reproduce read-only checks

From web/, with reviewer credentials supplied through environment: set CASEWAKE_BASE_URL=https://casewake.vercel.app and run node scripts/verify-phase14-readonly.mjs, then node scripts/verify-public-reviewed-case.mjs. CASEWAKE_ACCEPTANCE_OUTPUT and CASEWAKE_PUBLIC_EVIDENCE_DIR can preserve separate environment artifacts. Scripts never create a memory: write requests are rejected controls.
