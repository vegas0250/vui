# VUI — Vision & Architecture Principles

Product vision for VUI. Platform boundary: [PLATFORM.md](PLATFORM.md).
Implementation contract: [ARCHITECTURE.md](ARCHITECTURE.md).
Patterns vs templates: [docs/patterns.md](docs/patterns.md).

**Templates status:** shipped as opt-in exports (`vui/templates`,
`vui/template-dashboard`, `vui/template-settings`, `vui/template-workspace`).
Not registered by `import 'vui'`. Showcase Layout Gallery fills template slots
with demo content; see [docs/templates.md](docs/templates.md).

## 1. Vision

VUI is a universal, framework-agnostic UI system for building and maintaining
modern application interfaces.

Its purpose is to enable developers to create beautiful, consistent, responsive
interfaces quickly by combining ready-made components, layouts, templates, UI
modes and color themes.

**One UI system. Many applications. Centralized visual evolution.**

## 2. Core Principles

### 2.1. Single Source of Visual Truth

VUI is the central authority for application appearance.

Applications should not independently implement visual systems already provided
by VUI.

Changes to shared visual rules should propagate to consuming applications through
library updates.

### 2.2. Separation of Responsibilities

VUI owns:

- Design tokens and visual foundations.
- Color themes.
- UI modes: `web`, `desktop`, `terminal`.
- Reusable components and interaction patterns.
- Layout primitives and responsive behavior.
- Application templates and composition patterns.
- Accessibility and visual consistency.

Applications own:

- Business logic and domain data.
- Routing and application state.
- Application-specific content.
- Selection and composition of VUI components.
- Explicitly defined application-specific extensions.

### 2.3. Components Are the Foundation

All application interfaces should be composed primarily from VUI components.

Components must be reusable, accessible, responsive, consistent and independent
of specific applications.

Avoid duplicating components or introducing custom styling when an existing VUI
solution is appropriate.

### 2.4. Themes Control Colors

Color themes define semantic colors for backgrounds, surfaces, text, borders,
accents and states.

Themes must not control layout geometry or application structure.

Changing a theme should update colors without breaking the layout.

### 2.5. UI Modes Control Structural Design

VUI supports three independent UI modes:

- `web`: modern responsive web interfaces.
- `desktop`: native-like application interfaces based on Fluent 2 structural
  principles.
- `terminal`: dense, minimal, keyboard-oriented interfaces.

UI modes control typography, density, spacing, geometry, elevation, animation
and relevant interaction conventions.

Color themes and UI modes remain independent.

### 2.6. Layouts Control Composition

Layouts define how interface regions are arranged and behave responsively.

Applications should use reusable VUI layouts instead of repeatedly implementing
their own structural CSS.

Layouts must handle sizing, alignment, overflow, scrolling and responsive
behavior predictably.

### 2.7. Patterns vs Templates

**Patterns** are copyable reference assemblies in Studio. They are not custom
elements and are not package exports. See [docs/patterns.md](docs/patterns.md).

**Templates** are the planned published product layer: versioned Custom Element
hosts with stable named slots, built on `vui-shell` and layout primitives. They
carry structure only — no demo data, routing or business logic.

Examples of template shapes:

- Dashboard
- Workspace
- Settings
- Administration (future, on real demand)
- Authentication (future, on real demand)
- Content Management (future, on real demand)

Changing a template may change navigation, positioning and page composition while
preserving application data and business logic.

Templates should expose clear composition contracts rather than hardcode
application behavior.

### 2.8. Centralized Visual Evolution

Visual improvements should be implemented in VUI whenever they are broadly
reusable.

Updating VUI should allow consuming applications to adopt improvements without
duplicating the changes.

Existing component contracts, semantic tokens and layout APIs should remain
stable whenever possible.

Breaking changes must be explicit, versioned and documented.

### 2.9. Minimal Application-Level Styling

Applications should primarily configure and compose VUI rather than recreate its
design system.

Custom CSS is permitted for genuinely application-specific needs, but should not
override shared visual foundations unnecessarily.

### 2.10. Simplicity Over Abstraction

VUI must remain understandable, maintainable and efficient.

Prefer native browser capabilities, Web Components, CSS Grid, Flexbox and
standard CSS.

Avoid unnecessary dependencies, configuration layers and framework-specific
coupling.

## 3. System Architecture

```text
VUI
├── Foundations
│   ├── Design Tokens
│   ├── Color Themes
│   └── UI Modes
│       ├── Web
│       ├── Desktop
│       └── Terminal
│
├── Components
│   ├── Buttons / Inputs
│   ├── Navigation
│   ├── Tables / Lists
│   ├── Panels / Dialogs
│   └── ...
│
├── Layouts
│   ├── Stack / Grid
│   ├── Shell / Split
│   ├── Container / Scroll
│   └── Responsive Rules
│
├── Patterns
│   ├── Forms
│   ├── Filters
│   ├── Toolbars
│   └── Data Views
│   (showcase reference; not exported)
│
└── Templates
    ├── Dashboard
    ├── Workspace
    ├── Settings
    └── ...
    (opt-in published layer)
```

Three independent axes: **color theme** × **UI mode** × **template**.

## 4. Application Integration

An application should ideally need to:

1. Install VUI.
2. Select a UI mode.
3. Select a color theme.
4. Select an application template (`vui/template-*`).
5. Populate its components with application data and behavior.

The application should not need to rebuild common layouts, responsive rules or
visual styling.

## 5. Evolution Rules

- Improve shared visuals in VUI, not separately in every application.
- Keep application-specific behavior outside VUI.
- Preserve stable component and template APIs.
- Allow templates to evolve without coupling them to business logic.
- Prefer additive improvements over breaking redesigns.
- Use semantic versioning and document migrations.
- Test all supported modes, themes and layouts.
- Keep visual consistency across applications using compatible VUI versions.

## 6. Success Criteria

VUI succeeds when:

- A new application can obtain a professional interface with minimal custom
  styling.
- Multiple applications share the same visual foundations.
- A library update can improve their appearance consistently.
- Changing a theme requires no application code changes.
- Changing a template requires minimal integration work.
- Layouts remain stable across supported viewports.
- Developers spend more time implementing functionality than styling interfaces.

**Guiding principle:** Build application functionality in applications. Build
reusable visual experience in VUI.
