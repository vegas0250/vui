import '../foundation/icon';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { emitClose } from '../../core/events';
import type { VuiIcon } from '../foundation/icon';

const icons: Record<string, string> = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
};

export class VuiAlert extends VuiElement {
  static get observedAttributes(): string[] {
    return ['variant', 'closable', 'close-label'];
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
      :host { display: block; }
      :host([hidden]) { display: none; }
      .alert {
        display: flex;
        align-items: flex-start;
        gap: var(--vui-space-sm);
        padding: var(--vui-space-sm) var(--vui-space-md);
        border: var(--vui-border-width) solid var(--vui-color-info);
        border-radius: var(--vui-radius);
        background: var(--vui-color-info-surface);
      }
      .content { flex: 1 1 auto; min-width: 0; }
      :host([variant="success"]) .alert {
        border-color: var(--vui-color-success);
        background: var(--vui-color-success-surface);
      }
      :host([variant="warning"]) .alert {
        border-color: var(--vui-color-warning);
        background: var(--vui-color-warning-surface);
      }
      :host([variant="danger"]) .alert {
        border-color: var(--vui-color-danger);
        background: var(--vui-color-danger-surface);
      }
      .close {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--vui-size-control-sm);
        height: var(--vui-size-control-sm);
        border: 0;
        border-radius: var(--vui-radius-sm);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .close:hover { background: var(--vui-color-surface-hover); }
      .close:focus-visible {
        outline: var(--vui-focus-ring);
        outline-offset: var(--vui-focus-offset);
      }
      .close[hidden] { display: none; }
    `;
  }

  protected afterRender(): void {
    this.qs('button.close').addEventListener('click', () => {
      this.hidden = true;
      emitClose(this);
    });
  }

  protected sync(): void {
    const variant = this.getAttribute('variant') ?? 'info';
    const icon = this.qs<VuiIcon>('vui-icon');
    icon.setAttribute('name', icons[variant] ?? 'info');
    const assertive = variant === 'warning' || variant === 'danger';
    this.qs('.alert').setAttribute('role', assertive ? 'alert' : 'status');
    const close = this.qs<HTMLButtonElement>('button.close');
    close.hidden = !this.hasAttribute('closable');
    close.setAttribute('aria-label', this.getAttribute('close-label') ?? 'Close');
  }
}

defineElement('vui-alert', VuiAlert);
