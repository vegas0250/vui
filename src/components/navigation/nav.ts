import '../foundation/icon';
import { reportUnexpectedChildren } from '../../utils/dev';
import { defineElement } from '../../utils/define';
import { registerContract } from '../../contract/registry';
import { emitChange } from '../../utils/events';
import { VuiElement } from '../../utils/element';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';
import { isRtl, moveInList, stepIndex } from '../../interaction/keyboard';
import type { VIcon } from '../foundation/icon';

const chevron = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6"></path>
</svg>`;

function isNavChild(node: Element): node is VNavItem | VNavGroup {
  return node instanceof VNavItem || node instanceof VNavGroup;
}

function leafLabel(host: HTMLElement): string {
  const attr = host.getAttribute('label');
  if (attr != null && attr.length > 0) return attr;
  return [...host.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent?.replace(/\s+/g, ' ').trim() ?? '')
    .filter(Boolean)
    .join(' ');
}

export class VNavItem extends VuiElement {
  declare href: string;
  declare label: string;
  declare icon: string;
  declare disabled: boolean;
  declare selected: boolean;
  declare expanded: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['href', 'label', 'icon', 'disabled', 'selected', 'expanded', 'data-current'];
  }

  protected template(): string {
    return `
      <div class="row" part="row">
        <span class="guide" part="guide" aria-hidden="true"></span>
        <span class="twist" part="twist" aria-hidden="true">${chevron}</span>
        <vui-icon part="icon" hidden></vui-icon>
        <a part="link"><span class="text" part="label"></span></a>
      </div>
      <div class="children" part="children" role="group"><slot></slot></div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        min-width: 0;
        max-width: 100%;
        gap: var(--vui-nav-gap, 2px);
      }
      .row {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--vui-space-xs);
        min-width: 0;
        min-height: var(--vui-nav-item-height, var(--vui-size-control));
        padding-inline: var(--vui-nav-item-padding-inline, var(--vui-space-sm));
        border-radius: var(--vui-radius-field, var(--vui-radius));
        cursor: pointer;
        user-select: none;
        transition: background-color var(--vui-duration) var(--vui-easing);
      }
      .row:hover { background: var(--vui-color-hover, var(--vui-color-surface-hover)); }
      :host([disabled]) .row:hover { background: transparent; }
      :host([selected]) .row {
        background: var(--vui-color-selected);
        color: var(--vui-color-text);
      }
      :host([selected]) .row:hover { background: var(--vui-color-selected); }
      :host([data-current]) .row:focus-within,
      .row:focus-within {
        outline: var(--vui-focus-ring);
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      :host([disabled]) { opacity: var(--vui-opacity-disabled, 0.55); }
      :host([disabled]) .row { cursor: not-allowed; pointer-events: none; }
      .guide {
        position: absolute;
        inset-inline-start: calc(var(--vui-nav-indent, 12px) * 0.5);
        top: 0;
        bottom: 0;
        width: 1px;
        background: transparent;
        pointer-events: none;
      }
      :host([data-depth]:not([data-depth="0"])) .guide {
        background: var(--vui-nav-guide, var(--vui-color-border));
        opacity: 0.7;
      }
      :host([data-depth]:not([data-depth="0"])) .guide::after {
        content: "";
        position: absolute;
        inset-inline-start: 0;
        top: 50%;
        width: calc(var(--vui-nav-indent, 12px) * 0.5);
        border-block-start: 1px solid var(--vui-nav-guide, var(--vui-color-border));
        opacity: 0.9;
      }
      .twist {
        display: inline-flex;
        flex: 0 0 var(--vui-icon-size);
        align-items: center;
        justify-content: center;
        width: var(--vui-icon-size);
        height: var(--vui-icon-size);
        color: var(--vui-color-text-muted);
      }
      .twist svg {
        width: 100%;
        height: 100%;
        transition: transform var(--vui-duration) var(--vui-easing);
      }
      :host([expanded]) .twist svg { transform: rotate(90deg); }
      :host-context([dir="rtl"]):host(:not([expanded])) .twist svg { transform: scaleX(-1); }
      :host(:not([branch])) .twist { visibility: hidden; pointer-events: none; }
      vui-icon {
        flex: 0 0 var(--vui-icon-size);
        width: var(--vui-icon-size);
        height: var(--vui-icon-size);
        color: var(--vui-color-text-muted);
      }
      :host([selected]) vui-icon { color: var(--vui-color-text); }
      a {
        display: flex;
        align-items: center;
        min-width: 0;
        flex: 1 1 auto;
        color: inherit;
        text-decoration: none;
        overflow: hidden;
      }
      a:focus { outline: none; }
      .text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .children {
        display: none;
        flex-direction: column;
        gap: var(--vui-nav-gap, 2px);
        margin: 0;
        padding: 0;
        padding-inline-start: var(--vui-nav-indent, 12px);
        min-width: 0;
        overflow: clip;
      }
      :host([branch][expanded]) .children {
        display: flex;
        animation: vui-nav-open calc(var(--vui-duration) * 2) var(--vui-easing);
      }
      @keyframes vui-nav-open {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      ::slotted(vui-nav-item),
      ::slotted(vui-nav-group) { min-width: 0; }
    `;
  }

  protected afterRender(): void {
    this.qs('.twist').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.isDisabled() || !this.hasBranch()) return;
      this.toggleAttribute('expanded');
      this.closest('vui-nav')?.dispatchEvent(new Event('vui-nav-refresh', { bubbles: true }));
    });
    this.qs('a').addEventListener('click', (event) => {
      if (this.isDisabled()) {
        event.preventDefault();
        return;
      }
      if (this.hasBranch() && !this.getAttribute('href')) {
        event.preventDefault();
        this.toggleAttribute('expanded');
        this.closest('vui-nav')?.dispatchEvent(new Event('vui-nav-refresh', { bubbles: true }));
      }
    });
    this.qs('slot').addEventListener('slotchange', () => this.sync());
    queueMicrotask(() => {
      if (this.isConnected) this.sync();
    });
  }

  protected sync(): void {
    const branch = this.hasBranch();
    this.toggleAttribute('branch', branch);
    const expanded = this.hasAttribute('expanded');
    if (branch) this.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    else this.removeAttribute('aria-expanded');

    const text = leafLabel(this);
    this.qs('.text').textContent = text;

    const icon = this.getAttribute('icon') ?? '';
    const iconEl = this.qs<VIcon>('vui-icon');
    if (icon) {
      iconEl.hidden = false;
      iconEl.setAttribute('name', icon);
    } else {
      iconEl.hidden = true;
      iconEl.removeAttribute('name');
    }

    const link = this.qs<HTMLAnchorElement>('a');
    const disabled = this.isDisabled();
    const href = this.getAttribute('href');
    if (href && !disabled) link.href = href;
    else link.removeAttribute('href');
    link.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (this.hasAttribute('selected')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    link.tabIndex = !disabled && this.hasAttribute('data-current') ? 0 : -1;
    if (text) link.setAttribute('aria-label', text);
    else link.removeAttribute('aria-label');

    reportUnexpectedChildren(this, ['vui-nav-item', 'vui-nav-group']);
  }

  hasBranch(): boolean {
    return this.querySelector(':scope > vui-nav-item, :scope > vui-nav-group') !== null;
  }

  override focus(options?: FocusOptions): void {
    this.qs<HTMLElement>('a').focus(options);
  }
}

reflectStrings(VNavItem, ['href', 'label', 'icon']);
reflectBooleans(VNavItem, ['disabled', 'selected', 'expanded']);
defineElement('vui-nav-item', VNavItem);

registerContract({
  element: 'vui-nav-item',
  className: 'VNavItem',
  attributes: [
    { name: 'href', kind: 'string', reflected: true },
    { name: 'label', kind: 'string', reflected: true },
    { name: 'icon', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'selected', kind: 'boolean', reflected: true },
    { name: 'expanded', kind: 'boolean', reflected: true },
  ],
  events: ['click'],
  slots: [''],
  parts: ['row', 'guide', 'twist', 'icon', 'link', 'label', 'children'],
  methods: [],
  keyboard: ['Enter'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'native',
});

export class VNavGroup extends VuiElement {
  declare label: string;
  declare icon: string;
  declare expanded: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['label', 'icon', 'expanded'];
  }

  protected template(): string {
    return `
      <button type="button" class="header" part="header">
        <span class="twist" part="twist" aria-hidden="true">${chevron}</span>
        <vui-icon part="icon" hidden></vui-icon>
        <span class="label" part="label"></span>
      </button>
      <div class="items" part="items" role="group"><slot></slot></div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--vui-nav-gap, 2px);
        min-width: 0;
        max-width: 100%;
        margin-block: var(--vui-nav-category-gap, 12px) 0;
      }
      :host(:first-child) { margin-block-start: 0; }
      .header {
        display: flex;
        align-items: center;
        gap: var(--vui-space-xs);
        width: 100%;
        min-height: var(--vui-nav-item-height, var(--vui-size-control));
        margin: 0;
        padding-inline: var(--vui-nav-item-padding-inline, var(--vui-space-sm));
        border: 0;
        border-radius: var(--vui-radius-field, var(--vui-radius));
        background: transparent;
        color: var(--vui-color-text-muted);
        font: inherit;
        text-align: start;
        cursor: pointer;
        user-select: none;
      }
      .header:hover { background: var(--vui-color-hover, var(--vui-color-surface-hover)); }
      .header:focus { outline: none; }
      .header:focus-visible {
        outline: var(--vui-focus-ring);
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      .twist {
        display: inline-flex;
        flex: 0 0 var(--vui-icon-size);
        align-items: center;
        justify-content: center;
        width: var(--vui-icon-size);
        height: var(--vui-icon-size);
        color: inherit;
      }
      .twist svg {
        width: 100%;
        height: 100%;
        transition: transform var(--vui-duration) var(--vui-easing);
      }
      :host([expanded]) .twist svg { transform: rotate(90deg); }
      :host-context([dir="rtl"]):host(:not([expanded])) .twist svg { transform: scaleX(-1); }
      vui-icon {
        flex: 0 0 var(--vui-icon-size);
        width: var(--vui-icon-size);
        height: var(--vui-icon-size);
        color: inherit;
      }
      .label {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: var(--vui-font-size-sm);
        font-weight: var(--vui-font-weight-strong);
        letter-spacing: var(--vui-tracking-caps, 0.06em);
        text-transform: uppercase;
      }
      .items {
        display: none;
        flex-direction: column;
        gap: var(--vui-nav-gap, 2px);
        min-width: 0;
      }
      :host([expanded]) .items {
        display: flex;
        animation: vui-nav-group-open calc(var(--vui-duration) * 2) var(--vui-easing);
      }
      @keyframes vui-nav-group-open {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
  }

  protected afterRender(): void {
    const toggle = (event: Event) => {
      event.preventDefault();
      this.toggleAttribute('expanded');
      this.closest('vui-nav')?.dispatchEvent(new Event('vui-nav-refresh', { bubbles: true }));
    };
    this.qs('.header').addEventListener('click', toggle);
    this.qs('slot').addEventListener('slotchange', () => this.sync());
  }

  protected sync(): void {
    const label = this.getAttribute('label') ?? '';
    this.qs('.label').textContent = label;
    const icon = this.getAttribute('icon') ?? '';
    const iconEl = this.qs<VIcon>('vui-icon');
    if (icon) {
      iconEl.hidden = false;
      iconEl.setAttribute('name', icon);
    } else {
      iconEl.hidden = true;
      iconEl.removeAttribute('name');
    }
    const expanded = this.hasAttribute('expanded');
    this.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    const header = this.qs<HTMLButtonElement>('.header');
    header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (label) header.setAttribute('aria-label', label);
    else header.removeAttribute('aria-label');
    const items = this.qs<HTMLElement>('.items');
    if (label) items.setAttribute('aria-label', label);
    else items.removeAttribute('aria-label');
    reportUnexpectedChildren(this, ['vui-nav-item', 'vui-nav-group']);
  }
}

