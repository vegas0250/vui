import { toneStyles } from '../../theme/tone-styles';
import { tones, type VuiTone } from '../../theme/presets';
import { defineElement } from '../../utils/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../utils/element';
import { reflectStrings } from '../../utils/reflect';

export class VBadge extends VuiElement {
  declare variant: string;
  declare tone: VuiTone;

  static get observedAttributes(): string[] {
    return ['tone', 'variant'];
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
        font-variant-numeric: tabular-nums;
        line-height: var(--vui-line-height);
        overflow-wrap: anywhere;
      }
      :host([variant="info"]) [part="badge"] {
        border-color: var(--vui-color-info);
        background: var(--vui-color-info-surface); color: var(--vui-color-info-text, var(--vui-color-text));
      }
      :host([variant="success"]) [part="badge"] {
        border-color: var(--vui-color-success);
        background: var(--vui-color-success-surface); color: var(--vui-color-success-text, var(--vui-color-text));
      }
      :host([variant="warning"]) [part="badge"] {
        border-color: var(--vui-color-warning);
        background: var(--vui-color-warning-surface); color: var(--vui-color-warning-text, var(--vui-color-text));
      }
      :host([variant="danger"]) [part="badge"] {
        border-color: var(--vui-color-danger);
        background: var(--vui-color-danger-surface); color: var(--vui-color-danger-text, var(--vui-color-text));
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    ` + toneStyles('[part="badge"]', 'neutral', 'soft');
  }
}

reflectStrings(VBadge, ['variant']);
reflectStrings(VBadge, ['tone']);
defineElement('vui-badge', VBadge);

registerContract({
  element: 'vui-badge',
  className: 'VBadge',
  attributes: [{ name: 'tone', kind: 'enum', values: [...tones], reflected: true },{ name: 'variant', kind: 'enum', values: ['neutral', 'info', 'success', 'warning', 'danger', 'solid', 'soft', 'outline', 'ghost'], reflected: true }],
  events: [],
  slots: [''],
  parts: ['badge'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
