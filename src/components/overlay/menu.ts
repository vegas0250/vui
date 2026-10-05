import '../foundation/icon';
import { ownedChildren } from '../../composition/dom';
import { reportUnexpectedChildren } from '../../core/dev';
import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { runCommand, type CommandRegistry } from '../../interaction/commands';
import { bindContextMenu } from '../../interaction/context-menu';
import { applyRovingTabIndex, isActivation, isRtl, moveInList } from '../../interaction/keyboard';
import { placeLayer, pushOverlay, type Placement } from '../../interaction/overlay';

let menuSeq = 0;

function itemFromPointer(event: Event): VMenuItem | null {
  const found = event.composedPath().find((node): node is VMenuItem => node instanceof VMenuItem);
  if (found) return found;
  const target = event.target;
  if (target instanceof VMenuItem) return target;
  if (target instanceof Node) {
    const root = target.getRootNode();
    if (root instanceof ShadowRoot && root.host instanceof VMenuItem) return root.host;
  }
  return null;
}

export class VMenuItem extends VuiElement {
  declare label: string;
  declare command: string;
  declare shortcut: string;
  declare icon: string;
  declare disabled: boolean;
  declare checked: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['label', 'command', 'shortcut', 'icon', 'disabled', 'checked'];
  }

  protected template(): string {
    return `
      <span class="mark" part="check" aria-hidden="true"><vui-icon part="icon" hidden></vui-icon></span>
      <span class="label" part="label"></span>
      <span class="shortcut" part="shortcut" hidden></span>
      <span class="caret" part="caret" hidden aria-hidden="true"></span>
      <slot name="submenu"></slot>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: flex;
        align-items: center;
        gap: var(--vui-space-sm);
        min-width: 0;
        max-width: 100%;
        min-height: var(--vui-size-control);
        padding-inline: var(--vui-space-sm);
        border-radius: var(--vui-radius-sm);
        cursor: pointer;
        user-select: none;
      }
      :host(:focus),
      :host([data-current]) { background: var(--vui-color-surface-hover); }
      :host(:focus-visible) {
        outline: var(--vui-focus-ring);
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      :host([disabled]) { opacity: 0.45; cursor: not-allowed; }
      .mark {
        width: 1em;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      :host([checked]) .mark::before { content: "✓"; }
      vui-icon { width: 1em; height: 1em; color: var(--vui-color-primary); }
      :host([disabled]) vui-icon { color: inherit; }
      :host([checked]) vui-icon { display: none; }
      .label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .shortcut {
        margin-inline-start: auto;
        color: var(--vui-color-text-muted);
        font-size: var(--vui-font-size-sm);
      }
      .caret {
        margin-inline-start: var(--vui-space-sm);
        width: 0.4em;
        height: 0.4em;
        border-block-start: var(--vui-stroke-width) solid currentColor;
        border-inline-end: var(--vui-stroke-width) solid currentColor;
        transform: rotate(45deg);
      }
      :host(:not(:has(.shortcut:not([hidden])))) .caret { margin-inline-start: auto; }
      :host([layout="stack"]) {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        min-width: 0;
        padding: var(--vui-space-2xs);
        text-align: center;
      }
      :host([layout="stack"]) .mark { width: auto; }
      :host([layout="stack"]) .label {
        width: 100%;
        font-size: var(--vui-font-size-sm);
        line-height: 1.15;
        white-space: normal;
        text-align: center;
      }
      :host([layout="stack"]) .shortcut,
      :host([layout="stack"]) .caret { display: none; }
      :host-context([dir="rtl"]) .caret { transform: rotate(-135deg); }
    `;
  }

  protected afterRender(): void {
    this.addEventListener('click', (event) => {
      if (!this.unavailable) return;
      event.preventDefault();
      event.stopPropagation();
    });
    const enter = () => {
      if (this.unavailable) return;
      this.parentMenu()?.hoverItem(this);
    };
    this.addEventListener('pointerenter', enter);
    this.shadow.addEventListener('pointerover', enter);
    this.shadow.addEventListener('pointermove', enter);
  }

  protected sync(): void {
    const label = this.getAttribute('label') ?? '';
    this.qs('.label').textContent = label;
    const iconName = this.getAttribute('icon') ?? '';
    const icon = this.qs<HTMLElement>('vui-icon');
    icon.toggleAttribute('hidden', iconName.length === 0 || this.hasAttribute('checked'));
    if (iconName) icon.setAttribute('name', iconName);
    const shortcut = this.shortcutText();
    const shortcutEl = this.qs<HTMLElement>('.shortcut');
    shortcutEl.textContent = shortcut;
    shortcutEl.hidden = shortcut.length === 0;
    const nested = this.submenu();
    this.qs<HTMLElement>('.caret').hidden = !nested;
    this.setAttribute('role', 'menuitem');
    if (!this.id) this.id = `vui-menu-item-${++menuSeq}`;
    const disabled = this.unavailable;
    this.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (this.hasAttribute('checked')) this.setAttribute('aria-checked', 'true');
    else this.removeAttribute('aria-checked');
    if (nested) this.setAttribute('aria-haspopup', 'menu');
    else this.removeAttribute('aria-haspopup');
    if (this.tabIndex !== 0) this.tabIndex = -1;
  }

  get unavailable(): boolean {
    if (this.hasAttribute('disabled')) return true;
    const id = this.getAttribute('command');
    if (!id) return false;
    const command = this.commandMenu()?.commands?.get(id);
    return command?.enabled === false;
  }

  submenu(): VMenu | null {
    const nested = [...this.querySelectorAll(':scope > vui-menu')].find((node) => node instanceof VMenu);
    return nested instanceof VMenu ? nested : null;
  }

  refresh(): void {
    this.sync();
  }

  private shortcutText(): string {
    const own = this.getAttribute('shortcut');
    if (own) return own;
    const id = this.getAttribute('command');
    if (!id) return '';
    return this.commandMenu()?.commands?.get(id)?.shortcut ?? '';
  }

  private parentMenu(): VMenu | null {
    const parent = this.parentElement?.closest('vui-menu');
    return parent instanceof VMenu ? parent : null;
  }

  private commandMenu(): VMenu | null {
    let node: HTMLElement | null = this.parentElement;
    while (node) {
      if (node instanceof VMenu && node.commands) return node;
      node = node.parentElement;
    }
    return this.parentMenu();
  }
}

