import { installVuiStyles } from './install';

export type VuiTheme = 'light' | 'dark' | 'high-contrast' | 'system';
export type VuiDensity = 'comfortable' | 'compact' | 'dense';

const themes = new Set<VuiTheme>(['light', 'dark', 'high-contrast', 'system']);
const densities = new Set<VuiDensity>(['comfortable', 'compact', 'dense']);

export function setTheme(theme: VuiTheme, root: HTMLElement = document.documentElement): void {
  root.setAttribute('data-vui-theme', theme);
}

export function setDensity(density: VuiDensity, root: HTMLElement = document.documentElement): void {
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
