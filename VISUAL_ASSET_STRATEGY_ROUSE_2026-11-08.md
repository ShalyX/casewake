# Rouse Phase 18 visual asset strategy — 2026-11-08

**PASS for strategy.** The primary visual is the relationship between a current failure and a prior human-reviewed resolution. This serves the approved purpose: help Sui engineers retain evidence-linked resolutions and reuse them for compatible failures. Working Precedent and the Rouse identity remain locked. Asset completion and production acceptance are separate from this phase.

## Selection

Use the real interface as the hero asset. Current evidence is its counterweight; reviewed judgment is the focal point. Procedure, match reasons, reviewer and exact retained blob form the recognizable composition. A single retained edge may connect evidence with judgment; avoid background motifs or connectors that suggest unproven causality. Captioned provenance supports the promise rather than becoming a decorative technical wallpaper.

No stock photography, generated hero art, 3D object, new mascot or icon pack is needed. Native text, controls and disclosure communicate the work better and stay accessible when media fails. Sponsor names appear as explanatory text, not recreated logos. Phase 17 source screenshots are research only.

## Status and ownership

READY means the listed canonical files exist and are usable identity inputs. IMPLEMENTATION_REQUIRED means the composition or state must be built using real handlers; a static study is not a finished application asset. CAPTURE_AFTER_INTEGRATION means release evidence must be obtained from a current Rouse build. OMITTED is a deliberate non-dependency. Art Director owns selection; Design Engineering owns implementation/export; QA owns final capture acceptance. Priority is MUST, SHOULD or NICE.

The machine-readable registry is design/phase18/assets.json. The local asset map previews existing files only; each target carries its status. All images on the map are historical design targets or identity files, not current Rouse production screenshots.

## Asset register

### A01 — Global navigation / footer / install icon

Recognize the locked Rouse identity without displacing the task. **MUST · READY · restrained/interface-first**

Source: `web/public/brand/rouse/wordmark-light.svg`; `web/public/brand/rouse/wordmark-dark.svg`; `web/public/brand/rouse/favicon.svg`; `web/public/brand/rouse/favicon-16.png`; `web/public/brand/rouse/favicon-32.png`.

Format and placement: SVG wordmarks; SVG/PNG icons. Header wordmark 112–144 CSS px wide, preserve viewBox; 16/32px icons. No mark crop.

Fallback: Plain Rouse text link with accessible name.

Acceptance: Use reverse on ink and dark on paper. No new lock/shield/circuit motif. Logo remains legible at smallest intended size.

Alternative text: Rouse

### A02 — All product pages

Make decisions readable and provenance distinct. **MUST · READY · interface-first**

Source: `web/public/brand/rouse/fonts`; `web/public/brand/rouse/tokens.json`; `web/public/brand/rouse/FONT-LICENSE.txt`.

Format and placement: Canonical self-hosted TTF sources + JSON tokens; optimized web delivery required. Space Grotesk headings; DM Sans body; DM Mono identifiers. Body at least 16px for reading; secondary labels 12–14px.

Fallback: system-ui body and ui-monospace identifiers; preserve layout and all data.

Acceptance: Retain OFL licenses. Current three TTF sources total 426,584 bytes, above the proposed 250KB delivery budget. Before release, derive licensed web subsets/WOFF2 or choose only the needed weights, then measure transfer. Font swap must not hide text. Color always accompanied by wording.

Alternative text: Decorative typography; no image alternative required.

### A03 — Landing hero

Show an engineer why an earlier reviewed resolution matters to the current failure. **MUST · IMPLEMENTATION_REQUIRED · product-led**

Source: `design/phase16/landing.html`; `design/phase16/workspace.html`; `design/phase16/case-data.json`.

Format and placement: Responsive semantic DOM; optional WebP/PNG companion capture after integration. Desktop: current evidence alongside prior judgment. Mobile: current failure → reviewed procedure → reasons/reviewer → blob. Capture targets 1440×900 and 390×844.

Fallback: Keep the same case relationship as semantic text; never leave an empty media slot.

Acceptance: Primary visual must contain real case identity, review qualification and full copyable blob. Recorded example clearly labelled with capture date. No fake live dots/counts.

Alternative text: Recorded example: a compatible failure retrieves a human-reviewed reconciliation procedure and its retained blob.

### A04 — Workspace: eligible reviewed resolution

Let the engineer assess applicability before acting. **MUST · IMPLEMENTATION_REQUIRED · product-led**

Source: `design/phase16/workspace.html`; `design/phase16/case-data.json`; `evidence/real-case/exact-blob-recall.json`.

Format and placement: Live accessible DOM; acceptance screenshots. 1440×900 paired columns; 768px tablet and 390×844 ordered stack. Whole essential blob strip in desktop fold at reference viewport. Mobile may scroll vertically.

