import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/data/data-grid';
import '../../src/components/forms/input';
import '../../src/components/layout/grid';
import '../../src/components/layout/stack';
import '../../src/components/navigation/toolbar';
import type { VDataGrid } from '../../src/components/data/data-grid';
import type { VGrid } from '../../src/components/layout/grid';

function cssText(element: HTMLElement): string {
  const root = element.shadowRoot;
  if (!root) return '';
  const adopted = [...root.adoptedStyleSheets].flatMap((sheet) => [...sheet.cssRules].map((rule) => rule.cssText));
  const tags = [...root.querySelectorAll('style')].map((style) => style.textContent ?? '');
  return [...adopted, ...tags].join('\n');
}

describe('responsive layout', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('lets a column count collapse inside a narrow container', () => {
    const grid = document.createElement('vui-grid') as VGrid;
    grid.setAttribute('columns', '3');
    grid.setAttribute('min', '8rem');
    document.body.append(grid);
    const template = grid.style.getPropertyValue('--vui-grid-template');
    expect(template).toContain('auto-fit');
    expect(template).toContain('min(100%');
    expect(template).not.toContain('repeat(3, minmax(0, 1fr))');
  });

  it('marks a row stack and keeps field and toolbar containers', () => {
    const row = document.createElement('vui-hstack');
    const input = document.createElement('vui-input');
    const toolbar = document.createElement('vui-toolbar');
    document.body.append(row, input, toolbar);

    expect(row.getAttribute('data-axis')).toBe('row');
    expect(cssText(input)).toContain('container-name: vui-field');
    expect(cssText(input)).toContain('@container vui-field (min-width: 36rem)');
    expect(cssText(toolbar)).toContain('container-name: vui-toolbar');
    expect(cssText(toolbar)).toContain('@container vui-toolbar (max-width: 40rem)');
  });

  it('hides secondary columns and keeps keyboard focus on visible cells', () => {
    const grid = document.createElement('vui-data-grid') as VDataGrid;
    grid.setAttribute('data-compact', '');
    document.body.append(grid);
    grid.columns = [
      { key: 'name', title: 'Name' },
      { key: 'note', title: 'Note', priority: 'secondary' },
    ];
    grid.rows = [{ id: '1', name: 'Button', note: 'Hidden note' }];

    const headers = [...(grid.shadowRoot?.querySelectorAll('th') ?? [])];
    expect(headers[1]?.hidden).toBe(true);
    expect(headers[0]?.hidden).toBe(false);
    const frame = grid.shadowRoot?.querySelector('.frame');
    expect(frame).toBeTruthy();
    expect(cssText(grid)).toContain('overflow: auto');
    expect(cssText(grid)).toContain('min-width: max-content');

    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(grid.shadowRoot?.querySelector('[role="gridcell"][tabindex="0"]')?.textContent).toBe('Button');
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(grid.shadowRoot?.querySelector('[role="gridcell"][tabindex="0"]')?.textContent).toBe('Button');
  });
});
