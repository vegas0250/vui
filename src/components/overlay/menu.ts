import '../foundation/icon';
import { ownedChildren } from '../../composition/dom';
import { reportUnexpectedChildren } from '../../utils/dev';
import { registerContract } from '../../contract/registry';
import { defineElement } from '../../utils/define';
import { VuiElement } from '../../utils/element';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';
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
  declare href: string;
  declare disabled: boolean;
  declare checked: boolean;
  declare selected: boolean;
  declare expanded: boolean;
  declare variant: string;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['label', 'command', 'shortcut', 'icon', 'href', 'disabled', 'checked', 'selected', 'expanded', 'variant'];
  }

  protected template(): string {
    return `
      <div class="row" part="row">
        <span class="mark" part="check" aria-hidden="true"><vui-icon part="icon" hidden></vui-icon></span>
        <a class="label" part="label"></a>
        <span class="shortcut" part="shortcut" hidden></span>
        <button type="button" class="caret" part="caret" hidden aria-hidden="true" tabindex="-1">
          <vui-icon name="chevron-right"></vui-icon>
        </button>
      </div>
      <slot name="submenu"></slot>
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
        border-radius: var(--vui-radius-field, var(--vui-radius-sm));
        cursor: pointer;
        user-select: none;
      }
      .row {
        display: flex;
        align-items: center;
        gap: var(--vui-space-sm);
        min-width: 0;
        min-height: var(--vui-size-control);
        padding-inline: var(--vui-space-sm);
        border-radius: inherit;
        transition: background-color var(--vui-duration) var(--vui-easing), border-color var(--vui-duration) var(--vui-easing);
      }
      :host(:focus) .row,
      :host([data-current]) .row { background: var(--vui-color-hover, var(--vui-color-surface-hover)); }
      :host([selected]) .row {
        background: var(--vui-color-selected, var(--vui-color-hover, var(--vui-color-surface-hover)));
        box-shadow: inset var(--vui-border-width-accent) 0 0 var(--vui-color-focus);
      }
      :host-context([dir="rtl"]):host([selected]) .row {
        box-shadow: inset calc(var(--vui-border-width-accent) * -1) 0 0 var(--vui-color-focus);
      }
      :host(:focus-visible) {
        outline: var(--vui-focus-ring);
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      :host([disabled]) { opacity: var(--vui-opacity-disabled, 0.55); cursor: not-allowed; }
      :host([variant="danger"]) { color: var(--vui-color-danger); }
      :host([variant="danger"]) vui-icon { color: var(--vui-color-danger); }
      :host([checked]) .row { box-shadow: inset var(--vui-border-width-accent) 0 0 var(--vui-color-focus); }
      :host-context([dir="rtl"]):host([checked]) .row { box-shadow: inset calc(var(--vui-border-width-accent) * -1) 0 0 var(--vui-color-focus); }
      .mark {
        width: 1em;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      :host([checked]) .mark::before { content: "✓"; }
      vui-icon { width: 1em; height: 1em; color: var(--vui-color-interactive-text, var(--vui-color-primary)); }
      :host([disabled]) vui-icon { color: inherit; }
      :host([checked]) .mark > vui-icon { display: none; }
      .label {
        min-width: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: inherit;
        text-decoration: none;
        cursor: inherit;
      }
      .shortcut {
        margin-inline-start: auto;
        color: var(--vui-color-text-muted);
        font-size: var(--vui-font-size-sm);
      }
      .caret {
        appearance: none;
        margin: 0;
        margin-inline-start: var(--vui-space-2xs);
        padding: 0;
        inline-size: 1.25em;
        block-size: 1.25em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: var(--vui-radius-sm, var(--vui-radius));
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .caret:hover { background: var(--vui-color-hover, var(--vui-color-surface-hover)); }
      .caret:focus { outline: none; }
      .caret:focus-visible { outline: var(--vui-focus-ring); outline-offset: calc(var(--vui-focus-offset) * -1); }
      .caret vui-icon {
        width: 0.85em;
        height: 0.85em;
        transition: transform var(--vui-duration) var(--vui-easing);
      }
      :host([expanded]) .caret vui-icon { transform: rotate(90deg); }
      :host-context([dir="rtl"]) .caret vui-icon { transform: scaleX(-1); }
      :host-context([dir="rtl"]):host([expanded]) .caret vui-icon { transform: scaleX(-1) rotate(90deg); }
      :host(:not(:has(.shortcut:not([hidden]))) ) .caret { margin-inline-start: auto; }
      :host([layout="stack"]) .row {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        gap: var(--vui-space-2xs);
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
      ::slotted(vui-menu[inline]) {
        margin-inline-start: var(--vui-space-md);
        padding-inline-start: var(--vui-space-sm);
        border-inline-start: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
      }
    `;
  }

  protected afterRender(): void {
    this.addEventListener('click', (event) => {
      if (!this.unavailable) return;
      event.preventDefault();
      event.stopPropagation();
    });
    this.qs('.caret').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.unavailable || !this.submenu()) return;
      this.toggleExpanded();
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
    const labelEl = this.qs<HTMLAnchorElement>('.label');
    labelEl.textContent = label;
    const href = this.getAttribute('href');
    if (href && !this.unavailable) {
      labelEl.href = href;
      labelEl.setAttribute('role', 'none');
    } else {
      labelEl.removeAttribute('href');
      labelEl.removeAttribute('role');
    }
    const iconName = this.getAttribute('icon') ?? '';
    const icon = this.qs<HTMLElement>('.mark > vui-icon');
    icon.toggleAttribute('hidden', iconName.length === 0 || this.hasAttribute('checked'));
    if (iconName) icon.setAttribute('name', iconName);
    const shortcut = this.shortcutText();
    const shortcutEl = this.qs<HTMLElement>('.shortcut');
    shortcutEl.textContent = shortcut;
    shortcutEl.hidden = shortcut.length === 0;
    const nested = this.submenu();
    const caret = this.qs<HTMLButtonElement>('.caret');
    caret.hidden = !nested;
    caret.disabled = this.unavailable;
    caret.setAttribute('aria-hidden', nested ? 'false' : 'true');
    caret.setAttribute('aria-label', nested ? 'Toggle submenu' : '');
    caret.tabIndex = nested && !this.unavailable ? 0 : -1;
    this.setAttribute('role', 'menuitem');
    if (!this.id) this.id = `vui-menu-item-${++menuSeq}`;
    const disabled = this.unavailable;
    this.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (this.hasAttribute('checked')) this.setAttribute('aria-checked', 'true');
    else this.removeAttribute('aria-checked');
    if (this.hasAttribute('selected')) this.setAttribute('aria-current', 'page');
    else this.removeAttribute('aria-current');
    if (nested) {
      this.setAttribute('aria-haspopup', 'menu');
      this.setAttribute('aria-expanded', this.hasAttribute('expanded') ? 'true' : 'false');
    } else {
      this.removeAttribute('aria-haspopup');
      this.removeAttribute('aria-expanded');
    }
    if (nested && this.isInlineTree()) {
      nested.toggleAttribute('inline', true);
      nested.toggleAttribute('open', this.hasAttribute('expanded'));
      if (!nested.getAttribute('slot')) nested.setAttribute('slot', 'submenu');
    }
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

  toggleExpanded(force?: boolean): void {
    const nested = this.submenu();
    if (!nested) return;
    const next = force ?? !this.hasAttribute('expanded');
    this.toggleAttribute('expanded', next);
    if (this.isInlineTree()) {
      nested.toggleAttribute('inline', true);
      nested.toggleAttribute('open', next);
      this.sync();
      return;
    }
    const parent = this.parentMenu();
    if (!parent) return;
    if (next) parent.openSubmenu(this, false);
    else nested.hidePublic();
  }

  refresh(): void {
    // Parent menus refresh children during their own connect; the child shadow
    // may not exist yet (custom element connect order is parent-first).
    if (!this.isReady()) return;
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

  private isInlineTree(): boolean {
    return this.parentMenu()?.isInline() ?? false;
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
  declare orientation: string;

  private registry: CommandRegistry | null = null;
  private releaseOverlay: (() => void) | null = null;
  private groupId = '';
  private unbind: (() => void) | null = null;
  private hovered: VMenuItem | null = null;

  static get observedAttributes(): string[] {
    return ['label', 'orientation', 'inline', 'open'];
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

  isInline(): boolean {
    return this.hasAttribute('inline');
  }

  orientationValue(): 'vertical' | 'horizontal' {
    return this.getAttribute('orientation') === 'horizontal' ? 'horizontal' : 'vertical';
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
        background: var(--vui-color-popover, var(--vui-color-surface-raised));
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
        border-radius: var(--vui-radius-box, var(--vui-radius));
        box-shadow: var(--vui-shadow-lg);
      }
      :host([open]) { display: block; }
      :host([inline]) {
        position: static;
        z-index: auto;
        width: auto;
        min-width: 0;
        max-width: 100%;
        max-height: none;
        padding: 0;
        overflow: visible;
        background: transparent;
        border: 0;
        border-radius: 0;
        box-shadow: none;
      }
      :host(:focus) { outline: none; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
      .menu { display: flex; flex-direction: column; min-width: 0; gap: var(--vui-space-2xs); }
      :host([orientation="horizontal"]) .menu { flex-direction: row; flex-wrap: wrap; align-items: center; }
      .bar { display: none; }
      :host(:has([slot="bar"])) .bar {
        display: flex;
        gap: var(--vui-space-2xs);
        min-width: min(18rem, 100%);
        margin-top: var(--vui-space-2xs);
        padding-top: var(--vui-space-2xs);
        border-top: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
      }
      ::slotted(hr) {
        width: auto;
        align-self: stretch;
        height: 0;
        margin: var(--vui-space-2xs) var(--vui-space-xs);
        border: 0;
        border-block-start: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
      }
      :host([orientation="horizontal"]) ::slotted(hr) {
        width: 0;
        height: auto;
        align-self: stretch;
        margin: var(--vui-space-xs) var(--vui-space-2xs);
        border-block-start: 0;
        border-inline-start: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
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
      const path = event.composedPath();
      if (path.some((node) => node instanceof HTMLElement && node.classList?.contains('caret'))) return;
      const item = path.find((node): node is VMenuItem => node instanceof VMenuItem);
      if (!item || item.parentElement !== this || item.unavailable) return;
      if (item.submenu()) {
        if (this.isInline()) {
          item.toggleExpanded();
          return;
        }
        this.hoverItem(item);
        return;
      }
      const href = item.getAttribute('href');
      if (href) {
        if (!this.isInline()) this.root().closeTree();
        return;
      }
      const id = item.getAttribute('command');
      if (id && this.commands && !runCommand(this.commands, id)) return;
      if (!this.isInline()) this.root().closeTree();
    });
    this.qs('slot').addEventListener('slotchange', () => this.refreshItems());
    this.addEventListener('pointermove', (event) => {
      if (this.isInline() || !this.hasAttribute('open')) return;
      const item = itemFromPointer(event);
      if (!item || item.unavailable) return;
      const menu = item.parentElement;
      if (menu instanceof VMenu) menu.hoverItem(item);
    });
  }

  protected sync(): void {
    const label = this.getAttribute('label') ?? 'Menu';
    this.setAttribute('role', this.orientationValue() === 'horizontal' ? 'menubar' : 'menu');
    this.setAttribute('aria-label', label);
    if (this.isInline() && !(this.parentElement instanceof VMenuItem)) this.toggleAttribute('open', true);
    const visible = this.hasAttribute('open');
    this.toggleAttribute('aria-hidden', !visible);
    this.refreshItems();
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
    if (this.isInline()) {
      this.setAttribute('open', '');
      this.refreshItems();
      return;
    }
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
    if (this.isInline()) return;
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
    if (this.isInline() || item.parentElement !== this || item.unavailable) return;
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

  /** Used by nested items when collapsing a flyout submenu. */
  hidePublic(): void {
    this.hide();
  }

  openSubmenu(item: VMenuItem, moveFocus: boolean): void {
    const nested = item.submenu();
    if (!nested) return;
    for (const other of this.items()) {
      if (other === item) continue;
      const sibling = other.submenu();
      if (sibling?.hasAttribute('open')) sibling.hide();
    }
    item.setAttribute('expanded', '');
    if (this.isInline()) {
      nested.toggleAttribute('inline', true);
      nested.setAttribute('open', '');
      item.refresh();
      return;
    }
    if (nested.hasAttribute('open')) return;
    item.setAttribute('aria-expanded', 'true');
    const rect = item.getBoundingClientRect();
    const rtl = isRtl(this);
    const horizontal = this.orientationValue() === 'horizontal';
    nested.showAt(
      horizontal ? rect.left : rtl ? rect.left : rect.right,
      horizontal ? rect.bottom : rect.top,
      {
        group: this.groupId,
        placement: horizontal ? 'bottom-start' : rtl ? 'left-start' : 'right-start',
        moveFocus,
      },
    );
  }

  private hide(): void {
    if (this.isInline()) {
      if (this.parentElement instanceof VMenuItem) {
        this.removeAttribute('open');
        this.parentElement.removeAttribute('expanded');
        this.parentElement.setAttribute('aria-expanded', 'false');
      }
      return;
    }
    if (!this.hasAttribute('open') && !this.releaseOverlay) return;
    this.removeAttribute('open');
    this.setAttribute('aria-hidden', 'true');
    this.hovered = null;
    for (const item of this.items()) {
      item.removeAttribute('data-current');
      item.removeAttribute('expanded');
    }
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
      if (this.isInline() && item.submenu()) item.submenu()?.toggleAttribute('inline', true);
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

  private onKeydown(event: KeyboardEvent): void {
    const target = event.target;
    if (target instanceof VMenuItem && target.parentElement !== this) return;
    if (target instanceof VMenu && target !== this) return;
    if (event.key === 'Tab') {
      if (this.isInline()) return;
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
    const horizontal = this.orientationValue() === 'horizontal';
    const closeKey = horizontal ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const openKey = horizontal ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    if (event.key === closeKey) {
      if (this.isInline() && current.hasAttribute('expanded')) {
        event.preventDefault();
        event.stopPropagation();
        current.toggleExpanded(false);
        return;
      }
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
      if (this.isInline()) current.toggleExpanded(true);
      else this.openSubmenu(current, true);
      return;
    }
    if (isActivation(event)) {
      event.preventDefault();
      event.stopPropagation();
      current.click();
      return;
    }
    const next = moveInList(index, enabled.length, event.key, {
      orientation: horizontal ? 'horizontal' : 'vertical',
      pageSize: 5,
    });
    if (next === null) return;
    event.preventDefault();
    event.stopPropagation();
    const item = enabled[next];
    if (!item) return;
    applyRovingTabIndex(items, items.indexOf(item));
    item.focus({ preventScroll: true });
  }
}

reflectStrings(VMenuItem, ['label', 'command', 'shortcut', 'icon', 'href', 'variant']);
reflectBooleans(VMenuItem, ['disabled', 'checked', 'selected', 'expanded']);
reflectStrings(VMenu, ['label', 'orientation']);
reflectBooleans(VMenu, ['inline']);
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
    { name: 'href', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'checked', kind: 'boolean', reflected: true },
    { name: 'selected', kind: 'boolean', reflected: true },
    { name: 'expanded', kind: 'boolean', reflected: true },
    { name: 'variant', kind: 'enum', values: ['danger'], reflected: true },
    { name: 'layout', kind: 'string', reflected: false },
  ],
  events: ['click'],
  slots: ['submenu'],
  parts: ['row', 'check', 'icon', 'label', 'shortcut', 'caret'],
  methods: [],
  keyboard: ['Enter', 'Space'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'roving',
});

registerContract({
  element: 'vui-menu',
  className: 'VMenu',
  attributes: [
    { name: 'label', kind: 'string', reflected: true, description: ['Доступное имя меню.', 'Accessible menu name.'] },
    { name: 'orientation', kind: 'enum', values: ['vertical', 'horizontal'], reflected: true, default: 'vertical' },
    { name: 'inline', kind: 'boolean', reflected: true, default: false, description: ['Меню в потоке, не popup.', 'In-flow menu instead of a popup.'] },
  ],
  events: [{ name: 'close', description: ['Popup-меню закрыто.', 'Popup menu closed.'], bubbles: false, detail: 'void' }],
  slots: ['', 'bar'],
  parts: ['menu', 'bar'],
  methods: ['showAt', 'close', 'bindTo'],
  keyboard: ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', 'Space', 'Escape'],
  states: [],
  responsive: 'viewport',
  focus: 'roving',
  role: 'presentation',
  docs: {
    guidance: [
      'Базовый пример — плоский список пунктов. Вложенные меню показывайте отдельно. Пункты — vui-menu-item.',
      'Start with a flat item list. Document nested menus separately. Items are vui-menu-item.',
    ],
    properties: [
      { name: 'commands', type: 'CommandRegistry', description: ['Реестр команд приложения.', 'Application command registry.'] },
    ],
    methods: [
      { name: 'showAt', signature: 'showAt(x: number, y: number): void', description: ['Открыть popup у точки.', 'Open the popup at a point.'] },
      { name: 'close', signature: 'close(): void', description: ['Закрыть popup.', 'Close the popup.'] },
      { name: 'bindTo', signature: 'bindTo(target: EventTarget): void', description: ['Привязать открытие к цели.', 'Bind open behavior to a target.'] },
    ],
    slots: [
      { name: '', description: ['Пункты меню.', 'Menu items.'] },
      { name: 'bar', description: ['Нижняя полоса.', 'Bottom bar.'] },
    ],
    tokens: ['--vui-z-overlay', '--vui-radius-box', '--vui-row-height'],
  },
});
