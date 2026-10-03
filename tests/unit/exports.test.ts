import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '../..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { exports: Record<string, unknown> };

/** Stable public entry points. Removing or renaming one is a breaking change. */
const publicExports = [
  '.',
  './theme',
  './runtime',
  './contract',
  './composition',
  './families',
  './interaction',
  './icon',
  './button',
  './button-group',
  './icon-button',
  './toggle',
  './avatar',
  './avatar-group',
  './badge',
  './chip',
  './kbd',
  './link',
  './separator',
  './text',
  './input',
  './textarea',
  './checkbox',
  './radio',
  './switch',
  './select',
  './slider',
  './field',
  './dialog',
  './drawer',
  './menu',
  './popover',
  './tabs',
  './breadcrumbs',
  './pagination',
  './nav',
  './stepper',
  './tooltip',
  './alert',
  './empty',
  './progress',
  './spinner',
  './skeleton',
  './toast',
  './panel',
  './container',
  './scroll-area',
  './stack',
  './hstack',
  './vstack',
  './grid',
  './split-panel',
  './toolbar',
  './status-bar',
  './shell',
  './window',
  './file-tree',
  './data-grid',
  './list',
  './properties',
  './content',
  './foundation',
  './layout',
  './actions',
  './forms',
  './feedback',
  './overlay',
  './navigation',
  './data',
  './desktop',
  './themes/tokens',
  './themes/density',
  './themes/light',
  './themes/dark',
  './themes/high-contrast',
  './themes/system',
];

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (name.endsWith('.ts')) files.push(path);
  }
  return files;
}

describe('public package surface', () => {
  it('matches the frozen export map', () => {
    expect(Object.keys(pkg.exports).sort()).toEqual([...publicExports].sort());
  });

  it('does not publish core, showcase, or patterns', () => {
    const keys = Object.keys(pkg.exports);
    expect(keys.some((key) => key.includes('core') || key.includes('showcase') || key.includes('pattern'))).toBe(false);
  });

  it('keeps component modules off the package root', () => {
    const sources = walk(join(root, 'src/components'));
    for (const file of sources) {
      const text = readFileSync(file, 'utf8');
      expect(text.includes("from '../../index'") || text.includes("from '../index'"), file).toBe(false);
    }
  });
});
