import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { build, preview } from 'vite';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const work = mkdtempSync(join(tmpdir(), 'vui-consumer-'));

try {
  execFileSync('pnpm', ['pack', '--pack-destination', work], { cwd: root, stdio: 'inherit' });
  const tarballName = readdirSync(work).find((name) => name.endsWith('.tgz'));
  if (!tarballName) throw new Error('pnpm pack did not produce a tarball');
  const tarball = join(work, tarballName);
  const listing = execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' });
  const banned = listing
    .split('\n')
    .filter((name) => /\/(tests|showcase|scripts|fixtures)\//.test(name) || name.endsWith('.test.ts') || name.includes('src/showcase'));
  if (banned.length) throw new Error(`package contains internal files:\n${banned.join('\n')}`);
  if (!listing.includes('package/dist/index.js')) throw new Error('package is missing dist/index.js');
  if (!listing.includes('package/themes/light.css')) throw new Error('package is missing theme CSS');

  writeFileSync(
    join(work, 'package.json'),
    JSON.stringify({
      name: 'vui-consumer',
      private: true,
      type: 'module',
      dependencies: { vui: `file:${tarball}` },
    }),
  );
  execFileSync('npm', ['install', '--omit=dev', '--no-package-lock'], { cwd: work, stdio: 'inherit' });

  writeFileSync(
    join(work, 'index.html'),
    `<!doctype html>
<html>
  <head><meta charset="utf-8"></head>
  <body>
    <vui-button id="save" variant="primary">Save</vui-button>
    <vui-input id="name" label="Name"></vui-input>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
`,
  );
  writeFileSync(
    join(work, 'main.ts'),
    `import 'vui';
import 'vui/forms';
import 'vui/navigation';
import 'vui/data';
import 'vui/overlay';
import { VButton } from 'vui/button';
import { setDensity, setTheme } from 'vui/theme';

setTheme('dark');
setDensity('compact');
document.documentElement.dir = 'rtl';

const button = document.querySelector('#save');
if (!(button instanceof VButton)) {
  throw new Error('VButton from vui/button is not the registered element');
}
button.addEventListener('click', () => {
  button.textContent = 'Saved';
});
document.body.dataset.ready = 'yes';
`,
  );

  await build({
    root: work,
    configFile: false,
    logLevel: 'error',
    build: { outDir: 'dist', emptyOutDir: true },
  });

  const server = await preview({
    root: work,
    configFile: false,
    logLevel: 'error',
    preview: { host: '127.0.0.1', port: 4187, strictPort: true },
  });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:4187/');
    await page.waitForSelector('body[data-ready="yes"]');
    const state = await page.evaluate(() => {
      const button = document.querySelector('#save');
      const input = document.querySelector('#name');
      return {
        theme: document.documentElement.getAttribute('data-vui-theme'),
        density: document.documentElement.getAttribute('data-vui-density'),
        dir: document.documentElement.dir,
        shadow: Boolean(button?.shadowRoot?.querySelector('button')),
        input: Boolean(input?.shadowRoot?.querySelector('input')),
        dialog: Boolean(customElements.get('vui-dialog')),
        grid: Boolean(customElements.get('vui-data-grid')),
        tabs: Boolean(customElements.get('vui-tabs')),
      };
    });
    await page.locator('#save').click();
    await page.waitForFunction(() => document.querySelector('#save')?.textContent === 'Saved');

    const problems = [];
    if (state.theme !== 'dark') problems.push(`theme ${state.theme}`);
    if (state.density !== 'compact') problems.push(`density ${state.density}`);
    if (state.dir !== 'rtl') problems.push(`dir ${state.dir}`);
    if (!state.shadow) problems.push('button shadow missing');
    if (!state.input) problems.push('input shadow missing');
    if (!state.dialog || !state.grid || !state.tabs) problems.push('category registration missing');
    if (problems.length) throw new Error(problems.join(', '));
  } finally {
    await browser.close();
    await server.close();
  }

  console.log('consumer: packed install, production build, and browser check passed');
} finally {
  rmSync(work, { recursive: true, force: true });
}
