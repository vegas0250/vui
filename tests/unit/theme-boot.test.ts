import { beforeEach, expect, it } from 'vitest';
import { themeBootScript } from '../../src/showcase/boot';
beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});
it('applies the persisted custom mode and canvas before the documentation module loads', () => {
  localStorage.setItem(
    'vui.theme.preference.v1',
    JSON.stringify({
      schemaVersion: 1,
      name: 'Light custom',
      baseTheme: 'tokyo-night',
      mode: 'light',
      tokens: { background: '#ffffff', foreground: '#111111' },
    }),
  );
  new Function(themeBootScript())();
  expect(document.documentElement.dataset.vuiMode).toBe('light');
  expect(document.documentElement.style.colorScheme).toBe('light');
  expect(
    document.documentElement.style.getPropertyValue('--vui-color-background'),
  ).toBe('#ffffff');
});
it('does not inject CSS expressions from persisted token values', () => {
  localStorage.setItem(
    'vui.theme.preference.v1',
    JSON.stringify({
      schemaVersion: 1,
      name: 'Corrupt',
      baseTheme: 'tokyo-night',
      mode: 'dark',
      tokens: { background: 'url(https://evil.invalid)' },
    }),
  );
  new Function(themeBootScript())();
  expect(
    document.documentElement.style.getPropertyValue('--vui-color-background'),
  ).toBe('#16161e');
  expect(document.documentElement.style.cssText).not.toContain('evil.invalid');
});
