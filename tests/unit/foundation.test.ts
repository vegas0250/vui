import { beforeEach, describe, expect, it } from 'vitest';
import darkCss from '../../themes/dark.css?raw';
import highContrastCss from '../../themes/high-contrast.css?raw';
import lightCss from '../../themes/light.css?raw';
import systemCss from '../../themes/system.css?raw';
import densityCss from '../../src/tokens/density.css?raw';
import '../../src/components/layout/grid';
import '../../src/components/layout/panel';
import '../../src/components/layout/split-panel';
import '../../src/components/layout/stack';
import type { VGrid } from '../../src/components/layout/grid';
import type { VPanel } from '../../src/components/layout/panel';
import type { VSplitPanel } from '../../src/components/layout/split-panel';

describe('token contract', () => {
  it('keeps theme files on the semantic palette instead of raw colors', () => {
    for (const css of [lightCss, darkCss, highContrastCss, systemCss]) {
      expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(css).not.toMatch(/rgba?\(/);
    }
    expect(lightCss).toContain('--vui-color-primary: var(--vui-palette-blue-600)');
    expect(darkCss).toContain('--vui-color-background: var(--vui-palette-ink-900)');
    expect(systemCss).toContain('--vui-color-background: var(--vui-palette-ink-900)');
    expect(highContrastCss).toContain('--vui-color-focus: var(--vui-palette-hc-yellow)');
    expect(densityCss.match(/--vui-panel-padding: var\(--vui-space-lg\)/g)).toHaveLength(3);
  });
});

describe('layout contract', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('uses one gap, padding, align, justify, and overflow vocabulary', () => {
    const row = document.createElement('vui-hstack');
    row.setAttribute('gap', 'lg');
    row.setAttribute('padding', 'sm');
    row.setAttribute('align', 'center');
    row.setAttribute('justify', 'end');
    row.setAttribute('overflow', 'hidden');
    document.body.append(row);

    expect(row.getAttribute('data-axis')).toBe('row');
    expect(row.style.getPropertyValue('--vui-layout-gap')).toBe('var(--vui-space-lg)');
    expect(row.style.getPropertyValue('--vui-layout-padding')).toBe('var(--vui-space-sm)');
    expect(row.style.getPropertyValue('--vui-layout-align')).toBe('center');
    expect(row.style.getPropertyValue('--vui-layout-justify')).toBe('flex-end');
    expect(row.style.getPropertyValue('--vui-layout-overflow')).toBe('hidden');

    row.setAttribute('overflow', 'sideways');
    expect(row.style.getPropertyValue('--vui-layout-overflow')).toBe('visible');

    const grid = document.createElement('vui-grid') as VGrid;
    grid.setAttribute('gap', 'lg');
    grid.setAttribute('padding', 'xs');
    document.body.append(grid);
    expect(grid.style.getPropertyValue('--vui-layout-gap')).toBe('var(--vui-space-lg)');
    expect(grid.style.getPropertyValue('--vui-layout-padding')).toBe('var(--vui-space-xs)');
  });

  it('keeps panel padding and overflow on the same scale', () => {
    const panel = document.createElement('vui-panel') as VPanel;
    panel.setAttribute('heading', 'Notes');
    panel.setAttribute('padding', 'md');
    panel.setAttribute('overflow', 'hidden');
    document.body.append(panel);
    expect(panel.style.getPropertyValue('--vui-layout-padding')).toBe('var(--vui-space-md)');
    expect(panel.style.getPropertyValue('--vui-layout-overflow')).toBe('hidden');
    expect(panel.shadowRoot?.querySelector('h2')?.textContent).toBe('Notes');
  });

  it('clamps split position to min and max and keeps a nested panel independent', () => {
    const outer = document.createElement('vui-split-panel') as VSplitPanel;
    outer.setAttribute('position', '30');
    const inner = document.createElement('vui-split-panel') as VSplitPanel;
    inner.setAttribute('slot', 'start');
    inner.setAttribute('orientation', 'vertical');
    inner.setAttribute('position', '45');
    inner.setAttribute('min', '20');
    inner.setAttribute('max', '80');
    outer.append(inner);
    document.body.append(outer);

    expect(outer.position).toBe(30);
    expect(inner.position).toBe(45);
    inner.position = 5;
    expect(inner.getAttribute('position')).toBe('20');
    expect(outer.position).toBe(30);

    const separator = inner.shadowRoot?.querySelector('.sep');
    expect(separator?.getAttribute('aria-valuemin')).toBe('20');
    expect(separator?.getAttribute('aria-valuemax')).toBe('80');
    expect(separator?.getAttribute('aria-orientation')).toBe('horizontal');
    separator?.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(inner.getAttribute('position')).toBe('80');
    separator?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(inner.getAttribute('position')).toBe('20');
    expect(outer.getAttribute('position')).toBe('30');
  });
});
