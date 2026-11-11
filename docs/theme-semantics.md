# VUI theme adaptations

These six presets are VUI adaptations, not official ports. Existing IDs and schema version 1 remain stable. Other presets retain their original base mappings. The default pair is Catppuccin Mocha / Latte; explicit saved choices still win over the OS preference. The editor draft is independent of that preference.

## Audit and decisions

The existing engine already had canvas (`background`), panel (`surface`), card, elevated, popover and modal roles, a validated partial JSON schema, CSS export and immutable presets. Components already consumed most of these roles. Gaps were: fields and hover surfaces were overwritten with aliases at export, menus ignored popover, accent previews patched primary variables inline, status foregrounds were implicit, borders conflated decoration with control boundaries, and the editor enumerated tokens in a separate hardcoded list.

Reuse those roles. Only add `field`, `surfaceHover`, `controlBorder` and tone foregrounds, soft backgrounds and borders (`Soft`, `Text`, `Border`, `OnSolid`), reusing the existing `primaryForeground` and `accentForeground` for solid actions. Each addresses an actual component use. The editor automatically includes every allowlisted token. New tokens retain color validation, undo/redo, persistence and JSON/CSS export. Old partial documents inherit missing roles; overriding old surface or tone colors derives missing dependent tokens. Explicit dependent overrides always win, so custom drafts can still have contrast errors.

## Reference mappings

| Family | Canvas / panel / field | Raised / popover / modal | Primary / decorative accent | Status colors |
| --- | --- | --- | --- | --- |
| Catppuccin Mocha | Mantle / Base / Mantle | Surface0 / Surface0 / Base | Mauve / Blue | Green, Yellow, Red, Sky |
| Catppuccin Latte | Mantle / Base / Mantle | white adaptation / Base / Base | Mauve / Blue | Green, Yellow, Red, Blue |
| Tokyo Night | bg_dark / bg / bg_dark | Storm panel / bg_float / Storm panel | Blue / Purple | Green, Yellow, Red, Cyan |
| Tokyo Night Day | darker chrome / bg / lighter field | lighter surface / lighter surface / bg | Blue / Purple | Green, Yellow, Red, Cyan |
| Dracula | Background Dark / Background / Background Dark | Selection / Floating / Floating | Purple / Pink | Green, Yellow, Red, Cyan |
| Nord | nord0 / nord1 / nord0 | nord2 / nord1 / nord1 | nord8 / nord15 | nord14, nord13, nord11, nord9 |

Cards share panel colors deliberately. Contrast, stroke and elevation establish hierarchy without a unique color for every role. Day is a VUI interpretation of upstream's inverted light scheme, not an exact reproduction of an editor screenshot. Family-specific soft ramps are hand assigned in `reference-roles.ts`; shared accessibility adjustments affect text and boundaries rather than replacing every palette with a uniform generated scheme. Status text can differ from the original swatch to meet AA. Decorative accents never imply success or failure.

