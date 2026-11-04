# Product Hygiene / Public Release Audit — Casewake

Audit 2026-11-04, authorized Windows PC `DESKTOP-G26AFAJ`.

## Skill and method
- **Installed skill invoked:** `C:\Users\USER\.codex\skills\public-project-launch-hygiene\SKILL.md` (reconstructed, version unknown). This audit follows its actual public-release checklist.
- Hackathon Operator's canonical Product Hygiene skill under the exact name could not be found; therefore use the Operator's `specialists/product-hygiene.md` fallback categories as an extension. **fallback_used: true** for the canonical Product Hygiene gate. Do not label the missing named skill as run.
- Also read `brand-identity-project-assets`, `brandkit` and `frontend-design` installed skills before writing brand/product changes.

## Executed checks

| Category | Finding and change | Status |
|---|---|---|
| Identity | `Casewake` chosen after exploring ReTrace, Tracekin, Aftercase, Casewake; exact-word web collision scan (not trademark clearance). Name now in brand/doc, UI routes, page metadata and npm package. | FIXED |
| Logo | Replaced generic rotated crypto diamond with two offset case brackets + central evidence line; favicon is matching SVG. Needs 24px and mobile rendered recheck. | IMPLEMENTED, VISUAL QA OPEN |
| Product truth | Landing description now emphasizes real observations and simulation-tested guidance, not pretending there are verified repaired historic incidents. | FIXED |
| Public API exposure | `PUBLIC_DEMO_MODE=true`: POST `/api/transaction` and `/api/recall` allow only 3 authentic published examples; `/api/remember` and `/api/observations` reject all writes with 403; `/api/memories` returns only total count+namespace and 2-minute cache, not blob ID list. | TESTED LOCALLY |
| Secrets | `web/.env.local` ignored; Tatum API key, Walrus delegate private key, reviewer write token stay server-only. Secret scan against tracked files/history required before public push. | PENDING SCAN |
| Read/write verification | Public-mode local test: `/api/status` public mode true/reviewerWritesEnabled false; arbitrary digests 403; writes 403; allowed real transaction lookup 200; allowed live Walrus recall 200 (one runbook, one observation, 12 hits). | VERIFIED |
| Dependency/build | Next.js 16.4.4 production compilation, TypeScript and ESLint passed after name and public API gate changes. | VERIFIED |
| Browser state | Previous real UI/proof screenshots captured, but must capture Casewake brand and three public sample buttons at desktop and mobile widths. | OPEN |
| Navigation | Existing `/`, `/workspace`, `/proof/splitcoins` routes; back/copy/links and deep-link testing planned after deploy. | PARTIALLY VERIFIED |
| Dead/fake content | No fake accounts/chat/streamer/testimonials. Landing illustration remains a deliberately conceptual overlay using a genuine real digest; explicitly labeled as conceptual. | REVIEWED |
| External dependencies | Tatum/Walrus may time out; bounded reads only, never automatically retry uncertain writes. Production serverless latency still to be tested. | OPEN DEPLOY |
| OpenGraph/social card | Metadata updated, but dedicated OG image still pending. | P2 |
| Accessibility | Added focus-visible treatment; labels exist on main digest field; mobile/responsive screenshot review and contrast still required. | PARTIAL |
| GitHub/hosting | Public repo, Vercel deployment and logged-out live verification not yet finished at audit start. | RELEASE BLOCKER |
| Submission | 2:35 actual screenshot-driven script in DEMO.md, truthful blog draft in BLOG_DRAFT.md. Recorded video, published article, form receipt still missing. | OPEN |

## Release gates (status updates required)
1. **P0** No private keys in repository history and no public reviewer writes. Check direct local mode and deployed runtime.
2. **P0** Public app responds to three real proof digests; unrelated disallowed query 403; live Walrus runbook 1 vs negative control 0.
3. **P1** Public repo and deployment URL from logged-out context.
4. **P1** Browser screenshot at desktop and mobile with new name, no default Next branding.
5. **P1** Final video, blog published and form receipt by 2026-11-10 17:00 UTC.
6. **P2** Dedicated custom OpenGraph preview image, 24px favicon, accessibility contrast.

Current Product Hygiene gate: **IN PROGRESS** until all P0 and relevant public release checks pass. Never claim final submission readiness before actual video/publication.

## Adversarial warnings
- No independent human-verified historical repair exists: do not enable "verified fix" claims in the demo or pitch. A successful controlled simulation is not equivalent.
- Public read-only per-digest whitelist protects against *scope abuse*, but does not provide distributed per-IP rate limiting. Monitor sponsor quotas and Vercel function usage. Network cache is process-local, not global.
- A public GitHub repo alone does not grant an open-source license. The owner should choose an explicit license if desired.
- No final trademark clearance or domain ownership implied by preliminary exact-name search.
