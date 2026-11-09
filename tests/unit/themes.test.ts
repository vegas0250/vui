import { mix } from '../../src/theme/colors';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyTheme,
  builtInThemes,
  contrast,
  defaultThemes,
  exportThemeCSS,
  exportThemeJSON,
  getTheme,
  getThemePreference,
  importThemeJSON,
  initializeTheme,
  normalizeColor,
  readCustomThemes,
  registerTheme,
  resolveTheme,
  saveThemePreference,
  setTheme,
  ThemeHistory,
  themeById,
  themeDocument,
  themeVariables,
  tokenNames,
  updateToken,
  validateTheme,
  writeCustomThemes,
} from '../../src/theme';
beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});
describe('palette-independent theme engine', () => {
  it('provides ten immutable complete palettes with readable semantic pairs', () => {
    expect(builtInThemes).toHaveLength(10);
    for (const preset of builtInThemes) {
      expect(Object.isFrozen(preset.tokens)).toBe(true);
      expect(Object.keys(preset.tokens).sort()).toEqual([...tokenNames].sort());
      const t = preset.tokens;
      const surfaces = [
        t.background,
        t.surface,
        t.surfaceElevated,
        t.card,
        t.popover,
        t.modal,
        t.secondary,
        t.selection,
        ...[t.success, t.warning, t.error, t.info].map((color) =>
          mix(t.surface, color, 0.08),
        ),
      ];
      for (const color of [t.foreground, t.textMuted, t.interactiveText])
        for (const background of surfaces)
          expect(
            contrast(color, background),
            preset.id + ' text on ' + background,
          ).toBeGreaterThanOrEqual(4.5);

      for (const [fg, bg] of [
        [t.foreground, t.background],
        [t.foreground, t.surface],
        [t.textMuted, t.surface],
        [t.primaryForeground, t.primary],
        [t.primaryForeground, t.primaryHover],
        [t.primaryForeground, t.primaryActive],
        [t.secondaryForeground, t.secondary],
        [t.accentForeground, t.accent],
      ])
        expect(
          contrast(fg, bg),
          preset.id + ' ' + fg + ' / ' + bg,
        ).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('applies every palette through the existing public API', () => {
    for (const preset of builtInThemes) {
      setTheme(preset.id);
      expect(getTheme()).toBe(preset.id);
      expect(
        document.documentElement.style.getPropertyValue(
          '--vui-color-background',
        ),
      ).toBe(preset.tokens.background);
    }
  });
  it('keeps legacy themes and clears all overrides when switching back', () => {
    applyTheme({ ...themeDocument('tokyo-night'), appearance: { radius: 24 } });
    setTheme('high-contrast');
    expect(getTheme()).toBe('high-contrast');
    expect(
      document.documentElement.style.getPropertyValue('--vui-radius'),
    ).toBe('');
  });
  it('updates preview variables without changing the documentation theme', () => {
    const preview = document.createElement('section');
    applyTheme('tokyo-night');
    const draft = updateToken(
      themeDocument('catppuccin-latte'),
      'primary',
      '#123456',
    );
    applyTheme(draft, preview);
    expect(preview.style.getPropertyValue('--vui-color-primary')).toBe(
      '#123456',
    );
    expect(getTheme()).toBe('tokyo-night');
    expect(themeById('catppuccin-latte').tokens.primary).toBe('#8839ef');
  });
  it('supports programmatic registration but refuses built-in mutation', () => {
    registerTheme(
      'test-personal',
      updateToken(themeDocument('tokyo-night'), 'primary', '#ffffff'),
    );
    applyTheme('test-personal');
    expect(getTheme()).toBe('test-personal');
    expect(() => registerTheme('tokyo-night', themeDocument('nord'))).toThrow();
    expect(() => registerTheme('light', themeDocument('nord'))).toThrow();
  });
  it('normalizes HEX, RGB and HSL with optional alpha', () => {
    expect(normalizeColor('#abc')).toBe('#aabbcc');
    expect(normalizeColor('rgb(50% 50% 50%)')).toBe('#808080');
    expect(normalizeColor('rgb(255 0 128 / 50%)')).toBe('#ff008080');
    expect(normalizeColor('hsl(120 100% 50%)')).toBe('#00ff00');
    expect(() => normalizeColor('url(https://example.com)')).toThrow();
    expect(contrast('#00000000', '#ffffff')).toBe(1);
    expect(contrast('#000000', '#ffffff')).toBe(21);
  });
  it('round trips JSON and emits only allowlisted CSS properties', () => {
    const draft = updateToken(
      themeDocument('dracula'),
      'foreground',
      'rgb(255,255,255)',
    );
    expect(importThemeJSON(exportThemeJSON(draft))).toEqual(draft);
    const css = exportThemeCSS(draft);
    expect(css).toContain('--vui-color-text: #ffffff;');
    expect(css).toContain('[data-vui-theme="custom"]');
    expect(css).not.toContain('undefined');
  });
  it('rejects hostile or unsupported imports', () => {
    const base = themeDocument('nord');
    for (const bad of [
      { ...base, schemaVersion: 99 },
      { ...base, tokens: { background: 'red;display:none' } },
      { ...base, tokens: { '--evil': '#ffffff' } },
      { ...base, mode: 'system' },
      { ...base, mode: ['light'] },
      { ...base, appearance: { density: ['dense'] } },
      { ...base, appearance: { radius: Infinity } },
      { ...base, appearance: { density: 'invalid' } },
      { ...base, tokens: [] },
      { ...base, script: 'evil' },
    ])
      expect(() => validateTheme(bad)).toThrow();
    expect(() => importThemeJSON('x'.repeat(65537))).toThrow();
  });
  it('persists, restores and ignores corrupted preferences', () => {
    saveThemePreference('dracula');
    expect(getThemePreference()).toBe('dracula');
    const draft = updateToken(themeDocument('nord'), 'primary', '#ffffff');
    saveThemePreference(draft);
    expect(getThemePreference()).toEqual(draft);
    localStorage.setItem('vui.theme.preference.v1', 'invalid json');
    expect(getThemePreference()).toBe(null);
  });
  it('uses system defaults until an explicit preference overrides them', () => {
    const media = {
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    } as unknown as MediaQueryList;
    const stop = initializeTheme(document.documentElement, localStorage, media);
    expect(getTheme()).toBe(defaultThemes.dark);
    stop();
    saveThemePreference('rose-pine-dawn');
    initializeTheme(document.documentElement, localStorage, media)();
    expect(getTheme()).toBe('rose-pine-dawn');
    localStorage.clear();
    initializeTheme(document.documentElement, localStorage, {
      ...media,
      matches: false,
    })();
    expect(getTheme()).toBe(defaultThemes.light);
  });
  it('saves independent custom themes and restores their base preset', () => {
    const base = themeDocument('nord'),
      custom = { ...updateToken(base, 'surface', '#123456'), name: 'My Nord' };
    writeCustomThemes([custom]);
    expect(readCustomThemes()).toEqual([custom]);
    expect(resolveTheme(base)).toEqual(themeById('nord').tokens);
    expect(resolveTheme(custom).surface).toBe('#123456');
  });
  it('undoes, redoes, branches and resets without aliasing snapshots', () => {
    const base = themeDocument('tokyo-night'),
      history = new ThemeHistory(base);
    history.commit(updateToken(base, 'primary', '#123456'));
    history.commit(updateToken(history.current, 'surface', '#abcdef'));
    expect(history.undo().tokens.surface).toBeUndefined();
    expect(history.redo().tokens.surface).toBe('#abcdef');
    history.undo();
    history.commit(updateToken(history.current, 'border', '#ffffff'));
    expect(history.canRedo).toBe(false);
    history.commit(base);
    expect(history.current.tokens).toEqual({});
  });
  it('exports appearance tokens within bounded ranges', () => {
    expect(
      themeVariables({
        ...themeDocument('nord'),
        appearance: {
          radius: 12,
          borderWidth: 2,
          shadowIntensity: 35,
          density: 'compact',
        },
      }),
    ).toMatchObject({ '--vui-radius': '12px', '--vui-border-width': '2px' });
  });
});
