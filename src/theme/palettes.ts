/**
 * VUI own base palettes (light + dark). Semantic derivation and AA adjustments live in presets.ts.
 *
 * Design notes (see docs/theme-semantics.md):
 * - Neutral, slightly cool grays with a clear surface ladder (Radix / Linear clarity).
 * - One indigo brand hue for actions and focus, one teal accent (no competing primaries).
 * - Dark is a deep blue-gray, never pure black; text is off-white to cut glare (Tokyo Night / Catppuccin comfort).
 * - Status colors are calm, desaturated and pass WCAG AA on every surface after derivation.
 */
export interface Palette {
  background: string;
  surface: string;
  elevated: string;
  foreground: string;
  muted: string;
  primary: string;
  secondary?: string;
  secondaryForeground?: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}
export const palettes: Readonly<Record<string, Readonly<Palette>>> = Object.freeze({
  light: Object.freeze({
    background: '#f5f6f8',
    surface: '#ffffff',
    elevated: '#ffffff',
    foreground: '#171a21',
    muted: '#596070',
    primary: '#4f56d9',
    secondary: '#eef0f4',
    secondaryForeground: '#171a21',
    accent: '#0e7f86',
    success: '#17804d',
    warning: '#9a5b00',
    error: '#cf2f45',
    info: '#1767c2',
  }),
  dark: Object.freeze({
    background: '#0e1016',
    surface: '#151821',
    elevated: '#1c202b',
    foreground: '#e7e9f0',
    muted: '#9ca3b4',
    primary: '#8d95ff',
    secondary: '#232835',
    secondaryForeground: '#e7e9f0',
    accent: '#5ccfc2',
    success: '#62d394',
    warning: '#f0c36d',
    error: '#ff7d8c',
    info: '#70b6ff',
  }),
});
