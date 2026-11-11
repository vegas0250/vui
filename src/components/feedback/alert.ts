import { toneStyles } from '../../theme/tone-styles';
import { tones, type VuiTone } from '../../theme/presets';
import '../foundation/icon';
import { registerContract } from '../../contract/registry';
import { defineElement } from '../../utils/define';
import { VuiElement } from '../../utils/element';
import { emitClose } from '../../utils/events';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';
import type { VIcon } from '../foundation/icon';

const icons: Record<string, string> = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
};

export class VAlert extends VuiElement {
  declare variant: string;
  declare tone: VuiTone;
  declare closeLabel: string;
  declare closable: boolean;
  declare banner: boolean;

  static get observedAttributes(): string[] {
    return ['tone', 'variant', 'closable', 'close-label', 'banner'];
  }

  protected template(): string {
    return `
      <div class="alert" part="alert">
        <vui-icon part="icon"></vui-icon>
        <div class="content" part="content"><slot></slot></div>
        <button type="button" class="close" part="close" hidden>
          <vui-icon name="x"></vui-icon>
        </button>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      :host([hidden]) { display: none; }
      .alert {
        display: flex;
        align-items: flex-start;
        gap: var(--vui-space-sm);
        padding: var(--vui-space-sm) var(--vui-space-md);
        border: var(--vui-border-width) solid var(--vui-color-info);
        border-radius: var(--vui-radius-box, var(--vui-radius));
        background: var(--vui-color-info-surface); color: var(--vui-color-info-text, var(--vui-color-text));
      }
      .content { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }
      :host([variant="success"]) .alert {
        border-color: var(--vui-color-success);
        background: var(--vui-color-success-surface); color: var(--vui-color-success-text, var(--vui-color-text));
      }
      :host([variant="warning"]) .alert {
        border-color: var(--vui-color-warning);
        background: var(--vui-color-warning-surface); color: var(--vui-color-warning-text, var(--vui-color-text));
      }
      :host([variant="danger"]) .alert {
        border-color: var(--vui-color-danger);
        background: var(--vui-color-danger-surface); color: var(--vui-color-danger-text, var(--vui-color-text));
      }
      :host([variant="neutral"]) .alert {
        border-color: var(--vui-color-block-border, var(--vui-color-border));
        background: var(--vui-color-surface);
      }
      :host([banner]) .alert {
        border-radius: 0;
        border-inline: 0;
      }
      .close {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--vui-size-control-sm);
        height: var(--vui-size-control-sm);
        border: 0;
        border-radius: var(--vui-radius-field, var(--vui-radius-sm));
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .close:hover { background: var(--vui-color-hover, var(--vui-color-surface-hover)); }
      .close:focus-visible {
        outline: var(--vui-focus-ring);
        outline-offset: var(--vui-focus-offset);
      }
      .close[hidden] { display: none; }
    ` + toneStyles('.alert', 'info', 'soft');
  }

  protected afterRender(): void {
    this.qs('button.close').addEventListener('click', () => {
      this.hidden = true;
      emitClose(this);
    });
  }

  protected sync(): void {
    const variant = this.getAttribute('tone') ?? this.getAttribute('variant') ?? 'info';
    const icon = this.qs<VIcon>('vui-icon');
    icon.setAttribute('name', icons[variant] ?? 'info');
    const assertive = variant === 'warning' || variant === 'danger';
    this.qs('.alert').setAttribute('role', assertive ? 'alert' : 'status');
    const close = this.qs<HTMLButtonElement>('button.close');
    close.hidden = !this.hasAttribute('closable');
    close.setAttribute('aria-label', this.getAttribute('close-label') ?? 'Close');
  }
}

reflectStrings(VAlert, { variant: 'variant', closeLabel: 'close-label' });
reflectBooleans(VAlert, ['closable', 'banner']);
reflectStrings(VAlert, ['tone']);
defineElement('vui-alert', VAlert);

registerContract({
  element: 'vui-alert',
  className: 'VAlert',
  attributes: [{ name: 'tone', kind: 'enum', values: [...tones], reflected: true },
    { name: 'variant', kind: 'enum', values: ['info', 'success', 'warning', 'danger', 'neutral', 'solid', 'soft', 'outline', 'ghost'], reflected: true },
    { name: 'closable', kind: 'boolean', reflected: true },
    { name: 'banner', kind: 'boolean', reflected: true },
    { name: 'close-label', kind: 'string', property: 'closeLabel', reflected: true },
  ],
  events: ['close'],
  slots: [''],
  parts: ['alert', 'icon', 'content', 'close'],
  methods: [],
  keyboard: ['Tab', 'Enter', 'Space'],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