Fallback: Show actual source/procedure/reviewer/blob as text; if recall fails use unavailable state, never a cached eligible result.

Acceptance: Preserve procedure, compatibility reasons, reviewer, source link and full exact blob. No shortened identifier as the only evidence. Original operator deployment remains unknown.

Alternative text: Current failure beside the reviewed prior resolution, compatibility reasons and exact retained record.

### A05 — Workspace: empty / unconfigured / loading / lookup error / success / unknown / no match / unavailable

Make the next action clear without implying evidence that is absent. **MUST · IMPLEMENTATION_REQUIRED · interface-first**

Source: `design/phase16/workspace.html`; `web/scripts/phase16-target-qa.mjs`.

Format and placement: Semantic text, CSS indicator, existing controls; no illustration set. 390×844, 768px, 1440×900; status and action stay in reading order. No fixed screenshot embedded as application state.

Fallback: Plain status text and available next action. Loading can use static wording.

Acceptance: Keep all eight states distinct. Success does not suggest failure repair. Unknown requires investigation. No-match differs from unavailable. Clear stale results. Indicators obey reduced motion.

Alternative text: State-specific text in the interface; do not add redundant decorative alt text.

### A06 — Protected review / pending / completed receipt

Show what the human approved and whether storage actually completed. **MUST · IMPLEMENTATION_REQUIRED · interface-first**

Source: `design/phase16/workspace.html`; `evidence/real-case/human-approval.json`; `evidence/real-case/reviewed-memory-receipt.json`.

Format and placement: Actual form/status/receipt DOM; controlled-state QA captures. Desktop and mobile. Do not crop proof-method fields, confirmation or completion identity. Pending is a separate state with job recovery.

Fallback: Readable status plus job identifier; completed receipt only after confirmed job. No image-only receipt.

Acceptance: Keep both confirmation methods and conditional fields. No prechecked approval; no resubmit-as-recovery. Existing receipt may be read for captures; a new case requires its own approval. Controlled fixtures labelled in QA.

Alternative text: Human review fields followed by a storage receipt; completion names the retained blob.

### A07 — Case proof / field notes / judge evidence link

Allow an independent reader to inspect the original evidence and the scope of the correction. **MUST · CAPTURE_AFTER_INTEGRATION · data-led**

Source: `evidence/real-case/REVIEW.md`; `evidence/real-case/exact-blob-recall.json`; `evidence/production-reviewed-case`; `design/phase16/case-data.json`.

Format and placement: Text links + current read-only application PNG/WebP captures. 1440×900 and 390×844; optional detail crop at native scale. Keep a full-frame parent capture and timestamp/source metadata.

Fallback: Link to immutable case commit and structured evidence with readable description.

Acceptance: Use a current Rouse build and actual read-only retrieval. Show distinct recurrence and exact blob. Do not call independent replay an original operator deployment or an onchain repair.

Alternative text: A distinct real failure recalls the exact blob of the approved independent integration resolution.

### A08 — External share preview / hackathon listing

Make Rouse recognizable before the app opens. **SHOULD · READY · brand-led**

Source: `web/public/brand/rouse/social-card.png`; `web/public/brand/rouse/avatar.png`; `web/public/brand/rouse/social-preview.html`.

Format and placement: PNG social card and avatar. 1200×630 social; 512×512 avatar. Test centre crops and circle avatar. Keep supplied composition; do not stretch.

Fallback: Platform title and description in text.

Acceptance: These are identity assets, not evidence of usage or current app behavior. Any URL/copy change requires a fresh metadata preview.

Alternative text: Rouse — retain evidence-linked resolutions for compatible Sui failures.

### A09 — Workflow explanation below landing hero

Explain import → review → retain → reuse without suggesting an automatic repair. **SHOULD · IMPLEMENTATION_REQUIRED · diagram-led**

Source: `PRODUCT.md`; `DESIGN.md`.

Format and placement: Semantic ordered list styled with a single restrained retained-edge line. Horizontal at wide widths, ordered vertical at mobile; no text baked into image.

Fallback: The ordered list itself.

Acceptance: Human review is explicit; store completion follows the real job. Recurrence is distinct from the original source. No arrows imply automatic execution.

Alternative text: Four steps: inspect a failure, review a resolution, retain it, reuse it on a compatible failure.

### A10 — Sponsor integration attribution

Explain what Tatum and Walrus contribute to the actual product. **MUST · IMPLEMENTATION_REQUIRED · restrained/text-led**

Source: `PRODUCT.md`; `evidence/phase14/release-verification.md`.

Format and placement: Text names and source links; no downloaded or recreated sponsor marks. Short readable caption near provenance; wrap on mobile.

Fallback: Plain text: transaction evidence via Tatum; reviewed memory retained on Walrus.

