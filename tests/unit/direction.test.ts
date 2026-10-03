import { beforeEach, describe, expect, it } from 'vitest';
import type { VMenu } from '../../src/components/overlay/menu';
import type { VSplitPanel } from '../../src/components/layout/split-panel';
import type { VTabs } from '../../src/components/navigation/tabs';
import type { VFileTree } from '../../src/components/desktop/file-tree';
import { clearOverlays } from '../../src/core/overlay';
import '../../src/index';

describe('inline direction', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
    document.documentElement.removeAttribute('dir');
  });

  it('moves tabs toward the inline end with ArrowLeft in rtl', () => {
    document.documentElement.dir = 'rtl';
    const tabs = document.createElement('vui-tabs') as VTabs;
    tabs.innerHTML = `
      <vui-tab slot="tab">One</vui-tab>
      <vui-tab slot="tab" selected>Two</vui-tab>
      <vui-tab slot="tab">Three</vui-tab>
      <vui-tab-panel slot="panel">A</vui-tab-panel>
      <vui-tab-panel slot="panel">B</vui-tab-panel>
      <vui-tab-panel slot="panel">C</vui-tab-panel>
    `;
    document.body.append(tabs);
    const [first, second, third] = [...tabs.querySelectorAll('vui-tab')];
    second?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(third?.hasAttribute('selected')).toBe(true);
    expect(first?.hasAttribute('selected')).toBe(false);
    expect(second?.hasAttribute('selected')).toBe(false);
  });

  it('opens a submenu toward the inline start in rtl', () => {
    document.documentElement.dir = 'rtl';
    const menu = document.createElement('vui-menu') as VMenu;
    menu.innerHTML = `
      <vui-menu-item label="More">
        <vui-menu slot="submenu" label="Nested">
          <vui-menu-item label="Inside"></vui-menu-item>
        </vui-menu>
      </vui-menu-item>
    `;
    document.body.append(menu);
    menu.showAt(20, 20);
    const item = menu.querySelector('vui-menu-item');
    item?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(item?.querySelector('vui-menu')?.hasAttribute('open')).toBe(true);
  });

  it('grows the start pane when ArrowLeft is pressed on an rtl split', () => {
    document.documentElement.dir = 'rtl';
    const split = document.createElement('vui-split-panel') as VSplitPanel;
    document.body.append(split);
    split.position = 40;
    split.shadowRoot?.querySelector('.sep')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(split.position).toBe(42);
  });

  it('expands a tree branch with ArrowLeft in rtl', () => {
    document.documentElement.dir = 'rtl';
    const tree = document.createElement('vui-file-tree') as VFileTree;
    tree.innerHTML = `<vui-tree-item label="Folder" kind="folder"><vui-tree-item label="File"></vui-tree-item></vui-tree-item>`;
    document.body.append(tree);
    const folder = tree.querySelector('vui-tree-item');
    folder?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(folder?.hasAttribute('expanded')).toBe(true);
  });
});
