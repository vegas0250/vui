import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
assert.equal(execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim(), '', 'Commit reviewed source before packaging the website');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'vui-site-package-'));
try {
  const html = readFileSync(join(root, 'dist-docs/index.html'), 'utf8');
  assert(html.includes('theme-boot.js'), 'Run pnpm build:docs first');
  assert(!html.includes('/src/'), 'Website must contain production assets');
  cpSync(join(root, 'dist-docs'), join(work, 'site'), { recursive: true });
  writeFileSync(join(work, 'release.json'), JSON.stringify({
    schemaVersion: 1, version: pkg.version,
    source: 'https://github.com/vegas0250/vui',
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  }, null, 2) + '\n');
  mkdirSync(join(root, '.artifacts'), { recursive: true });
  const archive = join(root, '.artifacts', `vui-website-${pkg.version}.tar.gz`);
  execFileSync('tar', ['-czf', archive, '-C', work, 'site', 'release.json']);
  console.log(archive);
} finally { rmSync(work, { recursive: true, force: true }); }
