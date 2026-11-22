# VUI design system specification

One token contract, two structural UI modes, any number of color themes.

| Axis | Owns | Source |
| --- | --- | --- |
| Theme | semantic colors, border width, elevation ink | `themes/*.css`, `src/theme/presets.ts` |
| UI mode | space, size, type, radius, icon geometry, focus, motion, elevation geometry | `src/tokens/ui.css` |
| Primitives | palette, font stacks, weights, z-index, breakpoints, containers | `src/tokens/tokens.css` |

Components read `--vui-*` tokens only. They never branch on theme or mode names
and never hardcode visual values (exceptions: `1px` visually-hidden helpers,
`line-height: 1` inside fixed-height controls, `@media`/`@container` lengths,
which CSS cannot read from custom properties).

## Reference systems

| Mode | Primary reference | Applied conventions |
| --- | --- | --- |
| `web` | Radix Themes, shadcn/ui | 24/32/40 controls, 6px field / 8px container radii, 8px icon–label gap, medium-weight controls, fluid headings, 2px offset focus ring |
| `desktop` | Fluent 2 | 24/32/40 controls, Fluent type ramp (12/14/16/20/24), 4/8 radii, 12/16/20/24 icon grid, 6px icon gap, semibold controls, 24px dialog padding |

Cross-cutting: Radix primitives for keyboard/ARIA behavior, Material 3 for
adaptive layout and touch targets, Ant Design for dense data surfaces
(`--vui-row-height`, `vui-data-grid`), Apple HIG for 44px touch minimums and
hierarchy through weight rather than color.

## Spacing

Ramp `--vui-space-2xs … 3xl` (4px grid; desktop adds 6px optical aligner).

| Token | web | desktop |
| --- | --- | --- |
| `2xs` / `xs` / `sm` | 2 / 4 / 8 | 2 / 4 / 6 |
| `md` / `lg` / `xl` | 12 / 16 / 20 | 8 / 12 / 16 |
| `2xl` / `3xl` | 32 / 48 | 24 / 32 |

Semantic aliases (declared per mode scope so nested modes resolve correctly):

| Alias | Value | Use |
| --- | --- | --- |
| `--vui-gap-related` | `space-sm` | items of one cluster: icon + text, label + control |
| `--vui-gap-group` / `--vui-form-gap` | `space-lg` | fields in a form, cards in a row |
| `--vui-gap-section` | `space-2xl` | page sections |
| `--vui-container-gutter` | `clamp(lg, 4vw, 2xl)` | page side padding |
| `--vui-field-gap` | 6 / 4 | label ↔ control ↔ hint |
| `--vui-panel-padding` | `space-lg` | panels, cards, empty states |
| `--vui-dialog-padding` | 24 / 24 | dialog and drawer sections |
| `--vui-popover-padding` | 12 / 12 | popover surface |
| `--vui-menu-padding` | 4 / 4 | menu surface inset |

## Geometry

| Token | web | desktop |
| --- | --- | --- |
| `--vui-size-control-sm` / `control` / `-lg` | 24 / 32 / 40 | 24 / 32 / 40 |
| `--vui-menu-item-height` | 32 | 32 |
| `--vui-row-height` | 40 | 32 |
| `--vui-nav-item-height` | 36 | 36 |
| `--vui-header-height` / `toolbar` / `statusbar` | 56 / 44 / 32 | 48 / 40 / 24 |
| `--vui-radius-selector` / `field` / `box` | 4 / 6 / 8 | 2 / 4 / 8 |
| `--vui-focus-ring` / offset | 2px / 2px | 2px / 1px |

Border width comes from the theme (`--vui-border-width`, 1px; high contrast 2px).
`--vui-radius-box/field/selector` may be overridden per theme by the theme engine
(Theme Studio shape families).

### Touch

`@media (pointer: coarse)` raises web and desktop targets: controls 32/40/48,
rows, menu items and nav items to `--vui-size-touch` (44px), split resizers to
16px. Typography is unchanged.

## Typography

Font stacks: `--vui-font-sans` (Segoe UI Variable → system UI → Helvetica/Arial),
`--vui-font-mono` (Cascadia → SF Mono/Menlo → Consolas).

