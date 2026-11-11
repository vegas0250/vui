import { installVuiStyles } from '../theme/install';
import { prefersForcedColors, prefersReducedMotion } from './accessibility';
import { readLayers } from './layers';
import { readMotion } from './motion';
import { inlineThreshold } from './responsive';
import { getTheme } from './theme';
import { getUIMode } from './ui';
import { componentTokens, primitiveTokens, readToken, semanticTokens } from './tokens';
import type { LayerName } from './layers';
import type { VuiTheme } from './theme';
import type { VuiUIMode } from './ui';

export interface FoundationSnapshot {
  theme: VuiTheme;
  uiMode: VuiUIMode;
  /** @deprecated Use uiMode. */
  density: VuiUIMode;
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

/** Current theme, UI mode, tokens, motion, layers, and container thresholds. The three axes stay independent. */
export function readFoundation(root: HTMLElement = document.documentElement): FoundationSnapshot {
  connectFoundation();
  const names = [...primitiveTokens, ...semanticTokens, ...componentTokens];
  const tokens: Record<string, string> = {};
  for (const name of names) tokens[name] = readToken(name, root);
  const uiMode = getUIMode(root);
  return {
    theme: getTheme(root),
    uiMode,
    density: uiMode,
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
