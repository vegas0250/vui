import { contrast, mix, readable } from './colors';
import { palettes } from './palettes';
export const tokenNames = [
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
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'accent',
  'accentForeground',
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
export interface ThemePreset {
  readonly id: string;
  readonly name: string;
  readonly mode: ThemeMode;
  readonly tokens: Readonly<ThemeTokens>;
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
];
export const builtInThemes: readonly ThemePreset[] = Object.freeze(
  definitions.map(([id, name, mode]) => {
    const p = palettes[id],
      dark = mode === 'dark';
    const primary = readable(p.primary, p.surface, 3),
      accent = readable(p.accent, p.surface, 3);
    const on = (color: string) =>
      contrast('#ffffff', color) > contrast('#000000', color)
        ? '#ffffff'
        : '#000000';
    const foreground = on(primary);
    const hoverEnd = foreground === '#ffffff' ? '#000000' : '#ffffff';
    const baseSurfaces = [p.background, p.surface, p.elevated];
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
    const tokens: ThemeTokens = {
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
      border: onSurfaces(mix(p.surface, p.foreground, 0.3), 3),
      borderHover: onSurfaces(p.muted, 3),
      primary,
      primaryHover: mix(primary, hoverEnd, 0.08),
      primaryActive: mix(primary, hoverEnd, 0.16),
      primaryForeground: on(primary),
      secondary: p.elevated,
      secondaryForeground: readable(p.foreground, p.elevated),
      accent,
      accentForeground: on(accent),
      ...states,
      focusRing: onSurfaces(primary, 3),
      selection,
      overlay: dark ? '#000000b3' : '#18182580',
      shadow: dark ? '#00000080' : '#4c4f6926',
    };
    return Object.freeze({ id, name, mode, tokens: Object.freeze(tokens) });
  }),
);
export const defaultThemes = Object.freeze({
  dark: 'tokyo-night',
  light: 'catppuccin-latte',
});
