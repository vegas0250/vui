import { cycleTab, openFocusScope } from './focus';

/** Layers Dialog, Dropdown, Popover, Tooltip, Drawer, Toast, and Menu share. */
export type OverlayKind = 'popup' | 'modal' | 'toast' | 'tooltip';

export type Placement = 'bottom-start' | 'top-start' | 'right-start' | 'left-start';

export interface OverlayOptions {
  owner: HTMLElement;
  kind: OverlayKind;
  /** Element that receives `--vui-overlay-z`. Defaults to `owner`. */
  layer?: HTMLElement;
  dismissable?: boolean | (() => boolean);
  dismissOnOutside?: boolean;
  /** Cycle Tab inside `owner`. Native `<dialog>` keeps this off and uses the platform trap. */
  trapFocus?: boolean;
  lockScroll?: boolean;
  /** Restore focus to the element that was active when the overlay opened. */
  restoreFocus?: boolean;
  /**
   * Layers that share a group close together on an outside pointer.
   * Escape still closes only the top layer, so a nested menu can unwind one step.
   */
  group?: string;
  onDismiss?: (reason: 'escape' | 'outside') => void;
}

interface Entry extends OverlayOptions {
  closeScope: ((close?: { restore?: boolean }) => void) | null;
}

const stack: Entry[] = [];
let attached = false;

const zBase: Record<OverlayKind, number> = {
  popup: 1000,
  modal: 1300,
  toast: 1400,
  tooltip: 1500,
};

function flag(value: boolean | (() => boolean) | undefined, fallback = false): boolean {
  if (typeof value === 'function') return value();
  if (typeof value === 'boolean') return value;
  return fallback;
}

function applyStack(): void {
  stack.forEach((entry, index) => {
    const layer = entry.layer ?? entry.owner;
    layer.style.setProperty('--vui-overlay-z', String(zBase[entry.kind] + index));
  });
  const lock = stack.some((entry) => entry.lockScroll);
  document.documentElement.toggleAttribute('data-vui-scroll-lock', lock);
  for (const entry of stack) entry.owner.setAttribute('data-vui-overlay', entry.kind);
}

function syncListeners(): void {
  if (stack.length > 0 && !attached) {
    document.addEventListener('keydown', onKeydown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    attached = true;
  } else if (stack.length === 0 && attached) {
    document.removeEventListener('keydown', onKeydown, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
    attached = false;
  }
}

function escapeTarget(): Entry | 'block' | undefined {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const entry = stack[index];
    if (!entry) continue;
    if (flag(entry.dismissable, true)) return entry;
    if (entry.kind === 'modal' || entry.kind === 'popup') return 'block';
  }
  return undefined;
}

function topOutside(): Entry | undefined {
  for (let index = stack.length - 1; index >= 0; index -= 1) {
    const entry = stack[index];
    if (!entry) continue;
    if (entry.dismissOnOutside) return entry;
    if (entry.kind === 'modal' || entry.kind === 'popup') return undefined;
  }
  return undefined;
}

function onKeydown(event: KeyboardEvent): void {
  const top = stack[stack.length - 1];
  if (!top) return;
  if (event.key === 'Escape') {
    const target = escapeTarget();
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    if (target !== 'block') target.onDismiss?.('escape');
    return;
  }
  if (event.key === 'Tab' && top.trapFocus) cycleTab(top.owner, event);
}

function onPointerDown(event: Event): void {
  const target = topOutside();
  if (!target) return;
  const path = event.composedPath();
  if (target.group) {
    const members = stack.filter((entry) => entry.group === target.group);
    if (members.some((entry) => path.includes(entry.owner))) return;
    for (const entry of [...members].reverse()) entry.onDismiss?.('outside');
    return;
  }
  if (path.includes(target.owner)) return;
  target.onDismiss?.('outside');
}

function release(entry: Entry, restore = true): void {
  const index = stack.indexOf(entry);
  if (index < 0) return;
  stack.splice(index, 1);
  if (!stack.some((item) => item.owner === entry.owner)) entry.owner.removeAttribute('data-vui-overlay');
  applyStack();
  syncListeners();
  entry.closeScope?.(restore ? undefined : { restore: false });
  entry.closeScope = null;
}

/** Register an open overlay. The returned function removes it and restores focus when requested. */
export function pushOverlay(options: OverlayOptions): () => void {
  const needsScope = Boolean(options.restoreFocus || options.trapFocus);
  const entry: Entry = {
    ...options,
    closeScope: needsScope
      ? openFocusScope(options.owner, {
          restore: Boolean(options.restoreFocus),
          reclaim: Boolean(options.restoreFocus || options.trapFocus),
        })
      : null,
  };
  stack.push(entry);
  applyStack();
  syncListeners();
  return () => release(entry);
}

export function overlayDepth(): number {
  return stack.length;
}

/** Drops the stack without restoring focus. Test isolation only. */
export function clearOverlays(): void {
  const closing = [...stack];
  stack.length = 0;
  for (const entry of closing) {
    entry.owner.removeAttribute('data-vui-overlay');
    entry.closeScope?.({ restore: false });
    entry.closeScope = null;
  }
  document.documentElement.removeAttribute('data-vui-scroll-lock');
  if (attached) {
    document.removeEventListener('keydown', onKeydown, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
    attached = false;
  }
}

export interface AnchorBox {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

/** Pin `layer` to an anchor and keep it inside the viewport. */
export function placeLayer(layer: HTMLElement, anchor: AnchorBox, placement: Placement = 'bottom-start'): void {
  layer.style.position = 'fixed';
  layer.style.right = 'auto';
  layer.style.bottom = 'auto';
  const gutter = 8;
  const width = layer.offsetWidth;
  const height = layer.offsetHeight;
  const viewWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  let left = anchor.x;
  let top = anchor.y;
  if (placement === 'bottom-start') top = anchor.y + (anchor.height ?? 0);
  if (placement === 'top-start') top = anchor.y - height;
  if (placement === 'right-start') left = anchor.x + (anchor.width ?? 0);
  if (placement === 'left-start') left = anchor.x - width;
  const maxLeft = Math.max(gutter, viewWidth - width - gutter);
  const maxTop = Math.max(gutter, viewHeight - height - gutter);
  left = Math.min(Math.max(gutter, left), maxLeft);
  top = Math.min(Math.max(gutter, top), maxTop);
  layer.style.left = `${Math.round(left)}px`;
  layer.style.top = `${Math.round(top)}px`;
}
