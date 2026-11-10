# Theme Studio validation

Environment: Node 24, locked pnpm dependencies, Playwright 1.63.0 in its official Noble container. No production deployment or Git push was performed.

Passed checks:

- `pnpm typecheck` and `pnpm lint` (the repository uses TypeScript strict/no-unused analysis, not a separately installed lint framework).
- `pnpm test`: **119 tests in 33 files**, including immutable presets, contrast across canvas/surfaces/selection/state fills, normalization, import validation, history, persistence, isolation and the initial theme bootstrap.
- `pnpm build`: reusable package and declarations.
- `pnpm build:docs`: independent static documentation in `dist-docs/`.
- `pnpm check:budget`: 119 JavaScript modules, 354,943 bytes, within the existing package limits.
- `pnpm check:shake`: selective imports remain smaller than the full library.
- `pnpm check:consumer`: packed npm installation, external consumer production build and browser verification.
- Cross-browser Theme Studio suite: **18 scenarios passed** across Chromium, Firefox and WebKit.
- Complete Chromium regression suite: **32 scenarios passed**, including existing components, accessibility, keyboard behavior, responsive behavior and visuals.
- After the final contrast adjustments, all unit/static/build/package checks and the affected **14 theme and legacy visual scenarios passed again**.
- Portal: **8 Node tests**, production build, HTTP/CORS and exact equality between its project manifest and VUI's offline catalog.

## Legacy reference-image maintenance

The existing image baselines predated the current upstream visual fixture. For example, the fixture already contained a Tree section absent from the checked-in board image. This was verified using a pristine archive of upstream commit `76fc8a2`, isolated on port 5174, with the same locked dependencies and browser image.

The three initially failing board renders from the modified library were byte-for-byte identical to independent renders from that untouched upstream source. All eight visual cases were then rendered in the pristine tree. Eleven outdated reference PNGs were copied from that pristine result, rather than generated from the implementation under review. The modified library subsequently passed all 32 Chromium tests and the final eight visual cases against those references.

## Boundaries

The Theme Studio preview is local, not an authentication or dashboard backend. Saved themes are browser/origin-specific. Arbitrary user colors can fail contrast; the editor warns instead of silently replacing intentional overrides. Translucent background contrast is evaluated over white, so consumer-specific underlays require an additional check. Strict CSP deployments must allow the initial head bootstrap through a nonce or hash.

The VUI subdomain serves an independent static documentation release. See docs/website.md for deployment and rollback.
