import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { execPnpm, spawnPnpm } from './pnpm.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const work = mkdtempSync(join(tmpdir(), 'vui-next-'));
// Fail before packing if the library/declaration build is incomplete.
const library = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
for (const entry of Object.values(library.exports)) {
  if (typeof entry !== 'object') continue;
  for (const path of [entry.import, entry.types]) {
    assert(readFileSync(join(root, path)).length, `Missing ${path}; run pnpm build first`);
  }
}
assert(/^['"]use client['"];/.test(readFileSync(join(root, 'dist/react.js'), 'utf8')),
  'The published React entry must preserve its client boundary');
let server;
let browser;
try {
  execPnpm(['pack', '--pack-destination', work], { cwd: root, stdio: 'pipe' });
  const tarball = join(work, readdirSync(work).find((name) => name.endsWith('.tgz')));
  const app = join(work, 'app');
  cpSync(join(root, 'examples/next'), app, {
    recursive: true, filter: (path) => !path.split(/[/\\]/).some((part) => part === 'node_modules' || part === '.next'),
  });
  const pkg = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8'));
  pkg.dependencies.vui = `file:${tarball}`;
  writeFileSync(join(app, 'package.json'), JSON.stringify(pkg, null, 2));
  execPnpm(['install', '--prefer-offline', '--no-frozen-lockfile', '--store-dir', join(tmpdir(), 'vui-pnpm-store')], {
    cwd: app, stdio: 'inherit', env: { ...process.env, CI: 'true' },
  });
  execPnpm(['build'], {
    cwd: app, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  const port = await new Promise((resolve, reject) => {
    const socket = createServer();
    socket.once('error', reject);
    socket.listen(0, '127.0.0.1', () => {
      const address = socket.address();
      socket.close(() => resolve(address.port));
    });
  });
  let output = '';
  server = spawnPnpm(['exec', 'next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: app, detached: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  });
  server.stdout.on('data', (data) => { output += data; });
  server.stderr.on('data', (data) => { output += data; });
  const url = `http://127.0.0.1:${port}`;
  let response;
  for (let attempt = 0; attempt < 150; attempt++) {
    if (server.exitCode !== null) throw new Error(output);
    try { response = await fetch(url); if (response.ok) break; } catch { /* Starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert(response?.ok, `Next.js did not start: ${output}`);
  const html = await response.text();
  assert(html.includes('<vui-button'), 'Missing server-rendered button');
  assert(html.includes('VUI with Next.js'), 'Missing Server Component output');
  assert(html.includes('Hello, ') && html.includes('Ada'), 'Missing server-rendered client content');

  // Check request-time SSR as well as the prerendered Server Component page.
  for (const value of ['First SSR request', 'Second SSR request']) {
    const ssr = await fetch(`${url}/ssr`, { headers: { 'x-vui-example': value } });
    assert(ssr.ok, 'Request-time SSR failed');
    const markup = await ssr.text();
    assert(markup.includes(`<vui-button>${value}</vui-button>`), 'SSR did not reflect this request');
  }

  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(url);
  await page.getByRole('textbox', { name: 'Name' }).fill('Grace');
  await page.getByRole('status').filter({ hasText: 'Hello, Grace' }).waitFor();
  await page.getByRole('checkbox').focus();
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.querySelector('output')?.textContent === 'Subscribed');
  await page.keyboard.press('Space');
  await page.waitForFunction(() => document.querySelector('output')?.textContent === 'Unsubscribed');
  await page.getByRole('button', { name: 'Open dialog' }).click();
  await page.getByRole('dialog', { name: 'Welcome' }).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: 'Welcome' }).waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Open dialog' }).click();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('dialog', { name: 'Welcome' }).waitFor({ state: 'hidden' });
  await page.getByRole('gridcell', { name: 'VUI', exact: true }).waitFor();
  assert.deepEqual(errors, [], 'Hydration or browser errors');

  errors.length = 0;
  await page.goto(`${url}/templates`);
  await page.waitForFunction(() => Boolean(customElements.get('vui-template-dashboard')));
  await page.locator('vui-template-dashboard').waitFor();
  await page.getByRole('button', { name: 'Switch template' }).click();
  await page.locator('vui-template-settings').waitFor();
  await page.getByRole('button', { name: 'Switch template' }).click();
  await page.locator('vui-template-workspace').waitFor();
  assert.deepEqual(errors, [], 'Templates route hydration or browser errors');
  console.log('next: packed install, TypeScript, production SSR, hydration, events, object props, dialog and templates passed');
} finally {
  await browser?.close();
  if (server?.pid) {
    try {
      if (process.platform === 'win32') {
        execFileSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        process.kill(-server.pid, 'SIGTERM');
      }
    } catch { /* Already exited. */ }
    if (server.exitCode === null) await new Promise((resolve) => server.once('exit', resolve));
  }
  rmSync(work, { recursive: true, force: true });
}
