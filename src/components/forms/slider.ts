import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { emitChange, emitInput } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { fieldStyles } from '../../core/styles';

function readNumber(element: HTMLElement, name: string, fallback: number): number {
  if (!element.hasAttribute(name)) return fallback;
  const raw = Number(element.getAttribute(name));
  return Number.isFinite(raw) ? raw : fallback;
}

export class VSlider extends VuiElement {
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
    return ['label', 'hint', 'name', 'min', 'max', 'step', 'value', 'value-end', 'disabled', 'invalid'];
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

  get valueEnd(): string {
    return this.getAttribute('value-end') ?? '';
  }

  set valueEnd(next: string | null) {
    if (next == null || next === '') this.removeAttribute('value-end');
    else this.setAttribute('value-end', next);
  }

  protected template(): string {
    return `
      <div class="field">
        <label class="label" part="label"></label>
        <div class="control" part="control">
          <input part="input" type="range" />
          <input part="end" type="range" hidden />
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
      input[type="range"] {
        width: 100%;
        min-width: 0;
        accent-color: var(--vui-color-primary);
      }
      input[hidden] { display: none; }
      .label:empty, .hint:empty { display: none; }
      :host([invalid]) input { outline: var(--vui-border-width) solid var(--vui-color-danger); }
      input:focus-visible { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
    `;
  }

  protected afterRender(): void {
    const start = this.qs<HTMLInputElement>('[part="input"]');
    const end = this.qs<HTMLInputElement>('[part="end"]');
    start.id = `vui-slider-${Math.random().toString(36).slice(2, 9)}`;
    const publish = (commit: boolean): void => {
      if (this.hasAttribute('value-end')) {
        let low = Number(start.value);
        let high = Number(end.value);
        if (low > high) {
          if (this.shadow.activeElement === end) low = high;
          else high = low;
          start.value = String(low);
          end.value = String(high);
        }
        this.setAttribute('value-end', String(high));
      }
      this.setAttribute('value', start.value);
      this.writeForm();
      if (commit) emitChange(this);
      else emitInput(this);
    };
    start.addEventListener('input', () => publish(false));
    end.addEventListener('input', () => publish(false));
    start.addEventListener('change', () => publish(true));
    end.addEventListener('change', () => publish(true));
  }

  protected sync(): void {
    const start = this.qs<HTMLInputElement>('[part="input"]');
    const end = this.qs<HTMLInputElement>('[part="end"]');
    const label = this.qs<HTMLLabelElement>('label');
    const hint = this.qs<HTMLElement>('.hint');
    const min = readNumber(this, 'min', 0);
    const max = readNumber(this, 'max', 100);
    const step = this.getAttribute('step') ?? '1';
    const low = Math.min(max, Math.max(min, Number(this.value) || min));
    for (const input of [start, end]) {
      input.min = String(min);
      input.max = String(max);
      input.step = step;
      input.disabled = this.isDisabled();
      input.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
    }
    if (start.value !== String(low)) start.value = String(low);
    const ranged = this.hasAttribute('value-end');
    end.hidden = !ranged;
    if (ranged) {
      const high = Math.max(low, Math.min(max, Number(this.valueEnd) || max));
      if (end.value !== String(high)) end.value = String(high);
      end.setAttribute('aria-label', `${this.getAttribute('label') ?? 'Value'} end`);
    }
    const text = this.getAttribute('label') ?? '';
    label.textContent = text;
    label.htmlFor = start.id;
    hint.textContent = this.getAttribute('hint') ?? '';
    if (!hint.id) hint.id = `${start.id}-hint`;
    if (hint.textContent) start.setAttribute('aria-describedby', hint.id);
    else start.removeAttribute('aria-describedby');
    this.writeForm();
  }

  private writeForm(): void {
    const end = this.hasAttribute('value-end') ? this.valueEnd : '';
    this.internals?.setFormValue(end ? `${this.value},${end}` : this.value);
  }
}

reflectStrings(VSlider, ['label', 'hint', 'name', 'min', 'max', 'step']);
reflectBooleans(VSlider, ['disabled', 'invalid']);
defineElement('vui-slider', VSlider);

registerContract({
  element: 'vui-slider',
  className: 'VSlider',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'hint', kind: 'string', reflected: true },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'min', kind: 'string', reflected: true },
    { name: 'max', kind: 'string', reflected: true },
    { name: 'step', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'value-end', kind: 'string', property: 'valueEnd', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'invalid', kind: 'boolean', reflected: true },
  ],
  events: ['input', 'change'],
  slots: [],
  parts: ['label', 'control', 'input', 'end', 'hint'],
  methods: [],
  keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'],
  states: ['disabled', 'invalid'],
  responsive: 'container',
  focus: 'native',
});
