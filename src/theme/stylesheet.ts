import { themeDocument, themeExportVariables } from './engine';
import type { ThemeMode } from './presets';

/** Elevation strength per scheme; ui.css owns shadow geometry, the theme owns ink + strength. */
const shadowStrength: Record<ThemeMode, [string, string, string]> = {
  light: ['6%', '10%', '16%'],
  dark: ['35%', '36%', '46%'],
};

function declarations(mode: ThemeMode, indent: string): string {
  const vars: Record<string, string> = {
    ...themeExportVariables(themeDocument(mode)),
    '--vui-shadow-strength-sm': shadowStrength[mode][0],
    '--vui-shadow-strength-md': shadowStrength[mode][1],
    '--vui-shadow-strength-lg': shadowStrength[mode][2],
    '--vui-border-width': '1px',
  };
  return [`color-scheme: ${mode};`, ...Object.entries(vars).map(([k, v]) => `${k}: ${v};`)]
    .map((line) => `${indent}${line}`)
    .join('\n');
}

const header = (what: string) =>
  `/*\n  ${what}\n  GENERATED from src/theme/palettes.ts by src/theme/stylesheet.ts — do not edit by hand.\n  Regenerate: VUI_WRITE_THEME_CSS=1 pnpm vitest run tests/unit/theme-css.test.ts\n*/\n`;

/** Standalone stylesheets for the two VUI themes and the OS-following `system` theme. */
export function builtInThemeStylesheets(): Record<'light' | 'dark' | 'system', string> {
  return {
    light: `${header('VUI Light. Also the :root default when no data-vui-theme is set.')}:root,\n[data-vui-theme="light"] {\n${declarations('light', '  ')}\n}\n`,
    dark: `${header('VUI Dark.')}[data-vui-theme="dark"] {\n${declarations('dark', '  ')}\n}\n`,
    system: `${header('System: VUI Light or VUI Dark following prefers-color-scheme. Complete on its own.')}@media (prefers-color-scheme: light) {\n  [data-vui-theme="system"] {\n${declarations('light', '    ')}\n  }\n}\n\n@media (prefers-color-scheme: dark) {\n  [data-vui-theme="system"] {\n${declarations('dark', '    ')}\n  }\n}\n`,
  };
}
