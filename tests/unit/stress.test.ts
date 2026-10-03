import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/actions/button';
import '../../src/components/data/data-grid';
import '../../src/components/data/list';
import { clearOverlays } from '../../src/core/overlay';
import type { VButton } from '../../src/components/actions/button';
import type { VDataGrid } from '../../src/components/data/data-grid';
import type { VList } from '../../src/components/data/list';

describe('stress', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
  });

  it('selects a row in a 1000-row grid without rebuilding every cell', () => {
    const grid = document.createElement('vui-data-grid') as VDataGrid;
    document.body.append(grid);
    grid.columns = [
      { key: 'name', title: 'Name' },
      { key: 'area', title: 'Area' },
    ];
    grid.rows = Array.from({ length: 1000 }, (_item, index) => ({
      id: String(index),
      name: `Row ${index}`,
      area: index % 2 === 0 ? 'Data' : 'Forms',
    }));
    const cell = grid.shadowRoot?.querySelector('[data-row="10"]');
    expect(grid.shadowRoot?.querySelectorAll('[role="gridcell"]')).toHaveLength(2000);

    const started = performance.now();
    grid.selectedId = '750';
    const elapsed = performance.now() - started;

    expect(grid.shadowRoot?.querySelector('tr[data-id="750"]')?.getAttribute('aria-selected')).toBe('true');
    expect(grid.shadowRoot?.querySelector('[data-row="10"]')).toBe(cell);
    expect(elapsed).toBeLessThan(250);
  });

  it('mounts a 1000-item list and disconnects every item with the host', () => {
    const list = document.createElement('vui-list') as VList;
    list.label = 'Many';
    list.innerHTML = Array.from({ length: 1000 }, (_item, index) => `<vui-list-item value="${index}">Item ${index}</vui-list-item>`).join('');
    document.body.append(list);
    const first = list.querySelector('vui-list-item');
    expect(list.querySelectorAll('vui-list-item')).toHaveLength(1000);
    expect(first?.isConnected).toBe(true);
    list.remove();
    expect(list.isConnected).toBe(false);
    expect(first?.isConnected).toBe(false);
  }, 20000);

  it('counts one click after a button is remounted many times', () => {
    const button = document.createElement('vui-button') as VButton;
    button.textContent = 'Go';
    document.body.append(button);
    let clicks = 0;
    button.addEventListener('click', () => {
      clicks += 1;
    });
    for (let index = 0; index < 25; index += 1) {
      button.remove();
      document.body.append(button);
    }
    button.shadowRoot?.querySelector('button')?.click();
    expect(clicks).toBe(1);
    expect(button.connectionCount).toBe(26);
  });
});
