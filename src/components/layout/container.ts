import { defineElement } from '../../utils/define';
import { applySpace } from '../../utils/layout';
import { VuiElement } from '../../utils/element';
import { reflectStrings } from '../../utils/reflect';
import { registerContract } from '../../contract/registry';

export class VContainer extends VuiElement {
  declare size: string;
  declare padding: string;

  static get observedAttributes(): string[] {
    return ['size', 'padding'];
  }

  protected template(): string {
    return `<div part="body"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: block;
        width: 100%;
        min-width: 0;
        max-width: min(100%, var(--vui-container-md, 64rem));
        margin-inline: auto;
        box-sizing: border-box;
        padding: var(--vui-layout-padding, 0);
      }
      :host([size="small"]) { max-width: min(100%, var(--vui-container-sm, 40rem)); }
      :host([size="large"]) { max-width: min(100%, var(--vui-container-lg, 80rem)); }
      :host([size="xlarge"]) { max-width: min(100%, var(--vui-container-xl, 96rem)); }
      :host([size="full"]) { max-width: 100%; }
      [part="body"] { min-width: 0; max-width: 100%; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    const padding = this.getAttribute('padding');
    if (padding) applySpace(this, '--vui-layout-padding', padding, '0');
    else this.style.removeProperty('--vui-layout-padding');
  }
}

reflectStrings(VContainer, ['size', 'padding']);
defineElement('vui-container', VContainer);

registerContract({
  element: 'vui-container',
  className: 'VContainer',
  attributes: [
    { name: 'size', kind: 'enum', values: ['small', 'medium', 'large', 'xlarge', 'full'], reflected: true },
    { name: 'padding', kind: 'string', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['body'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
