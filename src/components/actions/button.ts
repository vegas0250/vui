import { buttonStyles } from './button-styles';
import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

export class VButton extends VuiElement {
  declare variant: string;
  declare size: string;
  declare name: string;
  declare value: string;
  declare form: string;
  declare disabled: boolean;

  static get observedAttributes(): string[] {
    return ['variant', 'size', 'disabled', 'type', 'name', 'value', 'form'];
  }

  protected template(): string {
    return `
      <button part="base" type="button">
        <slot name="icon"></slot>
        <slot></slot>
      </button>
    `;
  }

  protected componentStyles(): string {
    return buttonStyles;
  }

  protected sync(): void {
    const button = this.qs<HTMLButtonElement>('button');
    const type = this.getAttribute('type');
    button.type = type === 'submit' || type === 'reset' ? type : 'button';
    button.disabled = this.isDisabled();
    const name = this.getAttribute('name');
    const value = this.getAttribute('value');
    if (name) button.name = name;
    else button.removeAttribute('name');
    if (value !== null) button.value = value;
    else button.removeAttribute('value');
    const form = this.getAttribute('form');
    if (form) button.setAttribute('form', form);
    else button.removeAttribute('form');
  }
}

reflectStrings(VButton, ['variant', 'size', 'type', 'name', 'value', 'form']);
reflectBooleans(VButton, ['disabled']);
defineElement('vui-button', VButton);

registerContract({
  element: 'vui-button',
  className: 'VButton',
  attributes: [
    { name: 'variant', kind: 'enum', values: ['primary', 'secondary', 'ghost', 'danger'], reflected: true },
    { name: 'size', kind: 'enum', values: ['small', 'medium', 'large'], reflected: true },
    { name: 'type', kind: 'enum', values: ['button', 'submit', 'reset'], reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'form', kind: 'string', reflected: true },
  ],
  events: ['click'],
  slots: ['', 'icon'],
  parts: ['base'],
  methods: [],
  keyboard: ['Tab', 'Enter', 'Space'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'native',
});

export interface VButton {
  type: string;
}
