# VUI architecture

VUI is one ESM package. Its existing Web Components remain the implementation;
React 19 applications use typed adapters from `vui/react`. There is no second set
of styles, accessibility behavior, or themes to maintain.

## Start with a component

For a button, read `src/components/actions/button.ts`, `button-styles.ts`,
`button.react.ts`, and `button.test.ts`. The element owns its template, styles,
properties, and behavior. Small components keep styles in the same file. Related
child elements (such as Select and Option) share a module. Broader integration
checks live in `tests/unit` and browser scenarios in `tests/e2e`.

The normal path is **React adapter → custom element → CSS tokens**. Components do
not need an application provider, state manager, router, or dependency injection.

## Source map

| Directory | Responsibility |
| --- | --- |
| `src/components/` | Elements grouped by purpose; adjacent React adapters and component tests |
| `src/theme/` | Presets, validation, import/export, applying CSS variables |
| `src/utils/` | Element lifecycle, property reflection, styles, events, React adapter |
| `src/tokens/` | Shared CSS custom properties and density scales |
| `src/interaction/` | Shared keyboard, focus, selection, overlay and pointer behavior |
| `src/showcase/` | Documentation, Theme Studio drafts, portal navigation and preview templates; never published |

There is no `hooks/` directory yet: the small adapter keeps its effects together.
Add one when a genuinely reusable public React hook is needed, rather than
creating a layer every component must pass through.

`foundation/`, `contract/`, `composition/`, `families/`, and `categories/` remain
for compatibility with published entry points. Foundation exposes token and
layout inspection; contract describes component APIs; composition checks parent
and child relationships; families catalog shared behavior; categories re-export
components. These are not a sequence of wrappers. A component installs theme CSS
directly and does not initialize the foundation inspection API.

## Element lifecycle

`utils/element.ts` creates one shadow root per element. On first connection it
renders the template and mounts shared styles; later connections reuse that DOM.
Attribute changes call `sync()`. Named listeners and teardown callbacks are
released on disconnect. Constructable stylesheets are shared by component type,
with a `<style>` fallback. `utils/reflect.ts` supplies string and boolean property
reflection. Components with richer values keep explicit getters and setters.

The public API consists of attributes, properties, methods, events, slots, CSS
parts and documented custom properties. Existing `vui-*` names, exported classes,
category imports and legacy theme CSS paths remain supported. See
[the component reference](docs/components.md) for the API catalog.

## React and Next.js

`src/react.ts` re-exports adjacent `*.react.ts` adapters. Each calls the same
small factory in `utils/react.ts`. It renders the real `vui-*` tag, forwards a
ref to that element, attaches native DOM event listeners, and dynamically imports
only its element implementation after mounting. Object properties such as grid
rows are assigned after registration, avoiding pre-upgrade properties that would
hide element setters. Effect cleanup prevents stale async writes and duplicate
listeners. There is no provider and no internal React state or extra render.

Only the adapters and their helper carry `"use client"`. The build preserves this
boundary. A Next.js Server Component can render an adapter with serializable
props; event handlers belong in an application Client Component. React is an
optional peer dependency, so HTML and Electron consumers do not install it.

**SSR scope:** the server emits custom-element tags, primitive attributes and
light-DOM children. The shadow controls are created in the browser after
hydration. This is SSR-compatible integration, not server-rendered shadow DOM;
interactive controls require JavaScript. Direct `vui`, `vui/button` and category
imports remain browser entry points and must not be evaluated by a server.

[React and Next.js usage](docs/react.md) explains events, refs and limitations.
The [working example](examples/next) includes a Server Component, client state,
forms, a modal and grid object props.

## Themes

CSS custom properties are the rendering source of truth. Components consume the
same `--vui-*` tokens for every palette. Presets provide validated values for
those tokens; density changes scale and spacing without changing theme state.
Legacy theme entry points remain available. Explicit preferences win over OS
preferences; documentation defaults to Tokyo Night for dark and Catppuccin Latte
for light. Theme Studio draft state is separate from the documentation theme.

The theme engine allowlists tokens, validates types and colors, bounds imported
JSON, and never evaluates imported CSS or code. Built-in presets are immutable.
Live preview, color editing, JSON import/export and CSS export use this same
engine. Reference templates, editor history, preview UI and portal data stay in
`src/showcase`, outside the package export map and declaration build.

## Build and verification

`package.json` is the source of truth for public entry points. Vite derives its
ESM entries from that map and preserves modules; TypeScript emits declarations.
Component registration and legacy style imports are side effects. React adapter
modules are side-effect-free and factory calls are marked pure, allowing unused
adapters and their dynamic imports to be removed. React and lucide are external.

Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and
`pnpm build:docs`. Then run `pnpm check:shake`, `pnpm check:budget`,
`pnpm check:consumer`, `pnpm check:next`, and relevant `pnpm test:e2e` scenarios.
The Next.js check installs a packed tarball into a temporary copy of the example,
builds production output, checks server HTML, and tests hydration and interaction
in Chromium. Generated output and dependency directories are ignored by Git.

The documentation website has four routed sections and a contract-backed page for
every visual element. Live examples and copied programs share their markup, styles
and setup function. The portal consumes its separate website artifact inside the
VUI subproject; website source never enters the library package. See
[website publishing](docs/website.md) for build and deployment boundaries.