Acceptance: Separate chain evidence from memory retention and review judgment. No implied sponsorship endorsement or invented availability badges.

Alternative text: Use visible integration wording; no sponsor logo alternatives required.

### A11 — Demo / pitch frames

Show the independently usable loop using the final app. **MUST · CAPTURE_AFTER_INTEGRATION · product-led; motion planned in Phase 19**

Source: `DEMO.md`; `evidence/real-case/exact-blob-recall.json`; `evidence/phase14/release-verification.md`.

Format and placement: Later real browser recording and high-resolution stills. Plan 1920×1080 recording; keep essential evidence in a safe central readable frame. Final duration/edit belongs to demo production.

Fallback: Live read-only walkthrough plus evidence links if video unavailable.

Acceptance: Capture current Rouse app after implementation/QA. Use existing reviewed receipt and distinct recurrence. Controlled error fixtures cannot masquerade as live results. No new writes just to obtain footage.

Alternative text: The failure, review, completed retention and later exact-record recall shown in sequence.

### A12 — Optional decorative hero artwork

No independent communication job beyond the product visual. **NICE · OMITTED · none**

Source: No commissioned asset.

Format and placement: None. None

Fallback: Use the paired evidence interface as the focal visual.

Acceptance: Do not commission stock, generated photography, 3D objects, generic particles or illustrations merely to fill space.

Alternative text: None

## Evidence and capture rules

Bind example visuals to the approved case manifest, not manually typed substitutes: source 8dT1dpmvyX9o8t5F5H9AtsQQDdsYDxcoLnSVyEXzJLiA; recurrence HvDzt4nbgp4espMfM8m9vBks6L8EqAyRUGQpuvWRAPHV; reviewer ShalyX; blob KYVwYj5yXnhoEMZN_m-6rPGVUKw9h43bSkFg4zxcIxY. Immutable source commit fa78ff8a458dd9d61855b43f67ff9fd575fba215. Preserve those historical Casewake URLs. The demonstrated correction is an independently tested integration reconciliation procedure; original operator deployment is unknown and no onchain repair is claimed.

Existing Phase 16 images establish composition only. Earlier public captures and web/public/images/casewake-* assets are historical and must not stand in for a current Rouse release. Capture after design implementation and real read-only verification, with URL/build commit, UTC capture time, viewport, state, fixture/live distinction and source manifest recorded. Strip credentials and private input. Keep the uncropped parent alongside any detail export; do not crop away uncertainty, failure status, proof qualifications or identifiers. Do not retouch a result into a different state.

Review/pending/error screenshots may use clearly labelled controlled fixtures for QA. Public evidence of completed storage and exact recall must use the already-approved real receipt and distinct recurrence. Do not create another memory for screenshots. New human approvals are case-specific.

## Responsive and accessibility contract

At desktop, juxtapose current evidence with the reviewed procedure. At mobile, retain the decision order and allow vertical scrolling; do not shrink a complete desktop screenshot into unreadable text. The procedure, compatibility reasons, reviewer and full exact blob remain outside secondary disclosure. Full identifiers must wrap and remain copyable. Use semantic DOM for application states; static images never become the form or receipt. Supply captions/alt text for meaningful captures and empty alt for decorative duplicates. Do not repeat all screenshot text in alt if an adjacent accessible transcript supplies it. Keep visible focus and sufficient text contrast; never encode state using color alone.

## Performance and delivery

Planning limits: each logo SVG ≤10KB; social PNG ≤150KB; optional hero WebP ≤250KB; below-fold capture ≤180KB; used font subset total ≤250KB. These are proposed transfer budgets, not measured application performance. The three canonical TTF font files total 426,584 bytes: production subsets/WOFF2 or a smaller used-weight set are required to meet the proposed 250KB transfer budget. Inventory validation records actual ready-file sizes; application network measurement is an implementation gate. Prefer zero hero bitmap. Reserve aspect ratio for media, use responsive sources if captures are needed, lazy-load below the fold, and retain self-hosted OFL files. No autoplay video or asset-driven data requests.

## Order and exit

1. Reuse ready identity files and tokens. Resolve contrast/weight choices through actual rendered QA, without redesigning the mark.
2. Build the paired evidence composition and every state against the original eight P0 groups. Keep handlers and source evidence intact.
3. Measure layout/accessibility/network and verify read-only actual recall in the new app.
4. Capture A07/A11 only after the implemented Rouse build passes. Replace old launch images and metadata at release; preserve historical proof URLs.

Phase 18 closes because all major judge-facing placements have a purpose, source, priority, owner, format, responsive behavior, fallback and acceptance criterion. Required delivery work is explicit, not silently marked ready. Phase 19 motion storyboard is next; Phase 20 design lock and later implementation/visual QA remain. This phase does not authorize a new memory write or claim a Rouse deployment.
