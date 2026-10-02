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
