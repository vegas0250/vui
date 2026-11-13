# Integration

VUI is a Custom Elements library. Bundlers and frameworks are optional consumers,
not part of the runtime. The published package is ESM + CSS tokens; React is an
optional peer for `vui/react` only.

## Supported patterns

| Pattern | Entry | When |
| --- | --- | --- |
| Plain HTML / SPA | `import 'vui'` or `vui/<component>` | Static sites, Vite/SPA shells, any ESM loader |
| Category import | `vui/forms`, `vui/layout`, … | Smaller graphs without the full set |
| React 19 | `vui/react` | JSX apps; adapters lazy-register CE after mount |
| Next.js App Router | `vui/react` + theme CSS in root layout | Preferred full-stack web stack |
| Electron renderer | same as HTML or React | Desktop chrome via `data-vui-ui="desktop"` |
| Opt-in templates | `vui/template-*` or React `Template*` | Application chrome hosts; not in `import 'vui'` |

Verification:

- Framework-free packed install: `pnpm check:consumer`
- Next.js packed install + SSR/hydration: `pnpm check:next`
- Theme/runtime ESM loads in Node without Vite; element modules need a DOM (`HTMLElement`)

Do not import `vui`, `vui/button`, categories, or templates on a Next.js Server
runtime path that evaluates Node. Use `vui/react` adapters (SSR emits light DOM).

## Preferred full-stack stack

For **new** full-stack web apps: **Next.js (App Router) + React 19 + native Turbopack**.

```sh
pnpm add vui react react-dom
# app layout CSS
# import 'vui/themes/tokens';
# import 'vui/themes/ui';
# import 'vui/themes/system';
```

```tsx
// app/layout.tsx
<html lang="en" data-vui-theme="system" data-vui-ui="web">
```

```tsx
// Server Component — serializable props only
import { Button, Panel } from 'vui/react';
```

```tsx
'use client';
import { Input } from 'vui/react';
// event handlers, refs, setTheme / setUIMode
```

No `transpilePackages`, provider, or `ssr: false` required. Dev and production
builds use Next’s native Turbopack (`next dev` / `next build`). Library packaging
still uses the repo Vite lib build; that is unrelated to application tooling.

Working reference: [examples/next](../examples/next). Details: [react.md](react.md).

## Web / Desktop / Terminal UI modes

Theme (`data-vui-theme`) and UI mode (`data-vui-ui`) are independent.

| Mode | Attribute | Use |
| --- | --- | --- |
| Web | `data-vui-ui="web"` | Sites and browser SPAs (default structural scale) |
| Desktop | `data-vui-ui="desktop"` | Electron / dense app chrome |
| Terminal | `data-vui-ui="terminal"` | Monospace TUI look — not a shell |

```ts
import { setTheme, setUIMode } from 'vui/theme';
setTheme('system');      // or a preset / custom theme id
setUIMode('desktop');    // 'web' | 'desktop' | 'terminal'
```

Recommendations:

- **Web apps (vegas0250.ru-style):** Next + `vui/react`, `data-vui-ui="web"`, selective
  components or templates as needed.
- **Desktop (VUT Vortex-style):** Electron renderer with CE or React; prefer
  `data-vui-ui="desktop"`; `vui-shell` / `vui-template-*` / `vui-window` /
  `vui-titlebar` for chrome; same tokens as web.
- **Terminal look:** same components; only switch UI mode. Do not fork components.

Templates stay opt-in: import `vui/template-dashboard` (etc.) or use
`TemplateDashboard` from `vui/react`. See [templates.md](templates.md).

## Public API surface (integration boundary)

Stable for consumers:

- Custom elements `vui-*` and classes `V*`
- Package exports in `package.json` (categories, components, theme, runtime,
  contract, composition, families, interaction, templates, react, theme CSS)
- Attributes, properties, methods, events, slots, CSS parts, documented tokens
- `setTheme` / `setUIMode` / `readFoundation`

Not required for apps:

- Showcase, Studio patterns, Theme Studio UI, website (`vui.vegas0250.ru`)
- Vite as the application bundler
- Importing the full `vui` graph when a category or component entry suffices

## Checklist for a new consumer

1. Install the packed package (`vui`), not repo `src/`.
2. Choose HTML/CE or `vui/react`.
3. Load theme CSS (`tokens` + `ui` + palette/system) once at the document root.
4. Set `data-vui-theme` and `data-vui-ui` (or call `setTheme` / `setUIMode` after mount).
5. Give shell/templates a bounded height (`100vh` / flex + `min-height: 0`).
6. Keep domain state in the app; listen to DOM `input` / `change` / `close`.
7. Run `pnpm check:consumer` / `pnpm check:next` equivalents against your install path.
