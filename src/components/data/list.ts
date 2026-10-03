import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { emitChange } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { moveInList } from '../../interaction/keyboard';
import { SelectionModel, type SelectionGesture } from '../../interaction/selection';

export class VListItem extends VuiElement {
  declare value: string;
  declare disabled: boolean;
  declare selected: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['value', 'disabled', 'selected'];
  }

  protected template(): string {
    return `<span part="label"><slot></slot></span>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        min-height: var(--vui-row-height, var(--vui-size-control));
        padding-inline: var(--vui-space-sm);
        cursor: pointer;
        overflow-wrap: anywhere;
      }
      :host([selected]) { background: var(--vui-color-surface); }
      :host(:hover) { background: var(--vui-color-surface-hover); }
      :host(:focus-visible) { outline: var(--vui-focus-ring); outline-offset: calc(var(--vui-focus-offset) * -1); }
      :host([disabled]) { opacity: 0.5; cursor: not-allowed; }
    `;
  }

  protected sync(): void {
    this.setAttribute('role', 'option');
    this.setAttribute('aria-selected', this.hasAttribute('selected') ? 'true' : 'false');
    this.setAttribute('aria-disabled', this.isDisabled() ? 'true' : 'false');
  }
}

reflectStrings(VListItem, ['value']);
reflectBooleans(VListItem, ['disabled', 'selected']);
defineElement('vui-list-item', VListItem);

registerContract({
  element: 'vui-list-item',
  className: 'VListItem',
  attributes: [
    { name: 'value', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'selected', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['label'],
  methods: [],
  keyboard: [],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'roving',
});

export class VList extends VuiElement {
  declare label: string;
  declare multiple: boolean;

  private readonly model = new SelectionModel<string>('single');
  private owned = '';

  static get observedAttributes(): string[] {
    return ['label', 'multiple', 'value'];
  }

  get value(): string {
    return this.model.selected.join(',');
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  protected template(): string {
    return `<div part="list" role="listbox"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      [part="list"] { display: flex; flex-direction: column; min-width: 0; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot').addEventListener('slotchange', () => this.sync());
    this.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.localName !== 'vui-list-item' || target.parentElement !== this) return;
      if (target.hasAttribute('disabled')) return;
      const items = this.items();
      const index = items.indexOf(target);
      const gesture: SelectionGesture =
        this.hasAttribute('multiple') && event.shiftKey
          ? 'range'
          : this.hasAttribute('multiple') && (event.metaKey || event.ctrlKey)
            ? 'toggle'
            : 'replace';
      this.model.select(this.itemId(target, index), gesture);
      this.commit();
      target.focus();
    });
    this.addEventListener('keydown', (event) => {
      const items = this.enabled();
      if (items.length === 0) return;
      const current = Math.max(0, items.findIndex((item) => item === document.activeElement || item.tabIndex === 0));
      const nextIndex = moveInList(current, items.length, event.key, { orientation: 'vertical' });
      if (nextIndex === null) return;
      const next = items[nextIndex];
      if (!next) return;
      event.preventDefault();
      const index = this.items().indexOf(next);
      this.model.select(this.itemId(next, index), 'replace');
      this.commit();
      next.focus();
    });
  }

  protected sync(): void {
    const list = this.qs('[part="list"]');
    const label = this.getAttribute('label') ?? '';
    if (label) list.setAttribute('aria-label', label);
    else list.removeAttribute('aria-label');
    list.setAttribute('aria-multiselectable', this.hasAttribute('multiple') ? 'true' : 'false');
    const items = this.items();
    this.model.setMode(this.hasAttribute('multiple') ? 'multiple' : 'single');
    this.model.setOrder(items.map((item, index) => this.itemId(item, index)));
    const incoming = this.getAttribute('value') ?? '';
    if (incoming !== this.owned) {
      this.owned = incoming;
      this.model.clear();
      const ids = incoming.split(',').filter((item) => item.length > 0);
      if (this.hasAttribute('multiple')) {
        for (const id of ids) this.model.select(id, 'toggle');
      } else if (ids[0]) this.model.select(ids[0], 'replace');
    }
    this.paint();
  }

  private commit(): void {
    const next = this.model.selected.join(',');
    this.owned = next;
    if (this.getAttribute('value') !== next) this.setAttribute('value', next);
    this.paint();
    emitChange(this);
  }

  private paint(): void {
    const items = this.items();
    const selected = new Set(this.model.selected);
    const active = this.model.active;
    items.forEach((item, index) => {
      const id = this.itemId(item, index);
      item.toggleAttribute('selected', selected.has(id));
      item.tabIndex = !item.hasAttribute('disabled') && (active === id || (active === null && selected.has(id))) ? 0 : -1;
    });
    const enabled = items.filter((item) => !item.hasAttribute('disabled'));
    if (enabled.length > 0 && !enabled.some((item) => item.tabIndex === 0)) {
      const first = enabled[0];
      if (first) first.tabIndex = 0;
    }
  }

  private items(): HTMLElement[] {
    return [...this.children].filter((node): node is HTMLElement => node.localName === 'vui-list-item');
  }

  private enabled(): HTMLElement[] {
    return this.items().filter((item) => !item.hasAttribute('disabled'));
  }

  private itemId(item: HTMLElement, index: number): string {
    return item.getAttribute('value') || String(index);
  }
}

reflectStrings(VList, ['label']);
reflectBooleans(VList, ['multiple']);
defineElement('vui-list', VList);

registerContract({
  element: 'vui-list',
  className: 'VList',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'multiple', kind: 'boolean', reflected: true },
  ],
  events: ['change'],
  slots: [''],
  parts: ['list'],
  methods: [],
  keyboard: ['ArrowUp', 'ArrowDown', 'Home', 'End'],
  states: [],
  responsive: 'flow',
  focus: 'roving',
  role: 'listbox',
});
