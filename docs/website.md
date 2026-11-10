# Documentation website and publishing

The library and documentation share one repository and have independent outputs:

| Purpose | Command | Output | Publication |
| --- | --- | --- | --- |
| Library | `pnpm build` | `dist`, declarations, existing theme entries | `pnpm pack`; optional manual npm release |
| Website | `pnpm build:docs` | `dist-docs` | `pnpm package:website`; import into the vegas0250 VUI subproject |

The package `files` allowlist and TypeScript build exclusion keep `src/showcase`,
website assets, navigation, editor state, and examples out of the library archive.
`pnpm check:consumer` checks that archive. Public exports and legacy theme paths
are covered by export tests. No Storybook or additional workspace is required.

## Source and routes

`src/showcase/main.ts` starts the website. The four sections are Getting Started,
Components, Interface Examples, and Themes. Hash routes provide direct component
links, for example `?lang=en#/components/button`. Russian is the default. Changing
language retains the selected page. The searchable menu groups all 69 visual
elements, including child elements shown with their required parents.

`component-data.ts` combines the actual registered contracts with bilingual
explanations and additional property documentation. `examples.ts` owns sample
markup and a self-contained setup function. The live demonstration and copied
code use exactly that markup and function; copy includes every required component
import and the same preview CSS. Consumers run HTML examples with an ESM bundler
such as Vite. Browser checks run a copied example independently with an import map.

The settings form validates and saves, the table filters rows, the dialog manages
focus, and the application shell toggles navigation. Variants and states use the
existing component attributes and CSS tokens. The original laboratory remains at
`?legacy=1`, loaded separately for regression checks and historical links.

Theme Studio uses the existing public engine. Documentation preferences and
editor drafts are separate. Embedded documentation prefixes storage keys with
`vui.documentation.` so it cannot overwrite the portal's theme preferences.
The initial theme script is external and runs before the app for strict CSP.
Portal navigation loads `/api/projects` from vegas0250.ru and falls back to the
checked-in manifest when offline. `pnpm sync:portal` refreshes that fallback.

## Review, build and publish

1. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm build:docs`.
2. Run `pnpm check:consumer`, `pnpm check:shake`, and relevant Playwright scenarios.
3. Commit reviewed source. `pnpm package:website` requires a clean checkout and
   packages the built site with the exact source SHA and version.
4. In `/var/www/vegas0250`, run `npm run import:vui -- /path/to/vui-website-VERSION.tar.gz`.
   It validates paths and provenance, stages static assets in `public/vui-docs`,
   keeps the previous staging directory, and records `apps/vui/release.json`.
5. Refresh the portal's `vendor/vui-VERSION.tgz` from `pnpm pack` after reviewing the
   library build. Update its dependency and lockfile, then run its tests and build.
6. Use the portal's existing deployment workflow. The VUI route frames the actual
   website inside the shared navigation. Only the documentation path permits
   same-origin framing; the rest of the portal keeps its existing CSP restrictions.

`.github/workflows/library-release.yml` builds only the library artifact. npm
publishing requires an explicit manual input, the `npm` environment and NPM_TOKEN.
`.github/workflows/website.yml` builds/tests only the website artifact; its optional
manual deployment uses the `production` environment and configured DEPLOY_HOST,
DEPLOY_USER, DEPLOY_SSH_KEY and DEPLOY_KNOWN_HOSTS. No npm publication is performed by
website deployment. Keep these credentials in GitHub secrets, never source files.

Generated outputs are ignored by Git. Deployments and repository pushes require
user authorization; the workflows do not automatically deploy on a normal push.
