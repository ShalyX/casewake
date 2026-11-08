# Rouse Phase 19 motion storyboard — 2026-11-08

## Product purpose and motion decision

The engineer needs to inspect a failure, assess prior reviewed judgment and retain an evidenced resolution for later reuse. Motion makes changes in evidence understandable. It must never imply that Rouse executed a repair. Working Precedent remains the selected composition; no new visual territory is needed.

**Direction: evidence changes in place.** The page stays still while its actual state becomes clearer. Landing content and primary action appear at first paint. No scroll reveals, camera moves, parallax, typewriter proof, progress percentages, flying blobs or sequential card entrances. The magic moment is a distinct failure retrieving an inspectable prior resolution; the full procedure, reasons, reviewer and exact blob arrive together.

This deliverable is a static UI storyboard and implementation contract. It is not an animated app, recorded live sequence, launch film or final motion QA. Existing Phase 16 captures are labelled composition references; they cannot prove backend state transitions. Demo production remains a later phase.

## Grammar and time

One optional result reveal: opacity 0→1 and translateY 4px→0 over 180ms, cubic-bezier(.2,.8,.2,1). Local status feedback ≤120ms; receipt acknowledgment ≤160ms. Text/proof updates immediately in the DOM; animation never delays announcement, interaction or a response. There is no minimum loading duration. Do not animate a result that arrives before a loading paint just to demonstrate a spinner. Clear obsolete query results synchronously, without exit animation; keep durable receipts in their separate region.

Only opacity and transform may tween. No animation library is required. No animated layout, height, width, blur, background filter, infinite success effect or data request for ornament. Loading uses explicit text; one optional 1000ms opacity indicator is allowed only while an actual foreground request is running. Accepted storage pending is a durable status, not a spinner that promises imminent completion. No automatic write/retry or business transition may run from an animation callback. Durations and byte budgets here are targets, not measured implementation performance.

## Transition contract

### M01 — Enter the workspace

**landing → empty**

Trigger: User activates the workspace link; destination route renders.

Meaning: The engineer is moving into a task, not watching a launch sequence.

Pacing: 0ms bespoke transition. Use ordinary navigation; landing content is visible at first paint.

Interaction and focus: Normal route focus/heading behavior; no scroll interception or entrance stagger.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: An entrance animation can delay the primary task or hide content when JavaScript fails.

Handler binding: `web/src/app/page.tsx; web/src/app/workspace/page.tsx`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M02 — Inspect a new digest

**empty / result / lookup-error → reading**

Trigger: Validated nonempty digest starts the transaction request.

Meaning: The old result no longer applies to the new query.

Pacing: Clear prior query result immediately before request. Status appears at once; optional opacity 120ms on status only. No minimum spinner time.

Interaction and focus: Retain focus on invoked control. Mark result region busy and announce Reading transaction once. Keep any completed receipt separate and stable.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: Fading old evidence out over the new request could misattribute a reviewed result.

Handler binding: `inspect(): reset tx/candidates/recallNote; setPhase(reading)`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M03 — Reveal chain evidence

**reading → recalling**

Trigger: The transaction response establishes failed outcome and memory is configured.

Meaning: Chain evidence is known; reviewed memory is still being sought.

Pacing: Show chain evidence immediately. Optional status opacity 120ms; no staging of digest or error lines.

Interaction and focus: Keep focus. Announce Reading complete. Checking reviewed memory once; busy applies to recall region only.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: A single combined success reveal could imply that a failed transaction was repaired.

Handler binding: `inspect(): setTx(observed); failed + walrusConfigured; setPhase(recalling); loadRecall()`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M04 — Reveal the reviewed precedent

**recalling → eligible**

Trigger: Recall response contains a candidate accepted by the existing compatibility checks.

Meaning: A prior reviewed procedure is now available for human assessment.

Pacing: One result-region opacity/translateY(4px→0) reveal, 180ms cubic-bezier(.2,.8,.2,1). No stagger, glow, confetti or numeric counter. Entire text/proof enters together; no delayed blob.

Interaction and focus: Announce Reviewed resolution available once. Keep focus on the initiating control; no autofocus or automatic scroll. All essential information stays outside disclosure.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: Animating a link between cases may assert a stronger causal relation than compatibility supports.

Handler binding: `loadRecall(): candidates/observedPrecedents/simulationRunbooks/recallUnavailable; existing acceptance guards`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M05 — Show honest alternatives

**reading / recalling → success / unknown / no-match / unavailable / unconfigured / lookup-error**

Trigger: Actual outcome, configuration check or request failure selects its own branch.

Meaning: No recommendation is sometimes the correct product outcome. Observation-only records and simulation runbooks remain labelled supporting evidence; they never animate into reviewed resolutions.

