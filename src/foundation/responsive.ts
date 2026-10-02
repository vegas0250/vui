import { inlineThreshold, lengthToPx, observeInlineSize, readLength } from '../core/responsive';

export { inlineThreshold, lengthToPx, observeInlineSize, readLength };

/** Container width band. Theme and density do not participate. */
export type ContainerBand = 'narrow' | 'medium' | 'wide';

/**
 * Band for a measured container width.
 * A non-positive width is not a layout change: callers skip it the same way as a zero `ResizeObserver` box.
 */
export function containerBand(width: number, element: Element = document.documentElement): ContainerBand {
  if (!(width > 0)) return 'wide';
  const narrow = inlineThreshold(element, '--vui-layout-narrow', 352);
  const medium = inlineThreshold(element, '--vui-layout-medium', 640);
  if (width <= narrow) return 'narrow';
  if (width <= medium) return 'medium';
  return 'wide';
}
