# Rouse discoverability review — 2026-11-08

**PASS — requested usability extension before Phase22.** Engineers can now inspect their own valid Sui Mainnet digests without reviewer access, browse reviewed cases at /cases, and search error text/keywords. Recording remains protected. Actual app and optimized local production bundle are implemented; public deployment is unchanged.

## Engineer journey

Landing and primary navigation expose Reviewed cases. Browse the current workspace's reviewed resolutions or search an error/module such as big_vector::leaf_remove. Each result shows the full procedure, matching text terms where applicable, reviewer, original evidence, completed blob and qualifications. Inspect my transaction leads to the actual workspace; any valid digest can be inspected without a key. Actual transaction evidence and existing compatibility checks determine eligible recall. Search never labels a case compatible or a new incident fixed.

## Catalogue, search and boundary

The catalogue is read from the real account/namespace through MemWal: completed inventory, then content retrieval. Only the existing decoder's validated reviewed resolutions enter the public DTO; observations, simulation runbooks, unsupported review claims and prevention-only guards are excluded. Extra record fields cannot leak through projection. Namespace completeness is measured rather than inferred from semantic recall. Missing/decryption-limited content produces explicit partial coverage. Empty results and unavailable services stay distinct; no stale case remains during a new search. A short shared read cache reduces repeated SDK work.

Search is error-text/keyword matching over retrieved reviewed content, including error/module/procedure/package/SDK fields. It returns related-only results with matching terms. Generic trace words or numeric-only overlap cannot promote a different error. Query input is bounded to3–2,000characters and is not durably stored or sent to a write endpoint. It is not a global or exhaustive index of Sui problems. The current real catalogue has one reviewed resolution among13 completed records; that is read data, not a UI constant. Coverage of those13 records was complete in acceptance.

Transaction and recall endpoints no longer gate arbitrary valid digests behind the example allowlist. Server syntax validation and real Tatum/Walrus evidence checks remain. Recording, observations, protected job recovery and acceptance verification retain byte-identical route source to aa7a31b. Actual requests with missing and incorrect reviewer credentials are denied before storage. No new memory was created; three submissions in the workflow regression were intercepted fixtures.

## Validation

Optimized production build, TypeScript, ESLint, existing unit tests and six new discovery unit tests pass. Actual browser/read acceptance ran on next start with PUBLIC_DEMO_MODE=true, demonstrating the old flag cannot reimpose the removed access restriction.

| Check set | Result |
|---|---|
| live-browser.json |17 actual checks: anonymous library and module search retrieve the original ShalyX record/exact blob; unrelated search clears results; library leads to an anonymous real failed digest outside the old examples; recording stays disabled without reviewer access; entry links and desktop/mobile layout work. |
| state-browser.json |10 controlled checks for unavailable versus empty, partial coverage, stale clearing, keyboard disclosure, reduced motion and mobile layout; no submissions. |
| workflow-regression.json |29 controlled existing review/storage checks including both attestations, field/focus correction, accepted-job focus, reload/ambiguous response, failed-job dismissal, receipt retention and exact/mismatch recurrence; three fixture submissions, no real writes. |
| config-regression.json |13 controlled Tatum/Walrus/access/inventory/proof-method checks; updated expectation explicitly allows public reads under the historical example flag. |
| primary-flow.json |20 actual checks retain the approved main workflow, exact-blob desktop fold, desktop/tablet/mobile composition, provenance, reduced motion and historical proof/field-note routes. |
| read-only-acceptance.json |12 actual public-read/access checks: real library/search, unrelated search, bounds, status, anonymous non-example transaction and recall, invalid digest, missing/wrong recording credentials and protected job read. |

Total89 browser checks and12 actual read/access checks. No new Walrus write. The reviewed record remains the independently tested cancellation integration procedure; original operator deployment is unknown and no historical onchain repair is claimed.

Desktop library and mobile search were visually inspected. A cold development read temporarily returned unavailable and a subsequent real read recovered; the UI did not fabricate an empty catalogue. Production-bundle acceptance passed. Final screenshots are from the local production bundle without development controls.

## Design and handoff

The user explicitly authorized the discoverability/access change. Design revision2 is recorded in design/current-lock.json and design/revisions/2/. The immutable Phase20 revision1 and its71 frozen dependencies remain verifiable; the current spec explicitly overrides its example-only read restriction and adds the library/search composition. Original Product Lock revision1 and all eight P0 groups remain intact.

Phase22 must now review landing, workspace and /cases, including catalogue loading/empty/unavailable/partial states, error search and transaction handoff, keyboard/accessibility and actual normal/reduced-motion sequences. Existing public deployment is not represented as updated. Local production preview: http://127.0.0.1:4242/cases. Original dirty checkout and unrelated investigation artifacts are preserved.
