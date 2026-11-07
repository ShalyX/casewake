# Casewake — Design Direction & Visual System

**Product Lock:** `PRODUCT.md` revision 1
**Brand lock:** Trace Instrument
**Design status:** Direction selected; visual implementation and screenshot QA in progress
**Owner:** Hackathon Operator / Art Director

## 1. Product reality map (Gate A)

### User and job
- **Primary user:** Sui dApp/protocol engineer or support responder investigating a failed Mainnet execution.
- **Job:** turn a transaction digest into a trustworthy incident record; compare it with previous incidents; preserve only a human-approved fix; retrieve the exact reviewed record when a genuinely compatible failure recurs.
- **Emotional promise:** *I don't have to reconstruct the same investigation from zero, and I can see exactly why I should trust the recalled answer.*
- **First 30 seconds:** paste a real digest → see Tatum's outcome, checkpoint, timestamp, error and failed command → see whether there is an eligible precedent, a mismatch, or no memory.
- **Magic moment:** a different, later, compatible failed transaction recalls the exact Walrus blob containing the human-reviewed resolution and its proof snapshot.
- **Primary action:** investigate an incident; secondary action: submit a case-specific resolution for authorized human review.
- **Trust contract:** read-only chain inspection; no wallet signing; no automatic remediation; failed, successful and unknown are separate outcomes; unknown never becomes failed; a bare URL, AI explanation or generic runbook never becomes a verified fix.

### Surface inventory
1. **Landing:** explain the problem and workflow; show an explicitly illustrative trace, not fabricated live status.
2. **Workspace:** digest intake, chain evidence, precedent comparison, human-review editor, Walrus receipt and exact-blob recall.
3. **Field notes:** explain evidence classes, matching boundaries and what Casewake refuses to claim.
4. **Proof surface:** show a real simulation only as simulation; never imply it repaired or executed the historical route.
5. **Release/demo:** reproduce the same real user journey with the same source evidence and proof links.

### Product truths that must remain visible
- An observation is not a resolution.
- A simulation-tested prevention guard is not a historical route repair.
- A human reviewer owns the causal judgment.
- A completed Walrus write must show the actual blob receipt.
- Recall must identify the exact blob and a distinct, later, compatible failure.
- The legacy DeepBook experiment is a separate evidence track, not the general product's main experience.

## Five-line direction lock

- **Product:** a Sui incident memory console that turns real failed executions into human-approved, reusable engineering knowledge.
- **Character:** exacting, calm, skeptical and useful under pressure; never an AI oracle.
- **World:** a quiet night-shift engineering room—graphite surfaces, paper-white evidence, a restrained signal-lime trace and muted execution-orange.
- **Moments:** inspect the real failure; compare a compatible precedent; inspect the human proof; approve the fix; retrieve the exact record on a later failure.
- **Signature:** the bracketed CASEWAKE mark and a single trace line that connects source evidence to reviewed memory.

**Direction gate:** Trace Instrument is already locked in `BRAND.md` and the approved product work. No new visual-direction approval is needed; this phase is a polish pass, not a rebrand.

## 2. Three distinct visual territories (Gate B)

### A. Trace Instrument — selected
A precise engineering instrument for inspecting a transaction trace and retrieving a verified decision.

- **Composition:** editorial two-column landing; dense but quiet evidence console in the workspace; a single vertical evidence spine connects source failure → reviewer proof → Walrus record → later recall.
- **Palette:** graphite/green-black foundation, warm off-white text, signal-lime for verified/ready states, muted orange only for failed execution, subdued grey for unknown/pending.
- **Type:** Space Grotesk for decisive headings; DM Sans for readable interface copy; DM Mono for digests, checkpoints, timestamps and evidence labels.
- **Signature device:** the bracketed CASEWAKE mark and a fine trace line that terminates in a square evidence node.
- **Motion:** restrained, evidence-led transitions; no ambient animation that competes with the transaction.
- **Why it wins:** the product is about provenance and engineering judgment, not a chatbot or a generic AI dashboard. This territory already matches the locked brand and current implementation.

### B. Incident Ledger
A light, editorial engineering notebook.

- **Composition:** warm paper canvas, strong column grid, case-file tabs, annotated evidence excerpts and a chronological repair log.
- **Palette:** bone, graphite, slate blue and restrained vermilion for failure.
- **Type:** editorial serif for narrative, monospace for transaction identifiers.
- **Strength:** excellent readability and a natural home for long-form case notes.
- **Risk:** can read as a documentation portal; the onchain evidence and live recall moment lose visual priority.
- **Decision:** not selected. Retain its concise annotations and strong chronology as secondary interaction patterns.

### C. Signal Archive
A spatial archive of recurring failure signatures.

