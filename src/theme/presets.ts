import { contrast, mix, readable } from './colors';
import { palettes } from './palettes';
import { referenceRoles, referenceSoft } from './reference-roles';
export const tones = ['neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info'] as const;
export type VuiTone = (typeof tones)[number];
export type VuiVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export const toneSolidTokens = {
  neutral: 'neutralOnSolid', primary: 'primaryForeground', secondary: 'secondaryForeground', accent: 'accentForeground',
  success: 'successOnSolid', warning: 'warningOnSolid', danger: 'dangerOnSolid', info: 'infoOnSolid',
} as const;
export const tokenNames = [
  ...Object.values(toneSolidTokens),
  'field', 'surfaceHover', 'controlBorder', 'neutral', 'blockBorder',
  ...tones.flatMap((tone) => [`${tone}Soft`, `${tone}Text`, `${tone}Border`] as const),
  'background',
  'surface',
  'surfaceElevated',
  'card',
  'popover',
  'modal',
  'foreground',
  'textMuted',
  'textDisabled',
  'interactiveText',
  'border',
  'borderHover',
  'primary',
  'primaryHover',
  'primaryActive',
  'secondary',
  'accent',
  'success',
  'warning',
  'error',
  'info',
  'focusRing',
  'selection',
  'overlay',
  'shadow',
] as const;
export type ThemeToken = (typeof tokenNames)[number];
export type ThemeTokens = Record<ThemeToken, string>;
export type ThemeMode = 'light' | 'dark';
export interface ThemeAppearance {
  radius?: number;
  radiusBox?: number;
  radiusField?: number;
  radiusSelector?: number;
  borderWidth?: number;
  shadowIntensity?: number;
  /** Preferred structural scale. Color-only themes omit this and keep the host mode. */
  uiMode?: 'web' | 'desktop' | 'terminal';
  /** @deprecated Use uiMode. */
  density?: 'web' | 'desktop' | 'terminal' | 'comfortable' | 'compact' | 'dense';
}
export interface ThemePreset {
  readonly id: string;
  readonly name: string;
  readonly mode: ThemeMode;
  readonly tokens: Readonly<ThemeTokens>;
  readonly appearance?: Readonly<ThemeAppearance>;
}
/** VUI ships exactly two own themes. Ids equal the color scheme they implement. */
const definitions: Array<[string, string, ThemeMode]> = [
  ['light', 'VUI Light', 'light'],
  ['dark', 'VUI Dark', 'dark'],
];
/**
 * Theme ids removed in 2.0 (third-party adaptations, neon, high contrast). Stored preferences,
 * custom-theme base ids and setTheme() calls keep working: each maps to the VUI theme of its mode.
 */
