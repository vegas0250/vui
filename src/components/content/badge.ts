import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VBadge extends VuiElement {
  declare variant: string;

  static get observedAttributes(): string[] {
    return ['variant'];
  }

  protected template(): string {
    return `<span part="badge"><slot></slot></span>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; }
      [part="badge"] {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        padding: var(--vui-space-2xs) var(--vui-space-xs);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius-sm);
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        font-size: var(--vui-font-size-sm);
        line-height: var(--vui-line-height);
        overflow-wrap: anywhere;
      }
      :host([variant="info"]) [part="badge"] {
        border-color: var(--vui-color-info);
        background: var(--vui-color-info-surface);
      }
      :host([variant="success"]) [part="badge"] {
        border-color: var(--vui-color-success);
        background: var(--vui-color-success-surface);
      }
      :host([variant="warning"]) [part="badge"] {
        border-color: var(--vui-color-warning);
        background: var(--vui-color-warning-surface);
      }
      :host([variant="danger"]) [part="badge"] {
        border-color: var(--vui-color-danger);
        background: var(--vui-color-danger-surface);
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }
}

reflectStrings(VBadge, ['variant']);
defineElement('vui-badge', VBadge);

registerContract({
  element: 'vui-badge',
  className: 'VBadge',
  attributes: [{ name: 'variant', kind: 'enum', values: ['neutral', 'info', 'success', 'warning', 'danger'], reflected: true }],
  events: [],
  slots: [''],
  parts: ['badge'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
