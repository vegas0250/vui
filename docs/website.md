# Documentation website and publishing

The library and documentation share one repository and have independent outputs:

| Purpose | Command | Output | Publication |
| --- | --- | --- | --- |
| Library | `pnpm build` | `dist`, declarations, existing theme entries | `pnpm pack`; optional manual npm release |
| Website | `pnpm build:docs` | `dist-docs` | `pnpm package:website`; independent static deployment |

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
editor drafts are separate. Preferences stay in the website origin's localStorage.
The initial theme script is external and runs before the app for strict CSP.
The website has no portal navigation or requests to the utility project manifest.

## Review, build and publish

1. Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm build:docs`.
2. Run `pnpm check:consumer`, `pnpm check:shake`, `pnpm check:website`, and relevant Playwright scenarios. The optimized-build check verifies all 69 registrations, real interaction, responsive width, and the external boot script.
3. Commit reviewed source. `pnpm package:website` requires a clean checkout and
   packages the built site with the exact source SHA and version.
4. Run `./deploy.sh /path/to/vui-website-VERSION.tar.gz` in this repository. It validates the archive and provenance, stages an immutable release and atomically switches `current`. Previous releases remain under `.releases` for rollback.
5. Enable `deploy/nginx.conf` after removing the VUI hostname from the utility server blocks. The existing tools certificate covers this hostname; preserve its renewal. The static website is served at https://vui.vegas0250.ru/ without the utility application upstream. Point `current` to the previous release to roll back.
6. The utility portal continues to use a separately reviewed vendored library archive. Website-only releases do not change that dependency or redeploy utilities.

`.github/workflows/library-release.yml` builds only the library artifact. npm
publishing requires an explicit manual input, the `npm` environment and NPM_TOKEN.
`.github/workflows/website.yml` builds/tests only the website artifact; its optional
manual deployment uses the `production` environment and configured DEPLOY_HOST,
DEPLOY_USER, DEPLOY_SSH_KEY and DEPLOY_KNOWN_HOSTS. No npm publication is performed by
website deployment. Keep these credentials in GitHub secrets, never source files.

Generated outputs are ignored by Git. Deployments and repository pushes require
user authorization; the workflows do not automatically deploy on a normal push.
