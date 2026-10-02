import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VSkeleton extends VuiElement {
  declare variant: string;

  static get observedAttributes(): string[] {
    return ['variant'];
  }

  protected template(): string {
    return `<div part="shape" aria-hidden="true"></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      [part="shape"] {
        min-height: var(--vui-size-control);
        border-radius: var(--vui-radius);
        background: var(--vui-color-surface);
        border: var(--vui-border-width) solid var(--vui-color-border);
      }
      :host([variant="text"]) [part="shape"] {
        min-height: var(--vui-space-sm);
        border-radius: var(--vui-radius-sm);
      }
      :host([variant="circle"]) {
        display: inline-flex;
        width: var(--vui-size-control);
      }
      :host([variant="circle"]) [part="shape"] {
        width: 100%;
        aspect-ratio: 1;
        min-height: 0;
        border-radius: 50%;
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    this.setAttribute('aria-hidden', 'true');
  }
}

reflectStrings(VSkeleton, ['variant']);
defineElement('vui-skeleton', VSkeleton);

registerContract({
  element: 'vui-skeleton',
  className: 'VSkeleton',
  attributes: [{ name: 'variant', kind: 'enum', values: ['block', 'text', 'circle'], reflected: true }],
  events: [],
  slots: [],
  parts: ['shape'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
