import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/categories/forms';
import { getDensity, getTheme, setDensity, setTheme } from '../../src/theme/index';

describe('forms', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    document.documentElement.removeAttribute('data-vui-theme');
    document.documentElement.removeAttribute('data-vui-density');
  });

  it('registers form controls without pulling dialog', () => {
    expect(customElements.get('vui-input')).toBeTypeOf('function');
    expect(customElements.get('vui-checkbox')).toBeTypeOf('function');
    expect(customElements.get('vui-switch')).toBeTypeOf('function');
    expect(customElements.get('vui-select')).toBeTypeOf('function');
    expect(customElements.get('vui-dialog')).toBeUndefined();
  });

  it('toggles checkbox and switch with the checked property', () => {
    const checkbox = document.createElement('vui-checkbox');
    checkbox.textContent = 'Agree';
    document.body.append(checkbox);
    const input = checkbox.shadowRoot?.querySelector('input');
    expect(input).toBeInstanceOf(HTMLInputElement);
    input?.click();
    expect(checkbox.hasAttribute('checked')).toBe(true);

    const toggle = document.createElement('vui-switch');
    document.body.append(toggle);
    (toggle as HTMLElement & { checked: boolean }).checked = true;
    expect(toggle.shadowRoot?.querySelector('input')?.checked).toBe(true);
    expect(toggle.getAttribute('role') === 'switch' || toggle.shadowRoot?.querySelector('input')?.getAttribute('role') === 'switch').toBe(true);
  });

  it('commits a select value from the keyboard', () => {
    const select = document.createElement('vui-select');
    select.innerHTML = `
      <vui-option value="ru">Русский</vui-option>
      <vui-option value="en">English</vui-option>
    `;
    document.body.append(select);
    const trigger = select.shadowRoot?.querySelector('button');
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(select.getAttribute('value')).toBe('en');
  });
});

describe('theme and density', () => {
  it('sets theme and density attributes', () => {
    setTheme('dark');
    setDensity('dense');
    expect(getTheme()).toBe('dark');
    expect(getDensity()).toBe('dense');
    expect(document.documentElement.getAttribute('data-vui-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-vui-density')).toBe('dense');

    const css = document.getElementById('vui-styles')?.textContent ?? '';
    expect(css).toContain('--vui-color-primary');
    expect(css).toContain('[data-vui-theme="high-contrast"]');
    expect(css).toContain('[data-vui-density="dense"]');
    expect(css).toContain('prefers-color-scheme: dark');
  });
});