reflectStrings(VNavGroup, ['label', 'icon']);
reflectBooleans(VNavGroup, ['expanded']);
defineElement('vui-nav-group', VNavGroup);

registerContract({
  element: 'vui-nav-group',
  className: 'VNavGroup',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'icon', kind: 'string', reflected: true },
    { name: 'expanded', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['header', 'twist', 'icon', 'label', 'items'],
  methods: [],
  keyboard: ['Enter', 'Space'],
  states: [],
  responsive: 'flow',
  focus: 'native',
  role: 'group',
});

export class VNav extends VuiElement {
  declare label: string;
  declare orientation: string;

  static get observedAttributes(): string[] {
    return ['label', 'orientation'];
  }

  protected template(): string {
    return `<nav part="nav" role="navigation"><slot></slot></nav>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;
        container-type: inline-size;
        container-name: vui-nav;
      }
      nav {
        display: flex;
        flex-direction: column;
        gap: var(--vui-nav-gap, 2px);
        min-width: 0;
      }
      :host([orientation="horizontal"]) nav {
        flex-direction: row;
        flex-wrap: wrap;
        gap: var(--vui-space-xs);
      }
      @container vui-nav (max-width: 22rem) {
        nav { flex-direction: column; }
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot').addEventListener('slotchange', () => this.sync());
    this.addEventListener('vui-nav-refresh', () => this.refreshTabStops());
    this.addEventListener('click', (event) => {
      const item = this.itemFromEvent(event);
      if (!item || item.hasAttribute('disabled')) {
        if (item?.hasAttribute('disabled')) event.preventDefault();
        return;
      }
      if (event.composedPath().some((node) => node instanceof Element && node.classList.contains('twist'))) {
        return;
      }
      for (const candidate of this.allItems()) candidate.toggleAttribute('selected', candidate === item);
      this.refreshTabStops(item);
      emitChange(this);
    });
    this.addEventListener('keydown', (event) => this.onKeydown(event));
  }

  protected sync(): void {
    reportUnexpectedChildren(this, ['vui-nav-item', 'vui-nav-group']);
    const nav = this.qs('nav');
    const label = this.getAttribute('label') ?? '';
    if (label) nav.setAttribute('aria-label', label);
    else nav.removeAttribute('aria-label');
    this.markDepths();
    const current = this.visibleItems().find((item) => item.hasAttribute('selected')) ?? this.visibleItems()[0];
    this.refreshTabStops(current);
  }

  private markDepths(root: ParentNode = this, depth = 0): void {
    for (const child of [...root.children]) {
      if (child instanceof VNavItem) {
        child.setAttribute('data-depth', String(depth));
        this.markDepths(child, depth + 1);
      } else if (child instanceof VNavGroup) {
        child.setAttribute('data-depth', String(depth));
        this.markDepths(child, depth + 1);
      }
    }
  }

  private directChildren(root: ParentNode = this): Array<VNavItem | VNavGroup> {
    if (root instanceof HTMLElement) reportUnexpectedChildren(root, ['vui-nav-item', 'vui-nav-group']);
    return [...root.children].filter(isNavChild);
  }

  private allItems(root: ParentNode = this): VNavItem[] {
    const result: VNavItem[] = [];
    const walk = (parent: ParentNode): void => {
      for (const child of this.directChildren(parent)) {
        if (child instanceof VNavItem) {
          result.push(child);
          walk(child);
        } else {
          walk(child);
        }
      }
    };
    walk(root);
    return result;
  }

  private visibleItems(): VNavItem[] {
    const result: VNavItem[] = [];
    const walk = (parent: ParentNode): void => {
      for (const child of this.directChildren(parent)) {
        if (child instanceof VNavGroup) {
          if (child.hasAttribute('expanded')) walk(child);
          continue;
        }
        result.push(child);
        if (child.hasAttribute('expanded')) walk(child);
      }
    };
    walk(this);
    return result.filter((item) => !item.hasAttribute('disabled'));
  }

  private refreshTabStops(active?: VNavItem): void {
    const enabled = this.visibleItems();
    const current =
      (active && enabled.includes(active) ? active : undefined) ??
      enabled.find((item) => item.hasAttribute('data-current')) ??
      enabled.find((item) => item.hasAttribute('selected')) ??
      enabled[0];
    for (const item of this.allItems()) item.toggleAttribute('data-current', item === current);
  }

  private itemFromEvent(event: Event): VNavItem | null {
    const match = event.composedPath().find((node) => node instanceof VNavItem);
    return match instanceof VNavItem ? match : null;
  }

  private onKeydown(event: KeyboardEvent): void {
    const items = this.visibleItems();
    if (items.length === 0) return;
    const current =
      items.find((item) => item === document.activeElement || item.contains(document.activeElement)) ??
      items.find((item) => item.hasAttribute('data-current')) ??
      items[0];
    if (!current) return;
    const index = items.indexOf(current);
    const orientation = this.getAttribute('orientation') === 'horizontal' ? 'horizontal' : 'vertical';
    const nextIndex = moveInList(index, items.length, event.key, {
      orientation,
      loop: orientation === 'horizontal',
      rtl: isRtl(this),
    });

    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End' ||
      (orientation === 'horizontal' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight'))
    ) {
      if (nextIndex === null) return;
      event.preventDefault();
      let target = nextIndex;
      const enabledAt = (itemIndex: number) => items[itemIndex] !== undefined;
      if (!enabledAt(target)) {
        if (event.key === 'Home') target = stepIndex(-1, 1, items.length, enabledAt);
        else if (event.key === 'End') target = stepIndex(items.length, -1, items.length, enabledAt);
        else target = stepIndex(index, target >= index ? 1 : -1, items.length, enabledAt);
      }
      const next = items[target];
      if (!next) return;
      for (const item of this.allItems()) item.toggleAttribute('selected', item === next);
      this.refreshTabStops(next);
      next.focus();
      emitChange(this);
      return;
    }

    if (orientation === 'horizontal') return;

    const rtl = isRtl(this);
    const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const closeKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === openKey) {
      event.preventDefault();
      if (current.hasBranch() && !current.hasAttribute('expanded')) {
        current.setAttribute('expanded', '');
        this.refreshTabStops(current);
        return;
      }
      const next = items[index + 1];
      if (next) {
        for (const item of this.allItems()) item.toggleAttribute('selected', item === next);
        this.refreshTabStops(next);
        next.focus();
        emitChange(this);
      }
      return;
    }
    if (event.key === closeKey) {
      event.preventDefault();
      if (current.hasBranch() && current.hasAttribute('expanded')) {
        current.removeAttribute('expanded');
        this.refreshTabStops(current);
        return;
      }
      const parent = current.parentElement;
      if (parent instanceof VNavItem) {
        for (const item of this.allItems()) item.toggleAttribute('selected', item === parent);
        this.refreshTabStops(parent);
        parent.focus();
        emitChange(this);
      }
    }
  }
}

reflectStrings(VNav, ['label', 'orientation']);
defineElement('vui-nav', VNav);

registerContract({
  element: 'vui-nav',
  className: 'VNav',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'orientation', kind: 'enum', values: ['vertical', 'horizontal'], reflected: true },
  ],
  events: ['change'],
  slots: [''],
  parts: ['nav'],
  methods: [],
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'],
  states: [],
  responsive: 'container',
  focus: 'native',
  role: 'navigation',
});
