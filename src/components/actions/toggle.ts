import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { emitChange } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { moveInList } from '../../interaction/keyboard';

export class VToggle extends VuiElement {
  declare value: string;
  declare disabled: boolean;
  declare pressed: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['value', 'disabled', 'pressed', 'data-current'];
  }

  protected template(): string {
    return `<button part="base" type="button"><slot></slot></button>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; }
      button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        max-width: 100%;
        min-height: var(--vui-size-control);
        padding-inline: var(--vui-space-md);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        font: inherit;
        cursor: pointer;
        overflow-wrap: anywhere;
      }
      button:hover { background: var(--vui-color-surface-hover); }
      :host([pressed]) button {
        background: var(--vui-color-primary);
        color: var(--vui-color-on-primary);
        border-color: var(--vui-color-primary);
      }
      button:focus { outline: none; }
      button:focus-visible { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
      button:disabled { opacity: 0.5; cursor: not-allowed; }
      @media (forced-colors: active) {
        button { border: var(--vui-border-width) solid ButtonText; background: ButtonFace; color: ButtonText; }
        :host([pressed]) button { background: Highlight; color: HighlightText; }
      }
    `;
  }

  protected afterRender(): void {
    this.qs('button').addEventListener('click', () => {
      if (this.isDisabled()) return;
      if (this.parentElement?.localName === 'vui-toggle-group') {
        emitChange(this);
        return;
      }
      this.pressed = !this.pressed;
      emitChange(this);
    });
  }

  protected sync(): void {
    const button = this.qs<HTMLButtonElement>('button');
    button.disabled = this.isDisabled();
    button.setAttribute('aria-pressed', this.hasAttribute('pressed') ? 'true' : 'false');
    button.tabIndex = this.hasAttribute('data-current') && !this.isDisabled() ? 0 : -1;
  }

  override focus(options?: FocusOptions): void {
    this.qs<HTMLElement>('button').focus(options);
  }
}

reflectStrings(VToggle, ['value']);
reflectBooleans(VToggle, ['disabled', 'pressed']);
defineElement('vui-toggle', VToggle);

registerContract({
  element: 'vui-toggle',
  className: 'VToggle',
  attributes: [
    { name: 'value', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'pressed', kind: 'boolean', reflected: true },
  ],
  events: ['click', 'change'],
  slots: [''],
  parts: ['base'],
  methods: [],
  keyboard: ['Tab', 'Enter', 'Space'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'native',
});

export class VToggleGroup extends VuiElement {
  declare label: string;
  declare orientation: string;
  declare disabled: boolean;
  declare multiple: boolean;

  private applied = '';

  static get observedAttributes(): string[] {
    return ['label', 'orientation', 'disabled', 'multiple', 'value'];
  }

  get value(): string {
    return this.items()
      .filter((item) => item.hasAttribute('pressed'))
      .map((item) => item.getAttribute('value') ?? '')
      .join(',');
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  protected template(): string {
    return `<div part="group" role="group"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; container-type: inline-size; container-name: vui-toggle; }
      [part="group"] { display: inline-flex; flex-wrap: wrap; gap: var(--vui-space-2xs); min-width: 0; max-width: 100%; }
      :host([orientation="vertical"]) [part="group"] { flex-direction: column; align-items: stretch; }
      :host([disabled]) { opacity: 0.55; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
      @container vui-toggle (max-width: 22rem) {
        [part="group"] { flex-direction: column; align-items: stretch; }
      }
    `;
  }

  protected afterRender(): void {
    this.qs('slot').addEventListener('slotchange', () => this.sync());
    this.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.localName !== 'vui-toggle' || target.parentElement !== this) return;
      if (target.hasAttribute('disabled') || this.hasAttribute('disabled')) return;
      if (this.hasAttribute('multiple')) target.toggleAttribute('pressed');
      else {
        for (const item of this.items()) item.toggleAttribute('pressed', item === target);
      }
      this.writeValue();
      emitChange(this);
    });
    this.addEventListener('keydown', (event) => {
      const items = this.enabled();
      if (items.length === 0) return;
      const current = Math.max(0, items.findIndex((item) => item === document.activeElement || item.hasAttribute('data-current')));
      const orientation = this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'both';
      const nextIndex = moveInList(current, items.length, event.key, { orientation, loop: true });
      if (nextIndex === null || nextIndex === current) return;
      event.preventDefault();
      const next = items[nextIndex];
      if (!next) return;
      if (!this.hasAttribute('multiple')) {
        for (const item of this.items()) item.toggleAttribute('pressed', item === next);
        this.writeValue();
        emitChange(this);
      }
      this.roving(next);
      next.focus();
    });
  }

  protected sync(): void {
    const group = this.qs('[part="group"]');
    const label = this.getAttribute('label') ?? '';
    if (label) group.setAttribute('aria-label', label);
    else group.removeAttribute('aria-label');
    group.setAttribute('aria-disabled', this.hasAttribute('disabled') ? 'true' : 'false');
    const selected = this.getAttribute('value');
    if (selected !== null && selected !== this.applied) {
      this.applied = selected;
      const picked = new Set(selected.split(',').filter((item) => item.length > 0));
      for (const item of this.items()) item.toggleAttribute('pressed', picked.has(item.getAttribute('value') ?? ''));
    }
    const current =
      this.enabled().find((item) => item.hasAttribute('data-current')) ??
      this.enabled().find((item) => item.hasAttribute('pressed'));
    this.roving(current ?? this.enabled()[0]);
  }

  private writeValue(): void {
    const next = this.value;
    if (this.getAttribute('value') === next) return;
    this.applied = next;
    this.setAttribute('value', next);
  }

  private items(): HTMLElement[] {
    return [...this.children].filter((node): node is HTMLElement => node.localName === 'vui-toggle');
  }

  private enabled(): HTMLElement[] {
    return this.items().filter((item) => !item.hasAttribute('disabled') && !this.hasAttribute('disabled'));
  }

  private roving(active: HTMLElement | undefined): void {
    for (const item of this.items()) item.toggleAttribute('data-current', item === active);
  }
}

reflectStrings(VToggleGroup, ['label', 'orientation']);
reflectBooleans(VToggleGroup, ['disabled', 'multiple']);
defineElement('vui-toggle-group', VToggleGroup);

registerContract({
  element: 'vui-toggle-group',
  className: 'VToggleGroup',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'orientation', kind: 'enum', values: ['horizontal', 'vertical'], reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'multiple', kind: 'boolean', reflected: true },
  ],
  events: ['change'],
  slots: [''],
  parts: ['group'],
  methods: [],
  keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'],
  states: ['disabled'],
  responsive: 'container',
  focus: 'roving',
});
