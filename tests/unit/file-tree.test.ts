import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/desktop/file-tree';
import type { VFileTree } from '../../src/components/desktop/file-tree';

describe('vui-file-tree', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('expands a folder and selects the next visible item', async () => {
    const tree = document.createElement('vui-file-tree') as VFileTree;
    tree.innerHTML = `
      <vui-tree-item label="src" kind="folder">
        <vui-tree-item label="index.ts" kind="file"></vui-tree-item>
      </vui-tree-item>
      <vui-tree-item label="package.json" kind="file"></vui-tree-item>
    `;
    document.body.append(tree);
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    const folder = tree.querySelector('vui-tree-item');
    expect(folder?.getAttribute('role')).toBe('treeitem');
    expect(folder?.getAttribute('aria-expanded')).toBe('false');

    folder?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    expect(folder?.hasAttribute('expanded')).toBe(true);
    expect(folder?.getAttribute('aria-expanded')).toBe('true');

    folder?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    expect(tree.selectedItem?.getAttribute('label')).toBe('index.ts');
  });

  it('shows summary, count and status, and skips a disabled row', async () => {
    const tree = document.createElement('vui-file-tree') as VFileTree;
    tree.innerHTML = `
      <vui-tree-item label="LAN" icon="network" kind="folder" expanded summary="10.0.0.0/8" count="2" status="активно" status-variant="success">
        <vui-tree-item label="old" disabled></vui-tree-item>
        <vui-tree-item label="wifi" icon="waypoints"></vui-tree-item>
      </vui-tree-item>
    `;
    document.body.append(tree);
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    const folder = tree.querySelector('vui-tree-item');
    expect(folder?.shadowRoot?.querySelector('[part="summary"]')?.textContent).toBe('10.0.0.0/8');
    expect(folder?.shadowRoot?.querySelector('[part="count"]')?.textContent).toBe('2');
    expect(folder?.shadowRoot?.querySelector('[part="status"]')?.textContent).toBe('активно');
    expect(folder?.shadowRoot?.querySelector('vui-icon')?.getAttribute('name')).toBe('network');
    expect(folder?.getAttribute('aria-label')).toContain('10.0.0.0/8');

    folder?.setAttribute('loading', '');
    expect(folder?.getAttribute('aria-busy')).toBe('true');
    expect(folder?.shadowRoot?.querySelector('vui-icon')?.getAttribute('name')).toBe('loader');
    folder?.removeAttribute('loading');

    folder?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    expect(tree.selectedItem?.getAttribute('label')).toBe('wifi');
    expect(tree.querySelector('[disabled]')?.getAttribute('aria-disabled')).toBe('true');
  });
});
