export type ListOrientation = 'horizontal' | 'vertical' | 'both';

export interface ListMoveOptions {
  orientation?: ListOrientation;
  /** Wrap arrow keys. Home and End stay on the ends. */
  loop?: boolean;
  /** Rows skipped by PageUp and PageDown. Defaults to a third of the list, at least 1. */
  pageSize?: number;
  /** When set, ArrowLeft and ArrowRight follow the inline direction. */
  rtl?: boolean;
}

function nearestDir(element: Element): Element | null {
  let node: Element | null = element;
  while (node) {
    const dir = node.getAttribute('dir');
    if (dir === 'rtl' || dir === 'ltr') return node;
    node = node.parentElement;
  }
  return null;
}

/**
 * Inline direction of `element`. Vertical movement does not use this.
 * A browser that resolves `dir` is trusted via computed style, so a CSS `direction` between the attribute and the element still wins.
 * An engine that leaves computed `direction` as `ltr` while `dir="rtl"` is set is trusted via the attribute.
 */
export function isRtl(element: Element): boolean {
  const marked = nearestDir(element);
  if (!marked) return getComputedStyle(element).direction === 'rtl';
  const markedDir = marked.getAttribute('dir');
  if (getComputedStyle(marked).direction === markedDir) return getComputedStyle(element).direction === 'rtl';
  return markedDir === 'rtl';
}

/**
 * Next index for arrow, Home, End, PageUp, and PageDown.
 * Returns null when the key is not navigation for this orientation.
 */
export function moveInList(current: number, count: number, key: string, options: ListMoveOptions = {}): number | null {
  if (count <= 0) return null;
  const orientation = options.orientation ?? 'vertical';
  const loop = options.loop ?? false;
  const horizontal = orientation === 'horizontal' || orientation === 'both';
  const vertical = orientation === 'vertical' || orientation === 'both';
  const page = options.pageSize ?? Math.max(1, Math.floor(count / 3));
  const index = Number.isFinite(current) ? current : 0;

  const rtl = options.rtl ?? false;
  let next = index;
  if (horizontal && key === 'ArrowLeft') next = index + (rtl ? 1 : -1);
  else if (horizontal && key === 'ArrowRight') next = index + (rtl ? -1 : 1);
  else if (vertical && key === 'ArrowUp') next = index - 1;
  else if (vertical && key === 'ArrowDown') next = index + 1;
  else if (key === 'Home') next = 0;
  else if (key === 'End') next = count - 1;
  else if (vertical && key === 'PageUp') next = index - page;
  else if (vertical && key === 'PageDown') next = index + page;
  else return null;

  const arrow = key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown';
  if (loop && arrow) next = (next + count) % count;
  else next = Math.max(0, Math.min(count - 1, next));
  return next;
}

/** Step to the next index accepted by `accept`, or stay put at a boundary. Delta 0 snaps to the nearest accepted index. */
export function stepIndex(current: number, delta: number, count: number, accept: (index: number) => boolean): number {
  if (count <= 0) return current;
  if (delta === 0) {
    if (current >= 0 && current < count && accept(current)) return current;
    for (let index = 0; index < count; index += 1) {
      if (accept(index)) return index;
    }
    return current;
  }
  let index = current;
  for (let step = 0; step < count; step += 1) {
    index += delta;
    if (index < 0 || index >= count) return current;
    if (accept(index)) return index;
  }
  return current;
}

/** Next enabled index. `current` may be -1 or `count` to start a search from either end. */
export function nextEnabled(
  count: number,
  current: number,
  delta: number,
  enabled: (index: number) => boolean,
  loop = true,
): number {
  if (count <= 0 || delta === 0) return current;
  let index = current;
  for (let step = 0; step < count; step += 1) {
    if (loop) index = (index + delta + count) % count;
    else {
      index += delta;
      if (index < 0 || index >= count) return current;
    }
    if (enabled(index)) return index;
  }
  return current;
}

/** One item in `items` keeps tabindex 0. The rest become -1. */
export function applyRovingTabIndex(items: readonly HTMLElement[], activeIndex: number): void {
  items.forEach((item, index) => {
    item.tabIndex = index === activeIndex ? 0 : -1;
  });
}

export function isActivation(event: KeyboardEvent): boolean {
  return (event.key === 'Enter' || event.key === ' ') && !event.ctrlKey && !event.metaKey && !event.altKey;
}
