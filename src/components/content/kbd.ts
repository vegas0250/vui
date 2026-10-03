import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';

export class VKbd extends VuiElement {
  protected template(): string {
    return `<kbd part="kbd"><slot></slot></kbd>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; }
      kbd {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
        padding: var(--vui-space-2xs) var(--vui-space-xs);
        border: var(--vui-border-width) solid var(--vui-color-border-strong);
        border-radius: var(--vui-radius-sm);
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        font-family: var(--vui-font-mono);
        font-size: var(--vui-font-size-sm);
        line-height: 1;
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }
}

defineElement('vui-kbd', VKbd);

registerContract({
  element: 'vui-kbd',
  className: 'VKbd',
  attributes: [],
  events: [],
  slots: [''],
  parts: ['kbd'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
