import { readToken } from './tokens';

/** Z-index tokens. Overlay stacking itself stays in `src/interaction/overlay.ts`. */
export const layerTokens = {
  dropdown: '--vui-z-dropdown',
  sticky: '--vui-z-sticky',
  overlay: '--vui-z-overlay',
  dialog: '--vui-z-dialog',
  toast: '--vui-z-toast',
  tooltip: '--vui-z-tooltip',
} as const;

export type LayerName = keyof typeof layerTokens;

export function readLayers(element: Element = document.documentElement): Record<LayerName, string> {
  const layers = {} as Record<LayerName, string>;
  for (const name of Object.keys(layerTokens) as LayerName[]) {
    layers[name] = readToken(layerTokens[name], element);
  }
  return layers;
}
