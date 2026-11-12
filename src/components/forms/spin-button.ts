import { defineElement } from '../../utils/define';
import { registerContract } from '../../contract/registry';
import { emitChange, emitInput } from '../../utils/events';
import { VuiElement } from '../../utils/element';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';
import { fieldStyles } from '../../utils/styles';

function readNumber(element: HTMLElement, name: string, fallback: number): number {
  if (!element.hasAttribute(name)) return fallback;
  const raw = Number(element.getAttribute(name));
  return Number.isFinite(raw) ? raw : fallback;
}

/** Fluent UI Web Controls: SpinButton */
export class VSpinButton extends VuiElement {
  declare label: string;
  declare hint: string;
  declare name: string;
  declare min: string;
  declare max: string;
  declare step: string;
  declare disabled: boolean;
  declare invalid: boolean;

  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['label', 'hint', 'name', 'min', 'max', 'step', 'value', 'disabled', 'invalid'];
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
    return this.getAttribute('value') ?? String(readNumber(this, 'min', 0));
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  protected template(): string {
    return `
      <div class="field">
        <label class="label" part="label"></label>
        <div class="control" part="control">
          <button type="button" part="decrement" aria-label="Decrease" tabindex="-1">−</button>
          <input part="input" type="number" />
          <button type="button" part="increment" aria-label="Increase" tabindex="-1">+</button>
        </div>
        <div class="hint" part="hint"></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      ${fieldStyles}
      :host {
        display: flex;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        container-type: inline-size;
        container-name: vui-field;
      }
      .control {
        display: inline-flex;
        align-items: stretch;
        width: max-content;
        max-width: 100%;
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius-field);
        background: var(--vui-color-field, var(--vui-color-surface));
        overflow: hidden;
      }
      input {
        width: 4.5rem;
        min-width: 0;
        border: 0;
        background: transparent;
        color: var(--vui-color-text);
        font: inherit;
        text-align: center;
        height: var(--vui-size-control);
        padding: 0 var(--vui-space-xs);
      }
      button {
        appearance: none;
        margin: 0;
        border: 0;
        background: var(--vui-color-surface-hover, var(--vui-color-surface));
        color: var(--vui-color-text);
        width: var(--vui-size-control-sm);
        cursor: pointer;
        font: inherit;
        line-height: 1;
      }
      button:focus-visible, input:focus-visible {
        outline: var(--vui-focus-ring);
        outline-offset: var(--vui-focus-offset);
      }
      :host([invalid]) .control { border-color: var(--vui-color-danger); }
      :host([disabled]) .control { opacity: var(--vui-opacity-disabled); }
      .label:empty, .hint:empty { display: none; }
    `;
  }

  protected afterRender(): void {
    const input = this.qs<HTMLInputElement>('[part="input"]');
    input.id = `vui-spin-${Math.random().toString(36).slice(2, 9)}`;
    const publish = (commit: boolean): void => {
      this.value = input.value;
      emitInput(this);
      if (commit) emitChange(this);
      this.internals?.setFormValue(this.value);
    };
    const nudge = (dir: 1 | -1): void => {
      if (this.disabled) return;
      const min = readNumber(this, 'min', Number.NEGATIVE_INFINITY);
      const max = readNumber(this, 'max', Number.POSITIVE_INFINITY);
      const step = Math.max(readNumber(this, 'step', 1), Number.EPSILON);
      const next = Math.min(max, Math.max(min, (Number(input.value) || 0) + dir * step));
      input.value = String(next);
      publish(true);
    };
    this.bind('input', input, 'input', () => publish(false));
    this.bind('change', input, 'change', () => publish(true));
    this.bind('dec', this.qs('[part="decrement"]'), 'click', () => nudge(-1));
    this.bind('inc', this.qs('[part="increment"]'), 'click', () => nudge(1));
  }

  protected sync(): void {
    const input = this.qs<HTMLInputElement>('[part="input"]');
    const label = this.qs<HTMLLabelElement>('.label');
    const hint = this.qs('.hint');
    label.textContent = this.getAttribute('label') ?? '';
    if (label.textContent) label.htmlFor = input.id;
    hint.id = `${input.id}-hint`;
    hint.textContent = this.getAttribute('hint') ?? '';
    input.name = this.getAttribute('name') ?? '';
    input.min = this.getAttribute('min') ?? '';
    input.max = this.getAttribute('max') ?? '';
    input.step = this.getAttribute('step') ?? '1';
    input.value = this.value;
    input.disabled = this.disabled;
    input.setAttribute('aria-invalid', String(this.invalid));
    if (hint.textContent) input.setAttribute('aria-describedby', hint.id);
    else input.removeAttribute('aria-describedby');
    this.qs<HTMLButtonElement>('[part="decrement"]').disabled = this.disabled;
    this.qs<HTMLButtonElement>('[part="increment"]').disabled = this.disabled;
    this.internals?.setFormValue(this.value);
  }
}

reflectStrings(VSpinButton, ['label', 'hint', 'name', 'min', 'max', 'step']);
reflectBooleans(VSpinButton, ['disabled', 'invalid']);
defineElement('vui-spin-button', VSpinButton);

registerContract({
  element: 'vui-spin-button',
  className: 'VSpinButton',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'hint', kind: 'string', reflected: true },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'min', kind: 'string', reflected: true },
    { name: 'max', kind: 'string', reflected: true },
    { name: 'step', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'invalid', kind: 'boolean', reflected: true },
  ],
  events: ['input', 'change'],
  slots: [],
  parts: ['label', 'control', 'input', 'decrement', 'increment', 'hint'],
  methods: [],
  keyboard: ['ArrowUp', 'ArrowDown'],
  states: ['disabled', 'invalid'],
  responsive: 'container',
  focus: 'native',
});
