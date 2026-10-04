import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/data/data-grid';
import type { VDataGrid } from '../../src/components/data/data-grid';

describe('vui-data-grid', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('renders rows and moves selection with the keyboard', () => {
    const grid = document.createElement('vui-data-grid') as VDataGrid;
    document.body.append(grid);
    grid.columns = [
      { key: 'name', title: 'Name' },
      { key: 'category', title: 'Category' },
    ];
    grid.rows = [
      { id: 'button', name: 'Button', nameTitle: 'Button.full', category: 'Actions' },
      { id: 'input', name: 'Input', category: 'Forms' },
    ];
    expect(grid.shadowRoot?.querySelector('td')?.getAttribute('title')).toBe('Button.full');
    expect(grid.shadowRoot?.textContent).toContain('Button');
    expect(grid.shadowRoot?.querySelectorAll('[role="gridcell"]').length).toBe(4);

    let selected = '';
    grid.addEventListener('change', () => {
      selected = grid.selectedId;
    });
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(grid.selectedId).toBe('input');
    expect(selected).toBe('input');
    expect(grid.shadowRoot?.querySelector('tr[data-id="input"]')?.getAttribute('aria-selected')).toBe('true');
  });

  it('extends a range when multiple selection is on', () => {
    const grid = document.createElement('vui-data-grid') as VDataGrid;
    grid.multiple = true;
    document.body.append(grid);
    grid.columns = [{ key: 'name', title: 'Name' }];
    grid.rows = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
      { id: 'c', name: 'C' },
    ];
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, shiftKey: true }));
    expect(grid.selectedIds).toEqual(['b', 'c']);
    expect(grid.shadowRoot?.querySelector('[role="grid"]')?.getAttribute('aria-multiselectable')).toBe('true');
  });
});
