# Phase 22 visual, accessibility and motion review — Rouse

PASS for the local production build against Design Lock revision 2. Public deployment remains unchanged. Product Lock revision 1 remains the authority: help Sui engineers preserve evidence-linked reviewed resolutions and reuse them for compatible failures. The fixes make that investigation usable with keyboard input and on narrow screens; recording remains protected.

## Environment and evidence

Branch codex/real-incident-loop, base 35196ac. Reviewed source hashes: evidence/phase22/acceptance.json. Next.js production build at http://127.0.0.1:4242, Chromium on Windows. Current catalogue contains one reviewed resolution among 13 completed records. Actual anonymous reads use Tatum/Walrus; all storage/failure motion scenarios intercept service responses and identify fixtures. New real memory writes: zero.

Targets: DESIGN.md, design/revisions/2/DISCOVERY.md, evidence/phase16/landing-desktop.png, workspace-eligible-desktop.png and mobile counterparts; Phase19 M01–M14. The three art directions and selected Working Precedent remain locked. These accessibility refinements do not reopen the concept.

## Findings, corrections and re-capture

1. Keyboard focus disappeared from search during loading and from transaction inspection when native disabled state replaced the active control. Busy controls now retain focus with aria-disabled plus guarded handlers; explicit retry transfers focus to a stable results region. The original failure is initial-focus-probe.json; final normal/reduced recordings assert retained focus. Search also retains the submitted query beside results, so editing the field cannot misrepresent which text produced them.
2. Storage accepted/completed and later lookup announcements could contradict the current operation. One persistent concise polite status now follows the active operation. Pending status no longer announces the entire job receipt. Initial-status-regression.json records the defect; state-accessibility.json and motion-qa.json record pending, completed and subsequent successful-read announcements.
3. Proof notes overflowed at 320px; journal inline code could overlap; long stored source digests overflowed the receipt. Flexible minmax columns, wrapping and minimum-width rules fix those causes. Small standalone evidence/navigation links now meet target sizing. Visible skip links, editor focus outlines and named main landmarks complete the keyboard route.

Re-captures: landing/workspace/library/journal/proof × desktop1440, tablet768, mobile390, reflow320. final-static-audit.json has 20 scans, zero violations, zero horizontal overflow, one skip link per route and no standalone targets below24px. Inline prose links are excluded from the standalone target check. Full-page controlled screenshots can include the off-viewport fixed skip link; live-fold.json confirms it remains above the viewport before and after scroll when unfocused.

## Target comparison and critique

Landing preserves the asymmetric promise/record composition, local wordmark and restrained lime emphasis. The recorded example is labelled and scoped. Workspace preserves the43:57 evidence/procedure relationship, with the complete procedure, compatibility reasons, reviewer and full exact blob outside collapsed provenance. Actual blob strip bottom: 851.3125px at1440×900. The actual approved text is longer than the old composed target and deliberately retains its limits. Mobile orders chain evidence before reviewed procedure and provenance. Library extends that same typographic system with a practical error-text entry, visible coverage, related-reading qualification and an inspect-my-transaction handoff. No compatibility verdict is inferred from a text search.

Typography, spacing, borders and evidence density are coherent across the main app and secondary pages. The library's longer mobile scroll is intentional: procedure/evidence remain readable instead of collapsing essential content. The journal is an editorial archive with historical Casewake sections; its record is not silently rewritten. No major clipping, missing core state, meaningless decoration or unlabelled fixture was found.

## Accessibility acceptance

axe-core4.14.0:20 actual-page viewport scans plus 28 controlled stable workspace-state scans and10 library-state scans; zero violations. Stable states wait for the180ms reveal to settle before contrast sampling. Initial mid-animation opacity produced a transient contrast report; the settled colors pass. The sole incomplete check in final static scans is a decorative aria-hidden arrow containing a non-text glyph; it uses the same lime as the adjacent link over graphite (manual contrast exceeds4.5:1).

29 workspace checks cover empty/setup/loading, chain failure/success/unknown, recall unavailable/no-match, observation/runbook/reviewed tiers, blank editor/validation/correction focus, explicit approvals, accepted/persisted/completed/unconfirmed/failed storage, mismatch and exact recurrence, and the observation-only receipt. The receipt state also passes at320px.10 library checks cover unavailable/partial/empty/read/search/retry/disclosure states.28 keyboard/fallback checks confirm first-tab skip links, main focus, one primary heading, reviewer disclosure, visible input outlines, digest accessible name, WCAG text-spacing reflow and blocked font/wordmark fallback.

This is a bounded browser review, not WCAG certification. Narrator/NVDA, physical touch devices, OS zoom and Safari/Firefox were not exercised.320px reflow and CSS text-spacing checks are reported precisely rather than described as a complete assistive-technology matrix.

## Motion acceptance

Four actual browser recordings: desktop/mobile × normal/reduced;98 assertions. Recordings exercise read → recall → explicit review → accepted pending storage → completed receipt → successful new lookup → distinct exact-blob recurrence → browse/search/no-result/unavailable/retry. All simulated service responses are visibly labelled; none creates a Mainnet memory.

Candidate reveal begins only after recall returns; normal CSS duration180ms and observed event timing are in motion-timing.json. Reduced motion has no reveal animation or active animations; CSS also removes transitions and pseudo-element animation. No artificial minimum network wait, timed success, parallax, continuous animation or hover movement is introduced. Background responses preserve focus; explicit replacement actions transfer it to a stable labelled region. Essential procedure/reviewer/reasons/blob stay inspectable.

Initial recording under concurrent accessibility scans showed host scheduling delays. The final sequence runs in the foreground without those scans. Full-page screenshots briefly resized the recording viewport; final captures use viewport screenshots to remove that QA artifact. Four WebM recordings and ffprobe metadata are preserved; desktop-normal.mp4 and mobile-reduced.mp4 are review copies. Contact sequences were visually inspected for readable loading, pending/completed boundaries, retained receipt, search states and consistent mobile order.

## Internal score and handoff

| Dimension | Score /4 | Evidence |
|---|---:|---|
| Product awareness/task clarity |4| Public digest and error-text entry; actual approved recurrence |
| Memorability/originality |3| Working Precedent evidence/procedure composition and Rouse wordmark |
| Composition/hierarchy |4| Actual desktop/mobile captures; complete blob within first desktop screen |
| Brand coherence |4| Local fonts/assets, graphite/paper/lime and shared secondary routes |
| Interaction/motion |3| Four normal/reduced recordings, focus and operation-bound status assertions |
| Completeness/accessibility/responsiveness |3|20 page scans,38 stable state scans, keyboard/reflow/fallback checks |

Total21/24; every dimension≥3; no hard veto. This is an internal quality heuristic, not an official judging score or external usability validation.

Production build, TypeScript, lint, existing unit suite and95 immutable design-contract checks pass.12 actual read/access checks re-confirm anonymous own-digest inspection, reviewed-case search and recording/recovery protection. API and library implementation files are unchanged from35196ac. The immutable approved evidence and all approval/write guards remain intact.

Phase22 is complete within local release scope. Phase23 BUILD_LOOP is next. Public release verification, external engineer utility/track confirmation, final hygiene, demo film, judge simulation and submission remain open. The QA clips are not the final hackathon film. requires_operator_decision:false.

Guidance applied: frontend-design/references/visual-qa.md; hackathon-operator specialists/visual-qa.md and design-quality-gates.md; playwright CLI; current [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Source skill paths are under C:/Users/USER/.codex/skills and the installed hackathon-operator plugin cache. Browser captures and service results, rather than skill invocation alone, establish this acceptance.
