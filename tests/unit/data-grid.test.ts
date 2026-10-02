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
      { id: 'button', name: 'Button', category: 'Actions' },
      { id: 'input', name: 'Input', category: 'Forms' },
    ];

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
});
