import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VSeparator extends VuiElement {
  declare orientation: string;
  declare label: string;

  static get observedAttributes(): string[] {
    return ['orientation', 'label'];
  }

  protected template(): string {
    return `<div part="rule"></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      [part="rule"] {
        border: 0;
        border-block-start: var(--vui-border-width) solid var(--vui-color-border);
        min-width: 0;
      }
      :host([orientation="vertical"]) {
        display: inline-flex;
        align-self: stretch;
        width: auto;
        height: auto;
      }
      :host([orientation="vertical"]) [part="rule"] {
        border-block-start: 0;
        border-inline-start: var(--vui-border-width) solid var(--vui-color-border);
        min-height: 1em;
        height: 100%;
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    const rule = this.qs('[part="rule"]');
    const vertical = this.getAttribute('orientation') === 'vertical';
    const label = this.getAttribute('label') ?? '';
    rule.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    if (label) {
      rule.setAttribute('role', 'separator');
      rule.setAttribute('aria-label', label);
      rule.removeAttribute('aria-hidden');
    } else {
      rule.setAttribute('role', 'none');
      rule.removeAttribute('aria-label');
      rule.setAttribute('aria-hidden', 'true');
    }
  }
}

reflectStrings(VSeparator, ['orientation', 'label']);
defineElement('vui-separator', VSeparator);

registerContract({
  element: 'vui-separator',
  className: 'VSeparator',
  attributes: [
    { name: 'orientation', kind: 'enum', values: ['horizontal', 'vertical'], reflected: true },
    { name: 'label', kind: 'string', reflected: true },
  ],
  events: [],
  slots: [],
  parts: ['rule'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
