import { reportDeveloper } from '../utils/dev';
import { installVuiStyles } from './install';
import { applyTheme, clearTheme, listThemes } from './engine';
import { canonicalThemeId } from './presets';
export * from './engine';
export * from './presets';
export { normalizeColor, contrast, colorFormats } from './colors';

/** VUI ships two themes (light, dark); system follows the OS. Registered custom ids are allowed. */
export type VuiTheme = 'light' | 'dark' | 'system' | (string & {});
/** Structural interface scale: web or desktop. */
export type VuiUIMode = 'web' | 'desktop';
/** @deprecated Use VuiUIMode. */
export type VuiDensity = VuiUIMode;

const themes = new Set<VuiTheme>(['light', 'dark', 'system']);
const uiModes = new Set<VuiUIMode>(['web', 'desktop']);

export function setTheme(
  theme: VuiTheme,
  root: HTMLElement = document.documentElement,
): void {
  const id = listThemes().some((item) => item.id === theme) ? theme : canonicalThemeId(theme);
  if (id !== 'system' && listThemes().some((item) => item.id === id)) {
    applyTheme(id, root);
    return;
  }
  if (!themes.has(id)) {
    reportDeveloper(
      'theme',
      `Unknown theme "${String(theme)}". Expected light|dark|system or a registered theme id. The current theme stays.`,
    );
    return;
  }
  clearTheme(root);
  root.setAttribute('data-vui-theme', id);
}

export function setUIMode(
  mode: VuiUIMode,
  root: HTMLElement = document.documentElement,
): void {
  if (!uiModes.has(mode)) {
    reportDeveloper(
      'ui',
      `Unknown UI mode "${String(mode)}". Expected web|desktop. The current UI mode stays.`,
    );
    return;
  }
  root.setAttribute('data-vui-ui', mode);
  root.removeAttribute('data-vui-density');
  // Drop inline elevation so ui.css mode recipes apply.
  for (const key of ['--vui-shadow-sm', '--vui-shadow-md', '--vui-shadow-lg']) {
    root.style.removeProperty(key);
  }
  root.dispatchEvent(
    new CustomEvent('vui-ui-change', { bubbles: true, detail: { uiMode: mode } }),
  );
}

/** @deprecated Use setUIMode. */
export function setDensity(
  density: VuiUIMode | 'comfortable' | 'compact' | 'dense',
  root: HTMLElement = document.documentElement,
): void {
  setUIMode(normalizeUIMode(density), root);
}

export function getTheme(
  root: HTMLElement = document.documentElement,
): VuiTheme {
  const value = root.getAttribute('data-vui-theme');
  return value !== null &&
    (themes.has(value as VuiTheme) || listThemes().some((t) => t.id === value))
    ? (value as VuiTheme)
    : 'light';
}

export function getUIMode(
  root: HTMLElement = document.documentElement,
): VuiUIMode {
  const value = root.getAttribute('data-vui-ui');
  if (value !== null && uiModes.has(value as VuiUIMode)) return value as VuiUIMode;
  const legacy = root.getAttribute('data-vui-density');
  if (legacy === 'web' || legacy === 'desktop') return legacy;
  if (legacy === 'comfortable') return 'web';
  if (legacy === 'compact' || legacy === 'dense') return 'desktop';
  return 'web';
}

/** @deprecated Use getUIMode. */
export function getDensity(
  root: HTMLElement = document.documentElement,
): VuiUIMode {
  return getUIMode(root);
}

export function normalizeUIMode(
  value: string | null | undefined,
): VuiUIMode {
  if (value === 'desktop' || value === 'compact' || value === 'dense') return 'desktop';
  return 'web';
}

installVuiStyles();
