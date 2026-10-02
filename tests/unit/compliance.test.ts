import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/actions/button';
import '../../src/components/data/data-grid';
import '../../src/components/desktop/file-tree';
import '../../src/components/feedback/toast';
import '../../src/components/forms/input';
import '../../src/components/forms/select';
import '../../src/components/overlay/dialog';
import { checkCompliance, contractFor, designLiteralViolations, listContracts, remount } from '../../src/contract/index';
import type { ComponentContract } from '../../src/contract/index';
import { defineElement } from '../../src/core/define';
import { VuiElement } from '../../src/core/element';
import { clearOverlays } from '../../src/core/overlay';
import type { VDataGrid } from '../../src/components/data/data-grid';
import type { VDialog } from '../../src/components/overlay/dialog';
import type { VFileTree } from '../../src/components/desktop/file-tree';

const representative = [
  'vui-button',
  'vui-input',
  'vui-dialog',
  'vui-toast',
  'vui-select',
  'vui-data-grid',
  'vui-file-tree',
];

class VLifecycleProbe extends VuiElement {
  hits = 0;

  protected template(): string {
    return `<button type="button">Go</button>`;
  }

  protected componentStyles(): string {
    return `:host { max-width: 100%; }`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.bind('press', this.qs('button'), 'click', () => {
      this.hits += 1;
    });
  }
}

defineElement('vui-lifecycle-probe', VLifecycleProbe);

describe('component compliance', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
  });

  it('reports hardcoded design colors', () => {
    expect(designLiteralViolations('button { color: var(--vui-color-text); }')).toEqual([]);
    expect(designLiteralViolations('button { color: #fff; background: rgb(0, 0, 0); }')).toEqual(['#fff', 'rgb(']);
  });

  it('drops listeners on disconnect and keeps one shadow across reconnect', () => {
    const probe = document.createElement('vui-lifecycle-probe') as VLifecycleProbe;
    document.body.append(probe);
    const shadow = probe.shadowRoot;
    probe.shadowRoot?.querySelector('button')?.click();
    expect(probe.hits).toBe(1);
    expect(probe.connectionCount).toBe(1);

    probe.remove();
    probe.shadowRoot?.querySelector('button')?.click();
    expect(probe.hits).toBe(1);

    document.body.append(probe);
    expect(probe.shadowRoot).toBe(shadow);
    expect(probe.connectionCount).toBe(2);
    probe.shadowRoot?.querySelector('button')?.click();
    expect(probe.hits).toBe(2);
  });

  it('checks the representative set against the platform contract', () => {
    expect(listContracts().map((contract) => contract.element)).toEqual(expect.arrayContaining(representative));
    for (const name of representative) {
      const contract = contractFor(name);
      expect(contract, name).toBeTruthy();
      const element = document.createElement(name);
      document.body.append(element);
      expect(checkCompliance(element, contract as ComponentContract), name).toEqual([]);
      const shadow = remount(element);
      expect(element.shadowRoot).toBe(shadow);
      expect((element as VuiElement).connectionCount).toBeGreaterThanOrEqual(2);
    }
  });

  it('detects a declared loading state that never sets aria-busy', () => {
    const button = document.createElement('vui-button');
    document.body.append(button);
    const contract = contractFor('vui-button');
    expect(contract).toBeTruthy();
    const failures = checkCompliance(button, {
      ...(contract as ComponentContract),
      states: ['disabled', 'loading'],
    });
    expect(failures.join('\n')).toContain('aria-busy');
  });

  it('keeps button, input, dialog, toast, select, grid, and tree behavior after reconnect', async () => {
    const button = document.createElement('vui-button');
    button.textContent = 'Save';
    document.body.append(button);
    remount(button);
    let clicks = 0;
    button.addEventListener('click', () => {
      clicks += 1;
    });
    button.shadowRoot?.querySelector('button')?.click();
    expect(clicks).toBe(1);

    const input = document.createElement('vui-input');
    input.setAttribute('label', 'Email');
    input.setAttribute('invalid', '');
    document.body.append(input);
    remount(input);
    expect(input.shadowRoot?.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');

    const opener = document.createElement('button');
    const dialog = document.createElement('vui-dialog') as VDialog;
    dialog.label = 'Confirm';
    document.body.append(opener, dialog);
    opener.focus();
    remount(dialog);
    dialog.show();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dialog.open).toBe(false);

    const toast = document.createElement('vui-toast');
    toast.setAttribute('heading', 'Saved');
    toast.textContent = 'Done';
    document.body.append(toast);
    let closed = 0;
    toast.addEventListener('close', () => {
      closed += 1;
    });
    remount(toast);
    toast.shadowRoot?.querySelector('button')?.click();
    expect(closed).toBe(1);

    const select = document.createElement('vui-select');
    select.setAttribute('label', 'Language');
    const first = document.createElement('vui-option');
    first.setAttribute('value', 'a');
    first.textContent = 'Alpha';
    select.append(first);
    document.body.append(select);
    remount(select);
    select.shadowRoot?.querySelector('button')?.click();
    const second = document.createElement('vui-option');
    second.setAttribute('value', 'b');
    second.textContent = 'Beta';
    select.append(second);
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    expect(select.shadowRoot?.querySelectorAll('[role="option"]')).toHaveLength(2);
    select.shadowRoot?.querySelector('button')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    const grid = document.createElement('vui-data-grid') as VDataGrid;
    document.body.append(grid);
    grid.columns = [
      { key: 'name', title: 'Name' },
      { key: 'note', title: 'Note', priority: 'secondary' },
    ];
    grid.rows = [
      { id: 'button', name: 'Button', note: 'Primary' },
      { id: 'input', name: 'Input', note: 'Primary' },
    ];
    remount(grid);
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(grid.selectedId).toBe('input');

    const tree = document.createElement('vui-file-tree') as VFileTree;
    tree.innerHTML = `
      <vui-tree-item label="src" kind="folder">
        <vui-tree-item label="index.ts" kind="file"></vui-tree-item>
      </vui-tree-item>
    `;
    document.body.append(tree);
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));
    remount(tree);
    const folder = tree.querySelector('vui-tree-item');
    folder?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    expect(folder?.getAttribute('aria-expanded')).toBe('true');
  });
});
