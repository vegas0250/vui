import { toneStyles } from '../../theme/tone-styles';
import { tones, type VuiTone } from '../../theme/presets';
import '../../components/foundation/icon';
import { buttonStyles } from './button-styles';
import { registerContract } from '../../contract/registry';
import { defineElement } from '../../utils/define';
import { VuiElement } from '../../utils/element';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';
import type { VIcon } from '../foundation/icon';

export class VIconButton extends VuiElement {
  declare name: string;
  declare label: string;
  declare variant: string;
  declare tone: VuiTone;
  declare size: string;
  declare disabled: boolean;
  declare loading: boolean;

  static get observedAttributes(): string[] {
    return ['tone', 'name', 'label', 'variant', 'size', 'disabled', 'loading', 'type'];
  }

  protected template(): string {
    return `
      <button part="base" type="button">
        <span part="busy" hidden></span>
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
      button:hover { background: var(--vui-color-hover, var(--vui-color-surface-hover)); }
      :host([size="small"]) button {
        width: var(--vui-size-control-sm);
        min-width: var(--vui-size-control-sm);
      }
      :host([size="large"]) button {
        width: var(--vui-size-control-lg);
        min-width: var(--vui-size-control-lg);
      }
      :host([size="large"]) vui-icon {
        width: calc(var(--vui-icon-size) * 1.25);
        height: calc(var(--vui-icon-size) * 1.25);
        min-width: calc(var(--vui-icon-size) * 1.25);
        max-width: calc(var(--vui-icon-size) * 1.25);
        flex: 0 0 calc(var(--vui-icon-size) * 1.25);
      }
      :host([variant="primary"]) button {
        background: var(--vui-color-primary);
        color: var(--vui-color-on-primary);
      }
      :host([variant="primary"]) button:hover { background: var(--vui-color-primary-hover); }
      :host([variant="secondary"]) button {
        background: var(--vui-color-surface);
        border-color: var(--vui-color-block-border, var(--vui-color-border));
      }
      :host([variant="danger"]) button {
        background: transparent;
        color: var(--vui-color-danger);
      }
      :host([variant="danger"]) button:hover {
        background: var(--vui-color-danger-surface);
      }
    ` + toneStyles('button', 'primary', 'solid');
  }

  protected sync(): void {
    const button = this.qs<HTMLButtonElement>('button');
    const icon = this.qs<VIcon>('vui-icon');
    const type = this.getAttribute('type');
    button.type = type === 'submit' || type === 'reset' ? type : 'button';
    const loading = this.hasAttribute('loading');
    button.disabled = this.isDisabled() || loading;
    button.setAttribute('aria-busy', loading ? 'true' : 'false');
    this.qs('[part="busy"]').toggleAttribute('hidden', !loading);
    const label = this.getAttribute('label') ?? '';
    button.setAttribute('aria-label', label);
    if (!label) button.setAttribute('aria-label', this.getAttribute('name') ?? 'Icon button');
    icon.setAttribute('name', this.getAttribute('name') ?? '');
  }
}

reflectStrings(VIconButton, ['tone', 'name', 'label', 'variant', 'size', 'type']);
reflectBooleans(VIconButton, ['disabled', 'loading']);
defineElement('vui-icon-button', VIconButton);

registerContract({
  element: 'vui-icon-button',
  className: 'VIconButton',
  attributes: [
    { name: 'tone', kind: 'enum', values: [...tones], reflected: true },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'label', kind: 'string', reflected: true },
    { name: 'variant', kind: 'enum', values: ['ghost', 'primary', 'secondary', 'danger', 'solid', 'soft', 'outline'], reflected: true },
    { name: 'size', kind: 'enum', values: ['small', 'medium', 'large'], reflected: true },
    { name: 'type', kind: 'enum', values: ['button', 'submit', 'reset'], reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'loading', kind: 'boolean', reflected: true },
  ],
  events: ['click'],
  slots: [],
  parts: ['base', 'busy', 'icon'],
  methods: [],
  keyboard: ['Tab', 'Enter', 'Space'],
  states: ['disabled', 'loading'],
  responsive: 'flow',
  focus: 'native',
});

export interface VIconButton {
  type: string;
}