export const legacyThemeAliases: Readonly<Record<string, ThemeMode>> = Object.freeze({
  midnight: 'dark', emerald: 'dark', 'minimal-light': 'light', 'tokyo-night': 'dark',
  'catppuccin-mocha': 'dark', dracula: 'dark', nord: 'dark', 'rose-pine': 'dark',
  'kanagawa-wave': 'dark', synthwave: 'dark', 'catppuccin-latte': 'light',
  'tokyo-night-day': 'light', 'rose-pine-dawn': 'light', 'modern-light': 'light',
  retro: 'light', 'fluent-light': 'light', 'fluent-dark': 'dark', 'radix-light': 'light',
  'radix-dark': 'dark', 'high-contrast': 'light', 'neon-green': 'dark',
  'neon-magenta': 'dark', 'neon-cyan': 'dark', 'vui-light': 'light', 'vui-dark': 'dark',
});
/** Canonical built-in id for a current or legacy theme id; other ids are returned unchanged. */
export function canonicalThemeId(id: string): string {
  return Object.prototype.hasOwnProperty.call(legacyThemeAliases, id) ? legacyThemeAliases[id] : id;
}
export const builtInThemes: readonly ThemePreset[] = Object.freeze(
  definitions.map(([id, name, mode]) => {
    const roles = referenceRoles[id];
    const p = { ...palettes[id], ...roles,
      elevated: roles?.surfaceElevated ?? palettes[id].elevated },
      dark = mode === 'dark';
    const primary = roles ? p.primary : readable(p.primary, p.surface, 3),
      accent = roles ? p.accent : readable(p.accent, p.surface, 3);
    // Text on solid fills: white, or a tinted near-black ink instead of pure #000.
    const ink = dark ? '#0e1016' : '#11131a';
    const on = (color: string) =>
      contrast('#ffffff', color) > contrast(ink, color)
        ? '#ffffff'
        : ink;
    const foreground = on(primary);
    const hoverEnd = foreground === '#ffffff' ? '#000000' : '#ffffff';
    const baseSurfaces = [p.background, p.surface, p.elevated, roles?.field ?? p.surface, roles?.surfaceHover ?? p.elevated, roles?.selection ?? p.surface];
    const onBase = (color: string, target = 4.5) =>
      baseSurfaces.reduce(
        (value, background) => readable(value, background, target),
        color,
      );
    const states = {
      success: onBase(p.success),
      warning: onBase(p.warning),
      error: onBase(p.error),
      info: onBase(p.info),
    };
    const selection = mix(primary, p.surface, 0.85);
    const surfaces = [
      ...baseSurfaces,
      selection,
      ...Object.values(states).map((color) => mix(p.surface, color, 0.08)),
    ];
    const onSurfaces = (color: string, target = 4.5) =>
      surfaces.reduce(
        (value, background) => readable(value, background, target),
        color,
      );
    const base = {
      background: p.background,
      surface: p.surface,
      surfaceElevated: p.elevated,
      card: p.surface,
      popover: p.elevated,
      modal: p.surface,
      foreground: onSurfaces(p.foreground),
      textMuted: onSurfaces(p.muted),
      interactiveText: onSurfaces(p.primary),
      textDisabled: mix(p.foreground, p.surface, 0.5),
      border: roles ? mix(p.surface, p.foreground, 0.2) : onSurfaces(mix(p.surface, p.foreground, 0.3), 3),
      borderHover: onSurfaces(p.muted, 3),
      primary,
      primaryHover: mix(primary, hoverEnd, 0.08),
      primaryActive: mix(primary, hoverEnd, 0.16),
      primaryForeground: on(primary),
      secondary: p.secondary ?? p.elevated,
      secondaryForeground: readable(p.secondaryForeground ?? p.foreground, p.secondary ?? p.elevated),
      accent,
      accentForeground: on(accent),
      ...states,
      focusRing: onSurfaces(primary, 3),
      selection,
      overlay: dark ? '#05060ab3' : '#10131c73',
      // Opaque ink: elevation strength comes from --vui-shadow-strength-* in the theme stylesheet.
      shadow: dark ? '#000000' : '#151a2e',
    };
    const resolved = { ...base, ...roles, neutral: base.foreground };
    const toneTokens = Object.fromEntries(tones.flatMap((tone) => {
      const color = tone === 'danger' ? resolved.error : resolved[tone];
      const soft = referenceSoft[id]?.[tone] ?? mix(resolved.surface, color, 0.08);
      return [
        [`${tone}Soft`, soft],
        [`${tone}Text`, readable(color, soft, 4.5)],
        [`${tone}Border`, readable(color, soft, 3)],
        [toneSolidTokens[tone], tone === 'secondary' ? base.secondaryForeground : on(color)],
      ];
    }));
    const tokens = { ...resolved, blockBorder: mix(resolved.card, resolved.foreground, 0.18), field: roles?.field ?? resolved.surface,
      surfaceHover: roles?.surfaceHover ?? resolved.secondary,
      controlBorder: readable(resolved.borderHover, roles?.field ?? resolved.surface, 3),
      ...toneTokens } as ThemeTokens;
    // Text must also work on selected rows, menus and the new soft surfaces.
    const actualSurfaces = [tokens.background, tokens.surface, tokens.surfaceElevated,
      tokens.card, tokens.field, tokens.popover, tokens.modal, tokens.selection,
      tokens.surfaceHover, tokens.secondary, ...tones.filter(tone => tone !== 'secondary').map(tone => tokens[`${tone}Soft`])];
    if (roles) for (const key of ['foreground', 'textMuted', 'interactiveText'] as const)
      tokens[key] = actualSurfaces.reduce((color, bg) => readable(color, bg), tokens[key]);
    if (roles) tokens.focusRing = actualSurfaces.reduce((color, bg) => readable(color, bg, 3), tokens.focusRing);
    for (const tone of tones) {
      tokens[`${tone}Border`] = [tokens.surface, tokens.background, tokens.card, tokens[`${tone}Soft`]].reduce((color, bg) => readable(color, bg, 3), tokens[`${tone}Border`]);
      tokens[`${tone}Text`] = [...actualSurfaces, tokens[`${tone}Soft`]].reduce((color, bg) => readable(color, bg), tokens[`${tone}Text`]);
    }
    tokens.controlBorder = [tokens.field, tokens.surface, tokens.card].reduce((color, bg) => readable(color, bg, 3), tokens.controlBorder);
    return Object.freeze({
      id,
      name,
      mode,
      tokens: Object.freeze(tokens),
    });
  }),
);
export const defaultThemes = Object.freeze({
  dark: 'dark',
  light: 'light',
});
