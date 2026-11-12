import { defineElement } from '../../utils/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../utils/element';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';
import { controlStyles, fieldStyles } from '../../utils/styles';

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
        align-self: stretch;
        width: 100%;
        min-width: 0;
        min-height: 0;
        height: auto;
        border: 0;
        outline: none;
        background: transparent;
        padding: 0;
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
    const allowed = ['text', 'password', 'email', 'search', 'number', 'url', 'tel', 'date', 'time', 'datetime-local', 'color', 'file'];
    input.type = allowed.includes(type) ? type : 'text';
    const next = this.getAttribute('value') ?? '';
    if (input.type !== 'file' && input.value !== next) {
      try {
        input.value = next;
      } catch {
        /* file and color reject some assignments */
      }
    }
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
    { name: 'label', kind: 'string', reflected: true, description: ['Подпись поля.', 'Field label.'] },
    { name: 'value', kind: 'string', reflected: true, default: '', description: ['Текущее значение.', 'Current value.'] },
    {
      name: 'type',
      kind: 'enum',
      values: ['text', 'password', 'email', 'search', 'number', 'url', 'tel', 'date', 'time', 'datetime-local', 'color', 'file'],
      reflected: true,
      default: 'text',
      description: ['Тип нативного input.', 'Native input type.'],
    },
    { name: 'placeholder', kind: 'string', reflected: true },
    { name: 'hint', kind: 'string', reflected: true, description: ['Подсказка или текст ошибки при invalid.', 'Hint or error text when invalid.'] },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'size', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true, default: false },
    { name: 'invalid', kind: 'boolean', reflected: true, default: false },
    { name: 'required', kind: 'boolean', reflected: true, default: false },
    { name: 'readonly', kind: 'boolean', reflected: true, default: false },
  ],
  events: [
    { name: 'input', description: ['Значение изменилось при вводе.', 'Value changed while typing.'], detail: '{ value: string }' },
    { name: 'change', description: ['Значение зафиксировано.', 'Value committed.'], detail: '{ value: string }' },
  ],
  slots: ['prefix', 'suffix'],
  parts: ['label', 'control', 'input', 'hint'],
  methods: [],
  keyboard: ['Tab'],
  states: ['disabled', 'invalid'],
  responsive: 'container',
  focus: 'native',
  docs: {
    guidance: [
      'Подпись, контрол и hint задаются атрибутами; не собирайте разметку поля вручную. Слоты prefix/suffix — только для дополнительной композиции.',
      'Label, control, and hint come from attributes; do not rebuild the field markup by hand. Use prefix/suffix only for extra composition.',
    ],
    slots: [
      { name: 'prefix', description: ['Содержимое слева от поля.', 'Content before the control.'] },
      { name: 'suffix', description: ['Содержимое справа от поля.', 'Content after the control.'] },
    ],
    parts: [
      { name: 'label', description: ['Подпись.', 'Label.'] },
      { name: 'control', description: ['Оболочка контрола.', 'Control chrome.'] },
      { name: 'input', description: ['Нативный input.', 'Native input.'] },
      { name: 'hint', description: ['Подсказка.', 'Hint.'] },
    ],
    tokens: ['--vui-size-control', '--vui-radius-field', '--vui-color-danger', '--vui-field-inline'],
  },
});

export interface VInput {
  type: string;
  readonly: boolean;
}