| Role | Token | web | desktop |
| --- | --- | --- | --- |
| Caption 2 | `--vui-font-size-xs` | 11 | 10 |
| Caption / label / hint | `--vui-font-size-sm` | 12 | 12 |
| Body | `--vui-font-size` | 14 / 1.43 | 14 / 1.43 |
| Body large | `--vui-font-size-lg` | 16 | 16 |
| Heading 3 | `--vui-heading-3` | 16 | 16 |
| Heading 2 | `--vui-heading-2` | 18→20 fluid | 20 |
| Heading 1 | `--vui-heading-1` | 24→28 fluid | 24 |

Line heights: `--vui-line-height`, `--vui-line-height-sm` (small text),
`--vui-line-height-heading`. Tracking: `--vui-tracking-heading` (−0.011em on web),
`--vui-tracking-caps` (uppercase group labels).
Weights: `--vui-font-weight` 400, `-medium` 500 (labels), `-strong` 600 (headings),
`--vui-font-weight-control` per mode (500 / 600).
Prose blocks should cap at `--vui-measure` (68ch). Truncation: `vui-text truncate`;
long tokens wrap with `overflow-wrap: anywhere`.

Field labels use primary text color (WCAG contrast); helper text stays muted.

## Icons

All built-ins share one geometry: 24×24 source grid, round caps/joins, keyline
strokes (source art: lucide, ISC — see `THIRD_PARTY_NOTICES.md`). Rendering is
controlled by the mode:

| Token | web | desktop |
| --- | --- | --- |
| `--vui-icon-size-sm` / `size` / `-lg` / `-xl` | 14 / 16 / 20 / 24 | 12 / 16 / 20 / 24 |
| `--vui-icon-stroke` (in 24-unit space) | 2 | 1.75 |
| `--vui-icon-gap` (icon ↔ label) | 8 | 6 |

`<vui-icon size="small|medium|large|xlarge">` selects a step. Control pairing:
small controls → `icon-size-sm`, medium → `icon-size`, large → `icon-size-lg`.
Decorative icons are `aria-hidden` and `focusable="false"`; give `label` for
meaningful icons. Custom glyphs: `registerIcon(name, svg)` with a 24×24
`viewBox`, `stroke="currentColor"`, no fill, so they inherit size, color and
stroke weight.

## Responsive

Viewport breakpoints (mobile first; repeated literally in `@media`):

| Token | Value | Meaning |
| --- | --- | --- |
| `--vui-breakpoint-xs` | 30rem (480) | full-screen dialogs and drawers below |
| `--vui-breakpoint-sm` | 40rem (640) | large phone |
| `--vui-breakpoint-md` | 48rem (768) | tablet |
| `--vui-breakpoint-lg` | 64rem (1024) | desktop |
| `--vui-breakpoint-xl` | 80rem (1280) | wide |
| `--vui-breakpoint-2xl` | 96rem (1536) | ultra-wide |

Components respond to their **container**, not the viewport:
`--vui-layout-narrow` (22rem) stacks toolbars, steppers, properties and nav;
`--vui-field-inline` (36rem) switches fields to label-beside-control;
`--vui-layout-medium` (40rem) collapses the shell into a vertical stack.
Content widths: `--vui-container-sm|md|lg|xl` (40/64/80/96rem) via
`<vui-container size="small|medium|large|xlarge|full">`.

Wide data tables stay inside `vui-data-grid`'s own scroll container; dialogs
become full-screen and drawers full-width under 30rem.

## States

| State | Recipe |
| --- | --- |
| Hover | `--vui-color-hover` / `*-hover` semantic colors |
| Focus | `:focus-visible` only, `--vui-focus-ring` + `--vui-focus-offset`; fields use `--vui-focus-shadow` |
| Selected | `--vui-color-selected` |
| Disabled | `opacity: var(--vui-opacity-disabled)` + `cursor: not-allowed` (0.5 web, 0.55 desktop, 0.72 high contrast) |
| Invalid | `--vui-color-danger` border + hint |
| Loading | `aria-busy`, spinner in place of icon |

Motion: `--vui-duration` (100 / 120ms) with `--vui-easing`; disabled under
`prefers-reduced-motion`. Elevation: `--vui-shadow-sm|md|lg`
(none in high contrast). `forced-colors` maps to system colors.
