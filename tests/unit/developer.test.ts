import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../src/components/actions/button';
import '../../src/components/data/list';
import { defineElement } from '../../src/core/define';
import { setDensity, setTheme } from '../../src/theme/index';
import type { VButton } from '../../src/components/actions/button';
import type { VuiDensity, VuiTheme } from '../../src/theme/index';

describe('developer mistakes', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('warns and leaves the current theme and density when the name is unknown', () => {
    const root = document.createElement('div');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setTheme('dark', root);
    setTheme('nope' as VuiTheme, root);
    setDensity('large' as VuiDensity, root);
    expect(root.getAttribute('data-vui-theme')).toBe('dark');
    expect(root.hasAttribute('data-vui-density')).toBe(false);
    expect(warn.mock.calls.map((call) => String(call[0])).join('\n')).toContain('Unknown theme');
    expect(warn.mock.calls.map((call) => String(call[0])).join('\n')).toContain('Unknown density');
  });

  it('keeps an unknown enum value and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const button = document.createElement('vui-button') as VButton;
    document.body.append(button);
    button.variant = 'huge';
    button.variant = 'huge';
    expect(button.getAttribute('variant')).toBe('huge');
    const messages = warn.mock.calls.map((call) => String(call[0]));
    expect(messages.filter((message) => message.includes('variant="huge"'))).toHaveLength(1);
  });

  it('does not replace an already registered element with a different class', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    class OtherButton extends HTMLElement {}
    const current = customElements.get('vui-button');
    defineElement('vui-button', OtherButton);
    expect(customElements.get('vui-button')).toBe(current);
    expect(warn.mock.calls.map((call) => String(call[0])).join('\n')).toContain('already defined');
  });

  it('warns when a parent receives an element it does not own', async () => {
    await import('../../src/components/forms/select');
    await import('../../src/components/navigation/tabs');
    await import('../../src/components/overlay/menu');
    await import('../../src/components/navigation/nav');
    await import('../../src/components/desktop/file-tree');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const hosts = ['vui-select', 'vui-tabs', 'vui-menu', 'vui-list', 'vui-nav', 'vui-file-tree'];
    for (const name of hosts) {
      const host = document.createElement(name);
      host.append(document.createElement('div'));
      document.body.append(host);
    }
    const messages = warn.mock.calls.map((call) => String(call[0])).join('\n');
    for (const name of hosts) {
      expect(messages, name).toContain(`${name} ignores <div>`);
      expect(document.querySelector(name)?.querySelector('div')).toBeTruthy();
    }
  });
});
