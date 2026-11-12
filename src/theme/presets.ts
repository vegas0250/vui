import { contrast, mix, readable } from './colors';
import { palettes } from './palettes';
import { retroColors } from './retro';
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
const definitions: Array<[string, string, ThemeMode]> = [
  ['midnight', 'Midnight', 'dark'],
  ['emerald', 'Emerald', 'dark'],
  ['minimal-light', 'Minimal Light', 'light'],
  ['tokyo-night', 'Tokyo Night', 'dark'],
  ['catppuccin-mocha', 'Catppuccin Mocha', 'dark'],
  ['dracula', 'Dracula', 'dark'],
  ['nord', 'Nord', 'dark'],
  ['rose-pine', 'Rosé Pine', 'dark'],
  ['kanagawa-wave', 'Kanagawa Wave', 'dark'],
  ['synthwave', 'SynthWave', 'dark'],
  ['catppuccin-latte', 'Catppuccin Latte', 'light'],
  ['tokyo-night-day', 'Tokyo Night Day', 'light'],
  ['rose-pine-dawn', 'Rosé Pine Dawn', 'light'],
  ['modern-light', 'Modern Light', 'light'],
  ['retro', 'Retro', 'light'],
  ['fluent-light', 'Desktop Light', 'light'],
  ['fluent-dark', 'Desktop Dark', 'dark'],
  ['radix-light', 'Radix Light', 'light'],
  ['radix-dark', 'Radix Dark', 'dark'],
];
/* Structural presets prefer a UI mode; radii/shadows come from ui.css unless a delta is intentional. */
const structuralAppearance: Record<string, Readonly<ThemeAppearance>> = {
  retro: Object.freeze({
    radiusBox: 8,
    radiusField: 4,
    radiusSelector: 4,
    borderWidth: 1,
    shadowIntensity: 0,
  }),
  /* Legacy ids fluent-light / fluent-dark keep preferred desktop chrome. */
  'fluent-light': Object.freeze({ uiMode: 'desktop' }),
  'fluent-dark': Object.freeze({ uiMode: 'desktop', shadowIntensity: 120 }),
  /* Radix color packs keep soft radii as appearance deltas on the current UI mode. */
  'radix-light': Object.freeze({
    radius: 8,
    radiusBox: 12,
    radiusField: 8,
    radiusSelector: 4,
  }),
  'radix-dark': Object.freeze({
    radius: 8,
    radiusBox: 12,
    radiusField: 8,
    radiusSelector: 4,
    shadowIntensity: 90,
  }),
};
export const builtInThemes: readonly ThemePreset[] = Object.freeze(
  definitions.map(([id, name, mode]) => {
    const roles = referenceRoles[id];
    const p = { ...palettes[id], ...roles,
      elevated: roles?.surfaceElevated ?? palettes[id].elevated },
      dark = mode === 'dark';
    const source = id === 'retro' ? retroColors : undefined;
    const primary = source?.primary ?? (roles ? p.primary : readable(p.primary, p.surface, 3)),
      accent = source?.accent ?? (roles ? p.accent : readable(p.accent, p.surface, 3));
    const on = (color: string) =>
      contrast('#ffffff', color) > contrast('#000000', color)
        ? '#ffffff'
        : '#000000';
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
      overlay: dark ? '#000000b3' : '#18182580',
      shadow: dark ? '#00000080' : '#4c4f6926',
    };
    const resolved = { ...base, ...roles, neutral: base.foreground, ...source };
    const toneTokens = Object.fromEntries(tones.flatMap((tone) => {
      const color = tone === 'danger' ? resolved.error : resolved[tone];
      const soft = referenceSoft[id]?.[tone] ?? mix(resolved.surface, color, 0.08);
      return [
        [`${tone}Soft`, soft],
        [`${tone}Text`, readable(color, soft, 4.5)],
        [`${tone}Border`, readable(color, soft, 3)],
        [toneSolidTokens[tone], source?.[toneSolidTokens[tone]] ?? (tone === 'secondary' ? base.secondaryForeground : on(color))],
      ];
    }));
    const tokens = { ...resolved, blockBorder: mix(resolved.card, resolved.foreground, 0.18), field: roles?.field ?? source?.field ?? resolved.surface,
      surfaceHover: roles?.surfaceHover ?? source?.surfaceHover ?? resolved.secondary,
      controlBorder: readable(resolved.borderHover, roles?.field ?? source?.field ?? resolved.surface, 3),
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
      ...(structuralAppearance[id] ? { appearance: structuralAppearance[id] } : {}),
    });
  }),
);
export const defaultThemes = Object.freeze({
  dark: 'catppuccin-mocha',
  light: 'catppuccin-latte',
});
