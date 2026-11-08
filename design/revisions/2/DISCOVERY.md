# Rouse design lock revision 2 — discovery and public inspection

Date: 2026-11-08. Explicit user instruction: “fix discoverability before Phase 22. Let engineers inspect their own digests without reviewer access, browse reviewed cases, and search by error text. Keep recording protected.” This authorizes these changes to the previous access/entry contract. Product Lock revision1, Rouse identity and Working Precedent remain intact. The frozen Phase20 revision1 remains historical and reproducible; this supplement overrides its public-example restriction and adds a discovery route.

## User outcome

An engineer can discover what reviewed knowledge is available without already knowing a specific transaction. They can then inspect their own Sui Mainnet digest and assess actual applicability. A text search finds related reading; it does not confer a transaction compatibility verdict or claim that a new incident is fixed. Recording remains a separate protected human decision.

## Entry points and composition

Primary navigation includes Reviewed cases; mobile retains Reviewed cases and Open workspace while secondary links remain available through the wider site. Landing retains Inspect a transaction as primary and exposes Browse reviewed cases as secondary. The existing recorded example and historical field notes remain supporting proof. Workspace intake states that own-digest inspection is public and links back to browsing/search; reviewer access describes recording and receipt recovery only.

`/cases` uses the same Rouse shell, typography, palette and retained-record treatment. Desktop: compact introduction and direct digest CTA, full-width error textarea, Search and Browse actions, honest result/coverage status, then reviewed records. Each record pairs the procedure at roughly62% with reviewer/source/exact-blob provenance at38%. Mobile stacks procedure/action/context then provenance; full identifiers wrap. The card shows the complete procedure, original artifact, reviewer/date and completed blob. Secondary details contain original diagnosis/error/source digest/package/SDK. No fabricated category counts, extra records or empty feature cards fill the library.

The initial route browses automatically. Search uses a distinct submitted-query state and clears previous results before the next request; stale/unmounted responses cannot repopulate it. Keep input/action controls stable, announce result changes politely and keep keyboard disclosure native. No new motion dependency or automatic scroll is required. Response wording is about related cases and unchecked applicability. “Inspect my transaction” leads to the real workspace; it does not silently populate or apply a case.

## Read and recording boundary

Any syntactically valid digest may use `/api/transaction` and `/api/recall` without reviewer access, including when the historical PUBLIC_DEMO_MODE environment flag is set. Existing syntax validation, real Tatum reads, failure/success/unknown branches, deterministic compatibility and evidence-tier rules remain intact. Status advertises public inspection and no longer advertises an example-only user restriction. This does not allow a malformed or nonexistent digest to invent a failed result.

`/api/remember`, `/api/observations`, protected job recovery and acceptance verification retain their existing authorization. Both confirmation methods, evidence validation, explicit human approvals and no-automatic-write-retry rules stay intact. Public browsing/search never calls a storage method. No new memory write is needed for implementation or acceptance.

## Catalogue and search truth

`GET /api/cases` retrieves the configured account/namespace's active completed blob inventory through the signed MemWal client, then retrieves content through recall. Only records accepted by the existing validated-memory decoder enter the library; observations, simulation runbooks, unsupported review claims and prevention-only guards are excluded. DTO projection exposes only the reviewed case's public engineering fields and provenance. It never returns arbitrary raw metadata, extra record properties or an eligibility verdict.

The SDK list API provides metadata, not plaintext. Content recall is ranked and bounded. Catalogue coverage is complete only when inventory pagination is complete and every examined active blob's content was retrieved. Otherwise show the incomplete-coverage qualification, including with no search results. Walk at most10 inventory pages and retrieve at most100 contents per refresh. A short server cache and a shared in-flight read reduce repeated work. Its timestamp is shown; expired read failure returns unavailable rather than silently serving stale records as current. The current real workspace has13 completed records and one reviewed resolution; those counts are observed data, never UI constants.

`POST /api/cases/search` accepts3–2,000 characters and searches error signatures/module names, case wording, package/SDK fields and procedures in the retrieved reviewed catalogue. This is error-text/keyword search, not an AI explanation or a global semantic index. Generic trace words and numeric-only overlaps do not manufacture a related case. Results explain matching terms and carry `related-only`; a different error class is not made compatible by a text search. Query text is not durably stored, put into a browser query URL or sent to a memory-write endpoint. The implementation searches it in the server process rather than forwarding raw pasted logs for embeddings.

## State and acceptance additions

Loading names the catalogue read and clears previous cases. Unavailable browse/search is distinct from empty/no-related-results and offers retry. Empty results never say that no solution exists. Incomplete coverage remains explicit. Unsupported or observation-only records cannot enter reviewed results. Original case limitations remain visible; reviewing the source does not establish that the engineer's new failure is resolved.

Acceptance must show: a real reviewed record and exact blob in the anonymous library; real module/error search; unrelated search with no case; anonymous non-example Mainnet digest inspection and recall; public entry links; unchanged rejection of missing/incorrect recording credentials; catalogue unavailable/partial states; keyboard disclosure, no stale result, reduced motion and mobile layouts. Existing review/write/recovery regressions still apply. Phase22 must include these added surfaces in final visual, accessibility and motion acceptance. Deployment remains a separate action.
