# VUI contributor rules

- Work in English and write user-facing results in Russian until the user revokes that preference.
- Preserve the existing Custom Element API, package exports and legacy theme entry points. Reuse actual `vui-*` components in demonstrations.
- Reusable theme code belongs in `src/theme`; portal navigation, editor state and reference interface templates belong only in `src/showcase` and must not enter the published library.
- Extend the existing CSS tokens; do not create a second component design system or per-palette component styles. Built-in presets are immutable.
- The documentation defaults follow the OS: Catppuccin Mocha for dark mode and Catppuccin Latte for light mode. Explicit preferences win. Editor drafts and the documentation theme are separate states.
- New documentation UI supports Russian by default and English through `?lang=en`. The website is independent at https://vui.vegas0250.ru/: no utility navigation, portal manifest requests or portal embedding.
- Treat imported themes as untrusted data: allowlist tokens, validate all types and colors, bound file sizes, and never evaluate imported CSS or code.
- Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, both builds and relevant Playwright checks. Keep generated artifacts, dependency stores and browser output out of Git.
- For the Theme Studio task, create logical local commits only. Git push and production deployment require separate user authorization.
- Treat UI mode, theme, and the component catalog as three independent axes. Docs catalog groups live in `src/showcase/docs-catalog.ts`; expansion research stays in `docs/research/component-matrix.md`. Keep legacy theme ids such as `fluent-light` / `fluent-dark` working while hiding Fluent branding from the primary UI.
