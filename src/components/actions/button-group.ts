import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

export class VButtonGroup extends VuiElement {
  declare label: string;
  declare orientation: string;
  declare disabled: boolean;

  static get observedAttributes(): string[] {
    return ['label', 'orientation', 'disabled'];
  }

  protected template(): string {
    return `<div part="group" role="group"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; }
      :host([disabled]) { opacity: 0.55; }
      [part="group"] {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--vui-space-2xs);
        min-width: 0;
        max-width: 100%;
      }
      :host([orientation="vertical"]) [part="group"] { flex-direction: column; align-items: stretch; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    const group = this.qs('[part="group"]');
    const label = this.getAttribute('label') ?? '';
    if (label) group.setAttribute('aria-label', label);
    else group.removeAttribute('aria-label');
    const disabled = this.hasAttribute('disabled');
    group.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    this.toggleAttribute('inert', disabled);
    const orientation = this.getAttribute('orientation') === 'vertical' ? 'vertical' : 'horizontal';
    group.setAttribute('aria-orientation', orientation);
  }
}

reflectStrings(VButtonGroup, ['label', 'orientation']);
reflectBooleans(VButtonGroup, ['disabled']);
defineElement('vui-button-group', VButtonGroup);

registerContract({
  element: 'vui-button-group',
  className: 'VButtonGroup',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'orientation', kind: 'enum', values: ['horizontal', 'vertical'], reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['group'],
  methods: [],
  keyboard: ['Tab'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'native',
});
