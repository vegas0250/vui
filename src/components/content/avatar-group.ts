import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VAvatarGroup extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `<div part="group"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; }
      [part="group"] {
        display: inline-flex;
        align-items: center;
        min-width: 0;
        max-width: 100%;
      }
      ::slotted(*) { margin-inline-start: calc(var(--vui-space-xs) * -1); }
      ::slotted(*:first-child) { margin-inline-start: 0; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    const group = this.qs('[part="group"]');
    const label = this.getAttribute('label') ?? '';
    if (label) group.setAttribute('aria-label', label);
    else group.removeAttribute('aria-label');
  }
}

reflectStrings(VAvatarGroup, ['label']);
defineElement('vui-avatar-group', VAvatarGroup);

registerContract({
  element: 'vui-avatar-group',
  className: 'VAvatarGroup',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: [],
  slots: [''],
  parts: ['group'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
