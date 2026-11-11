import { normalizeColor, readable, contrast, mix } from './colors';
import { builtInThemes, defaultThemes, tokenNames, tones, toneSolidTokens } from './presets';
import type {
  ThemeMode,
  ThemePreset,
  ThemeToken,
  ThemeTokens,
} from './presets';
export interface ThemeDocument {
  schemaVersion: 1;
  name: string;
  baseTheme: string;
  mode: ThemeMode;
  tokens: Partial<ThemeTokens>;
  appearance?: {
    radius?: number;
    borderWidth?: number;
    shadowIntensity?: number;
    density?: 'comfortable' | 'compact' | 'dense';
  };
}
const registeredDocuments = new Map<string, ThemeDocument>();
const registry = new Map<string, ThemePreset>(
  builtInThemes.map((theme) => [theme.id, theme]),
);
export const themeStorageKey = 'vui.theme.preference.v1';
const customStorageKey = 'vui.theme.custom.v1';
export const tokenProperties: Record<ThemeToken, string> = {
  field: 'field', surfaceHover: 'surface-hover', controlBorder: 'control-border',
  ...Object.fromEntries(tones.flatMap(tone => [
    [`${tone}Soft`, `${tone}-surface`], [`${tone}Text`, `${tone}-text`],
    [`${tone}Border`, `${tone}-border`],
  ])) as Record<`${typeof tones[number]}${'Soft' | 'Text' | 'Border'}`, string>,
  neutral: 'neutral',
  neutralOnSolid: 'on-neutral-solid',
  successOnSolid: 'on-success-solid',
  warningOnSolid: 'on-warning-solid',
  dangerOnSolid: 'on-danger-solid',
  infoOnSolid: 'on-info-solid',
  background: 'background',
  surface: 'surface',
  surfaceElevated: 'surface-raised',
  card: 'card',
  popover: 'popover',
  modal: 'modal',
  foreground: 'text',
  textMuted: 'text-muted',
  textDisabled: 'text-disabled',
  interactiveText: 'interactive-text',
  border: 'border',
  borderHover: 'border-strong',
  primary: 'primary',
  primaryHover: 'primary-hover',
  primaryActive: 'primary-active',
  primaryForeground: 'on-primary',
  secondary: 'secondary',
  secondaryForeground: 'on-secondary',
  accent: 'accent',
  accentForeground: 'on-accent',
  success: 'success',
  warning: 'warning',
  error: 'danger',
  info: 'info',
  focusRing: 'focus',
  selection: 'selected',
  overlay: 'backdrop',
  shadow: 'shadow',
};
export function listThemes(): readonly ThemePreset[] {
  return [...registry.values()];
}
export function themeById(id: string): ThemePreset {
  const theme = registry.get(id);
  if (!theme) throw new Error('Unknown theme');
  return theme;
}
export function validateTheme(input: unknown): ThemeDocument {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Invalid theme document');
  const v = input as Record<string, unknown>;
  if (
    Object.keys(v).some(
      (k) =>
        ![
          'schemaVersion',
          'name',
          'baseTheme',
          'mode',
          'tokens',
          'appearance',
        ].includes(k),
    ) ||
    v.schemaVersion !== 1 ||
    typeof v.name !== 'string' ||
    !v.name.trim() ||
    v.name.length > 80 ||
    typeof v.baseTheme !== 'string' ||
    !builtInThemes.some((t) => t.id === v.baseTheme) ||
    typeof v.mode !== 'string' ||
    !['light', 'dark'].includes(v.mode) ||
    !v.tokens ||
    typeof v.tokens !== 'object' ||
    Array.isArray(v.tokens)
  )
    throw new Error('Invalid theme document');
  const tokens: Partial<ThemeTokens> = {};
  for (const [key, value] of Object.entries(v.tokens)) {
    if (!tokenNames.includes(key as ThemeToken) || typeof value !== 'string')
      throw new Error('Invalid theme token');
    tokens[key as ThemeToken] = normalizeColor(value);
  }
  const result: ThemeDocument = {
    schemaVersion: 1,
    name: v.name.trim(),
    baseTheme: v.baseTheme,
    mode: v.mode as ThemeMode,
    tokens,
  };
  if (v.appearance !== undefined) {
    if (
      !v.appearance ||
      typeof v.appearance !== 'object' ||
      Array.isArray(v.appearance)
    )
      throw new Error('Invalid appearance');
    const a = v.appearance as Record<string, unknown>;
    for (const [key, value] of Object.entries(a)) {
      if (key === 'density') {
        if (
          typeof value !== 'string' ||
          !['comfortable', 'compact', 'dense'].includes(value)
        )
          throw new Error('Invalid density');
      } else if (
        !['radius', 'borderWidth', 'shadowIntensity'].includes(key) ||
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value < 0 ||
        value > (key === 'radius' ? 32 : key === 'borderWidth' ? 4 : 100)
      )
        throw new Error('Invalid appearance');
    }
    result.appearance = { ...a } as ThemeDocument['appearance'];
  }
  return result;
}
export function resolveTheme(document: ThemeDocument): ThemeTokens {
  const valid = validateTheme(document);
  const tokens = { ...themeById(valid.baseTheme).tokens, ...valid.tokens };
  // Schema 1 documents can override old colors without supplying the new roles.
  // Explicit new tokens always win, including intentionally low-contrast drafts.
  for (const tone of tones) {
    const source = tone === 'danger' ? 'error' : tone;
    // Old documents used foreground as the neutral solid color.
    if (tone === 'neutral' && valid.tokens.foreground && !valid.tokens.neutral) tokens.neutral = tokens.foreground;
    const color = tokens[source];
    if (valid.tokens[source] || (tone === 'neutral' && valid.tokens.foreground) || valid.tokens.surface) {
      if (!valid.tokens[`${tone}Soft`]) tokens[`${tone}Soft`] = mix(tokens.surface, color, 0.08);
    }
    if (valid.tokens[source] || (tone === 'neutral' && valid.tokens.foreground) || valid.tokens.surface || valid.tokens[`${tone}Soft`]) {
      if (!valid.tokens[`${tone}Text`]) tokens[`${tone}Text`] = [tokens[`${tone}Soft`], tokens.surface, tokens.background, tokens.card].reduce((fg, bg) => readable(fg, bg), color);
      if (!valid.tokens[`${tone}Border`]) tokens[`${tone}Border`] = readable(color, tokens[`${tone}Soft`], 3);
      if (tone !== 'primary' && tone !== 'accent' && !valid.tokens[toneSolidTokens[tone]]) tokens[toneSolidTokens[tone]] = contrast('#ffffff', color) > contrast('#000000', color) ? '#ffffff' : '#000000';
    }
  }
  if (valid.tokens.surface && !valid.tokens.field) tokens.field = tokens.surface;
  if (valid.tokens.secondary && !valid.tokens.surfaceHover) tokens.surfaceHover = tokens.secondary;
  if (valid.tokens.border && !valid.tokens.controlBorder) tokens.controlBorder = tokens.border;
  if ((valid.tokens.field || valid.tokens.surface || valid.tokens.borderHover) && !valid.tokens.controlBorder && !valid.tokens.border)
    tokens.controlBorder = readable(tokens.borderHover, tokens.field, 3);
  return tokens;
}
export function themeDocument(id: string): ThemeDocument {
  const preset = themeById(id);
  if (!builtInThemes.some((t) => t.id === id))
    throw new Error('Use a built-in base theme');
  return {
    schemaVersion: 1,
    name: preset.name,
    baseTheme: preset.id,
    mode: preset.mode,
    tokens: {},
  };
}
export function registerTheme(id: string, input: ThemeDocument): void {
  if (
    !/^[a-z][a-z0-9-]{0,79}$/.test(id) ||
    builtInThemes.some((t) => t.id === id) ||
    [
      'light',
      'dark',
      'system',
      'high-contrast',
      'neon-green',
      'neon-magenta',
      'neon-cyan',
    ].includes(id)
  )
    throw new Error('Reserved or invalid theme identifier');
  const document = validateTheme(input);
  registeredDocuments.set(id, structuredClone(document));
  registry.set(
    id,
    Object.freeze({
      id,
      name: document.name,
      mode: document.mode,
      tokens: Object.freeze(resolveTheme(document)),
    }),
  );
}
export function themeVariables(input: ThemeDocument): Record<string, string> {
  const d = validateTheme(input),
    t = resolveTheme(d),
    vars: Record<string, string> = {};
  for (const key of tokenNames)
    vars[`--vui-color-${tokenProperties[key]}`] = t[key];
  Object.assign(vars, {
    '--vui-color-surface-sunken': t.background,
    '--vui-color-danger-hover': t.error,
    '--vui-color-on-danger': t.dangerOnSolid,
    '--vui-color-tooltip-bg': t.foreground,
    '--vui-color-tooltip-text': t.background,
    '--vui-color-tooltip-border': t.border,
    '--vui-focus-ring': '2px solid var(--vui-color-focus)',
    '--vui-focus-shadow':
      '0 0 0 3px color-mix(in srgb, var(--vui-color-focus) 28%, transparent)',
  });
  const strength = d.appearance?.shadowIntensity ?? 100;
  for (const [size, offset] of Object.entries({
    sm: '0 1px 3px',
    md: '0 8px 24px',
    lg: '0 18px 48px',
  }))
    vars[`--vui-shadow-${size}`] =
      `${offset} color-mix(in srgb, ${t.shadow} ${strength}%, transparent)`;
  vars['--vui-radius'] = `${d.appearance?.radius ?? 8}px`;
  vars['--vui-border-width'] = `${d.appearance?.borderWidth ?? 1}px`;
  return vars;
}
const applications = new WeakMap<HTMLElement, string[]>();
export function clearTheme(root: HTMLElement): void {
  for (const key of applications.get(root) ?? [])
    root.style.removeProperty(key);
  applications.delete(root);
  root.style.removeProperty('color-scheme');
  root.removeAttribute('data-vui-mode');
}
export function applyTheme(
  input: string | ThemeDocument,
  root: HTMLElement = document.documentElement,
): void {
  let d: ThemeDocument;
  if (typeof input === 'string') {
    const preset = themeById(input);
    d = builtInThemes.some((t) => t.id === input)
      ? themeDocument(input)
      : (registeredDocuments.get(input) ?? {
          schemaVersion: 1,
          name: preset.name,
          baseTheme: defaultThemes[preset.mode],
          mode: preset.mode,
          tokens: { ...preset.tokens },
        });
  } else d = validateTheme(input);
  const vars = themeVariables(d);
  for (const key of applications.get(root) ?? [])
    if (!(key in vars)) root.style.removeProperty(key);
  for (const [key, value] of Object.entries(vars))
    if (root.style.getPropertyValue(key) !== value)
      root.style.setProperty(key, value);
  applications.set(root, Object.keys(vars));
  root.style.colorScheme = d.mode;
  root.setAttribute(
    'data-vui-theme',
    typeof input === 'string' ? input : d.baseTheme,
  );
  root.setAttribute('data-vui-mode', d.mode);
  if (d.appearance?.density)
    root.setAttribute('data-vui-density', d.appearance.density);
  root.dispatchEvent(
    new CustomEvent('vui-theme-change', {
      detail: {
        theme: typeof input === 'string' ? input : d.baseTheme,
        mode: d.mode,
      },
      bubbles: true,
    }),
  );
}
export function exportThemeJSON(input: ThemeDocument): string {
  return JSON.stringify(validateTheme(input), null, 2);
}
export function importThemeJSON(json: string): ThemeDocument {
  if (json.length > 65536) throw new Error('Theme file too large');
  return validateTheme(JSON.parse(json));
}
export function exportThemeCSS(input: ThemeDocument): string {
  const d = validateTheme(input);
  return `/* VUI adaptation: ${d.baseTheme}; schema 1. See VUI THIRD_PARTY_NOTICES.md. */\n[data-vui-theme="custom"] {\n  color-scheme: ${d.mode};\n${Object.entries(
    themeVariables(d),
  )
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')}\n}\n`;
}
export function saveThemePreference(
  input: string | ThemeDocument,
  storage: Storage = localStorage,
): void {
  if (typeof input === 'string') themeById(input);
  else validateTheme(input);
  storage.setItem(themeStorageKey, JSON.stringify(input));
}
export function getThemePreference(
  storage: Storage = localStorage,
): string | ThemeDocument | null {
  try {
    const value = storage.getItem(themeStorageKey);
    if (!value) return null;
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string') {
      themeById(parsed);
      return parsed;
    }
    return validateTheme(parsed);
  } catch {
    return null;
  }
}
export function initializeTheme(
  root: HTMLElement = document.documentElement,
  storage: Storage = localStorage,
  media: MediaQueryList = matchMedia('(prefers-color-scheme: dark)'),
): () => void {
  const update = () =>
    applyTheme(
      getThemePreference(storage) ??
        defaultThemes[media.matches ? 'dark' : 'light'],
      root,
    );
  update();
  const changed = () => {
    if (!getThemePreference(storage)) update();
  };
  media.addEventListener('change', changed);
  return () => media.removeEventListener('change', changed);
}
export function readCustomThemes(
  storage: Storage = localStorage,
): ThemeDocument[] {
  try {
    const raw = storage.getItem(customStorageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 50) return [];
    return parsed.map(validateTheme);
  } catch {
    return [];
  }
}
export function writeCustomThemes(
  themes: ThemeDocument[],
  storage: Storage = localStorage,
): void {
  if (themes.length > 50) throw new Error('Too many custom themes');
  storage.setItem(customStorageKey, JSON.stringify(themes.map(validateTheme)));
}
export function updateToken(
  input: ThemeDocument,
  key: ThemeToken,
  color: string,
): ThemeDocument {
  if (!tokenNames.includes(key)) throw new Error('Invalid token');
  const d = validateTheme(input);
  return { ...d, tokens: { ...d.tokens, [key]: normalizeColor(color) } };
}
export class ThemeHistory {
  private undoStack: ThemeDocument[] = [];
  private redoStack: ThemeDocument[] = [];
  constructor(public current: ThemeDocument) {
    this.current = validateTheme(current);
  }
  commit(next: ThemeDocument): void {
    const valid = validateTheme(next);
    if (JSON.stringify(valid) === JSON.stringify(this.current)) return;
    this.undoStack.push(structuredClone(this.current));
    if (this.undoStack.length > 100) this.undoStack.shift();
    this.current = valid;
    this.redoStack = [];
  }
  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  undo(): ThemeDocument {
    if (this.canUndo) {
      this.redoStack.push(structuredClone(this.current));
      this.current = this.undoStack.pop()!;
    }
    return this.current;
  }
  redo(): ThemeDocument {
    if (this.canRedo) {
      this.undoStack.push(structuredClone(this.current));
      this.current = this.redoStack.pop()!;
    }
    return this.current;
  }
}
