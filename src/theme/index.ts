import { reportDeveloper } from '../core/dev';
import { installVuiStyles } from './install';

export type VuiTheme = 'light' | 'dark' | 'high-contrast' | 'system' | 'neon-green' | 'neon-magenta' | 'neon-cyan';
export type VuiDensity = 'comfortable' | 'compact' | 'dense';

const themes = new Set<VuiTheme>(['light', 'dark', 'high-contrast', 'system', 'neon-green', 'neon-magenta', 'neon-cyan']);
const densities = new Set<VuiDensity>(['comfortable', 'compact', 'dense']);

export function setTheme(theme: VuiTheme, root: HTMLElement = document.documentElement): void {
  if (!themes.has(theme)) {
    reportDeveloper(
      'theme',
      `Unknown theme "${String(theme)}". Expected light|dark|high-contrast|system|neon-green|neon-magenta|neon-cyan. The current theme stays.`,
    );
    return;
  }
  root.setAttribute('data-vui-theme', theme);
}

export function setDensity(density: VuiDensity, root: HTMLElement = document.documentElement): void {
  if (!densities.has(density)) {
    reportDeveloper(
      'density',
      `Unknown density "${String(density)}". Expected comfortable|compact|dense. The current density stays.`,
    );
    return;
  }
  root.setAttribute('data-vui-density', density);
}

export function getTheme(root: HTMLElement = document.documentElement): VuiTheme {
  const value = root.getAttribute('data-vui-theme');
  return value !== null && themes.has(value as VuiTheme) ? (value as VuiTheme) : 'light';
}

export function getDensity(root: HTMLElement = document.documentElement): VuiDensity {
  const value = root.getAttribute('data-vui-density');
  return value !== null && densities.has(value as VuiDensity) ? (value as VuiDensity) : 'comfortable';
}

installVuiStyles();