Pacing: Status replaces in place at 0ms; optional 120ms opacity for new status text only. No shake or red full-screen flash.

Interaction and focus: One concise polite result announcement; input validation is separate. Retry only the relevant read. Preserve accessible transaction evidence and any completed receipt.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: No-match must not be substituted for an outage; unknown is not a failed transaction.

Handler binding: `inspect() outcome/config branches and catch; loadRecall() recallDegraded/catch`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M06 — Inspect supporting provenance

**eligible → eligible with secondary details open / closed**

Trigger: User toggles native details summary.

Meaning: The engineer chooses deeper evidence; the essential decision remains available.

Pacing: Native open/close, 0ms height animation. No animated accordion.

Interaction and focus: Keep focus on summary and native expanded semantics. Never hide procedure/reasons/reviewer/full blob.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: Animating height shifts the decision out of the reading position and can clip identifiers.

Handler binding: `Phase17 native-details contract; existing provenance text`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M07 — Open and correct human review

**failed evidence / no-match / eligible → review / review with validation errors**

Trigger: User opens editor; invalid submit or proof-method change produces applicable form fields.

Meaning: The human supplies and approves a specific evidenced resolution.

Pacing: Editor appears at 0ms, no sliding drawer. Proof-method fields switch instantly. No animation between evidence methods.

Interaction and focus: User-opened editor focuses heading. Invalid submit focuses correction summary linked to fields; wording matches inline errors. Preserve entered values and require explicit approvals.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: Motion must not precheck approval, hide fields, expose private keys or turn an API outage into a field error.

Handler binding: `showEditor/proofMethod/verified/confirmedCausalLink state; remember() preconditions`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M08 — Submit one reviewed case

**review → writing**

Trigger: Valid protected submit starts exactly one remember attempt.

Meaning: The approval was submitted; durable completion is not yet known.

Pacing: Show Submitting reviewed resolution immediately. Static wording is sufficient; optional CSS indicator opacity cycle 1000ms, never a progress percentage.

Interaction and focus: Keep focus; mark write status busy. Prevent duplicate submit through existing handler. Do not animate disabled controls or erase the draft until acceptance.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: A filling progress bar would invent completion; a repeated click must not write again.

Handler binding: `remember(): writeInFlight/requestId; setPhase(writing); postJson(/api/remember)`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M09 — Keep the accepted job visible

**writing → pending**

Trigger: Remember response returns an accepted pending job ID.

Meaning: Storage accepted the request; there is no completed blob yet.

Pacing: Replace submission status at 0ms. Job ID appears in full with no typewriter effect. Static pending indicator; no ambient pulse.

Interaction and focus: Announce Storage accepted; completion pending once. Check status is a read of this job. Do not move focus on background status updates.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: Pending cannot be a short interstitial that advances after a fixed time.

Handler binding: `remember(): result.pending; retainStorage(accepted); checkStorage(accepted)`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M10 — Acknowledge durable completion

**writing / pending → receipt**

Trigger: Confirmed storage result includes the completed job receipt and Mainnet blob.

Meaning: The reviewed case has a retained record. This says nothing about repairing the original chain transaction.

Pacing: Receipt border/status may use one 160ms opacity reveal. Source/job/blob and next action are immediately readable. No pop, burst, bouncing check or count roll-up.

Interaction and focus: Announce Memory stored once. Keep receipt available across lookup/reload; background completion never steals focus.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: Any delayed proof line or inferred success before job completion breaks the evidence claim.

Handler binding: `remember() completed proof branch; checkStorage() receipt branch; retainStorage()`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M11 — Recover without another write

**pending / receipt / storage error → pending / receipt / storage error**

Trigger: Reload restores accepted job/receipt; explicit status read returns its actual state or fails.

Meaning: An accepted operation can be recovered independently of a new incident lookup.

Pacing: Restored information renders instantly. No replay of completion animation on hydration. Status-read failure leaves the accepted job and any prior receipt visible.

Interaction and focus: Keep focus on Check storage status; announce changed state once. No repeated assertive announcements on each poll.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: Recovery must never silently call remember again or discard a durable receipt.

Handler binding: `session storage initialization; checkStorage(); retainStorage(); failedStorageJob`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M12 — Reuse on a distinct failure

**receipt / eligible → reading → recalling → eligible / no-match / unavailable / error**

Trigger: User inspects a distinct recurrence, or protected exact-blob verification returns a result.

Meaning: Retained engineering knowledge becomes useful for a compatible new failure.

Pacing: Use M02–M05. Compare stable full blob text; no flying token, connector draw or automatic switch to a sample digest.

