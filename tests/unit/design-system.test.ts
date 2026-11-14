import { describe, expect, it } from 'vitest';
import tokensCss from '../../src/tokens/tokens.css?raw';
import uiCss from '../../src/tokens/ui.css?raw';

/** Body of the first rule whose selector list contains `selector`. */
function block(css: string, selector: string): string {
  const start = css.indexOf(selector);
  expect(start, selector).toBeGreaterThan(-1);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return css.slice(open + 1, close);
}

const modeScaleTokens = [
  '--vui-space-3xl',
  '--vui-font-size-xs',
  '--vui-line-height-sm',
  '--vui-line-height-heading',
  '--vui-tracking-heading',
  '--vui-font-weight-control',
  '--vui-icon-size-sm',
  '--vui-icon-size:',
  '--vui-icon-size-lg',
  '--vui-icon-size-xl',
  '--vui-icon-stroke',
  '--vui-icon-gap',
  '--vui-header-height',
  '--vui-field-gap',
  '--vui-dialog-padding',
  '--vui-popover-padding',
  '--vui-menu-padding',
  '--vui-menu-item-height',
];

describe('design system specification', () => {
  it('defines the complete structural scale in every UI mode', () => {
    for (const selector of ['[data-vui-ui="web"]', '[data-vui-ui="desktop"]', '[data-vui-ui="terminal"]']) {
      const body = block(uiCss, selector);
      for (const token of modeScaleTokens) expect(body, `${selector} ${token}`).toContain(token);
    }
  });

  it('keeps terminal compact, square and motionless', () => {
    const terminal = block(uiCss, '[data-vui-ui="terminal"]');
    expect(terminal).toContain('--vui-radius: 0px');
    expect(terminal).toContain('--vui-shadow-md: none');
    expect(terminal).toContain('--vui-duration: 0ms');
    expect(terminal).toContain('--vui-font-sans: var(--vui-font-mono)');
  });

  it('publishes mode-independent breakpoints, containers and touch minimums', () => {
    for (const token of ['--vui-breakpoint-sm', '--vui-breakpoint-md', '--vui-breakpoint-lg', '--vui-breakpoint-xl', '--vui-container-md', '--vui-size-touch', '--vui-font-weight-medium', '--vui-tracking-caps']) {
      expect(tokensCss).toContain(`${token}:`);
    }
  });

  it('resolves semantic gap aliases per mode scope and grows targets for coarse pointers', () => {
    const aliases = block(uiCss, '[data-vui-ui] {');
    expect(aliases).toContain('--vui-gap-related');
    expect(aliases).toContain('--vui-gap-section');
    const coarse = uiCss.slice(uiCss.indexOf('@media (pointer: coarse)'));
    expect(coarse).toContain(':root:not([data-vui-ui="terminal"])');
    expect(coarse).toContain('--vui-size-control: 40px');
  });

  it('keeps disabled opacity on the shared token in component sources', async () => {
    const sources = import.meta.glob('../../src/components/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    for (const [path, source] of Object.entries(sources)) {
      if (path.endsWith('.test.ts') || path.endsWith('.react.ts')) continue;
      expect(source, path).not.toMatch(/\[disabled\][^{]*\{[^}]*opacity:\s*0\.\d/);
    }
  });
});
