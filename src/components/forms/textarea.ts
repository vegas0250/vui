import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { emitChange, emitInput } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { controlStyles, fieldStyles } from '../../core/styles';

export class VTextarea extends VuiElement {
  declare label: string;
  declare placeholder: string;
  declare name: string;
  declare hint: string;
  declare rows: string;
  declare disabled: boolean;
  declare invalid: boolean;
  declare required: boolean;

  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['label', 'value', 'placeholder', 'disabled', 'invalid', 'name', 'required', 'hint', 'readonly', 'rows'];
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
    return this.shadow.querySelector('textarea')?.value ?? this.getAttribute('value') ?? '';
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  protected template(): string {
    return `
      <div class="field">
        <label class="label" part="label"></label>
        <div class="control" part="control">
          <textarea part="input"></textarea>
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
      textarea {
        flex: 1 1 auto;
        width: 100%;
        min-width: 0;
        min-height: calc(var(--vui-size-control) * 2);
        resize: vertical;
        border: 0;
        outline: none;
        background: transparent;
        padding-block: var(--vui-space-xs);
        field-sizing: content;
      }
      .label:empty, .hint:empty { display: none; }
      :host([readonly]) textarea { cursor: default; }
    `;
  }

  protected afterRender(): void {
    const area = this.qs<HTMLTextAreaElement>('textarea');
    area.id = `vui-textarea-${Math.random().toString(36).slice(2, 9)}`;
    area.addEventListener('input', () => {
      this.internals?.setFormValue(area.value);
      if (this.getAttribute('value') !== area.value) this.setAttribute('value', area.value);
      emitInput(this);
    });
    area.addEventListener('change', () => emitChange(this));
  }

  protected sync(): void {
    const area = this.qs<HTMLTextAreaElement>('textarea');
    const label = this.qs<HTMLLabelElement>('label');
    const hint = this.qs<HTMLElement>('.hint');
    const next = this.getAttribute('value') ?? '';
    if (area.value !== next) area.value = next;
    area.placeholder = this.getAttribute('placeholder') ?? '';
    area.disabled = this.isDisabled();
    area.required = this.hasAttribute('required');
    area.readOnly = this.hasAttribute('readonly');
    const rows = Number(this.getAttribute('rows'));
    area.rows = Number.isFinite(rows) && rows > 0 ? Math.floor(rows) : 4;
    area.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
    const text = this.getAttribute('label') ?? '';
    label.textContent = text;
    label.htmlFor = area.id;
    hint.textContent = this.getAttribute('hint') ?? '';
    if (!hint.id) hint.id = `${area.id}-hint`;
    if (hint.textContent) area.setAttribute('aria-describedby', hint.id);
    else area.removeAttribute('aria-describedby');
    this.internals?.setFormValue(area.value);
  }
}

reflectStrings(VTextarea, ['label', 'placeholder', 'name', 'hint', 'rows']);
reflectBooleans(VTextarea, ['disabled', 'invalid', 'required', 'readonly']);
defineElement('vui-textarea', VTextarea);

registerContract({
  element: 'vui-textarea',
  className: 'VTextarea',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'placeholder', kind: 'string', reflected: true },
    { name: 'hint', kind: 'string', reflected: true },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'rows', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'invalid', kind: 'boolean', reflected: true },
    { name: 'required', kind: 'boolean', reflected: true },
    { name: 'readonly', kind: 'boolean', reflected: true },
  ],
  events: ['input', 'change'],
  slots: [],
  parts: ['label', 'control', 'input', 'hint'],
  methods: [],
  keyboard: ['Tab'],
  states: ['disabled', 'invalid'],
  responsive: 'container',
  focus: 'native',
});

export interface VTextarea {
  readonly: boolean;
}
