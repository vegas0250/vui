/** Token names the platform owns. Components read these custom properties; they do not invent a parallel scale. */

export const primitiveTokens = [
  '--vui-font-sans',
  '--vui-font-mono',
  '--vui-duration',
  '--vui-easing',
  '--vui-radius-full',
  '--vui-layout-narrow',
  '--vui-layout-medium',
  '--vui-field-inline',
  '--vui-overlay-full',
] as const;

export const semanticTokens = [
  '--vui-color-background',
  '--vui-color-text',
  '--vui-color-text-muted',
  '--vui-color-surface',
  '--vui-color-primary',
  '--vui-color-danger',
  '--vui-color-success',
  '--vui-color-warning',
  '--vui-color-info',
  '--vui-color-focus',
  '--vui-focus-ring',
  '--vui-border-width',
  '--vui-shadow-md',
] as const;

export const componentTokens = [
  '--vui-size-control',
  '--vui-space-md',
  '--vui-font-size',
  '--vui-row-height',
  '--vui-toolbar-height',
  '--vui-statusbar-height',
  '--vui-panel-padding',
  '--vui-icon-size',
] as const;

export const foundationTokens = [...primitiveTokens, ...semanticTokens, ...componentTokens] as const;

export type FoundationToken = (typeof foundationTokens)[number];

/** Computed value of a custom property. Empty when the property is not set on the element. */
export function readToken(name: string, element: Element = document.documentElement): string {
  return getComputedStyle(element).getPropertyValue(name).trim();
}
