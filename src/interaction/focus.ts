/** The focused element, walking through open shadow roots. */
export function deepestActiveElement(): HTMLElement | null {
  let node = document.activeElement;
  while (node instanceof HTMLElement && node.shadowRoot?.activeElement instanceof HTMLElement) {
    node = node.shadowRoot.activeElement;
  }
  return node instanceof HTMLElement ? node : null;
}

/** True when `node` is the host or lives in its light or shadow tree. */
export function isWithin(host: HTMLElement, node: Node | null): boolean {
  let current: Node | null = node;
  while (current) {
    if (current === host) return true;
    const root = current.getRootNode();
    if (root instanceof ShadowRoot) current = root.host;
    else current = current.parentNode;
  }
  return false;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

export function focusableElements(owner: HTMLElement): HTMLElement[] {
  const found: HTMLElement[] = [];
  collect(owner, found);
  if (owner.shadowRoot) collect(owner.shadowRoot, found);
  return found.filter((element) => isTabbable(element));
}

function collect(root: ParentNode, found: HTMLElement[]): void {
  for (const node of root.querySelectorAll('*')) {
    if (node instanceof HTMLElement) found.push(node);
    if (node.shadowRoot) collect(node.shadowRoot, found);
  }
}

function isTabbable(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled') || element.getAttribute('aria-hidden') === 'true') return false;
  if (element.closest('[hidden]')) return false;
  const tab = element.getAttribute('tabindex');
  if (tab === '-1') return false;
  if (tab !== null && Number(tab) >= 0) return true;
  return element.matches(FOCUSABLE);
}

export interface FocusScopeOptions {
  /** Remember the element that was active and focus it when the scope closes. */
  restore?: boolean;
  /** When the focused descendant is removed, move focus to another element inside the scope. */
  reclaim?: boolean;
}

interface Scope {
  owner: HTMLElement;
  previous: HTMLElement | null;
  reclaim: boolean;
  last: HTMLElement | null;
  alive: boolean;
  cleanup: () => void;
}

const scopes: Scope[] = [];

function capturePrevious(owner: HTMLElement): HTMLElement | null {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;
  if (active === document.body || active === document.documentElement) return null;
  if (active === owner || owner.contains(active)) return null;
  return active;
}

function remember(scope: Scope): void {
  const active = deepestActiveElement();
  if (active && isWithin(scope.owner, active)) scope.last = active;
}

function reclaim(scope: Scope): void {
  if (!scope.alive || !scope.reclaim || !scope.owner.isConnected) return;
  if (scopes[scopes.length - 1] !== scope) return;
  const active = deepestActiveElement();
  if (active && active.isConnected && isWithin(scope.owner, active)) return;
  if (!scope.last || scope.last.isConnected) return;
  const next = focusableElements(scope.owner)[0];
  if (next) {
    next.focus();
    return;
  }
  if (scope.owner.tabIndex >= 0) scope.owner.focus();
}

/**
 * Nested focus scope. The returned function closes this scope.
 * Pass `{ restore: false }` to drop it without moving focus (test teardown).
 */
export function openFocusScope(owner: HTMLElement, options: FocusScopeOptions = {}): (close?: { restore?: boolean }) => void {
  const scope: Scope = {
    owner,
    previous: options.restore ? capturePrevious(owner) : null,
    reclaim: options.reclaim ?? Boolean(options.restore),
    last: null,
    alive: true,
    cleanup: () => undefined,
  };

  const onFocusIn = (): void => remember(scope);
  const onFocusOut = (): void => {
    queueMicrotask(() => reclaim(scope));
  };
  const observer = new MutationObserver(() => {
    queueMicrotask(() => reclaim(scope));
  });
  owner.addEventListener('focusin', onFocusIn);
  owner.addEventListener('focusout', onFocusOut);
  observer.observe(owner, { childList: true, subtree: true });
  if (owner.shadowRoot) observer.observe(owner.shadowRoot, { childList: true, subtree: true });
  scope.cleanup = () => {
    owner.removeEventListener('focusin', onFocusIn);
    owner.removeEventListener('focusout', onFocusOut);
    observer.disconnect();
  };
  scopes.push(scope);
  remember(scope);

  return (close) => {
    const index = scopes.indexOf(scope);
    if (index < 0) return;
    scopes.splice(index, 1);
    scope.alive = false;
    scope.cleanup();
    const restore = close?.restore !== false;
    const previous = scope.previous;
    if (!restore || !previous?.isConnected) return;
    queueMicrotask(() => {
      if (previous.isConnected) previous.focus();
    });
  };
}

/** Drops every scope without restoring focus. Test isolation only. */
export function discardFocusScopes(): void {
  while (scopes.length) {
    const scope = scopes[scopes.length - 1];
    if (!scope) break;
    const index = scopes.indexOf(scope);
    scopes.splice(index, 1);
    scope.alive = false;
    scope.cleanup();
  }
}

/** Move Tab forward or backward inside `owner`. Returns false when there is nothing to cycle. */
export function cycleTab(owner: HTMLElement, event: KeyboardEvent): boolean {
  if (event.key !== 'Tab') return false;
  const items = focusableElements(owner);
  if (!items.length) return false;
  const active = document.activeElement;
  const current = items.findIndex((item) => item === active || (active instanceof Node && item.contains(active)));
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return false;
  let next: HTMLElement;
  if (event.shiftKey) next = current <= 0 ? last : (items[current - 1] ?? last);
  else next = current < 0 || current >= items.length - 1 ? first : (items[current + 1] ?? first);
  event.preventDefault();
  event.stopPropagation();
  next.focus();
  return true;
}
