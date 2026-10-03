import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { fieldStyles } from '../../core/styles';

export class VField extends VuiElement {
  declare label: string;
  declare hint: string;
  declare disabled: boolean;
  declare invalid: boolean;
  declare required: boolean;

  static get observedAttributes(): string[] {
    return ['label', 'hint', 'disabled', 'invalid', 'required'];
  }

  protected template(): string {
    return `
      <div class="field" part="field">
        <div class="label" part="label"></div>
        <div class="control" part="control"><slot></slot></div>
        <div class="hint" part="hint"></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      ${fieldStyles}
      :host {
        display: block;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        container-type: inline-size;
        container-name: vui-field;
      }
      .label:empty, .hint:empty { display: none; }
      :host([invalid]) .hint { color: var(--vui-color-danger); }
      :host([disabled]) { opacity: 0.55; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot').addEventListener('slotchange', () => this.sync());
  }

  protected sync(): void {
    const label = this.qs('[part="label"]');
    const hint = this.qs('[part="hint"]');
    const control = this.qs('[part="control"]');
    const text = this.getAttribute('label') ?? '';
    label.textContent = text;
    if (!label.id) label.id = `vui-field-${Math.random().toString(36).slice(2, 9)}`;
    hint.textContent = this.getAttribute('hint') ?? '';
    if (!hint.id) hint.id = `${label.id}-hint`;
    if (text) control.setAttribute('aria-labelledby', label.id);
    else control.removeAttribute('aria-labelledby');
    if (hint.textContent) control.setAttribute('aria-describedby', hint.id);
    else control.removeAttribute('aria-describedby');
    control.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
    control.setAttribute('aria-disabled', this.hasAttribute('disabled') ? 'true' : 'false');
    if (this.hasAttribute('required')) control.setAttribute('aria-required', 'true');
    else control.removeAttribute('aria-required');
    this.paintChildren();
  }

  private paintChildren(): void {
    const disabled = this.hasAttribute('disabled');
    for (const child of this.children) {
      if (disabled) {
        if (!child.hasAttribute('disabled')) {
          child.setAttribute('disabled', '');
          child.setAttribute('data-field-disabled', '');
        }
      } else if (child.hasAttribute('data-field-disabled')) {
        child.removeAttribute('disabled');
        child.removeAttribute('data-field-disabled');
      }
    }
  }
}

reflectStrings(VField, ['label', 'hint']);
reflectBooleans(VField, ['disabled', 'invalid', 'required']);
defineElement('vui-field', VField);

registerContract({
  element: 'vui-field',
  className: 'VField',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'hint', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'invalid', kind: 'boolean', reflected: true },
    { name: 'required', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['field', 'label', 'control', 'hint'],
  methods: [],
  keyboard: ['Tab'],
  states: ['disabled', 'invalid'],
  responsive: 'container',
  focus: 'native',
});

export class VFieldGroup extends VuiElement {
  declare label: string;
  declare hint: string;
  declare disabled: boolean;

  static get observedAttributes(): string[] {
    return ['label', 'hint', 'disabled'];
  }

  protected template(): string {
    return `
      <fieldset part="group">
        <legend part="label"></legend>
        <div part="body"><slot></slot></div>
        <div class="hint" part="hint"></div>
      </fieldset>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      fieldset {
        margin: 0;
        padding: 0;
        border: 0;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: var(--vui-space-sm);
      }
      legend { padding: 0; font-weight: var(--vui-font-weight-strong); }
      .hint { color: var(--vui-color-text-muted); font-size: var(--vui-font-size-sm); }
      legend:empty, .hint:empty { display: none; }
      :host([disabled]) { opacity: 0.55; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot').addEventListener('slotchange', () => this.sync());
  }

  protected sync(): void {
    const legend = this.qs('legend');
    const hint = this.qs('.hint');
    const fieldset = this.qs<HTMLFieldSetElement>('fieldset');
    legend.textContent = this.getAttribute('label') ?? '';
    hint.textContent = this.getAttribute('hint') ?? '';
    const disabled = this.hasAttribute('disabled');
    fieldset.toggleAttribute('disabled', disabled);
    fieldset.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    for (const child of this.children) {
      if (disabled) {
        if (!child.hasAttribute('disabled')) {
          child.setAttribute('disabled', '');
          child.setAttribute('data-field-disabled', '');
        }
      } else if (child.hasAttribute('data-field-disabled')) {
        child.removeAttribute('disabled');
        child.removeAttribute('data-field-disabled');
      }
    }
  }
}

reflectStrings(VFieldGroup, ['label', 'hint']);
reflectBooleans(VFieldGroup, ['disabled']);
defineElement('vui-field-group', VFieldGroup);

registerContract({
  element: 'vui-field-group',
  className: 'VFieldGroup',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'hint', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['group', 'label', 'body', 'hint'],
  methods: [],
  keyboard: ['Tab'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'native',
});
