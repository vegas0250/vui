import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { emitChange } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

export class VRadio extends VuiElement {
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
        <input type="radio" part="input" />
        <span class="mark" aria-hidden="true"></span>
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
      .mark {
        width: 1.05em;
        height: 1.05em;
        box-sizing: border-box;
        border: var(--vui-border-width) solid var(--vui-color-border-strong);
        border-radius: 50%;
        background: var(--vui-color-field);
        flex: 0 0 auto;
      }
      input:checked + .mark {
        border-color: var(--vui-color-primary);
        background: radial-gradient(circle at center, var(--vui-color-primary) 0 40%, var(--vui-color-field) 45% 100%);
      }
      input:focus-visible + .mark {
        outline: var(--vui-focus-ring);
        outline-offset: var(--vui-focus-offset);
      }
      :host([invalid]) .mark { border-color: var(--vui-color-danger); }
      :host([disabled]) .field { opacity: 0.55; cursor: not-allowed; }
      .text:empty { display: none; }
      @media (forced-colors: active) {
        .mark { border: var(--vui-border-width) solid ButtonText; background: Field; }
        input:checked + .mark { background: Highlight; }
      }
    `;
  }

  protected afterRender(): void {
    this.qs<HTMLInputElement>('input').addEventListener('change', () => {
      const input = this.qs<HTMLInputElement>('input');
      this.toggleAttribute('checked', input.checked);
      if (input.checked) this.clearPeers();
      this.writeFormValue();
      emitChange(this);
    });
  }

  protected sync(): void {
    const input = this.qs<HTMLInputElement>('input');
    input.checked = this.hasAttribute('checked');
    input.disabled = this.isDisabled();
    const name = this.getAttribute('name');
    if (name) input.name = name;
    else input.removeAttribute('name');
    input.value = this.getAttribute('value') ?? 'on';
    input.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
    this.writeFormValue();
  }

  private clearPeers(): void {
    const name = this.getAttribute('name');
    if (!name) return;
    for (const other of document.querySelectorAll('vui-radio')) {
      if (other !== this && other.getAttribute('name') === name) other.removeAttribute('checked');
    }
  }

  private writeFormValue(): void {
    const input = this.qs<HTMLInputElement>('input');
    if (!input.checked) {
      this.internals?.setFormValue(null);
      return;
    }
    this.internals?.setFormValue(input.value);
  }
}

reflectStrings(VRadio, ['name', 'value']);
reflectBooleans(VRadio, ['disabled', 'invalid']);
defineElement('vui-radio', VRadio);

registerContract({
  element: 'vui-radio',
  className: 'VRadio',
  attributes: [
    { name: 'checked', kind: 'boolean', reflected: true },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'invalid', kind: 'boolean', reflected: true },
  ],
  events: ['change'],
  slots: [''],
  parts: ['input', 'label'],
  methods: [],
  keyboard: ['Tab', 'Space'],
  states: ['disabled', 'invalid'],
  responsive: 'flow',
  focus: 'native',
});

export class VRadioGroup extends VuiElement {
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
    return this.radios().find((radio) => radio.hasAttribute('checked'))?.getAttribute('value') ?? '';
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
      legend {
        padding: 0;
        color: var(--vui-color-text-muted);
        font-size: var(--vui-font-size-sm);
      }
      .options { display: flex; flex-wrap: wrap; gap: var(--vui-space-sm); min-width: 0; }
      .hint { color: var(--vui-color-text-muted); font-size: var(--vui-font-size-sm); }
      :host([invalid]) .hint { color: var(--vui-color-danger); }
      legend:empty, .hint:empty, legend[hidden], .hint[hidden] { display: none; }
      :host([disabled]) { opacity: 0.55; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
      @container vui-field (max-width: 36rem) {
        .options { flex-direction: column; align-items: flex-start; }
      }
    `;
  }

  protected afterRender(): void {
    this.addEventListener('keydown', (event) => {
      const key = event.key;
      if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight') return;
      const radios = this.radios().filter((radio) => !radio.hasAttribute('disabled'));
      if (radios.length === 0) return;
      const active = document.activeElement;
      let index = radios.findIndex((radio) => radio === active || radio.hasAttribute('checked'));
      if (index < 0) index = 0;
      const rtl = getComputedStyle(this).direction === 'rtl';
      const backward = key === 'ArrowUp' || key === (rtl ? 'ArrowRight' : 'ArrowLeft');
      const delta = backward ? -1 : 1;
      const next = radios[(index + delta + radios.length) % radios.length];
      if (!next) return;
      event.preventDefault();
      for (const radio of radios) radio.removeAttribute('checked');
      next.setAttribute('checked', '');
      next.focus();
      const nextValue = next.getAttribute('value') ?? '';
      if (this.getAttribute('value') !== nextValue) {
        this.applied = nextValue;
        this.setAttribute('value', nextValue);
      }
      emitChange(this);
    });
    this.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.localName !== 'vui-radio' || target.parentElement !== this) return;
      const nextValue = target.getAttribute('value') ?? '';
      if (this.getAttribute('value') === nextValue) return;
      this.applied = nextValue;
      this.setAttribute('value', nextValue);
    });
  }

  protected sync(): void {
    const legend = this.qs<HTMLElement>('legend');
    const hint = this.qs<HTMLElement>('.hint');
    const fieldset = this.qs<HTMLFieldSetElement>('fieldset');
    const label = this.getAttribute('label') ?? '';
    legend.textContent = label;
    legend.hidden = !label;
    hint.textContent = this.getAttribute('hint') ?? '';
    hint.hidden = !hint.textContent;
    if (!hint.id) hint.id = `vui-radio-group-${Math.random().toString(36).slice(2, 9)}`;
    fieldset.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
    fieldset.toggleAttribute('aria-required', this.hasAttribute('required'));
    const disabled = this.hasAttribute('disabled');
    fieldset.toggleAttribute('disabled', disabled);
    fieldset.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    if (hint.textContent) fieldset.setAttribute('aria-describedby', hint.id);
    else fieldset.removeAttribute('aria-describedby');
    const name = this.getAttribute('name');
    const selected = this.getAttribute('value');
    for (const radio of this.radios()) {
      if (name) radio.setAttribute('name', name);
      if (disabled) {
        radio.setAttribute('disabled', '');
        radio.setAttribute('data-group-disabled', '');
      } else if (radio.hasAttribute('data-group-disabled')) {
        radio.removeAttribute('disabled');
        radio.removeAttribute('data-group-disabled');
      }
    }
    if (selected !== null && selected !== this.applied) {
      this.applied = selected;
      for (const radio of this.radios()) {
        radio.toggleAttribute('checked', radio.getAttribute('value') === selected);
      }
    }
  }

  private radios(): HTMLElement[] {
    return [...this.children].filter((node): node is HTMLElement => node.localName === 'vui-radio');
  }
}

reflectStrings(VRadioGroup, ['label', 'name', 'hint']);
reflectBooleans(VRadioGroup, ['disabled', 'invalid', 'required']);
defineElement('vui-radio-group', VRadioGroup);

registerContract({
  element: 'vui-radio-group',
  className: 'VRadioGroup',
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
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
  states: ['disabled', 'invalid'],
  responsive: 'container',
  focus: 'native',
});
