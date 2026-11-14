import { describe, expect, it } from 'vitest';
import type { VIcon } from './icon';
import './icon';
import { iconNames, registerIcon } from '../../icons/registry';

describe('vui-icon', () => {
  it('renders a built-in icon and a registered svg', () => {
    expect(iconNames).toContain('folder');
    expect(iconNames).toEqual(expect.arrayContaining(['hash', 'network', 'shield', 'waypoints']));
    const icon = document.createElement('vui-icon');
    icon.setAttribute('name', 'folder');
    document.body.append(icon);
    expect(icon.shadowRoot?.querySelector('svg')).not.toBeNull();
    expect(icon.getAttribute('aria-hidden')).toBe('true');

    registerIcon('mark', '<svg viewBox="0 0 10 10"><rect width="10" height="10"></rect></svg>');
    icon.setAttribute('name', 'mark');
    icon.setAttribute('label', 'Mark');
    expect(icon.shadowRoot?.querySelector('rect')).not.toBeNull();
    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Mark');
  });

  it('keeps every documented gallery icon resolvable and ships essential glyphs', async () => {
    const { iconGroups } = await import('../../icons/registry');
    for (const group of iconGroups) for (const name of group.icons) expect(iconNames).toContain(name);
    expect(iconNames).toEqual(
      expect.arrayContaining(['chevron-up', 'external-link', 'filter', 'upload', 'user', 'calendar', 'lock', 'circle-x', 'more-vertical']),
    );
  });

  it('exposes a size scale and mode-driven stroke weight without hardcoded geometry', () => {
    const icon = document.createElement('vui-icon') as VIcon;
    icon.setAttribute('name', 'check');
    icon.size = 'large';
    document.body.append(icon);
    expect(icon.getAttribute('size')).toBe('large');
    const svg = icon.shadowRoot?.querySelector('svg');
    expect(svg?.getAttribute('focusable')).toBe('false');
    const css = [...(icon.shadowRoot?.adoptedStyleSheets ?? [])].map((sheet) => [...sheet.cssRules].map((rule) => rule.cssText).join('\n')).join('\n')
      || icon.shadowRoot?.querySelector('style')?.textContent || '';
    expect(css).toContain('--vui-icon-size-lg');
    expect(css).toContain('--vui-icon-stroke');
  });
});
