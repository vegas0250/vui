import { beforeEach, describe, expect, it } from 'vitest';
import darkCss from '../../themes/dark.css?raw';
import highContrastCss from '../../themes/high-contrast.css?raw';
import lightCss from '../../themes/light.css?raw';
import neonCyanCss from '../../themes/neon-cyan.css?raw';
import neonGreenCss from '../../themes/neon-green.css?raw';
import neonMagentaCss from '../../themes/neon-magenta.css?raw';
import systemCss from '../../themes/system.css?raw';
import tokensCss from '../../src/tokens/tokens.css?raw';
import uiCss from '../../src/tokens/ui.css?raw';
import { themeDocument, themeVariables } from '../../src/theme';
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
    for (const css of [lightCss, darkCss, highContrastCss, systemCss, neonGreenCss, neonMagentaCss, neonCyanCss]) {
      expect(css).toContain('--vui-color-selected:');
    }
    expect(uiCss.match(/--vui-panel-padding: var\(--vui-space-lg\)/g)).toHaveLength(3);
    expect(uiCss).toContain('[data-vui-ui="terminal"]');
    expect(uiCss).toContain('--vui-font-sans: var(--vui-font-mono)');
    expect(uiCss).toContain('--vui-shadow-sm: none');
    expect(uiCss).toContain('--vui-opacity-disabled:');
    expect(uiCss).toContain('[data-vui-theme="high-contrast"]');
    for (const css of [lightCss, darkCss, highContrastCss, systemCss, neonGreenCss, neonMagentaCss, neonCyanCss]) {
      expect(css).not.toContain('--vui-focus-ring:');
      expect(css).not.toContain('--vui-focus-shadow:');
    }
    expect(systemCss).toContain('--vui-color-background: var(--vui-palette-slate-50)');
    expect(systemCss).not.toContain(':root[data-vui-theme="system"]');
  });

  it('keeps elevation geometry in ui.css and only ink in themes', () => {
    const themes = { lightCss, darkCss, systemCss, neonGreenCss, neonMagentaCss, neonCyanCss, highContrastCss };
    for (const [name, css] of Object.entries(themes)) {
      expect(css, name).toContain('--vui-shadow-ink:');
      expect(css, name).not.toMatch(/--vui-shadow-(sm|md|lg):/);
      expect(css, name).not.toContain('palette-shadow-light-');
      expect(css, name).not.toContain('palette-shadow-dark-');
    }
    for (const css of [lightCss, darkCss, systemCss, neonGreenCss, neonMagentaCss, neonCyanCss]) {
      for (const size of ['sm', 'md', 'lg']) expect(css).toContain(`--vui-shadow-strength-${size}:`);
    }
    for (const css of [neonGreenCss, neonMagentaCss, neonCyanCss]) expect(css).toContain('--vui-shadow-glow:');
    for (const css of [lightCss, darkCss, systemCss, highContrastCss]) expect(css).not.toContain('--vui-shadow-glow');
    expect(tokensCss).toContain('--vui-palette-shadow-ink-light:');
    expect(tokensCss).toContain('--vui-palette-shadow-ink-dark:');
    expect(tokensCss).not.toMatch(/--vui-palette-shadow-(light|dark|neon-[a-z]+)-(sm|md|lg):/);

    const web = uiCss.slice(uiCss.indexOf(':root,'), uiCss.indexOf('[data-vui-ui="desktop"]'));
    const desktop = uiCss.slice(uiCss.indexOf('[data-vui-ui="desktop"]'), uiCss.indexOf('[data-vui-ui="terminal"]'));
    const terminal = uiCss.slice(uiCss.indexOf('[data-vui-ui="terminal"]'), uiCss.indexOf('[data-vui-theme="high-contrast"]'));
    for (const size of ['sm', 'md', 'lg']) {
      for (const block of [web, desktop]) {
        expect(block).toMatch(new RegExp(`--vui-shadow-${size}: var\\(--vui-shadow-offset-${size}\\) color-mix\\(.*var\\(--vui-shadow-ink`));
      }
      expect(terminal).toContain(`--vui-shadow-${size}: none`);
    }
    expect(web).toContain('var(--vui-shadow-glow, transparent)');
    expect(desktop).toContain('var(--vui-shadow-ambient-sm)');
    expect(terminal).not.toContain('--vui-shadow-glow');
    expect(uiCss.slice(uiCss.indexOf('[data-vui-theme="high-contrast"]'))).toContain('--vui-shadow-lg: none');
  });

  it('matches Studio elevation overrides to the ui.css recipes', () => {
    const offsets = (css: string, name: string, size: string) =>
      css.match(new RegExp(`--vui-shadow-${name}-${size}: ([^;]+);`))![1];
    const start = (marker: string) => uiCss.slice(uiCss.indexOf(marker));
    const web = start(':root,');
    const desktop = start('[data-vui-ui="desktop"]');
    const strip = (value: string) => value.replace(/color-mix\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)/g, 'C');
    const nord = themeDocument('nord');
    for (const size of ['sm', 'md', 'lg'] as const) {
      const webVars = themeVariables(nord, { uiMode: 'web' });
      expect(strip(webVars[`--vui-shadow-${size}`])).toBe(`${offsets(web, 'offset', size)} C`);
      const deskVars = themeVariables(nord, { uiMode: 'desktop' });
      expect(strip(deskVars[`--vui-shadow-${size}`])).toBe(
        `${offsets(desktop, 'offset', size)} C, ${offsets(desktop, 'ambient', size)} C`,
      );
      expect(themeVariables(nord, { uiMode: 'terminal' })[`--vui-shadow-${size}`]).toBe('none');
    }
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
