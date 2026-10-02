import { installVuiStyles } from '../theme/install';
import { prefersForcedColors, prefersReducedMotion } from './accessibility';
import { getDensity } from './density';
import { readLayers } from './layers';
import { readMotion } from './motion';
import { inlineThreshold } from './responsive';
import { getTheme } from './theme';
import { componentTokens, primitiveTokens, readToken, semanticTokens } from './tokens';
import type { VuiDensity } from './density';
import type { LayerName } from './layers';
import type { VuiTheme } from './theme';

export interface FoundationSnapshot {
  theme: VuiTheme;
  density: VuiDensity;
  reducedMotion: boolean;
  forcedColors: boolean;
  motion: { duration: string; easing: string };
  layers: Record<LayerName, string>;
  thresholds: { narrow: number; medium: number; field: number; overlay: number };
  tokens: Record<string, string>;
}

/** Install the single platform stylesheet. Every component connects through this. */
export function connectFoundation(): void {
  installVuiStyles();
}

/** Current theme, density, tokens, motion, layers, and container thresholds. The three axes stay independent. */
export function readFoundation(root: HTMLElement = document.documentElement): FoundationSnapshot {
  connectFoundation();
  const names = [...primitiveTokens, ...semanticTokens, ...componentTokens];
  const tokens: Record<string, string> = {};
  for (const name of names) tokens[name] = readToken(name, root);
  return {
    theme: getTheme(root),
    density: getDensity(root),
    reducedMotion: prefersReducedMotion(),
    forcedColors: prefersForcedColors(),
    motion: readMotion(root),
    layers: readLayers(root),
    thresholds: {
      narrow: inlineThreshold(root, '--vui-layout-narrow', 352),
      medium: inlineThreshold(root, '--vui-layout-medium', 640),
      field: inlineThreshold(root, '--vui-field-inline', 576),
      overlay: inlineThreshold(root, '--vui-overlay-full', 480),
    },
    tokens,
  };
}
