import { describe, expect, it } from 'vitest';
import { builtInThemes, contrast, defaultThemes, exportThemeCSS, exportThemeJSON, importThemeJSON, resolveTheme, themeDocument, themeVariables, tokenNames, tones, toneSolidTokens, updateToken } from '../../src/theme';
import '../../src/components/actions/button';
import '../../src/components/actions/icon-button';
import '../../src/components/content/badge';
import '../../src/components/content/chip';
import '../../src/components/feedback/alert';

describe('semantic theme roles', () => {
  it('ships the VUI light/dark pair as the defaults', () => {
    expect(defaultThemes).toEqual({ dark: 'dark', light: 'light' });
    expect(resolveTheme(themeDocument('dark'))).toMatchObject({ background: '#0e1016', surface: '#151821', field: '#10131a', primary: '#8d95ff' });
    expect(resolveTheme(themeDocument('light'))).toMatchObject({ background: '#f5f6f8', surface: '#ffffff', field: '#ffffff', primary: '#4f56d9' });
  });
  it('checks text, soft tone text, solid text, control boundaries and focus separately', () => {
    for (const { id, tokens: t } of builtInThemes) {
      for (const tone of tones) {
        const vars = themeVariables(themeDocument(id));
        expect(contrast(t[`${tone}Text`], vars[`--vui-color-${tone}-surface-hover`]), `${id}/${tone}/soft hover`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(t[toneSolidTokens[tone]], vars[`--vui-color-${tone}-hover`]), `${id}/${tone}/solid hover`).toBeGreaterThanOrEqual(4.5);
        const solid = tone === 'danger' ? t.error : t[tone];
        expect(contrast(t[toneSolidTokens[tone]], solid), `${id}/${tone}/solid`).toBeGreaterThanOrEqual(4.5);
        for (const bg of [t[`${tone}Soft`], t.surface, t.background, t.card, t.popover, t.modal])
          expect(contrast(t[`${tone}Text`], bg), `${id}/${tone}/text`).toBeGreaterThanOrEqual(4.5);
        for (const bg of [t[`${tone}Soft`], t.surface, t.background, t.card])
          expect(contrast(t[`${tone}Border`], bg), `${id}/${tone}/outline`).toBeGreaterThanOrEqual(3);
      }
      expect(contrast(t.primary, t.field), id + '/checked control').toBeGreaterThanOrEqual(3);
      expect(contrast(t.controlBorder, t.field), id + '/field boundary').toBeGreaterThanOrEqual(3);
      for (const bg of [t.field, t.surface, t.card, t.selection])
        expect(contrast(t.focusRing, bg), id + '/focus').toBeGreaterThanOrEqual(3);
    }
  });
  it('round trips every editable role and preserves schema 1 partial documents', () => {
    for (const token of tokenNames) {
      const document = updateToken(themeDocument('dark'), token, '#123456');
      const restored = importThemeJSON(exportThemeJSON(document));
      expect(resolveTheme(restored)[token]).toBe('#123456');
      expect(exportThemeCSS(restored)).toContain('#123456');
    }
    const old = { ...themeDocument('dark'), tokens: { surface: '#123456', primary: '#abcdef' } };
    expect(resolveTheme(old).field).toBe('#123456');
    expect(contrast(resolveTheme(old).primaryForeground, '#abcdef')).toBeGreaterThanOrEqual(4.5);
    expect(themeVariables(old)['--vui-color-field']).toBe('#123456');
    const legacy = { ...themeDocument('dark'), tokens: { secondary: '#234567', border: '#345678' } };
    expect(resolveTheme(legacy)).toMatchObject({ surfaceHover: '#234567', controlBorder: '#345678' });
    expect(resolveTheme({ ...legacy, tokens: { ...legacy.tokens, surfaceHover: '#112233', controlBorder: '#abcdef' } })).toMatchObject({ surfaceHover: '#112233', controlBorder: '#abcdef' });
  });

  it('re-derives readable content for edited fills and keeps legacy neutral behaviour', () => {
    const draft = updateToken(themeDocument('light'), 'secondary', '#123456');
    const restored = resolveTheme(importThemeJSON(exportThemeJSON(draft)));
    expect(restored.secondary).toBe('#123456');
    expect(contrast(restored.secondaryForeground, restored.secondary)).toBeGreaterThanOrEqual(4.5);
    const legacy = resolveTheme(updateToken(themeDocument('dark'), 'foreground', '#123456'));
    expect(legacy.neutral).toBe('#123456');
  });
  it('reflects tone while preserving legacy variant attributes', () => {
    for (const name of ['button', 'icon-button', 'badge', 'chip', 'alert']) {
      const element = document.createElement(`vui-${name}`) as HTMLElement & { tone: string; variant: string };
      element.variant = 'danger';
      element.tone = 'accent';
      document.body.append(element);
      expect([...element.shadowRoot!.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('')).not.toContain('--vui-tone');
      expect(element.getAttribute('variant')).toBe('danger');
      expect(element.getAttribute('tone')).toBe('accent');
      element.tone = 'warning';
      expect(element.getAttribute('tone')).toBe('warning');
      element.remove();
    }
  });
});
