import '../foundation/icon';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { emitClose } from '../../core/events';
import type { VIcon } from '../foundation/icon';

const icons: Record<string, string> = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
};

export interface ToastOptions {
  message: string;
  title?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  duration?: number;
}

export class VToast extends VuiElement {
  static get observedAttributes(): string[] {
    return ['variant', 'heading', 'duration', 'close-label'];
  }

  private timer = 0;
  private remaining = 0;
  private started = 0;

  protected template(): string {
    return `
      <div class="toast" part="toast">
        <vui-icon part="icon"></vui-icon>
        <div class="copy">
          <strong class="title" part="title"></strong>
          <div class="message" part="message"><slot></slot></div>
        </div>
        <button type="button" class="close" part="close"><vui-icon name="x"></vui-icon></button>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; pointer-events: auto; }
      :host([hidden]) { display: none; }
      .toast {
        display: flex;
        align-items: flex-start;
        gap: var(--vui-space-sm);
        width: min(22rem, calc(100vw - var(--vui-overlay-gutter) * 2));
        max-width: 100%;
        padding: var(--vui-space-sm) var(--vui-space-md);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-left: 3px solid var(--vui-color-info);
        border-radius: var(--vui-radius);
        background: var(--vui-color-surface-raised);
        box-shadow: var(--vui-shadow-md);
      }
      :host([variant="success"]) .toast { border-left-color: var(--vui-color-success); }
      :host([variant="warning"]) .toast { border-left-color: var(--vui-color-warning); }
      :host([variant="danger"]) .toast { border-left-color: var(--vui-color-danger); }
      .copy { flex: 1 1 auto; min-width: 0; overflow-wrap: anywhere; }
      .title:empty { display: none; }
      .title { display: block; font-size: var(--vui-font-size); }
      .message { color: var(--vui-color-text); }
      .close {
        appearance: none;
        display: inline-flex;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
        border-radius: var(--vui-radius-sm);
        width: var(--vui-size-control-sm);
        height: var(--vui-size-control-sm);
        align-items: center;
        justify-content: center;
      }
      .close:hover { background: var(--vui-color-surface-hover); }
      .close:focus-visible {
        outline: var(--vui-focus-ring);
        outline-offset: var(--vui-focus-offset);
      }
    `;
  }

  protected afterRender(): void {
    this.qs('button.close').addEventListener('click', () => this.dismiss());
    this.addEventListener('pointerenter', () => this.pause());
    this.addEventListener('pointerleave', () => this.resume());
  }

  disconnectedCallback(): void {
    window.clearTimeout(this.timer);
  }

  protected sync(): void {
    const variant = this.getAttribute('variant') ?? 'info';
    this.qs<VIcon>('vui-icon').setAttribute('name', icons[variant] ?? 'info');
    this.qs('.toast').setAttribute('role', variant === 'danger' || variant === 'warning' ? 'alert' : 'status');
    this.qs('.title').textContent = this.getAttribute('heading') ?? '';
    this.qs('button.close').setAttribute('aria-label', this.getAttribute('close-label') ?? 'Close');
  }

  start(): void {
    const duration = Number(this.getAttribute('duration') ?? 4000);
    if (!Number.isFinite(duration) || duration <= 0) return;
    this.remaining = duration;
    this.resume();
  }

  dismiss(): void {
    window.clearTimeout(this.timer);
    this.hidden = true;
    emitClose(this);
  }

  private pause(): void {
    if (!this.timer) return;
    window.clearTimeout(this.timer);
    this.timer = 0;
    this.remaining -= Date.now() - this.started;
  }

  private resume(): void {
    if (this.remaining <= 0 || this.hidden) return;
    this.started = Date.now();
    this.timer = window.setTimeout(() => this.dismiss(), this.remaining);
  }
}

export class VToaster extends VuiElement {
  protected template(): string {
    return `<div class="stack" part="stack"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        position: fixed;
        z-index: var(--vui-z-toast);
        right: var(--vui-overlay-gutter);
        bottom: var(--vui-overlay-gutter);
        left: var(--vui-overlay-gutter);
        display: flex;
        justify-content: flex-end;
        pointer-events: none;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: var(--vui-space-sm);
        align-items: stretch;
        width: min(22rem, 100%);
      }
    `;
  }

  show(options: ToastOptions): VToast {
    const toast = document.createElement('vui-toast') as VToast;
    toast.setAttribute('variant', options.variant ?? 'info');
    if (options.title) toast.setAttribute('heading', options.title);
    if (options.duration !== undefined) toast.setAttribute('duration', String(options.duration));
    toast.textContent = options.message;
    toast.addEventListener('close', () => toast.remove());
    this.append(toast);
    toast.start();
    return toast;
  }
}

export function toast(options: ToastOptions | string): VToast {
  const normalized: ToastOptions = typeof options === 'string' ? { message: options } : options;
  const existing = document.querySelector('vui-toaster');
  const host = existing instanceof VToaster ? existing : document.createElement('vui-toaster');
  if (!existing) document.body.append(host);
  if (!(host instanceof VToaster)) {
    throw new Error('vui-toaster is not registered');
  }
  return host.show(normalized);
}

defineElement('vui-toast', VToast);
defineElement('vui-toaster', VToaster);
