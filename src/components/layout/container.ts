import { defineElement } from '../../core/define';
import { applySpace } from '../../core/layout';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';
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
        max-width: min(100%, 64rem);
        margin-inline: auto;
        box-sizing: border-box;
        padding: var(--vui-layout-padding, 0);
      }
      :host([size="small"]) { max-width: min(100%, 40rem); }
      :host([size="large"]) { max-width: min(100%, 80rem); }
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
    { name: 'size', kind: 'enum', values: ['small', 'medium', 'large'], reflected: true },
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
