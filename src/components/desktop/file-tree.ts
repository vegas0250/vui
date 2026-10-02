import '../foundation/icon';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { emitChange } from '../../core/events';
import type { VIcon } from '../foundation/icon';

const chevron = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6"></path>
</svg>`;

export class VTreeItem extends VuiElement {
  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['label', 'expanded', 'selected', 'kind', 'value'];
  }

  protected template(): string {
    return `
      <div class="row" part="row">
        <span class="twist" aria-hidden="true">${chevron}</span>
        <vui-icon part="icon"></vui-icon>
        <span class="label" part="label"></span>
      </div>
      <div class="children" role="group"><slot></slot></div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; max-width: 100%; min-width: 0; }
      .row {
        display: flex;
        align-items: center;
        gap: var(--vui-space-xs);
        min-height: var(--vui-row-height);
        padding-inline: var(--vui-space-xs);
        border-radius: var(--vui-radius-sm);
        cursor: pointer;
        user-select: none;
      }
      :host(:focus) .row,
      :host([selected]) .row {
        background: var(--vui-color-surface-hover);
      }
      :host([selected]) .row { font-weight: var(--vui-font-weight-strong); }
      :host(:focus) .row {
        outline: var(--vui-focus-ring);
        outline-offset: -2px;
      }
      .twist {
        display: inline-flex;
        width: 1em;
        height: 1em;
        color: var(--vui-color-text-muted);
      }
      .twist svg { width: 1em; height: 1em; transition: transform var(--vui-duration) var(--vui-easing); }
      :host([expanded]) .twist svg { transform: rotate(90deg); }
      :host(:not([branch])) .twist { visibility: hidden; }
      .label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .children { padding-left: var(--vui-space-md); }
      .children[hidden] { display: none; }
    `;
  }

  protected afterRender(): void {
    this.qs('.row').addEventListener('click', (event) => {
      if (event.composedPath().includes(this.qs('.twist')) && this.hasChildren()) {
        this.toggleAttribute('expanded');
      }
    });
    this.qs('slot').addEventListener('slotchange', () => this.sync());
  }

  protected sync(): void {
    const label = this.getAttribute('label') ?? '';
    this.qs('.label').textContent = label;
    const kind = this.getAttribute('kind') ?? (this.hasChildren() ? 'folder' : 'file');
    const expanded = this.hasAttribute('expanded');
    const branch = kind === 'folder' || this.hasChildren();
    this.toggleAttribute('branch', branch);
    const iconName = kind === 'folder' || this.hasChildren() ? (expanded ? 'folder-open' : 'folder') : 'file';
    this.qs<VIcon>('vui-icon').setAttribute('name', iconName);
    this.setAttribute('role', 'treeitem');
    this.setAttribute('aria-label', label);
    if (branch) this.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    else this.removeAttribute('aria-expanded');
    this.setAttribute('aria-selected', this.hasAttribute('selected') ? 'true' : 'false');
    this.qs<HTMLElement>('.children').hidden = !expanded;
  }

  hasChildren(): boolean {
    return this.querySelector(':scope > vui-tree-item') !== null;
  }

  get itemValue(): string {
    return this.getAttribute('value') ?? this.getAttribute('label') ?? '';
  }
}

export class VFileTree extends VuiElement {
  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `<div class="tree" part="tree" role="tree"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; min-height: 0; }
      .tree { min-width: 0; max-width: 100%; overflow: auto; padding: var(--vui-space-xs); }
    `;
  }

  protected afterRender(): void {
    this.addEventListener('click', (event) => {
      const item = this.itemFromEvent(event);
      if (item) this.selectItem(item);
    });
    this.addEventListener('keydown', (event) => this.onKeydown(event));
    this.qs('slot').addEventListener('slotchange', () => this.refreshTabStops());
    this.refreshTabStops();
    queueMicrotask(() => this.refreshTabStops());
  }

  protected sync(): void {
    this.qs('[role="tree"]').setAttribute('aria-label', this.getAttribute('label') ?? 'Files');
  }

  get selectedItem(): VTreeItem | null {
    return this.visibleItems().find((item) => item.hasAttribute('selected')) ?? null;
  }

  private items(root: ParentNode = this): VTreeItem[] {
    return [...root.querySelectorAll(':scope > vui-tree-item')].filter(
      (node): node is VTreeItem => node instanceof VTreeItem,
    );
  }

  private visibleItems(): VTreeItem[] {
    const result: VTreeItem[] = [];
    const walk = (parent: ParentNode): void => {
      for (const item of this.items(parent)) {
        result.push(item);
        if (item.hasAttribute('expanded')) walk(item);
      }
    };
    walk(this);
    return result;
  }

  private refreshTabStops(): void {
    const visible = this.visibleItems();
    const current = visible.find((item) => item.tabIndex === 0) ?? visible[0];
    for (const item of this.querySelectorAll('vui-tree-item')) {
      if (item instanceof VTreeItem) item.tabIndex = item === current ? 0 : -1;
    }
  }

  private selectItem(item: VTreeItem): void {
    const previous = this.selectedItem;
    for (const candidate of this.querySelectorAll('vui-tree-item')) {
      if (candidate instanceof VTreeItem) candidate.toggleAttribute('selected', candidate === item);
    }
    item.tabIndex = 0;
    for (const candidate of this.querySelectorAll('vui-tree-item')) {
      if (candidate instanceof VTreeItem && candidate !== item) candidate.tabIndex = -1;
    }
    if (previous !== item) emitChange(this);
  }

  private itemFromEvent(event: Event): VTreeItem | null {
    const match = event.composedPath().find((node) => node instanceof VTreeItem);
    return match instanceof VTreeItem ? match : null;
  }

  private onKeydown(event: KeyboardEvent): void {
    const visible = this.visibleItems();
    const current =
      visible.find((item) => item === document.activeElement) ??
      visible.find((item) => item.tabIndex === 0) ??
      visible[0];
    if (!current) return;
    const index = visible.indexOf(current);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = visible[index + (event.key === 'ArrowDown' ? 1 : -1)];
      if (next) this.focusItem(next);
      return;
    }
    if (event.key === 'Home') {
      event.preventDefault();
      const first = visible[0];
      if (first) this.focusItem(first);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      const last = visible[visible.length - 1];
      if (last) this.focusItem(last);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (current.hasChildren() && !current.hasAttribute('expanded')) {
        current.setAttribute('expanded', '');
        this.refreshTabStops();
        return;
      }
      const next = visible[index + 1];
      if (next) this.focusItem(next);
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (current.hasAttribute('expanded')) {
        current.removeAttribute('expanded');
        this.refreshTabStops();
        return;
      }
      const parent = current.parentElement;
      if (parent instanceof VTreeItem) this.focusItem(parent);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectItem(current);
      if (current.hasChildren()) current.toggleAttribute('expanded');
    }
  }

  private focusItem(item: VTreeItem): void {
    this.selectItem(item);
    item.focus();
  }
}

defineElement('vui-tree-item', VTreeItem);
defineElement('vui-file-tree', VFileTree);
