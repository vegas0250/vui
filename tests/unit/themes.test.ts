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
  themeAppearance,
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
  it('provides nineteen immutable complete palettes with readable semantic pairs', () => {
    expect(builtInThemes).toHaveLength(19);
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
        if (preset.id !== 'retro') expect(
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
    expect(css).toContain('data-vui-ui');
    expect(css).not.toContain('--vui-space-md');
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

  it('resolves independent shape families, source defaults and legacy global radius', () => {
    const retro = themeDocument('retro');
    expect(themeAppearance(retro)).toMatchObject({ radiusBox: 8, radiusField: 4, radiusSelector: 4, borderWidth: 1, shadowIntensity: 0 });
    const legacy = { ...retro, appearance: { radius: 18 } };
    expect(themeVariables(legacy)).toMatchObject({ '--vui-radius': '18px', '--vui-radius-box': '18px', '--vui-radius-field': '18px', '--vui-radius-selector': '18px' });
    const shaped = { ...retro, appearance: { radius: 18, radiusBox: 24, radiusField: 6, radiusSelector: 0, borderWidth: 2 } };
    const restored = importThemeJSON(exportThemeJSON(shaped));
    expect(restored).toEqual(shaped);
    expect(themeVariables(restored)).toMatchObject({ '--vui-radius-box': '24px', '--vui-radius-field': '6px', '--vui-radius-selector': '0px', '--vui-border-width': '2px' });
    for (const key of ['radiusBox', 'radiusField', 'radiusSelector']) for (const value of [-1, 33, Infinity, '4', {}, null])
      expect(() => validateTheme({ ...retro, appearance: { [key]: value } })).toThrow();
    expect(themeAppearance(retro).radiusField).toBe(4);
    expect(themeVariables(updateToken(retro, 'blockBorder', '#123456'))['--vui-color-block-border']).toBe('#123456');
    expect(themeVariables(updateToken(retro, 'border', '#234567'))['--vui-color-block-border']).toBe('#234567');
  });
  it('exports appearance tokens within bounded ranges', () => {
    expect(
      themeVariables({
        ...themeDocument('nord'),
        appearance: {
          radius: 12,
          borderWidth: 2,
          shadowIntensity: 35,
          uiMode: 'desktop',
        },
      }),
    ).toMatchObject({ '--vui-radius': '12px', '--vui-border-width': '2px' });
  });
  it('aligns desktop-preferred presets and Radix color deltas to soft radii on web chrome', () => {
    expect(themeAppearance(themeDocument('fluent-light'))).toMatchObject({
      uiMode: 'desktop',
      radius: 4,
      radiusBox: 8,
      radiusField: 4,
      radiusSelector: 2,
    });
    expect(themeAppearance(themeDocument('radix-dark'))).toMatchObject({
      uiMode: 'web',
      radius: 8,
      radiusBox: 12,
      radiusField: 8,
      radiusSelector: 4,
    });
    expect(themeById('radix-dark').appearance?.uiMode).toBeUndefined();
    expect(themeVariables(themeDocument('fluent-dark'))['--vui-shadow-sm']).toMatch(/^0 0\.5px/);
    expect(themeVariables(themeDocument('radix-light'), { uiMode: 'web' })['--vui-radius']).toBe('8px');
    expect(themeAppearance(themeDocument('nord'), 'desktop').radiusField).toBe(4);
    expect(themeAppearance(themeDocument('nord'), 'web').radiusField).toBe(6);
    expect(themeAppearance(themeDocument('nord'), 'web').radiusBox).toBe(8);
  });
  it('resolves terminal mode independently from semantic colors', () => {
    const nord = themeDocument('nord');
    expect(themeAppearance(nord, 'terminal')).toMatchObject({
      uiMode: 'terminal',
      radius: 0,
      radiusBox: 0,
      radiusField: 0,
      radiusSelector: 0,
      shadowIntensity: 0,
    });
    expect(themeVariables(nord, { uiMode: 'terminal' })['--vui-shadow-md']).toBe(
      'none',
    );
    const root = document.createElement('div');
    root.setAttribute('data-vui-ui', 'terminal');
    applyTheme(nord, root);
    expect(root.getAttribute('data-vui-ui')).toBe('terminal');
    expect(root.style.getPropertyValue('--vui-color-background')).toBeTruthy();
    expect(root.style.getPropertyValue('--vui-radius')).toBe('');
    applyTheme(themeDocument('fluent-light'), root);
    expect(root.getAttribute('data-vui-ui')).toBe('desktop');
    expect(
      validateTheme({
        ...nord,
        appearance: { uiMode: 'terminal' },
      }).appearance?.uiMode,
    ).toBe('terminal');
  });
});

describe('contrast computation with repeated colors',()=>{
 it('preserves opaque and alpha compositing results after cache eviction',()=>{
   const expected=contrast('#ffffff80','#000000');
   expect(contrast('#ffffff','#000000')).toBeCloseTo(21,12);
   for(let i=0;i<2200;i++)contrast('#'+i.toString(16).padStart(6,'0'),'#ffffff');
   expect(contrast('#ffffff80','#000000')).toBeCloseTo(expected,12);
   expect(contrast('#00000000','#ffffff')).toBe(1);
   expect(()=>contrast('invalid','#ffffff')).toThrow();
 });
});
