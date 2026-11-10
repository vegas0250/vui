// @vitest-environment node
import type { ComponentType, ReactNode } from 'react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import * as components from '../../src/react';

describe('React server rendering', () => {
  it('imports and renders every adapter without browser globals', () => {
    expect(typeof HTMLElement).toBe('undefined');
    for (const Component of Object.values(components)) {
      const html = renderToString(createElement(Component as ComponentType<{ children: ReactNode }>, { children: 'Server content' }));
      expect(html).toContain('<vui-');
      expect(html).toContain('Server content');
    }
  });

  it('serializes attributes and children but leaves object properties for hydration', () => {
    const html = renderToString(createElement(components.DataGrid, {
      label: 'Rows', columns: [{ key: 'name', title: 'Name' }], rows: [{ id: 'a', name: 'Ada' }],
    }));
    expect(html).toContain('label="Rows"');
    expect(html).not.toContain('[object Object]');
    expect(html).not.toContain('columns=');
    expect(renderToString(createElement(components.Button, { disabled: false, children: 'Save' })))
      .not.toContain('disabled');
  });
});
