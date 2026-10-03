import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { checkCompliance, listContracts, remount } from '../../src/contract/index';
import { clearOverlays } from '../../src/core/overlay';
import '../../src/index';

/** Light-DOM value node. It has no shadow and is not a standalone component. */
const lightDomNodes = new Set(['vui-option']);

function definedElements(): string[] {
  const root = join(import.meta.dirname, '../../src/components');
  const names = new Set<string>();
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith('.ts')) {
        const text = readFileSync(path, 'utf8');
        for (const match of text.matchAll(/defineElement\('([^']+)'/g)) {
          const element = match[1];
          if (element) names.add(element);
        }
      }
    }
  };
  walk(root);
  return [...names].sort();
}

describe('component inventory', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
  });

  it('gives every custom element except light-dom options a contract', () => {
    const contracted = new Set(listContracts().map((contract) => contract.element));
    const missing = definedElements().filter((name) => !lightDomNodes.has(name) && !contracted.has(name));
    expect(missing).toEqual([]);
  });

  it('passes compliance for every registered contract', () => {
    for (const contract of listContracts()) {
      const element = document.createElement(contract.element);
      document.body.append(element);
      expect(checkCompliance(element, contract), contract.element).toEqual([]);
      element.remove();
    }
  });

  it('keeps one shadow across disconnect, reconnect, and a second instance', () => {
    for (const contract of listContracts()) {
      const element = document.createElement(contract.element) as HTMLElement & { connectionCount?: number };
      document.body.append(element);
      const shadow = element.shadowRoot;
      const start = element.connectionCount ?? 1;
      remount(element);
      remount(element);
      expect(element.shadowRoot, contract.element).toBe(shadow);
      expect(element.connectionCount, contract.element).toBe(start + 2);
      element.remove();
      document.body.append(element);
      expect(element.shadowRoot, contract.element).toBe(shadow);
      expect(element.isConnected, contract.element).toBe(true);
      element.remove();

      const again = document.createElement(contract.element);
      document.body.append(again);
      expect(again.shadowRoot, contract.element).toBeTruthy();
      expect(again.shadowRoot, contract.element).not.toBe(shadow);
      again.remove();
    }
  });
});
