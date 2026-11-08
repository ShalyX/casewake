# Rouse design lock — revision 1

Locked 2026-11-08 by internal Art Director review under the user's instruction to continue. This is an implementation contract, not user visual signoff, final application QA or a production release. Product Lock revision 1 and the explicitly chosen Rouse name remain authoritative.

## Authority and conflicts

Use PRODUCT.md for purpose and original P0 scope; NAME_LOCK.md and canonical web/public/brand/rouse assets for identity; this revision and DESIGN.md for composition; design/phase18/assets.json for delivery requirements; design/phase19/motion.json for response behavior. Phase 16 targets establish the main compositions; Phase 20 supplements specify remaining layouts. Where a Phase 16 study simplifies configuration, this revision controls. Dated process notes are historical. No prototype controls, illustrative data, disabled form behavior or study banner belongs in the product.

The design snapshot and dependency hashes are in design/phase20/DESIGN.locked.md and lock.json. Verify with `python scripts/verify-design-lock.py`. A deliberate change to hierarchy, essential evidence, state semantics, brand or motion requires a new recorded lock revision and reinspection. Routine implementation fixes and responsive refinements may proceed within this contract; no cosmetic permission gate is added.

## Purpose and composition

For Sui engineers: inspect the actual execution, compare a compatible prior reviewed resolution, and retain new evidence-linked reasoning after human approval. The main canvas pairs current chain evidence with prior human judgment. The product is broader than the single supporting cancellation example. It never automatically repairs, signs or settles a transaction.

Reuse the selected Working Precedent direction. Canonical graphite/paper/recall/failure tokens and retained-counter wordmark stay intact. Self-host Space Grotesk headings, DM Sans reading copy and DM Mono provenance. Main workspace heading 30px; body 16px/1.6; secondary provenance 12–14px; identifiers wrap. Use Phase16 CSS as a numeric layout reference, not a runtime import. The shell's maximum outer width is 1344px, desktop gutters 48px, mobile gutters 22px. Main task canvas is approximately 43:57 columns with 28px gap. Collapse at 760px; inspect 768px as the narrow paired-column limit. Field-note reading column max760px, 17px/1.8. Preserve canonical logo minimum104px and touch controls at least44px.

Landing: general promise/action at left and recorded reviewed example at right. Method uses ruled task rows; actual proof follows. Workspace: compact heading/intake, then chain evidence and reviewed procedure. At1440×900 the procedure, compatibility reasons, reviewer and entire exact-blob strip must fit in the first fold. Mobile ordering is intake → current evidence → procedure → reasons/limits → reviewer/source/blob → optional details. No horizontal code scroller or sticky overlay obscures proof. Native details contains only secondary error/provenance depth.

## Route and page contract

| Real route | Locked composition and behavior |
|---|---|
| `/` | Rouse navigation; product promise; Inspect a transaction primary action to `/workspace`; Open reviewed example secondary action to `/workspace?digest=HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV`; method rows; bounded reviewed-case proof; footer. Recorded example caption must identify its scope and date. |
| `/workspace` and digest query | Phase16 paired evidence layout plus Phase20 state supplements. Preserve existing lookup, compatibility, protected reviewer/write, asynchronous job recovery and exact-recall handlers. Query examples use actual digest inspection, never a hardcoded successful result. |
| `/journal/casewake` | Keep URL stable. Rouse shell; dated Nov7 reviewed-case update before Nov4 history; readable editorial column and adjacent evidence/source links. Keep original Casewake historical screenshot captions/dates. Replace current promotional captures only after Rouse implementation/read-only QA. |
| `/proof/splitcoins` | Keep URL stable. Rouse shell; explicit simulation qualification; two comparison panels at wide widths, one column on mobile; original simulation hash/blob/source/reproduction links and scope. Do not insert the cancellation-resolution blob here. |
| Existing API and evidence URLs | Preserve contracts and immutable historical names/paths. No new API or auth system is required by this redesign. |

Navigation must work across these routes with a clear workspace return path. Keep article/source links functional and visible; do not adopt static study-relative links. Tatum supplies transaction evidence, Walrus retains reviewed memory, and human review supplies the judgment; captions must keep these contributions distinct. No invented live-service badges or sponsor endorsement.

## Configuration and state contract

