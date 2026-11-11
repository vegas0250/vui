# VUI

Lightweight UI components for React 19, Next.js, plain HTML and Electron.
One package, shared CSS tokens, accessible keyboard interactions, and customizable
themes. The existing `vui-*` Web Components power every integration.

## Install

```sh
pnpm add vui react react-dom
```

React is optional for applications using Web Components directly.

## React / Next.js App Router

```tsx
// app/page.tsx — a Server Component
import { Button, Panel } from 'vui/react';

export default function Page() {
  return <Panel><Button variant="primary">Save</Button></Panel>;
}
```

For event handlers, use a Client Component:

```tsx
'use client';
import { useState } from 'react';
import { Input } from 'vui/react';

export function Name() {
  const [value, setValue] = useState('Ada');
  return <Input label="Name" value={value}
    onInput={(event) => setValue(event.currentTarget.value)} />;
}
```

Import `vui/themes/tokens`, `vui/themes/ui`, and `vui/themes/system` in
`app/layout.tsx` for initial token styles. Set `data-vui-theme="system"` on
`<html>` to follow OS appearance. Components install the complete theme stylesheet
when they mount. No provider, `transpilePackages`, or `ssr: false` is required.

The server renders element tags, attributes and children. Shadow DOM controls
and interaction initialize in the browser after hydration. Use `vui/react` in
server-rendered applications; direct element imports require a browser.

See the [Next.js example](examples/next), [React guide](docs/react.md), and
[component APIs](docs/components.md).

## HTML / Electron

```ts
import 'vui/button'; // Or vui/forms for a category, vui for all components.
```

```html
<vui-button variant="primary">Save</vui-button>
```

Existing class imports such as `import { VButton } from 'vui/button'` remain
available. Components work in Electron's renderer with the same tokens and API.

## Themes

```ts
// Browser code
import { setTheme, setUIMode } from 'vui/theme';
setTheme('tokyo-night');
setUIMode('desktop'); // or 'web' | 'terminal'
```

Theme (semantic colors) and UI mode (structural scale) are independent axes.
`terminal` is a monospace TUI-inspired visual mode, not a shell. Override
`--vui-*` CSS custom properties for application customization. Existing light,
dark, system, high-contrast and palette themes remain available. Theme Studio
supports live preview, color editing and validated JSON import/export; it is
documentation tooling and is not included in the runtime.

## Development

```sh
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm build:docs
pnpm check:shake
pnpm check:consumer
pnpm check:next
pnpm test:e2e
```

Read [ARCHITECTURE.md](ARCHITECTURE.md) for the source map, lifecycle, public API,
build boundaries and SSR limitations. Practical compositions are in
[docs/patterns.md](docs/patterns.md).

## Documentation website

Run `pnpm dev` for the bilingual catalog, interface examples and Theme Studio.
Direct component pages use routes such as `?lang=en#/components/button`.
`pnpm build:docs` builds the website independently from the library.
`pnpm check:website` checks that optimized build in Chromium; see
[website architecture and publishing](docs/website.md).