export class VMenu extends VuiElement {
  declare label: string;

  private registry: CommandRegistry | null = null;
  private releaseOverlay: (() => void) | null = null;
  private groupId = '';
  private unbind: (() => void) | null = null;
  private hovered: VMenuItem | null = null;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  get commands(): CommandRegistry | null {
    if (this.registry) return this.registry;
    const parent = this.parentElement?.closest('vui-menu');
    return parent instanceof VMenu ? parent.commands : null;
  }

  set commands(value: CommandRegistry | null) {
    this.registry = value;
    for (const item of this.items()) item.refresh();
  }

  protected template(): string {
    return `<div class="menu" part="menu" role="presentation"><slot></slot><div class="bar" part="bar"><slot name="bar"></slot></div></div>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: none;
        position: fixed;
        z-index: var(--vui-overlay-z, var(--vui-z-dropdown));
        box-sizing: border-box;
        width: max-content;
        min-width: min(var(--vui-menu-inline), calc(100vw - var(--vui-overlay-gutter) * 2));
        max-width: calc(100vw - var(--vui-overlay-gutter) * 2);
        max-height: min(var(--vui-overlay-max-block), var(--vui-menu-block));
        margin: 0;
        padding: var(--vui-space-2xs);
        overflow: auto;
        background: var(--vui-color-surface-raised);
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
        box-shadow: var(--vui-shadow-lg);
      }
      :host([open]) { display: block; }
      :host(:focus) { outline: none; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
      .menu { display: flex; flex-direction: column; min-width: 0; }
      .bar { display: none; }
      :host(:has([slot="bar"])) .bar {
        display: flex;
        gap: 2px;
        min-width: 18rem;
        margin-top: var(--vui-space-2xs);
        padding-top: var(--vui-space-2xs);
        border-top: var(--vui-border-width) solid var(--vui-color-border);
      }
      ::slotted(hr) {
        width: auto;
        align-self: stretch;
        height: 0;
        margin: var(--vui-space-2xs) var(--vui-space-xs);
        border: 0;
        border-block-start: var(--vui-border-width) solid var(--vui-color-border);
      }
    `;
  }

