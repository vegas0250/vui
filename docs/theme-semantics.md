# VUI themes: semantics and design

Since 2.0 VUI ships exactly two own themes: **VUI Light** (`light`) and **VUI Dark** (`dark`).
`system` follows `prefers-color-scheme` between them. Third-party adaptations (Catppuccin, Tokyo Night,
Dracula, Nord, Rosé Pine, Kanagawa, SynthWave, Fluent, Radix, Retro), neon and high-contrast themes were removed.

Source of truth: `src/theme/palettes.ts` (base colors) and `src/theme/reference-roles.ts` (surface roles, soft tints).
`src/theme/presets.ts` derives every semantic token and enforces contrast. `themes/light.css`, `themes/dark.css`
and `themes/system.css` are generated from the presets (`tests/unit/theme-css.test.ts` fails when they drift;
regenerate with `VUI_WRITE_THEME_CSS=1 pnpm vitest run tests/unit/theme-css.test.ts`).

## What was taken from established themes

| Idea | Inspired by | In VUI |
|------|-------------|--------|
| Clear neutral surface ladder, white cards on a tinted canvas | Radix Colors, Linear, Vercel Geist | canvas `#f5f6f8` → surface/card/popover `#ffffff`, hover `#eef0f4` |
| One brand hue for action + focus, one accent | Radix, Fluent 2 | indigo primary, teal accent; no competing purples/pinks |
| Deep blue-gray dark, never pure black; off-white text | Tokyo Night, Catppuccin Mocha | `#0e1016` canvas, `#151821` surface, `#e7e9f0` text |
| Elevation through lighter surfaces in dark mode | Material 3, Radix dark | surface → raised `#1c202b` → hover `#232835` |
| Soft tinted status surfaces (badges, alerts) | Catppuccin, Radix step 3 | hand-picked `*Soft` tints per tone |
| Calm, desaturated status colors | Nord, Catppuccin | green / amber / red / blue tuned per scheme |
| Tinted near-black text on light fills instead of `#000` | Catppuccin, Linear | on-solid ink `#11131a` / `#0e1016` |

No upstream palette is copied; values are original and only the design principles are borrowed.

## Roles

| Role | VUI Light | VUI Dark |
|------|-----------|----------|
| background / surface / field | `#f5f6f8` / `#ffffff` / `#ffffff` | `#0e1016` / `#151821` / `#10131a` |
| raised / popover / modal | `#ffffff` / `#ffffff` / `#ffffff` | `#1c202b` / `#1c202b` / `#181b25` |
| hover / selection | `#eef0f4` / `#e3e6fb` | `#232835` / `#2b3158` |
| text / muted | `#171a21` / `#596070` | `#e7e9f0` / `#9ca3b4` |
| primary / accent | `#4f56d9` / `#0e7f86` | `#8d95ff` / `#5ccfc2` |
| success / warning / danger / info | `#17804d` / `#9a5b00` / `#cf2f45` / `#1767c2` | `#62d394` / `#f0c36d` / `#ff7d8c` / `#70b6ff` |

Final values may be nudged by the engine so that text reaches WCAG AA 4.5:1 and boundaries 3:1 on every surface
they can appear on (canvas, surface, card, popover, modal, field, selection, hover and all soft tone fills).

## Compatibility

- Removed ids keep working: `setTheme`, `applyTheme`, `themeById`, stored preferences and custom-theme documents map
  each old id to the VUI theme of the same mode (`legacyThemeAliases`, `canonicalThemeId` in `vui/theme`).
- `vui/themes/high-contrast` is no longer exported; `high-contrast` and `neon-*` resolve to `light` / `dark`.
- Theme document schema 1 is unchanged; Theme Studio still edits every token and exports JSON/CSS.
- Themes are color-only: radii, density and elevation geometry come from the UI mode (`data-vui-ui`).

## Validation

Unit tests check every preset for complete tokens, text/soft-tone/solid/boundary/focus contrast and the generated
CSS files. Firefox and WebKit are not part of the local run. User-edited colors can still fail contrast; Theme Studio
reports this without rewriting explicit values.
