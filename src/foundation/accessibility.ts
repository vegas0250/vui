/** Platform accessibility signals. Components inherit reduced motion from base styles; they do not add a second policy. */

export const focusRingToken = '--vui-focus-ring';

function mediaMatches(query: string): boolean {
  if (typeof matchMedia !== 'function') return false;
  return matchMedia(query).matches;
}

export function prefersReducedMotion(): boolean {
  return mediaMatches('(prefers-reduced-motion: reduce)');
}

export function prefersForcedColors(): boolean {
  return mediaMatches('(forced-colors: active)');
}
