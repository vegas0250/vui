import { focusableElements } from './focus';

/** Layers future Dialog, Dropdown, Popover, Tooltip, Drawer, and Toast share. */
export type OverlayKind = 'popup' | 'modal' | 'toast' | 'tooltip';

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
  onDismiss?: (reason: 'escape' | 'outside') => void;
}

interface Entry extends OverlayOptions {
  restore: HTMLElement | null;
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

function captureRestore(owner: HTMLElement): HTMLElement | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  if (active === document.body || active === document.documentElement) return null;
  if (active === owner || owner.contains(active)) return null;
  return active;
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
  if (event.key === 'Tab' && top.trapFocus) trapTab(top, event);
}

function trapTab(entry: Entry, event: KeyboardEvent): void {
  const items = focusableElements(entry.owner);
  if (!items.length) return;
  const active = document.activeElement;
  const current = items.findIndex((item) => item === active || (active instanceof Node && item.contains(active)));
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  let next: HTMLElement;
  if (event.shiftKey) next = current <= 0 ? last : (items[current - 1] ?? last);
  else next = current < 0 || current >= items.length - 1 ? first : (items[current + 1] ?? first);
  event.preventDefault();
  event.stopPropagation();
  next.focus();
}

function onPointerDown(event: Event): void {
  const target = topOutside();
  if (!target) return;
  if (event.composedPath().includes(target.owner)) return;
  target.onDismiss?.('outside');
}

function release(entry: Entry): void {
  const index = stack.indexOf(entry);
  if (index < 0) return;
  stack.splice(index, 1);
  if (!stack.some((item) => item.owner === entry.owner)) entry.owner.removeAttribute('data-vui-overlay');
  applyStack();
  syncListeners();
  const restore = entry.restore;
  if (!restore?.isConnected) return;
  queueMicrotask(() => {
    if (restore.isConnected) restore.focus();
  });
}

/** Register an open overlay. The returned function removes it and restores focus when requested. */
export function pushOverlay(options: OverlayOptions): () => void {
  const entry: Entry = {
    ...options,
    restore: options.restoreFocus ? captureRestore(options.owner) : null,
  };
  stack.push(entry);
  applyStack();
  syncListeners();
  return () => release(entry);
}

export function overlayDepth(): number {
  return stack.length;
}

/** Drops the stack without dismissing. Test isolation only. */
export function clearOverlays(): void {
  for (const entry of stack) entry.owner.removeAttribute('data-vui-overlay');
  stack.length = 0;
  document.documentElement.removeAttribute('data-vui-scroll-lock');
  if (attached) {
    document.removeEventListener('keydown', onKeydown, true);
    document.removeEventListener('pointerdown', onPointerDown, true);
    attached = false;
  }
}
