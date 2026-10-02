import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/desktop/file-tree';
import type { VuiFileTree } from '../../src/components/desktop/file-tree';

describe('vui-file-tree', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('expands a folder and selects the next visible item', async () => {
    const tree = document.createElement('vui-file-tree') as VuiFileTree;
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
});
