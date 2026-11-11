import { afterEach, describe, expect, it, vi } from 'vitest';
import type { VuiTheme, VuiUIMode } from '../../src/theme/index';
import { setTheme, setUIMode } from '../../src/theme/index';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('developer warnings', () => {
  it('warns and leaves the current theme and UI mode when the name is unknown', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const root = document.createElement('div');
    setTheme('aurora' as VuiTheme, root);
    expect(root.hasAttribute('data-vui-theme')).toBe(false);
    setUIMode('tablet' as VuiUIMode, root);
    expect(root.hasAttribute('data-vui-ui')).toBe(false);
    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls.map((call) => String(call[0])).join('\n')).toContain('Unknown theme');
    expect(warn.mock.calls.map((call) => String(call[0])).join('\n')).toContain('Unknown UI mode');
  });
});
