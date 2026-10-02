import { buttonStyles } from './button-styles';
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

export interface VButton {
  type: string;
}
