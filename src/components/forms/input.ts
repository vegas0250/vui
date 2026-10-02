import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { controlStyles, fieldStyles } from '../../core/styles';

export class VInput extends VuiElement {
  declare label: string;
  declare placeholder: string;
  declare name: string;
  declare hint: string;
  declare size: string;
  declare disabled: boolean;
  declare invalid: boolean;
  declare required: boolean;

  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['label', 'value', 'placeholder', 'type', 'disabled', 'invalid', 'name', 'required', 'size', 'hint', 'readonly'];
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

  get value(): string {
    return this.shadow.querySelector('input')?.value ?? this.getAttribute('value') ?? '';
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  protected template(): string {
    return `
      <div class="field">
        <label class="label" part="label"></label>
        <div class="control" part="control">
          <slot name="prefix"></slot>
          <input part="input" />
          <slot name="suffix"></slot>
        </div>
        <div class="hint" part="hint"></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      ${fieldStyles}
      ${controlStyles}
      :host {
        display: flex;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        container-type: inline-size;
        container-name: vui-field;
      }
      input {
        flex: 1 1 auto;
        width: 100%;
        min-width: 0;
        border: 0;
        outline: none;
        background: transparent;
        padding: 0;
        height: calc(var(--vui-size-control) - (var(--vui-border-width) * 2));
      }
      .label:empty, .hint:empty { display: none; }
      :host([readonly]) input { cursor: default; }
    `;
  }

  protected afterRender(): void {
    const input = this.qs<HTMLInputElement>('input');
    input.id = `vui-input-${Math.random().toString(36).slice(2, 9)}`;
    input.addEventListener('input', () => {
      this.internals?.setFormValue(input.value);
      if (this.getAttribute('value') !== input.value) {
        this.setAttribute('value', input.value);
      }
    });
  }

  protected sync(): void {
    const input = this.qs<HTMLInputElement>('input');
    const label = this.qs<HTMLLabelElement>('label');
    const hint = this.qs<HTMLElement>('.hint');
    const type = this.getAttribute('type') ?? 'text';
    const allowed = ['text', 'password', 'email', 'search', 'number', 'url', 'tel'];
    input.type = allowed.includes(type) ? type : 'text';
    const next = this.getAttribute('value') ?? '';
    if (input.value !== next) input.value = next;
    input.placeholder = this.getAttribute('placeholder') ?? '';
    input.disabled = this.isDisabled();
    input.required = this.hasAttribute('required');
    input.readOnly = this.hasAttribute('readonly');
    input.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
    const text = this.getAttribute('label') ?? '';
    label.textContent = text;
    label.htmlFor = input.id;
    hint.textContent = this.getAttribute('hint') ?? '';
    if (!hint.id) hint.id = `${input.id}-hint`;
    if (hint.textContent) input.setAttribute('aria-describedby', hint.id);
    else input.removeAttribute('aria-describedby');
    this.internals?.setFormValue(input.value);
  }
}

reflectStrings(VInput, ['label', 'placeholder', 'type', 'name', 'hint', 'size']);
reflectBooleans(VInput, ['disabled', 'invalid', 'required', 'readonly']);
defineElement('vui-input', VInput);

registerContract({
  element: 'vui-input',
  className: 'VInput',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'type', kind: 'enum', values: ['text', 'password', 'email', 'search', 'number', 'url', 'tel'], reflected: true },
    { name: 'placeholder', kind: 'string', reflected: true },
    { name: 'hint', kind: 'string', reflected: true },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'size', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'invalid', kind: 'boolean', reflected: true },
    { name: 'required', kind: 'boolean', reflected: true },
    { name: 'readonly', kind: 'boolean', reflected: true },
  ],
  events: ['input', 'change'],
  slots: ['prefix', 'suffix'],
  parts: ['label', 'control', 'input', 'hint'],
  methods: [],
  keyboard: ['Tab'],
  states: ['disabled', 'invalid'],
  responsive: 'container',
  focus: 'native',
});

export interface VInput {
  type: string;
  readonly: boolean;
}
