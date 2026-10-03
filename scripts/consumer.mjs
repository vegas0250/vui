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
    <vui-select id="kind" label="Kind" value="a">
      <vui-option value="a" selected>Alpha</vui-option>
    </vui-select>
    <vui-dialog id="note" label="Note"></vui-dialog>
    <vui-tabs id="sections" label="Sections">
      <vui-tab panel="one" selected>One</vui-tab>
      <vui-tab-panel name="one">Panel</vui-tab-panel>
    </vui-tabs>
    <vui-data-grid id="grid" label="Rows"></vui-data-grid>
    <vui-list id="items" label="Items">
      <vui-list-item value="one" selected>One</vui-list-item>
    </vui-list>
    <vui-file-tree id="tree" label="Files">
      <vui-tree-item label="readme" kind="file"></vui-tree-item>
    </vui-file-tree>
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
import 'vui/desktop';
import { VButton } from 'vui/button';
import { VDataGrid } from 'vui/data-grid';
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
const grid = document.querySelector('#grid');
if (!(grid instanceof VDataGrid)) throw new Error('VDataGrid is not the registered element');
grid.columns = [{ key: 'name', title: 'Name' }];
grid.rows = [{ id: '1', name: 'Button' }];
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
        styles: Boolean(document.getElementById('vui-styles')),
        select: document.querySelector('#kind')?.shadowRoot?.textContent?.includes('Alpha') ?? false,
        dialog: Boolean(document.querySelector('#note')?.shadowRoot?.querySelector('dialog')),
        tabs: Boolean(document.querySelector('#sections')?.shadowRoot?.querySelector('[role="tablist"]')) && (document.querySelector('#sections')?.textContent?.includes('Panel') ?? false),
        grid: document.querySelector('#grid')?.shadowRoot?.textContent?.includes('Button') ?? false,
        list: document.querySelector('#items')?.textContent?.includes('One') ?? false,
        tree: document.querySelector('#tree vui-tree-item')?.shadowRoot?.textContent?.includes('readme') ?? false,
      };
    });
    await page.locator('#save').click();
    await page.waitForFunction(() => document.querySelector('#save')?.textContent === 'Saved');

    const problems = [];
    if (state.theme !== 'dark') problems.push(`theme ${state.theme}`);
    if (state.density !== 'compact') problems.push(`density ${state.density}`);
    if (state.dir !== 'rtl') problems.push(`dir ${state.dir}`);
    if (!state.styles) problems.push('theme styles missing');
    if (!state.shadow) problems.push('button shadow missing');
    if (!state.input) problems.push('input shadow missing');
    if (!state.select) problems.push('select did not render');
    if (!state.dialog) problems.push('dialog did not render');
    if (!state.tabs) problems.push('tabs did not render');
    if (!state.grid) problems.push('data grid did not render');
    if (!state.list) problems.push('list did not render');
    if (!state.tree) problems.push('file tree did not render');
    if (problems.length) throw new Error(problems.join(', '));
  } finally {
    await browser.close();
    await server.close();
  }

  console.log('consumer: packed install, production build, and browser check passed');
} finally {
  rmSync(work, { recursive: true, force: true });
}
