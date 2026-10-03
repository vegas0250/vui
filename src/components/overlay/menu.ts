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

export class VMenuItem extends VuiElement {
  declare label: string;
  declare command: string;
  declare shortcut: string;
  declare disabled: boolean;
  declare checked: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['label', 'command', 'shortcut', 'disabled', 'checked'];
  }

  protected template(): string {
    return `
      <span class="mark" part="check" aria-hidden="true"></span>
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
      :host(:focus) { background: var(--vui-color-surface-hover); }
      :host(:focus-visible) {
        outline: var(--vui-focus-ring);
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      :host([disabled]) { opacity: 0.45; cursor: not-allowed; }
      .mark {
        width: 1em;
        flex: 0 0 auto;
        text-align: center;
      }
      :host([checked]) .mark::before { content: "✓"; }
      .label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .shortcut {
        margin-inline-start: auto;
        color: var(--vui-color-text-muted);
        font-size: var(--vui-font-size-sm);
      }
      .caret {
        margin-inline-start: auto;
        width: 0.4em;
        height: 0.4em;
        border-block-start: var(--vui-stroke-width) solid currentColor;
        border-inline-end: var(--vui-stroke-width) solid currentColor;
        transform: rotate(45deg);
      }
      :host-context([dir="rtl"]) .caret { transform: rotate(-135deg); }
    `;
  }

  protected afterRender(): void {
    this.addEventListener('click', (event) => {
      if (!this.unavailable) return;
      event.preventDefault();
      event.stopPropagation();
    });
    this.addEventListener('pointerenter', () => {
      if (this.unavailable) return;
      const menu = this.parentMenu();
      menu?.highlight(this);
    });
  }

  protected sync(): void {
    const label = this.getAttribute('label') ?? '';
    this.qs('.label').textContent = label;
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
    return `<div class="menu" part="menu" role="presentation"><slot></slot></div>`;
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
    `;
  }

  protected afterRender(): void {
    this.addEventListener('keydown', (event) => this.onKeydown(event));
    this.addEventListener('click', (event) => {
      const item = event.target;
      if (!(item instanceof VMenuItem) || item.parentElement !== this || item.unavailable) return;
      if (item.submenu()) {
        this.openSubmenu(item);
        return;
      }
      const id = item.getAttribute('command');
      if (id && this.commands && !runCommand(this.commands, id)) return;
      this.root().closeTree();
    });
    this.qs('slot').addEventListener('slotchange', () => this.refreshItems());
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

  showAt(x: number, y: number, options?: { group?: string; placement?: Placement }): void {
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
    first?.focus();
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
    applyRovingTabIndex(items, items.indexOf(item));
    if (document.activeElement !== item) item.focus();
  }

  private hide(): void {
    if (!this.hasAttribute('open') && !this.releaseOverlay) return;
    this.removeAttribute('open');
    this.setAttribute('aria-hidden', 'true');
    if (this.parentElement instanceof VMenuItem) this.parentElement.setAttribute('aria-expanded', 'false');
    const release = this.releaseOverlay;
    this.releaseOverlay = null;
    release?.();
    this.dispatchEvent(new Event('close'));
  }

  private items(): VMenuItem[] {
    reportUnexpectedChildren(this, ['vui-menu-item']);
    return ownedChildren(this, 'vui-menu-item', (node): node is VMenuItem => node instanceof VMenuItem);
  }

  private enabledItems(): VMenuItem[] {
    return this.items().filter((item) => !item.unavailable);
  }

  private refreshItems(): void {
    for (const item of this.items()) {
      if (item.getAttribute('slot') !== null && item.getAttribute('slot') !== '') item.removeAttribute('slot');
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

  private openSubmenu(item: VMenuItem): void {
    const nested = item.submenu();
    if (!nested) return;
    item.setAttribute('aria-expanded', 'true');
    const rect = item.getBoundingClientRect();
    const rtl = isRtl(this);
    nested.showAt(rtl ? rect.left : rect.right, rect.top, {
      group: this.groupId,
      placement: rtl ? 'left-start' : 'right-start',
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
      this.openSubmenu(current);
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
    item.focus();
  }
}

reflectStrings(VMenuItem, ['label', 'command', 'shortcut']);
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
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'checked', kind: 'boolean', reflected: true },
  ],
  events: ['click'],
  slots: ['submenu'],
  parts: ['check', 'label', 'shortcut', 'caret'],
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
  slots: [''],
  parts: ['menu'],
  methods: ['showAt', 'close', 'bindTo'],
  keyboard: ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', 'Space', 'Escape'],
  states: [],
  responsive: 'viewport',
  focus: 'roving',
  role: 'presentation',
});
