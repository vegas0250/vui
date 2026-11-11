import '../foundation/icon';
import { defineElement } from '../../utils/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../utils/element';
import { emitChange } from '../../utils/events';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';
import { ownedChildren } from '../../composition/dom';
import { reportUnexpectedChildren } from '../../utils/dev';
import { copyText } from '../../interaction/clipboard';
import { applyRovingTabIndex, isRtl, moveInList, stepIndex } from '../../interaction/keyboard';
import { SelectionModel } from '../../interaction/selection';
import type { VIcon } from '../foundation/icon';

const chevron = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="m9 18 6-6-6-6"></path>
</svg>`;

export class VTreeItem extends VuiElement {
  declare label: string;
  declare kind: string;
  declare icon: string;
  declare summary: string;
  declare count: string;
  declare status: string;
  declare statusVariant: string;
  declare expanded: boolean;
  declare selected: boolean;
  declare disabled: boolean;
  declare loading: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['label', 'expanded', 'selected', 'kind', 'value', 'icon', 'summary', 'count', 'status', 'status-variant', 'disabled', 'loading'];
  }

  protected template(): string {
    return `
      <div class="row" part="row">
        <span class="twist" aria-hidden="true">${chevron}</span>
        <vui-icon part="icon"></vui-icon>
        <span class="copy">
          <span class="label" part="label"></span>
          <span class="summary" part="summary" hidden></span>
        </span>
        <span class="count" part="count" hidden></span>
        <span class="status" part="status" hidden></span>
        <span class="actions" part="actions" hidden><slot name="actions"></slot></span>
      </div>
      <div class="children" role="group"><slot></slot></div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; max-width: 100%; min-width: 0; }
      :host([disabled]) { opacity: var(--vui-opacity-disabled, 0.55); }
      .row {
        display: flex;
        align-items: center;
        gap: var(--vui-space-xs);
        min-height: var(--vui-row-height);
        padding-inline: var(--vui-space-xs);
        border-radius: var(--vui-radius-field, var(--vui-radius-sm));
        cursor: pointer;
        user-select: none;
        transition: background-color var(--vui-duration) var(--vui-easing), border-color var(--vui-duration) var(--vui-easing);
      }
      :host([disabled]) .row { cursor: default; }
      :host(:hover:not([disabled])) .row { background: var(--vui-color-hover, var(--vui-color-surface-hover)); }
      :host([selected]) .row {
        background: var(--vui-color-selected);
        box-shadow: inset var(--vui-border-width-accent) 0 0 var(--vui-color-focus);
      }
      :host([selected]:hover:not([disabled])) .row { background: var(--vui-color-selected); }
      :host-context([dir="rtl"]):host([selected]) .row { box-shadow: inset calc(var(--vui-border-width-accent) * -1) 0 0 var(--vui-color-focus); }
      :host(:focus-visible) .row {
        outline: var(--vui-focus-ring);
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      .twist {
        display: inline-flex;
        flex: 0 0 var(--vui-icon-size);
        width: var(--vui-icon-size);
        height: var(--vui-icon-size);
        color: var(--vui-color-text-muted);
      }
      .twist svg { width: 100%; height: 100%; transition: transform var(--vui-duration) var(--vui-easing); }
      :host([expanded]) .twist svg { transform: rotate(90deg); }
      :host-context([dir="rtl"]):host(:not([expanded])) .twist svg { transform: scaleX(-1); }
      :host(:not([branch])) .twist { visibility: hidden; }
      vui-icon { color: var(--vui-color-text-muted); }
      :host([selected]) vui-icon { color: var(--vui-color-text); }
      :host([loading]) vui-icon { animation: vui-tree-spin calc(var(--vui-duration) * 8) linear infinite; }
      @keyframes vui-tree-spin { to { transform: rotate(360deg); } }
      .copy {
        display: flex;
        align-items: baseline;
        gap: var(--vui-space-xs);
        min-width: 0;
        flex: 1 1 auto;
      }
      .label, .summary { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .label { flex: 1 1 auto; }
      .summary { flex: 0 1 42%; color: var(--vui-color-text-muted); font-size: var(--vui-font-size-sm); }
      .count {
        flex: 0 0 auto;
        color: var(--vui-color-text-muted);
        font-size: var(--vui-font-size-sm);
        font-variant-numeric: tabular-nums;
      }
      .status {
        flex: 0 0 auto;
        max-width: 8rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-inline: var(--vui-space-xs);
        border: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
        border-radius: var(--vui-radius-field, var(--vui-radius-sm));
        color: var(--vui-color-text-muted);
        font-size: var(--vui-font-size-sm);
        line-height: 1.3;
      }
      :host([status-variant="info"]) .status { color: var(--vui-color-info); background: var(--vui-color-info-surface); }
      :host([status-variant="success"]) .status { color: var(--vui-color-success); background: var(--vui-color-success-surface); }
      :host([status-variant="warning"]) .status { color: var(--vui-color-warning); background: var(--vui-color-warning-surface); }
      :host([status-variant="danger"]) .status { color: var(--vui-color-danger); background: var(--vui-color-danger-surface); }
      .actions {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-2xs);
        opacity: 0;
      }
      :host(:hover) .actions,
      :host(:focus-within) .actions,
      :host([selected]) .actions { opacity: 1; }
      .actions[hidden] { display: none; }
      .children { padding-inline-start: var(--vui-space-md); }
      .children[hidden] { display: none; }
    `;
  }

  protected afterRender(): void {
    this.qs('.row').addEventListener('click', (event) => {
      if (this.hasAttribute('disabled')) return;
      if (event.composedPath().includes(this.qs('.twist')) && this.hasChildren()) {
        this.toggleAttribute('expanded');
      }
    });
    this.qs('.children slot').addEventListener('slotchange', () => this.sync());
    this.qs('slot[name="actions"]').addEventListener('slotchange', () => this.sync());
    queueMicrotask(() => {
      if (this.isConnected) this.sync();
    });
  }

  protected sync(): void {
    const label = this.getAttribute('label') ?? '';
    this.qs('.label').textContent = label;
    const summary = this.getAttribute('summary') ?? '';
    const summaryEl = this.qs<HTMLElement>('.summary');
    summaryEl.textContent = summary;
    summaryEl.hidden = summary.length === 0;
    const count = this.getAttribute('count') ?? '';
    const countEl = this.qs<HTMLElement>('.count');
    countEl.textContent = count;
    countEl.hidden = count.length === 0;
    const status = this.getAttribute('status') ?? '';
    const statusEl = this.qs<HTMLElement>('.status');
    statusEl.textContent = status;
    statusEl.hidden = status.length === 0;
    const actions = this.qs<HTMLSlotElement>('slot[name="actions"]');
    this.qs<HTMLElement>('.actions').hidden = actions.assignedNodes({ flatten: true }).length === 0;
    const kind = this.getAttribute('kind') ?? (this.hasChildren() ? 'folder' : 'file');
    const expanded = this.hasAttribute('expanded');
    const branch = kind === 'folder' || this.hasChildren();
    this.toggleAttribute('branch', branch);
    const custom = this.getAttribute('icon') ?? '';
    let iconName = custom || (kind === 'folder' || this.hasChildren() ? (expanded ? 'folder-open' : 'folder') : 'file');
    if (this.hasAttribute('loading')) iconName = 'loader';
    this.qs<VIcon>('vui-icon').setAttribute('name', iconName);
    const accessible = [label, summary, count, status].filter((part) => part.length > 0);
    this.setAttribute('role', 'treeitem');
    this.setAttribute('aria-label', accessible.join(', '));
    this.setAttribute('aria-disabled', this.hasAttribute('disabled') ? 'true' : 'false');
    const busy = this.hasAttribute('loading');
    const row = this.qs('.row');
    if (busy) {
      this.setAttribute('aria-busy', 'true');
      row.setAttribute('aria-busy', 'true');
    } else {
      this.removeAttribute('aria-busy');
      row.removeAttribute('aria-busy');
    }
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
  declare label: string;

  static shadowDelegatesFocus = false;

  private readonly selection = new SelectionModel<VTreeItem>('single');

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
    reportUnexpectedChildren(this, ['vui-tree-item']);
  }

  get selectedItem(): VTreeItem | null {
    return this.visibleItems().find((item) => item.hasAttribute('selected')) ?? null;
  }

  private items(root: ParentNode = this): VTreeItem[] {
    if (root instanceof HTMLElement) reportUnexpectedChildren(root, ['vui-tree-item']);
    return ownedChildren(root, 'vui-tree-item', (node): node is VTreeItem => node instanceof VTreeItem);
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

  private refreshTabStops(active?: VTreeItem): void {
    const visible = this.visibleItems();
    const enabled = visible.filter((item) => !item.hasAttribute('disabled'));
    const current =
      (active && enabled.includes(active) ? active : undefined) ??
      enabled.find((item) => item.tabIndex === 0) ??
      enabled.find((item) => this.selection.isSelected(item)) ??
      enabled[0];
    applyRovingTabIndex(enabled, current ? enabled.indexOf(current) : -1);
    for (const item of this.querySelectorAll('vui-tree-item')) {
      if (item instanceof VTreeItem && !enabled.includes(item)) item.tabIndex = -1;
    }
  }

  private selectItem(item: VTreeItem): void {
    if (item.hasAttribute('disabled')) return;
    const previous = this.selectedItem;
    this.selection.setOrder(this.visibleItems());
    this.selection.select(item);
    for (const candidate of this.querySelectorAll('vui-tree-item')) {
      if (candidate instanceof VTreeItem) candidate.toggleAttribute('selected', this.selection.isSelected(candidate));
    }
    this.refreshTabStops(item);
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
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && !event.altKey) {
      event.preventDefault();
      void copyText((this.selectedItem ?? current).itemValue);
      return;
    }
    const nextIndex = moveInList(index, visible.length, event.key, { orientation: 'vertical', pageSize: 5 });
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End' ||
      event.key === 'PageUp' ||
      event.key === 'PageDown'
    ) {
      if (nextIndex === null) return;
      event.preventDefault();
      const enabledAt = (itemIndex: number) => visible[itemIndex] !== undefined && !visible[itemIndex].hasAttribute('disabled');
      let target = nextIndex;
      if (!enabledAt(target)) {
        if (event.key === 'Home') target = stepIndex(-1, 1, visible.length, enabledAt);
        else if (event.key === 'End') target = stepIndex(visible.length, -1, visible.length, enabledAt);
        else target = stepIndex(index, target >= index ? 1 : -1, visible.length, enabledAt);
      }
      const next = visible[target];
      if (next && !next.hasAttribute('disabled')) this.focusItem(next);
      return;
    }
    const rtl = isRtl(this);
    const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const closeKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (current.hasAttribute('disabled')) {
      if (event.key === openKey || event.key === closeKey || event.key === 'Enter' || event.key === ' ') event.preventDefault();
      return;
    }
    if (event.key === openKey) {
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
    if (event.key === closeKey) {
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

reflectStrings(VTreeItem, {
  label: 'label',
  kind: 'kind',
  icon: 'icon',
  summary: 'summary',
  count: 'count',
  status: 'status',
  statusVariant: 'status-variant',
});
reflectBooleans(VTreeItem, ['expanded', 'selected', 'disabled', 'loading']);
reflectStrings(VFileTree, ['label']);
defineElement('vui-tree-item', VTreeItem);
defineElement('vui-file-tree', VFileTree);

registerContract({
  element: 'vui-tree-item',
  className: 'VTreeItem',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'kind', kind: 'enum', values: ['file', 'folder'], reflected: true },
    { name: 'icon', kind: 'string', reflected: true },
    { name: 'summary', kind: 'string', reflected: true },
    { name: 'count', kind: 'string', reflected: true },
    { name: 'status', kind: 'string', reflected: true },
    { name: 'status-variant', kind: 'enum', values: ['neutral', 'info', 'success', 'warning', 'danger'], property: 'statusVariant', reflected: true },
    { name: 'expanded', kind: 'boolean', reflected: true },
    { name: 'selected', kind: 'boolean', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'loading', kind: 'boolean', reflected: true },
    { name: 'value', kind: 'string', reflected: false },
  ],
  events: [],
  slots: ['actions', ''],
  parts: ['row', 'icon', 'label', 'summary', 'count', 'status', 'actions'],
  methods: [],
  keyboard: [],
  states: ['disabled', 'loading'],
  responsive: 'flow',
  focus: 'roving',
  role: 'group',
});

registerContract({
  element: 'vui-file-tree',
  className: 'VFileTree',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: ['change'],
  slots: [''],
  parts: ['tree'],
  methods: [],
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', 'Space'],
  states: [],
  responsive: 'flow',
  focus: 'roving',
  role: 'tree',
});
