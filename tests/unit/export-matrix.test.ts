import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as actions from '../../src/categories/actions';
import * as content from '../../src/categories/content';
import * as data from '../../src/categories/data';
import * as desktop from '../../src/categories/desktop';
import * as feedback from '../../src/categories/feedback';
import * as forms from '../../src/categories/forms';
import * as foundation from '../../src/categories/foundation';
import * as layout from '../../src/categories/layout';
import * as navigation from '../../src/categories/navigation';
import * as overlay from '../../src/categories/overlay';
import * as root from '../../src/index';

const categories: Record<string, Record<string, unknown>> = {
  actions: actions as unknown as Record<string, unknown>,
  content: content as unknown as Record<string, unknown>,
  data: data as unknown as Record<string, unknown>,
  desktop: desktop as unknown as Record<string, unknown>,
  feedback: feedback as unknown as Record<string, unknown>,
  forms: forms as unknown as Record<string, unknown>,
  foundation: foundation as unknown as Record<string, unknown>,
  layout: layout as unknown as Record<string, unknown>,
  navigation: navigation as unknown as Record<string, unknown>,
  overlay: overlay as unknown as Record<string, unknown>,
};

const rootExports = root as unknown as Record<string, unknown>;

function exportTargets(exportsMap: Record<string, unknown>): string[] {
  return Object.values(exportsMap).map((value) => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && 'import' in value) return String((value as { import: string }).import);
    return '';
  });
}

function definedElements(): Array<{ tag: string; className: string; file: string; folder: string }> {
  const base = join(import.meta.dirname, '../../src/components');
  const found: Array<{ tag: string; className: string; file: string; folder: string }> = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      if (!name.endsWith('.ts')) continue;
      const text = readFileSync(path, 'utf8');
      for (const match of text.matchAll(/defineElement\('([^']+)',\s*(V[A-Za-z0-9]+)\)/g)) {
        const tag = match[1];
        const className = match[2];
        const folder = dir.slice(base.length + 1).split(/[/\\]/)[0];
        if (!tag || !className || !folder) continue;
        found.push({ tag, className, file: path.slice(base.length + 1).replaceAll('\\', '/'), folder });
      }
    }
  };
  walk(base);
  return found;
}

describe('export matrix', () => {
  const pkg = JSON.parse(readFileSync(join(import.meta.dirname, '../../package.json'), 'utf8')) as {
    version: string;
    exports: Record<string, unknown>;
  };
  const targets = exportTargets(pkg.exports);
  const defined = definedElements();

  it('publishes 1.1.0 and reaches every element from component, category, and full import', () => {
    expect(pkg.version).toBe('1.1.0');
    const seen = new Set<string>();
    for (const item of defined) {
      expect(seen.has(item.className), item.className).toBe(false);
      seen.add(item.className);

      const dist = `./dist/components/${item.file.replace(/\.ts$/, '.js')}`;
      expect(targets, item.file).toContain(dist);

      const ctor = rootExports[item.className];
      expect(typeof ctor, item.className).toBe('function');
      expect(categories[item.folder]?.[item.className], item.className).toBe(ctor);
      expect(customElements.get(item.tag), item.tag).toBe(ctor);
    }
  });
});