Interaction and focus: Receipt stays separate from query result. User chooses the next digest. Exact-recall success wording requires actual equality, never a visual resemblance.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: Self-recall, incompatible case or service failure cannot earn the same success state. Failed recall does not invalidate completed storage.

Handler binding: `verifySavedRecall(): distinct digest + expectedBlobId; inspect()/loadRecall()`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M13 — Copy provenance

**eligible / receipt → same state with local copy feedback**

Trigger: Clipboard promise resolves successfully following a user click.

Meaning: The identifier was copied, not newly verified or saved.

Pacing: Text feedback immediately; optional 100ms opacity. May clear feedback after 2 seconds, but must not change evidence or focus.

Interaction and focus: Keep button focus. Polite Copied announcement; failure shows selectable full identifier.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: A check icon could be misread as verification; avoid whole-panel animation.

Handler binding: `Design Engineering enhancement only: clipboard handler not assumed present`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

### M14 — Recover an unconfirmed submission

**writing → response-unconfirmed / rejected review / failed job**

Trigger: Transport failure loses the write response, explicit rejection returns, or status read reports terminal failure.

Meaning: Unknown acceptance is different from accepted pending, known rejection and known failure.

Pacing: Replace status immediately, 0ms. No countdown, automatic retry, progress bar or optimistic blob.

Interaction and focus: Unconfirmed response keeps the original attempt identity and permits existing-job recovery. Known rejection returns the editable review with visible reason; do not precheck approvals. Terminal failed job offers explicit dismissal; read failures preserve accepted job identity. Never infer acceptance without a job ID.

Mobile: Same state order in one column. Preserve current reading position; no camera moves or automatic scroll.

Reduced motion: Instant state replacement; no translation, opacity tween, pulse, smooth scroll or rotating indicator. Keep all status text and announcements.

Performance: Only opacity/transform if a transition is used; never animate height, width, blur or layout. No new animation library, decorative request or timer governing state.

Risk: Retrying an ambiguous write could duplicate storage; calling a rejected or failed job pending would mislead the reviewer.

Handler binding: `remember() catch RequestError status branch; storageAttempt without jobId; checkStorage() failedStorageJob; pending recovery panel`. These are semantic bindings in current source; the final DOM/announcement hooks remain implementation work.

## Responsive, focus and announcements

Desktop keeps current evidence and prior judgment paired. Mobile stacks them in decision order; status updates never scroll the document to a newly loaded result. The user can navigate by headings or activate a result link. Native details opens secondary information with no animated height. Essential proof is never in collapsed content. Keep the active control mounted when possible. If replacing a user-opened editor would remove the focused control, restore focus to its opener; background completion should update a persistent status region instead of unmounting the focused form. Invalid submission moves focus deliberately to an accessible correction summary; operational failures use their own status region.

Use one persistent polite live region with concise state messages, not the entire digest/procedure/receipt as a live region. Announce changes, not polling ticks. Clear busy independently for transaction, recall and storage operations. Error wording remains visible; never rely on a toast, color, sound or movement alone. No aria-live field contains secrets or the private reviewer key.

`prefers-reduced-motion: reduce` removes every transform/opacity animation, spinner/pseudo-element loop and smooth scroll. It does not hide information, remove status wording or substitute a timer. Motion disabled in the browser and a slow-device path must give the same decisions and exact identifiers.

## Storyboard frames and capture boundary

The HTML sheet pairs six existing static targets with captions about the real event between them. Separate intermediate events are named explicitly; a pair of frames is not a demonstration that the intermediate request completed. The reviewed-case data is bound to the original source, distinct recurrence and exact blob in motion.json. Original operator deployment remains unknown; the correction is an independently tested integration procedure. Preserve immutable Casewake proof URLs.

The review→pending→receipt frames are targets, not a new human approval or storage request. For final demo footage, use the existing approved receipt and read-only recurrence. A future new case needs its own evidence and approval. Phase 27 must rewrite the historical demo script; do not reuse its obsolete simulation/inventory narrative.

## Acceptance and handoff

Pass this phase only when each meaningful transition has trigger, start/end, meaning, pacing, interaction/scroll relation, mobile/reduced-motion fallback, performance constraint, risk and source binding. The manifest and responsive sheet are checked independently. Phase 20 must freeze the composition/state contract before broad implementation. Design Engineering may plan from this storyboard; full implementation remains gated by design lock.

Phase 22 must record the real application at desktop/tablet/mobile with normal and reduced motion, slow/instant responses, keyboard focus, errors, recovery and exact-blob reuse. Confirm that no animation event can trigger a write or alter compatibility, and no stale evidence survives a new query. Static board QA cannot close production motion QA. Final application motion is NOT VERIFIED.