- **Composition:** dark archive wall, compact incident tiles, signature clusters and a highlighted recalled record.
- **Palette:** near-black, cold white, muted cyan and one amber alert tone.
- **Type:** technical grotesk with condensed labels.
- **Strength:** makes recurrence and accumulated memory visually memorable.
- **Risk:** overemphasizes storage and similarity clustering; risks implying Casewake is an autonomous knowledge graph.
- **Decision:** not selected. Retain only the visual idea of a clearly bounded precedent card.

### Selection
**Trace Instrument** remains the only implementation direction. Do not blend all three into a hybrid. The other territories are documented alternatives, not a backlog.

## 3. Reference board (Gate C)

These are references for specific design decisions, not templates to copy.

| Reference | What to borrow | What not to borrow |
|---|---|---|
| [Linear](https://linear.app/) | Typographic hierarchy, compact navigation, calm spacing and clear action priority | Generic SaaS dashboard cards or purple gradients |
| [Sentry Issues](https://sentry.io/) | Error-first hierarchy, stack/evidence inspection and issue context close to the action | Dense telemetry panels that overwhelm a single incident |
| [Raycast](https://www.raycast.com/) | Keyboard-friendly interaction, crisp focus states and low-friction command surfaces | A command palette as the product's whole identity |
| [GitHub Pull Requests](https://github.com/pulls) | Review provenance, changed-file inspection and explicit human ownership | Treating a green checkmark as proof of causal correctness |
| [Sui Documentation](https://docs.sui.io/) | Exact terminology and chain-specific details | Long documentation copy inside the workspace |

## 4. Composition contract (Gate D)

### Landing desktop
- Header: brand left; Method, Field notes, Why it matters; one high-contrast workspace CTA.
- Hero: 42% narrative / 58% trace instrument at wide desktop; headline no more than three short lines.
- Hero visual must carry a visible **ILLUSTRATIVE FLOW / NOT LIVE DATA** label until it is backed by live API data.
- The trace shows a failure state, an observed precedent and an explicit **not yet verified** boundary. Never display a fabricated Walrus receipt or human approval.
- Four-step method follows immediately; manifesto is short; footer states the safety contract, not a vanity metric.

### Workspace desktop
- Evidence-first two-column layout: primary incident/evidence column (~64%); reviewer/precedent rail (~36%).
- Digest input and live status remain above the fold.
- Show source, network, checkpoint, timestamp, execution outcome, failed command and error fingerprint together.
- Separate three visual states: **failed** (orange), **succeeded** (green only when Tatum says success), **unknown** (neutral grey).
- Precedent panel must explain match/mismatch reasons, not only a similarity score.
- Human-review editor appears only for an eligible failed case; proof method is explicit:
  - Tatum-verified successful successor, or
  - a public merged GitHub PR/full commit whose metadata and changed-file diff are fetched and SHA-256 fingerprinted.
- The reviewer must name the exact engineering change and explicitly attest to the causal link.
- Walrus receipt appears only after the write returns a completed blob ID.
- Exact-blob recall appears only after a different, later, compatible failure retrieves that same blob.

### Workspace mobile
- Single-column flow; digest input first; status/evidence next; precedent and reviewer editor below.
- No horizontal scrolling for digests: wrap safely and provide copy controls.
- Sticky primary action only when it does not cover evidence or keyboard focus.
- Use accordions for secondary provenance, never hide outcome/error/approval status.

### Empty, loading, error and success states
- **Empty:** explain what digest to paste; no fake case rows.
- **Loading:** label the current source/action (Tatum lookup, Walrus recall); avoid indefinite spinners.
- **Failed:** show actual chain error and failed command; never call a gateway timeout a transaction failure.
- **Unknown:** explain the source could not confirm an outcome; no precedent write or Walrus search.
- **No match:** explain which fingerprint/route dimensions differ.
- **Eligible precedent:** show original digest, proof method, reviewer, evidence snapshot hash and Walrus blob ID.
- **Write complete:** show actual blob ID and receipt state.
- **Recall complete:** show second digest, later checkpoint, exact blob ID and matched dimensions.

## 5. Visual asset strategy (Gate E)

### Required assets
1. **Primary mark:** two evidence brackets and one central trace bar; readable at 16 px.
2. **Favicon/app icon:** the mark on the graphite background.
3. **Workspace screenshot:** real local production build with real API state; no fabricated user, chat, balance or receipt.
4. **Evidence diagram:** small SVG explaining Tatum → human review → Walrus → exact recall.
5. **Demo frames:** two real product states: incident inspection and exact-blob recall. If the second state is not genuinely achieved, label it as a prototype and do not submit it as proof.

### Asset constraints
- No stock hero photo, fake terminal screenshot, fake explorer data, decorative blockchain network art or generated dashboard image.
- Prefer CSS/SVG for the trace, bracket mark and evidence spine.
- Screenshots must come from the current build and be stored with capture date and viewport metadata.
- No screenshot may imply a verified fix until a real human-approved record and receipt exist.

## 6. Motion storyboard (Gate F)

| Beat | Trigger | Motion | Truth condition |
|---|---|---|---|
| 1. Inspect | Engineer submits digest | Status rail resolves in place; evidence rows fade/slide in 160–220 ms | Tatum response received |
| 2. Compare | Recall completes | Precedent rail expands; matching dimensions highlight one by one | A real eligible precedent exists |
| 3. Review | Reviewer opens a candidate | Proof panel unfolds; diff/transaction link and hash appear | Proof artifact fetched and fingerprinted |
| 4. Approve | Reviewer explicitly confirms | Approval indicator changes once; no confetti | Server validates all gates |
| 5. Remember | Walrus write completes | Receipt strip appears with actual blob ID | Completed Walrus receipt returned |
| 6. Reuse | Different later failure recalls same blob | Exact-blob indicator connects the second digest to the original record | Exact blob ID and later checkpoint verified |

- Respect `prefers-reduced-motion`; replace transitions with immediate state changes.
- Never animate a success state before the server confirms it.
- Motion duration: 160–220 ms for UI transitions; no perpetual pulsing beyond the small status indicator.

## 7. Implementation and critique loop

### Unslop audit — 2026-11-07

**Mode: polish.** The existing screen has a coherent product-specific composition and a locked identity. It does not need a new concept.

**What is already working**
- The landing headline is memorable and specific to the product's memory promise.
- The trace visual is bespoke and directly related to transaction evidence.
- The workspace hierarchy separates chain evidence, human review, recall and provenance.
- No stock photography, fake chatbot avatar, purple AI gradient or generic metric-card wall is present.

**Specific slop signals to remove**
- Repeated all-caps, widely tracked labels make every row feel equally loud; convert navigational and explanatory labels to sentence case and reduce tracking. Keep short machine identifiers uppercase only where they are actual protocol labels.
- Three green status dots currently imply all services are healthy even when only credentials are configured; only a completed live inventory check may use the verified/ready green state.
- The green ambient blur, status glow and large decorative rings compete with the evidence; remove or materially reduce them.
- The bright lime primary CTA competes with the lime headline and verified-state accent; make the primary action off-white and reserve lime for the signature trace and verified states.
- The current hero trace uses a legacy DeFi control digest; visibly label it as an illustrative/legacy control, not the general-case live demo.
- The public preset labels conceal that the three allowed examples are legacy DeFi controls; label their scope honestly rather than presenting them as the general product's representative cases.

**Approved polish scope:** sentence-case labels, truthful health-state colors, remove ambient glow, reduce decorative rings, neutral primary CTA, and explicit legacy-example disclosure. Do not change the locked Trace Instrument identity or invent new visuals.

### Current implementation notes
- The landing page and workspace already use the Trace Instrument palette and typography.
- Existing screenshots: `web/public/images/casewake-live-workspace.png` and `web/public/images/casewake-simulation-proof.png`. Re-capture both from the current production build before final visual sign-off.
- The hero visual is currently conceptual and uses an old DeFi control digest. Add the visible illustrative label and remove any implication that this is the general-case live demo.
- Remove the DeFi/DeepBook preset list from the public general-case intake. Do not present the old experiment as the product's showcase. The user must be able to paste a real digest; add a representative general-case preset only after its evidence is accepted.
- The reviewer editor now has two proof methods. The labels and evidence states must remain explicit and compact.

### Design QA rubric (score each 0–4)
- Product specificity: does this look like a Sui incident evidence tool rather than a generic AI dashboard?
- Hierarchy: can an engineer identify outcome, error, precedent and next action in five seconds?
- Evidence clarity: can a judge distinguish observed, simulated, human-reviewed and recalled states?
- Craft: typography, spacing, contrast, alignment, density and responsive behavior.
- Honesty: no invented data, no false live status, no unearned green checks.
- Demo legibility: can the full magic moment be understood in a 2–3 minute screen recording?

**Pass threshold:** average ≥3.5/4, no category below 3, with desktop and mobile screenshots attached. A written direction alone does not pass visual QA.

### Skill execution record
- Local search checked `%USERPROFILE%\.codex`, `%USERPROFILE%\.agents`, and common Codex skill directories for `unslop`, `stageshow` and Product Hygiene. The expected skill files were not found in those locations during this run.
- Do not claim those skills were invoked. Apply the documented anti-slop checks manually until the exact installed skill files can be located.
- Product Hygiene execution is tracked separately in `HYGIENE.md`.

## 8. Open design gates

- [ ] Replace or visibly label the legacy DeFi hero trace.
- [ ] Remove DeFi/DeepBook presets from the general public intake.
- [ ] Verify the new two-method reviewer form at desktop and mobile widths.
- [ ] Capture fresh landing, workspace-empty, workspace-failed, reviewer-form and recall screenshots.
- [ ] Score every screenshot against the six-category rubric.
- [ ] Record final visual sign-off only after the actual human-reviewed case and exact-blob recall are proven.
