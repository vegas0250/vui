import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';

const checkIcon = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M20 6 9 17l-5-5"></path>
</svg>`;

export class VuiCheckbox extends VuiElement {
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
      :host { display: inline-flex; vertical-align: middle; }
      .field {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-sm);
        cursor: pointer;
        min-height: var(--vui-size-control);
      }
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
        .box { border: 1px solid ButtonText; background: Field; }
        input:checked + .box { background: Highlight; color: HighlightText; }
      }
    `;
  }

  protected afterRender(): void {
    this.qs<HTMLInputElement>('input').addEventListener('change', () => {
      const input = this.qs<HTMLInputElement>('input');
      this.toggleAttribute('checked', input.checked);
      this.writeFormValue();
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

defineElement('vui-checkbox', VuiCheckbox);
