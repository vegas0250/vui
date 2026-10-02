import '../../components/foundation/icon';
import { buttonStyles } from './button-styles';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import type { VIcon } from '../foundation/icon';

export class VIconButton extends VuiElement {
  declare name: string;
  declare label: string;
  declare variant: string;
  declare size: string;
  declare disabled: boolean;

  static get observedAttributes(): string[] {
    return ['name', 'label', 'variant', 'size', 'disabled', 'type'];
  }

  protected template(): string {
    return `
      <button part="base" type="button">
        <vui-icon part="icon"></vui-icon>
      </button>
    `;
  }

  protected componentStyles(): string {
    return `
      ${buttonStyles}
      button {
        width: var(--vui-size-control);
        min-width: var(--vui-size-control);
        padding-inline: 0;
        background: transparent;
        color: var(--vui-color-text);
      }
      button:hover { background: var(--vui-color-surface-hover); }
      :host([size="small"]) button {
        width: var(--vui-size-control-sm);
        min-width: var(--vui-size-control-sm);
      }
      :host([size="large"]) button {
        width: var(--vui-size-control-lg);
        min-width: var(--vui-size-control-lg);
      }
      :host([variant="primary"]) button {
        background: var(--vui-color-primary);
        color: var(--vui-color-on-primary);
      }
      :host([variant="primary"]) button:hover { background: var(--vui-color-primary-hover); }
      :host([variant="secondary"]) button {
        background: var(--vui-color-surface);
        border-color: var(--vui-color-border);
      }
      :host([variant="danger"]) button {
        background: transparent;
        color: var(--vui-color-danger);
      }
      :host([variant="danger"]) button:hover {
        background: var(--vui-color-danger-surface);
      }
    `;
  }

  protected sync(): void {
    const button = this.qs<HTMLButtonElement>('button');
    const icon = this.qs<VIcon>('vui-icon');
    const type = this.getAttribute('type');
    button.type = type === 'submit' || type === 'reset' ? type : 'button';
    button.disabled = this.isDisabled();
    const label = this.getAttribute('label') ?? '';
    button.setAttribute('aria-label', label);
    if (!label) button.setAttribute('aria-label', this.getAttribute('name') ?? 'Icon button');
    icon.setAttribute('name', this.getAttribute('name') ?? '');
  }
}

reflectStrings(VIconButton, ['name', 'label', 'variant', 'size', 'type']);
reflectBooleans(VIconButton, ['disabled']);
defineElement('vui-icon-button', VIconButton);

export interface VIconButton {
  type: string;
}