| State | Content and allowed next action |
|---|---|
| Empty | Blank digest intake and permitted example. No fabricated result/count. |
| Transaction access unconfigured | Operator setup guidance without secrets; transaction lookup unavailable. |
| Memory unconfigured | Preserve permitted transaction lookup and actual chain evidence; explain that memory search is unavailable. Do not disable Tatum solely because Walrus is missing. |
| Reviewer access missing/rejected | Keep permitted reads; expose private reviewer-key input in access disclosure; protect all writes using existing server policy. Never imply that supplying a key alone approves a case. |
| Public example mode | Explain the actual example restriction near intake only when this mode applies. Authenticated mode must not show the public-example restriction. |
| Reading | Clear earlier query evidence before the new request; specific read status. Completed receipt stays separate. |
| Transaction request error/missing | Visible read failure with relevant read retry; no onchain failure inference. |
| Execution succeeded | Actual success evidence; no failure resolution recommendation. |
| Execution unknown | Neutral uncertainty; no failed classification, failure recall or reviewed write. |
| Failed, recalling | Current failure evidence visible while memory response is pending. |
| Eligible reviewed case | Procedure, reasons, SDK/package uncertainties, original-deployment limit, reviewer, source and full exact blob visible together. No Apply fix or incident-resolved action. |
| No eligible reviewed case | Failure remains unresolved; optional observation/runbook evidence stays separately labelled; protected review path available. |
| Recall unavailable | Current evidence remains; no conclusion about saved cases. Retry memory read only. |
| Human review | Both proof methods and all fields/explicit approvals preserved. Start diagnosis/change/reviewer/approvals blank. Proof method exposes its corresponding URL/verification or successor fields. Invalid fields get consistent summary and inline errors; auth/transport failure gets operational guidance. |
| Writing | One attempt identity and duplicate-submit protection. No progress percentage or completed receipt. Preserve draft until acceptance/rejection is known. |
| Response unconfirmed | Preserve attempt identity; explain uncertain acceptance; existing-job recovery only. Do not automatically resubmit or claim pending acceptance without a job ID. |
| Accepted pending job | Full accepted job identity and status read. No blob until actual completion. |
| Known rejected review | Keep fields and rejection reason; no accepted job or receipt. Correct input/access as applicable. |
| Terminal failed job | Keep job identity and actual failure. Explicit local dismissal; no implicit new write. |
| Completed memory | Durable source/job/blob receipt from real completion; survives next query, reload and recall failure. Observation receipt explicitly excludes a resolution claim. |
| Recurrence self/mismatch/error | Explain exact failed condition. A completed storage receipt remains valid. Only a distinct compatible actual exact-blob result earns exact-recall success. |
| Inventory available | Actual unique completed count in the active namespace, labelled all record types. Exclude pending records; do not hardcode13. |
| Inventory unavailable/partial | Say unavailable/incomplete; do not coerce to zero. Inventory read cannot block transaction inspection or erase results. |

The nine supplemental targets show placements, not exhaustive production copy. Use actual response reasons and identifiers. Never substitute a captured sample job/blob into a live error or inventory state. M01–M14 control motion/focus. Native disclosure uses no height animation. Background completion preserves focus; a deliberate user-opened editor or validation error may move focus as specified. Reduced motion removes all tweens/loops/smooth scroll without changing information or business state.

## Original P0 coverage and acceptance

| Group from PRODUCT.md | Required implementation result | Acceptance evidence after integration |
|---|---|---|
| 1. Read-only digest lookup via Tatum gRPC, actual source/provenance | Full outcome/digest/network/checkpoint/time/source; permitted sample uses real handler. | Actual read-only Mainnet lookup plus visible evidence; no signing or submission. |
| 2. Failure/success/unknown distinction | Separate content and allowed actions, source-specific error handling. | Controlled branch checks plus actual failed evidence. No transport error classified as execution failure. |
| 3. Human-confirmed case and completion receipt | Both methods, required fields, explicit review/reuse approval, accepted/unconfirmed/pending/failed/completed, durable receipt. | Existing reviewed receipt/job can be read; controlled fixtures exercise submissions/recovery without new writes. Any new real case needs case-specific approval. |
| 4. Recall and exact/mismatch reasoning | Visible applicable reasons, uncertainty, original evidence, reviewer/full blob; separate lower tiers. | Approved distinct recurrence recalls exact blob; self/unrelated rejected; outage and no-match distinct. |
| 5. Completed real-memory count | Namespace-aware unique completed all-types count; truthful unavailable/partial state. | Actual read plus controlled unavailable/deduplication cases. |
| 6. Workspace states | All rows above remain reachable from existing handlers; no stale evidence or receipt loss. | Browser state matrix at1440×900,768px,390×844; reload/slow/error/instant requests. |
| 7. Separate landing and workspace | Functional navigation, entry/sample links, footer and secondary pages. | Browser route/query/navigation checks and visual comparison against targets. |
| 8. Server-only secrets / protected writes | Existing API auth/security boundary preserved; keys absent from URLs/captures/public UI/state announcements. | Existing guard/secret tests and unauthenticated denial checks; no live secret in evidence. |

## Implementation order and release gate

1. Integrate canonical identity/tokens and licensed optimized font delivery. Current TTF inventory totals426,584bytes; proposed used-font transfer ≤250KB needs measured subsets/WOFF2 or a reduced used set. Logo≤10KB, social≤150KB and optional screenshot budgets remain Phase18 planning limits until measured.
2. Implement landing and compact paired workspace against existing Next handlers. Extract presentational components only where they preserve state/focus/semantics. Do not replace business state with study HTML or fake defaults.
3. Bring review/recovery, lower tiers, inventory/configuration and secondary routes into the same system. Use semantic DOM for proof, errors and receipts; no screenshot-only form.
4. Repeat existing functional checks, meaningful lint/build, all-eight-P0 state acceptance and real read-only reviewed-case/exact-blob verification. Record desktop/mobile screenshots and actual normal/reduced-motion state sequences for Phase22. Measure fonts/media/network. No broad retest is required absent code changes or unresolved concerns.
5. Compare target→actual, list the three largest mismatches, correct and recapture. Fail for stale/false evidence, unreadable proof, missing state or human decision, lost receipt, broken navigation, clipping, generic decorative substitution or unverified success. Current-release proof/demo captures follow passing implementation QA.

Design Lock authorizes the implementation direction. Deployment, final visual/motion QA, full-product verification, demo/judge readiness and submission remain separate. Broad implementation may proceed after this lock is recorded; no new memory write is needed for design or captures.
