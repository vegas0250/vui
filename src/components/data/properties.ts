import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VProperty extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `
      <div part="row">
        <span part="label"></span>
        <span part="value"><slot></slot></span>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      [part="row"] {
        display: grid;
        grid-template-columns: minmax(6rem, 40%) minmax(0, 1fr);
        gap: var(--vui-space-sm);
        min-width: 0;
        padding-block: var(--vui-space-2xs);
      }
      [part="label"] { color: var(--vui-color-text-muted); font-size: var(--vui-font-size-sm); }
      [part="value"] { min-width: 0; overflow-wrap: anywhere; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
      @container vui-properties (max-width: 22rem) {
        [part="row"] { grid-template-columns: minmax(0, 1fr); }
      }
    `;
  }

  protected sync(): void {
    this.qs('[part="label"]').textContent = this.getAttribute('label') ?? '';
  }
}

reflectStrings(VProperty, ['label']);
defineElement('vui-property', VProperty);

registerContract({
  element: 'vui-property',
  className: 'VProperty',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: [],
  slots: [''],
  parts: ['row', 'label', 'value'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'container',
  focus: 'native',
});

export class VProperties extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `<div part="list"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;
        container-type: inline-size;
        container-name: vui-properties;
      }
      [part="list"] { display: flex; flex-direction: column; min-width: 0; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    const list = this.qs('[part="list"]');
    const label = this.getAttribute('label') ?? '';
    if (label) list.setAttribute('aria-label', label);
    else list.removeAttribute('aria-label');
  }
}

reflectStrings(VProperties, ['label']);
defineElement('vui-properties', VProperties);

registerContract({
  element: 'vui-properties',
  className: 'VProperties',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: [],
  slots: [''],
  parts: ['list'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'container',
  focus: 'native',
});
