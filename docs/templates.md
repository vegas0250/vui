# Templates

Templates are published Custom Element hosts for application chrome. They compose
`vui-shell` and layout primitives with stable named slots. They do not carry
demo data, routing, or business logic.

Patterns remain copyable Studio recipes — see [patterns.md](patterns.md).
Product vision — [VISION.md](../VISION.md).

Theme (`data-vui-theme`) and UI mode (`data-vui-ui`) stay on the document.
Templates do not branch on theme or mode names.

## Opt-in imports

Templates are **not** registered by `import 'vui'`.

```ts
import 'vui/templates';
// or
import { VTemplateDashboard } from 'vui/template-dashboard';
import 'vui/template-settings';
import 'vui/template-workspace';
```

React 19 adapters (lazy CE registration, SSR-safe light DOM):

```tsx
'use client';
import { TemplateDashboard, Toolbar, Nav, NavItem, StatusBar } from 'vui/react';
```

Also import the components you place in slots (`vui/toolbar`, `vui/nav`, …) or
use `import 'vui'` for the full component set alongside a template entry.

## Shared slots

Aligned with `vui-shell` so apps can switch hosts with minimal markup changes:

| Slot | Role |
| --- | --- |
| `header` | optional titlebar / top chrome |
| `toolbar` | commands |
| `nav` | primary navigation (nav, file-tree, …) |
| default | primary content (Dashboard, Settings) |
| `aside` | secondary shell aside when used |
| `footer` | status bar |

Workspace extras:

| Slot | Maps to |
| --- | --- |
| `editor` | `vui-split-panel` `start` |
| `inspector` | `vui-split-panel` `end` |

Shell attributes are forwarded: `label`, `nav-label`, `aside-label`, `skip-label`,
`resize-label`, `aside-expand-label`, `aside-collapse-label`, `aside-resize-label`,
`collapsed`, `aside-collapsed`. Optional `content-label` labels the main scroll
area or split.

## Elements

| Tag | Class | Main structure |
| --- | --- | --- |
| `vui-template-dashboard` | `VTemplateDashboard` | shell + scrollable default slot |
| `vui-template-settings` | `VTemplateSettings` | shell + scroll + `vui-container size="small"` |
| `vui-template-workspace` | `VTemplateWorkspace` | shell + horizontal split (`editor` / `inspector`) |

## Integration example

```html
<html data-vui-theme="catppuccin-latte" data-vui-ui="desktop">
  <body style="height:100vh;margin:0">
    <vui-template-settings label="Application" content-label="Settings">
      <vui-toolbar slot="toolbar" label="Commands">
        <strong slot="start">Settings</strong>
      </vui-toolbar>
      <vui-nav slot="nav" label="Sections">
        <vui-nav-item selected>Profile</vui-nav-item>
        <vui-nav-item>Access</vui-nav-item>
      </vui-nav>
      <vui-panel heading="Profile">
        <vui-input label="Name" value="Ada"></vui-input>
      </vui-panel>
      <vui-status-bar slot="footer">Draft</vui-status-bar>
    </vui-template-settings>
    <script type="module">
      import 'vui/template-settings';
      import 'vui/toolbar';
      import 'vui/nav';
      import 'vui/panel';
      import 'vui/input';
      import 'vui/status-bar';
      import { setTheme, setUIMode } from 'vui/theme';
      setTheme('catppuccin-latte');
      setUIMode('desktop');
    </script>
  </body>
</html>
```

Switching to dashboard keeps the same region slots; only the host tag and main
content shape change. Workspace uses `editor` / `inspector` instead of the
default slot for the work area.

## Gallery and examples

- Layout matrix: `pnpm dev` → [layout.html](../layout.html) (showcase data + modes).
- Standalone realistic hosts: [templates.html](../templates.html) (switch template / UI mode / theme).
- Next.js client demo: `examples/next/app/templates` (`TemplateDashboard` / `Settings` / `Workspace`).

## Public API stability

**Stable (1.x, additive):** opt-in entry points `vui/templates` and `vui/template-*`;
element names; shell-aligned slots (`header`, `toolbar`, `nav`, default, `aside`,
`footer`); workspace `editor` / `inspector`; forwarded shell attributes and
`content-label`; React adapters `TemplateDashboard` / `TemplateSettings` /
`TemplateWorkspace`.

**Not part of the public package surface:** showcase markup, `bindLayout`, demo
brands/data, and Studio patterns.

**Intentional limitations**

- Templates are opt-in; `import 'vui'` does not register them.
- No routing, form validation, i18n, or domain state inside templates.
- Theme and UI mode remain document attributes; templates do not branch on them.
- Workspace has no default content slot — use `editor` / `inspector`.
- SSR emits light-DOM tags only; shadow chrome upgrades in the browser (same as
  other VUI adapters).
- Nested scrolling can appear if a parent also scrolls; give the host a bounded
  height (`height: 100%` / flex `min-height: 0`).

Breaking slot or entry renames require a major version or a documented migration.
