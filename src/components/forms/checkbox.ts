import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { emitChange } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

const checkIcon = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5"></path>
</svg>`;

export class VCheckbox extends VuiElement {
  declare name: string;
  declare value: string;
  declare disabled: boolean;
  declare invalid: boolean;

  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['checked', 'disabled', 'name', 'value', 'invalid'];
  }

  private internals: ElementInternals | null = null;

  constructor() {
    super();
    try {
      this.internals = this.attachInternals();
    } catch {
      this.internals = null;
    }
  }

  get checked(): boolean {
    return this.hasAttribute('checked');
  }

  set checked(next: boolean) {
    this.toggleAttribute('checked', next);
  }

  protected template(): string {
    return `
      <label class="field">
        <input type="checkbox" part="input" />
        <span class="box" aria-hidden="true">${checkIcon}</span>
        <span class="text" part="label"><slot></slot></span>
      </label>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; vertical-align: middle; max-width: 100%; min-width: 0; }
      .field {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-sm);
        cursor: pointer;
        min-height: var(--vui-size-control);
        max-width: 100%;
      }
      .text { min-width: 0; overflow-wrap: anywhere; }
      input {
        position: absolute;
        opacity: 0;
        width: 1px;
        height: 1px;
        margin: 0;
      }
      .box {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.05em;
        height: 1.05em;
        border: var(--vui-border-width) solid var(--vui-color-border-strong);
        border-radius: var(--vui-radius-sm);
        background: var(--vui-color-field);
        color: var(--vui-color-on-primary);
        flex: 0 0 auto;
      }
      .box svg { width: 0.85em; height: 0.85em; opacity: 0; }
      input:checked + .box {
        background: var(--vui-color-primary);
        border-color: var(--vui-color-primary);
      }
      input:checked + .box svg { opacity: 1; }
      input:focus-visible + .box {
        outline: var(--vui-focus-ring);
        outline-offset: var(--vui-focus-offset);
      }
      :host([invalid]) .box { border-color: var(--vui-color-danger); }
      :host([disabled]) .field { opacity: 0.55; cursor: not-allowed; }
      .text:empty { display: none; }
      @media (forced-colors: active) {
        .box { border: var(--vui-border-width) solid ButtonText; background: Field; }
        input:checked + .box { background: Highlight; color: HighlightText; }
      }
    `;
  }

  protected afterRender(): void {
    this.qs<HTMLInputElement>('input').addEventListener('change', () => {
      const input = this.qs<HTMLInputElement>('input');
      this.toggleAttribute('checked', input.checked);
      this.writeFormValue();
      emitChange(this);
    });
  }

  protected sync(): void {
    const input = this.qs<HTMLInputElement>('input');
    input.checked = this.hasAttribute('checked');
    input.disabled = this.isDisabled();
    input.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
    this.writeFormValue();
  }

  private writeFormValue(): void {
    const input = this.qs<HTMLInputElement>('input');
    if (!input.checked) {
      this.internals?.setFormValue(null);
      return;
    }
    this.internals?.setFormValue(this.getAttribute('value') ?? 'on');
  }
}

reflectStrings(VCheckbox, ['name', 'value']);
reflectBooleans(VCheckbox, ['disabled', 'invalid']);
defineElement('vui-checkbox', VCheckbox);

export class VCheckboxGroup extends VuiElement {
  declare label: string;
  declare name: string;
  declare hint: string;
  declare disabled: boolean;
  declare invalid: boolean;
  declare required: boolean;

  private applied = '';

  static get observedAttributes(): string[] {
    return ['label', 'name', 'hint', 'disabled', 'invalid', 'required', 'value'];
  }

  get value(): string {
    return this.boxes()
      .filter((box) => box.hasAttribute('checked'))
      .map((box) => box.getAttribute('value') ?? 'on')
      .join(',');
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  protected template(): string {
    return `
      <fieldset part="group">
        <legend part="label"></legend>
        <div class="options" part="options"><slot></slot></div>
        <div class="hint" part="hint"></div>
      </fieldset>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; container-type: inline-size; container-name: vui-field; }
      fieldset {
        margin: 0;
        padding: 0;
        border: 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--vui-space-2xs);
      }
      legend { padding: 0; color: var(--vui-color-text-muted); font-size: var(--vui-font-size-sm); }
      .options { display: flex; flex-wrap: wrap; gap: var(--vui-space-sm); min-width: 0; }
      .hint { color: var(--vui-color-text-muted); font-size: var(--vui-font-size-sm); }
      :host([invalid]) .hint { color: var(--vui-color-danger); }
      legend:empty, .hint:empty { display: none; }
      :host([disabled]) { opacity: 0.55; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
      @container vui-field (max-width: 22rem) {
        .options { flex-direction: column; align-items: flex-start; }
      }
    `;
  }

  protected afterRender(): void {
    this.addEventListener('keydown', (event) => {
      const key = event.key;
      if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight') return;
      const boxes = this.boxes().filter((box) => !box.hasAttribute('disabled'));
      if (boxes.length === 0) return;
      const active = document.activeElement;
      let index = boxes.findIndex((box) => box === active);
      if (index < 0) index = 0;
      const delta = key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 1;
      const next = boxes[(index + delta + boxes.length) % boxes.length];
      if (!next) return;
      event.preventDefault();
      next.focus();
    });
    this.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.localName !== 'vui-checkbox' || target.parentElement !== this) return;
      const next = this.value;
      if (this.getAttribute('value') === next) return;
      this.applied = next;
      this.setAttribute('value', next);
    });
  }

  protected sync(): void {
    const legend = this.qs<HTMLElement>('legend');
    const hint = this.qs<HTMLElement>('.hint');
    const fieldset = this.qs<HTMLFieldSetElement>('fieldset');
    const label = this.getAttribute('label') ?? '';
    legend.textContent = label;
    hint.textContent = this.getAttribute('hint') ?? '';
    if (!hint.id) hint.id = `vui-checkbox-group-${Math.random().toString(36).slice(2, 9)}`;
    fieldset.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
    fieldset.toggleAttribute('aria-required', this.hasAttribute('required'));
    const disabled = this.hasAttribute('disabled');
    fieldset.toggleAttribute('disabled', disabled);
    fieldset.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (hint.textContent) fieldset.setAttribute('aria-describedby', hint.id);
    else fieldset.removeAttribute('aria-describedby');
    const name = this.getAttribute('name');
    for (const box of this.boxes()) {
      if (name) box.setAttribute('name', name);
      if (disabled) {
        box.setAttribute('disabled', '');
        box.setAttribute('data-group-disabled', '');
      } else if (box.hasAttribute('data-group-disabled')) {
        box.removeAttribute('disabled');
        box.removeAttribute('data-group-disabled');
      }
    }
    const selected = this.getAttribute('value');
    if (selected !== null && selected !== this.applied) {
      this.applied = selected;
      const picked = new Set(selected.split(',').filter((item) => item.length > 0));
      for (const box of this.boxes()) {
        box.toggleAttribute('checked', picked.has(box.getAttribute('value') ?? 'on'));
      }
    }
  }

  private boxes(): HTMLElement[] {
    return [...this.children].filter((node): node is HTMLElement => node.localName === 'vui-checkbox');
  }
}

reflectStrings(VCheckboxGroup, ['label', 'name', 'hint']);
reflectBooleans(VCheckboxGroup, ['disabled', 'invalid', 'required']);
defineElement('vui-checkbox-group', VCheckboxGroup);

registerContract({
  element: 'vui-checkbox-group',
  className: 'VCheckboxGroup',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'hint', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'invalid', kind: 'boolean', reflected: true },
    { name: 'required', kind: 'boolean', reflected: true },
  ],
  events: ['change'],
  slots: [''],
  parts: ['group', 'label', 'options', 'hint'],
  methods: [],
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'],
  states: ['disabled', 'invalid'],
  responsive: 'container',
  focus: 'native',
});