Sources: [Catppuccin palette](https://catppuccin.com/palette/) and [style guide](https://github.com/catppuccin/catppuccin/blob/main/docs/style-guide.md); [Tokyo Night](https://github.com/folke/tokyonight.nvim) (night, storm and inverted day); [Dracula specification](https://github.com/dracula/draculatheme.com/blob/main/content/spec.mdx); [Nord colors and UI guidance](https://www.nordtheme.com/docs/colors-and-palettes/).

## Tone API

Buttons, icon buttons, badges, chips and alerts accept `tone="neutral|primary|accent|success|warning|danger|info"` and `variant="solid|soft|outline|ghost"`. Buttons default to primary/solid; labels default to neutral/soft; alerts default to info/soft when tone is specified. Solid presents emphasis, soft supports filled labels and alerts, outline supports boundaries, ghost supports low emphasis. Other components retain their existing structural APIs and consume semantic roles rather than unnecessary tone options.

```html
<vui-button tone="accent" variant="solid">Create project</vui-button>
<vui-badge tone="success" variant="soft">Ready</vui-badge>
<vui-chip tone="primary" variant="outline">Design</vui-chip>
<vui-alert tone="warning" variant="soft">Review required</vui-alert>
```

Existing variant names (`primary`, `secondary`, `danger`, `success`, etc.) retain their behavior. With new variants, tone selects the color. An explicit tone takes precedence over a legacy color variant. Disabled and loading buttons retain disabled styling. Hover/pressed strokes preserve the foreground/background contrast of new variants.

## Contrast and limits

Normal text and tone foregrounds target 4.5:1, focus and control boundaries 3:1. Decorative card dividers need not meet the control-boundary threshold. Disabled controls are exempt. A focus indicator and selected-row stroke supplement color. Outline and ghost text must be readable on the container as well as its soft surface.

Unit checks cover token pairs and old partial documents. The browser scenario renders the same form/table/components scene in all six presets, exercises hover, focus, pressed, selected, disabled, menu and modal states, and writes ignored screenshots. These are targeted checks, not a claim of complete WCAG conformance: content, custom themes, consumer CSS, transparent underlays and all possible container combinations need application-specific review. Legacy CSS-only themes keep variable fallbacks; exported custom CSS supplies all new roles.

## Attribution and redistribution

Palette authors retain their names and rights. Catppuccin: Copyright (c) 2021 Catppuccin, MIT. Nord: Copyright (c) 2016-present Sven Greb, MIT. Tokyo Night: folke and contributors, Apache-2.0. Dracula: Copyright (c) 2023 Dracula Theme, MIT. Full notices are included in `THIRD_PARTY_NOTICES.md` and `licenses/Apache-2.0.txt`. VUI changes semantic role assignments, surface hierarchy, tints and accessibility adjustments; no upstream application code or artwork is included.

When distributing upstream material, retain its copyright and full license text. MIT requires its copyright and permission notice; Apache-2.0 requires the license copy, retained notices, a modification notice and any applicable upstream NOTICE. Sources: [Catppuccin license](https://github.com/catppuccin/catppuccin/blob/main/LICENSE), [Tokyo Night license](https://github.com/folke/tokyonight.nvim/blob/main/LICENSE), [Nord license](https://github.com/nordtheme/nord/blob/develop/license). The names identify references and do not imply endorsement.

## Validation results

2026-11-11: `pnpm typecheck`, `pnpm lint`, all 133 unit tests (37 files), the library build and documentation build passed. The six identical scenes passed rendered button-text/outline checks and interactions in Chromium; Theme Studio passed preference, editing, persistence, import/export, comparison, dialog and mobile checks (12 theme tests). Foundation and existing keyboard/accessibility checks also passed (10 tests). The optimized website check passed. Package size, tree shaking and the packed consumer application passed; published notices are included. Screenshots are kept under ignored `.artifacts/theme-semantics/`.

Visual inspection confirmed distinct family surfaces and accents. Existing palette expectations were updated for intentional surface/default changes. No screenshot baselines or generated builds were added to Git.

Firefox and WebKit were not run in this environment (only Chromium is installed). Text and boundary pair checks do not constitute a complete accessibility audit of every consumer layout. User-edited colors can still fail contrast, which the editor reports without silently rewriting explicit values. Legacy `light`, `dark`, `system` CSS entry points retain their existing semantics; the Catppuccin default pair belongs to the preset initializer and documentation preference flow.

### Semantic color vocabulary

VUI supports the complete set of semantic roles described in
[daisyUI colors](https://daisyui.com/docs/colors/) through the existing tokens:

| daisyUI role | VUI token |
| --- | --- |
| base-100 / base-200 / base-300 / base-content | background / surface / surfaceElevated / foreground |
| primary / primary-content | primary / primaryForeground |
| secondary / secondary-content | secondary / secondaryForeground |
| accent / accent-content | accent / accentForeground |
| neutral / neutral-content | neutral / neutralOnSolid |
| info / info-content | info / infoOnSolid |
| success / success-content | success / successOnSolid |
| warning / warning-content | warning / warningOnSolid |
| error / error-content | error / dangerOnSolid |

`neutral` is now independent of page text. `tone="secondary"` supports solid,
soft, outline and ghost variants alongside the other tones. Every preset and
validated partial theme document includes these roles; existing CSS names and
legacy variants remain available. Older documents overriding foreground still
derive neutral from it unless they explicitly provide neutral. Secondary no
longer needs to double as the hover surface: surfaceHover is independently editable.

### Retro

`retro` uses the colors from the user-provided daisyUI Theme Generator payload
(`name: retro`, light scheme). `src/theme/retro.ts` records all twenty source
OKLCH colors and their sRGB HEX conversions, including the content colors.
No contrast correction is applied to these source fills or content colors.
Cards, fields, popovers and modals use base-100. Soft text, boundaries, focus,
hover and active states are derived through the shared VUI rules.

Some source solid/content pairs (including accent) are below WCAG AA. Theme
Studio reports them instead of silently changing the requested palette. Tests
verify the exact source colors separately from derived contrast roles. Generator shape defaults are now applied: Boxes 8 px, Fields 4 px, Selectors
4 px, border 1 px and zero shadow strength. Noise effects are not imported. Existing presets and OS defaults stay
unchanged. Select Retro in Theme Studio to create an editable draft.
