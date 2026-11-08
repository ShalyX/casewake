# Rouse Phase16 composition study

These are static page-art-direction targets, not the deployed app or a new backend integration. Eligible/receipt views use the actual approved public case snapshot; other views are clearly labelled controlled state illustrations. No study submits a memory.

Open index.html for the three territories, landing.html for the selected public page, or workspace.html for the selected workspace.

For reliable local font rendering, serve this directory:

    python -m http.server 4236 --bind 127.0.0.1 --directory design/phase16

Then open http://127.0.0.1:4236/.

Workspace state queries: eligible, empty, unconfigured, loading, lookup-error, success, unknown, no-match, unavailable, pending, receipt, review.

For example: workspace.html?state=pending. Add &controls=1 to expose the design-only navigation. Those controls are not part of the product target.

The Inspect form links to the existing public read-only workspace. The review study cannot submit; its password field and store button are disabled. Existing reviewer authorization/proof validation must be preserved during implementation.

case-data.json records provenance. brand/ contains the canonical identity assets/fonts and their licenses. ART_DIRECTION.md contains the frozen Phase16 handoff; root DESIGN.md is the current evolving design specification.
