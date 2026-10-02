import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';

export class VSwitch extends VuiElement {
  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['checked', 'disabled', 'name', 'value', 'label'];
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
        <input type="checkbox" role="switch" part="input" />
        <span class="track" aria-hidden="true"><span class="thumb"></span></span>
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
      .track {
        position: relative;
        width: calc(var(--vui-size-control) * 1.2);
        height: calc(var(--vui-size-control) * 0.66);
        border-radius: 999px;
        border: var(--vui-border-width) solid var(--vui-color-border-strong);
        background: var(--vui-color-surface-sunken);
        flex: 0 0 auto;
      }
      .thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: calc(var(--vui-size-control) * 0.66 - 6px);
        height: calc(var(--vui-size-control) * 0.66 - 6px);
        border-radius: 50%;
        background: var(--vui-color-text-muted);
        transition: transform var(--vui-duration) var(--vui-easing), background var(--vui-duration) var(--vui-easing);
      }
      input:checked + .track {
        background: var(--vui-color-primary);
        border-color: var(--vui-color-primary);
      }
      input:checked + .track .thumb {
        background: var(--vui-color-on-primary);
        transform: translateX(calc(var(--vui-size-control) * 0.54));
      }
      input:focus-visible + .track {
        outline: var(--vui-focus-ring);
        outline-offset: var(--vui-focus-offset);
      }
      :host([disabled]) .field { opacity: 0.55; cursor: not-allowed; }
      .text:empty { display: none; }
      @media (forced-colors: active) {
        .track { border: 1px solid ButtonText; background: Field; }
        .thumb { background: ButtonText; }
        input:checked + .track { background: Highlight; }
        input:checked + .track .thumb { background: HighlightText; }
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
    const label = this.getAttribute('label');
    if (label) input.setAttribute('aria-label', label);
    else input.removeAttribute('aria-label');
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

defineElement('vui-switch', VSwitch);