  protected afterRender(): void {
    this.addEventListener('keydown', (event) => this.onKeydown(event));
    this.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) event.preventDefault();
    });
    this.addEventListener('click', (event) => {
      if (event.button !== 0) return;
      const item = event.composedPath().find((node): node is VMenuItem => node instanceof VMenuItem);
      if (!item || item.parentElement !== this || item.unavailable) return;
      if (item.submenu()) {
        this.hoverItem(item);
        return;
      }
      const id = item.getAttribute('command');
      if (id && this.commands && !runCommand(this.commands, id)) return;
      this.root().closeTree();
    });
    this.qs('slot').addEventListener('slotchange', () => this.refreshItems());
    this.addEventListener('pointermove', (event) => {
      if (!this.hasAttribute('open')) return;
      const item = itemFromPointer(event);
      if (!item || item.unavailable) return;
      const menu = item.parentElement;
      if (menu instanceof VMenu) menu.hoverItem(item);
    });
  }

  protected sync(): void {
    const label = this.getAttribute('label') ?? 'Menu';
    this.setAttribute('role', 'menu');
    this.setAttribute('aria-label', label);
    this.toggleAttribute('aria-hidden', !this.hasAttribute('open'));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unbind?.();
    this.unbind = null;
    this.hide();
  }

  /** Right click and Shift+F10 on `target` open this menu. */
  bindTo(target: HTMLElement): () => void {
    this.unbind?.();
    this.unbind = bindContextMenu(target, (point) => this.showAt(point.x, point.y));
    return this.unbind;
  }

  showAt(x: number, y: number, options?: { group?: string; placement?: Placement; moveFocus?: boolean }): void {
    if (!this.groupId) this.groupId = `vui-menu-${++menuSeq}`;
    const group = options?.group ?? this.groupId;
    this.groupId = group;
    this.removeAttribute('aria-hidden');
    this.setAttribute('open', '');
    this.refreshItems();
    placeLayer(this, { x, y }, options?.placement ?? 'bottom-start');
    if (!this.releaseOverlay) {
      this.releaseOverlay = pushOverlay({
        owner: this,
        kind: 'popup',
        dismissable: true,
        dismissOnOutside: true,
        restoreFocus: true,
        group,
        onDismiss: () => this.hide(),
      });
    }
    const enabled = this.enabledItems();
    const items = this.items();
    const first = enabled[0];
    applyRovingTabIndex(items, first ? items.indexOf(first) : -1);
    if (options?.moveFocus !== false && first) {
      first.toggleAttribute('data-current', true);
      first.focus({ preventScroll: true });
    }
  }

  close(): void {
    this.root().closeTree();
  }

  closeTree(): void {
    const nested = [...this.querySelectorAll('vui-menu')].filter((node): node is VMenu => node instanceof VMenu);
    for (const menu of nested.reverse()) menu.hide();
    this.hide();
  }

  highlight(item: VMenuItem): void {
    const items = this.items();
    for (const other of items) other.toggleAttribute('data-current', other === item);
    applyRovingTabIndex(items, items.indexOf(item));
    if (document.activeElement !== item) item.focus({ preventScroll: true });
  }

  /** Hover opens a nested menu immediately and closes the siblings. */
  hoverItem(item: VMenuItem): void {
    if (item.parentElement !== this || item.unavailable) return;
    const nested = item.submenu();
    if (this.hovered === item && (!nested || nested.hasAttribute('open'))) return;
    this.hovered = item;
    for (const other of this.items()) other.toggleAttribute('data-current', other === item);
    const items = this.items();
    applyRovingTabIndex(items, items.indexOf(item));
    for (const other of items) {
      if (other === item) continue;
      const sibling = other.submenu();
      if (sibling?.hasAttribute('open')) sibling.hide();
    }
    if (nested) this.openSubmenu(item, false);
  }

  private hide(): void {
    if (!this.hasAttribute('open') && !this.releaseOverlay) return;
    this.removeAttribute('open');
    this.setAttribute('aria-hidden', 'true');
    this.hovered = null;
    for (const item of this.items()) item.removeAttribute('data-current');
    if (this.parentElement instanceof VMenuItem) this.parentElement.setAttribute('aria-expanded', 'false');
    const release = this.releaseOverlay;
    this.releaseOverlay = null;
    release?.();
    this.dispatchEvent(new Event('close'));
  }

  private items(): VMenuItem[] {
    reportUnexpectedChildren(this, ['vui-menu-item', 'hr']);
    return ownedChildren(this, 'vui-menu-item', (node): node is VMenuItem => node instanceof VMenuItem);
  }

  private enabledItems(): VMenuItem[] {
    return this.items().filter((item) => !item.unavailable);
  }

  private refreshItems(): void {
    for (const item of this.items()) {
      const slot = item.getAttribute('slot');
      if (slot && slot !== 'bar') item.removeAttribute('slot');
      item.refresh();
    }
  }

  private root(): VMenu {
    let current: VMenu = this;
    let parent = this.parentElement?.closest('vui-menu');
    while (parent instanceof VMenu) {
      current = parent;
      parent = parent.parentElement?.closest('vui-menu');
    }
    return current;
  }

  private openSubmenu(item: VMenuItem, moveFocus: boolean): void {
    const nested = item.submenu();
    if (!nested) return;
    for (const other of this.items()) {
      if (other === item) continue;
      const sibling = other.submenu();
      if (sibling?.hasAttribute('open')) sibling.hide();
    }
    if (nested.hasAttribute('open')) return;
    item.setAttribute('aria-expanded', 'true');
    const rect = item.getBoundingClientRect();
    const rtl = isRtl(this);
    nested.showAt(rtl ? rect.left : rect.right, rect.top, {
      group: this.groupId,
      placement: rtl ? 'left-start' : 'right-start',
      moveFocus,
    });
  }

  private onKeydown(event: KeyboardEvent): void {
    const target = event.target;
    if (target instanceof VMenuItem && target.parentElement !== this) return;
    if (target instanceof VMenu && target !== this) return;
    if (event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
      this.root().closeTree();
      return;
    }
    const items = this.items();
    const enabled = this.enabledItems();
    const current = enabled.find((item) => item === document.activeElement) ?? enabled[0];
    if (!current) return;
    const index = enabled.indexOf(current);
    const rtl = isRtl(this);
    const closeKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    if (event.key === closeKey) {
      if (!(this.parentElement instanceof VMenuItem)) return;
      event.preventDefault();
      event.stopPropagation();
      const parent = this.parentElement;
      this.hide();
      parent.focus();
      return;
    }
    if (event.key === openKey) {
      if (!current.submenu()) return;
      event.preventDefault();
      event.stopPropagation();
      this.openSubmenu(current, true);
      return;
    }
    if (isActivation(event)) {
      event.preventDefault();
      event.stopPropagation();
      current.click();
      return;
    }
    const next = moveInList(index, enabled.length, event.key, { orientation: 'vertical', pageSize: 5 });
    if (next === null) return;
    event.preventDefault();
    event.stopPropagation();
    const item = enabled[next];
    if (!item) return;
    applyRovingTabIndex(items, items.indexOf(item));
    item.focus({ preventScroll: true });
  }
}

reflectStrings(VMenuItem, ['label', 'command', 'shortcut', 'icon']);
reflectBooleans(VMenuItem, ['disabled', 'checked']);
reflectStrings(VMenu, ['label']);
defineElement('vui-menu-item', VMenuItem);
defineElement('vui-menu', VMenu);

registerContract({
  element: 'vui-menu-item',
  className: 'VMenuItem',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'command', kind: 'string', reflected: true },
    { name: 'shortcut', kind: 'string', reflected: true },
    { name: 'icon', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'checked', kind: 'boolean', reflected: true },
    { name: 'layout', kind: 'string', reflected: false },
  ],
  events: ['click'],
  slots: ['submenu'],
  parts: ['check', 'icon', 'label', 'shortcut', 'caret'],
  methods: [],
  keyboard: ['Enter', 'Space'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'roving',
});

registerContract({
  element: 'vui-menu',
  className: 'VMenu',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: ['close'],
  slots: ['', 'bar'],
  parts: ['menu', 'bar'],
  methods: ['showAt', 'close', 'bindTo'],
  keyboard: ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', 'Space', 'Escape'],
  states: [],
  responsive: 'viewport',
  focus: 'roving',
  role: 'presentation',
});
