import { reportUnexpectedChildren } from '../../core/dev';
import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { emitChange } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { isRtl, moveInList } from '../../interaction/keyboard';

export class VNavItem extends VuiElement {
  declare href: string;
  declare disabled: boolean;
  declare selected: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['href', 'disabled', 'selected', 'data-current'];
  }

  protected template(): string {
    return `<a part="link"><slot></slot></a>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: flex; min-width: 0; max-width: 100%; }
      a {
        display: flex;
        align-items: center;
        width: 100%;
        min-width: 0;
        gap: var(--vui-nav-item-gap, var(--vui-space-sm));
        min-height: var(--vui-size-control);
        padding-inline: var(--vui-space-sm);
        border-radius: var(--vui-radius);
        color: var(--vui-color-text);
        text-decoration: none;
        overflow-wrap: anywhere;
        cursor: pointer;
      }
      a:hover { background: var(--vui-color-surface-hover); }
      :host([selected]) a {
        background: var(--vui-color-surface-hover);
        color: var(--vui-color-text);
        font-weight: var(--vui-font-weight-strong);
      }
      a:focus { outline: none; }
      a:focus-visible { outline: var(--vui-focus-ring); outline-offset: calc(var(--vui-focus-offset) * -1); }
      :host([disabled]) a { opacity: 0.5; cursor: not-allowed; }
    `;
  }

  protected afterRender(): void {
    this.qs('a').addEventListener('click', (event) => {
      if (this.isDisabled()) event.preventDefault();
    });
  }

  protected sync(): void {
    const link = this.qs<HTMLAnchorElement>('a');
    const disabled = this.isDisabled();
    const href = this.getAttribute('href');
    if (href && !disabled) link.href = href;
    else link.removeAttribute('href');
    link.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (this.hasAttribute('selected')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    link.tabIndex = !disabled && this.hasAttribute('data-current') ? 0 : -1;
  }

  override focus(options?: FocusOptions): void {
    this.qs<HTMLElement>('a').focus(options);
  }
}

reflectStrings(VNavItem, ['href']);
reflectBooleans(VNavItem, ['disabled', 'selected']);
defineElement('vui-nav-item', VNavItem);

registerContract({
  element: 'vui-nav-item',
  className: 'VNavItem',
  attributes: [
    { name: 'href', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'selected', kind: 'boolean', reflected: true },
  ],
  events: ['click'],
  slots: [''],
  parts: ['link'],
  methods: [],
  keyboard: ['Enter'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'roving',
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
      :host { display: block; min-width: 0; max-width: 100%; container-type: inline-size; container-name: vui-nav; }
      nav { display: flex; flex-direction: column; gap: var(--vui-nav-gap, var(--vui-space-xs)); min-width: 0; }
      :host([orientation="horizontal"]) nav { flex-direction: row; flex-wrap: wrap; }
      @container vui-nav (max-width: 22rem) {
        nav { flex-direction: column; }
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot').addEventListener('slotchange', () => this.sync());
    this.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.localName !== 'vui-nav-item' || target.parentElement !== this) return;
      if (target.hasAttribute('disabled')) {
        event.preventDefault();
        return;
      }
      for (const item of this.items()) item.toggleAttribute('selected', item === target);
      emitChange(this);
    });
    this.addEventListener('keydown', (event) => {
      const items = this.enabled();
      if (items.length === 0) return;
      const current = Math.max(0, items.findIndex((item) => item === document.activeElement || item.hasAttribute('data-current')));
      const orientation = this.getAttribute('orientation') === 'horizontal' ? 'horizontal' : 'vertical';
      const nextIndex = moveInList(current, items.length, event.key, { orientation, loop: true, rtl: isRtl(this) });
      if (nextIndex === null) return;
      event.preventDefault();
      const next = items[nextIndex];
      if (!next) return;
      for (const item of this.items()) item.toggleAttribute('selected', item === next);
      this.roving(next);
      next.focus();
      emitChange(this);
    });
  }

  protected sync(): void {
    reportUnexpectedChildren(this, ['vui-nav-item']);
    const nav = this.qs('nav');
    const label = this.getAttribute('label') ?? '';
    if (label) nav.setAttribute('aria-label', label);
    else nav.removeAttribute('aria-label');
    const current = this.enabled().find((item) => item.hasAttribute('selected')) ?? this.enabled()[0];
    this.roving(current);
  }

  private items(): HTMLElement[] {
    return [...this.children].filter((node): node is HTMLElement => node.localName === 'vui-nav-item');
  }

  private enabled(): HTMLElement[] {
    return this.items().filter((item) => !item.hasAttribute('disabled'));
  }

  private roving(active: HTMLElement | undefined): void {
    for (const item of this.items()) item.toggleAttribute('data-current', item === active);
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
  focus: 'roving',
  role: 'navigation',
});
