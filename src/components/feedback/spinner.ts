import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VSpinner extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `
      <div part="spinner" role="status">
        <span part="mark" aria-hidden="true"></span>
        <span part="label"><slot></slot></span>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; }
      [part="spinner"] {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-xs);
        min-width: 0;
        max-width: 100%;
        color: var(--vui-color-text);
        font-size: var(--vui-font-size);
      }
      [part="mark"] {
        width: 1em;
        height: 1em;
        flex: 0 0 auto;
        box-sizing: border-box;
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-inline-start-color: var(--vui-color-primary);
        border-radius: 50%;
        animation: vui-spin calc(var(--vui-duration) * 8) linear infinite;
      }
      [part="label"]:empty { display: none; }
      @keyframes vui-spin { to { transform: rotate(360deg); } }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    const status = this.qs('[part="spinner"]');
    const visible = (this.textContent ?? '').trim().length > 0;
    if (visible) status.removeAttribute('aria-label');
    else status.setAttribute('aria-label', this.getAttribute('label') || 'Loading');
  }
}

reflectStrings(VSpinner, ['label']);
defineElement('vui-spinner', VSpinner);

registerContract({
  element: 'vui-spinner',
  className: 'VSpinner',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: [],
  slots: [''],
  parts: ['spinner', 'mark', 'label'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
  role: 'status',
});
