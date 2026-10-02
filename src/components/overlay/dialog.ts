import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { emitClose } from '../../core/events';

const closeIcon = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <path d="M18 6 6 18"></path>
  <path d="m6 6 12 12"></path>
</svg>`;

export class VuiDialog extends VuiElement {
  static get observedAttributes(): string[] {
    return ['open', 'label', 'dismissable', 'size', 'close-label'];
  }

  protected template(): string {
    return `
      <dialog part="dialog">
        <div class="surface" part="surface">
          <header part="header">
            <h2 tabindex="-1" part="title"></h2>
            <button type="button" class="close" part="close">${closeIcon}</button>
          </header>
          <div class="body" part="body"><slot></slot></div>
          <footer part="footer"><slot name="footer"></slot></footer>
        </div>
      </dialog>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        position: fixed;
        width: 0;
        height: 0;
        overflow: visible;
      }
      dialog {
        padding: 0;
        border: 0;
        margin: auto;
        background: transparent;
        color: inherit;
        max-width: calc(100vw - var(--vui-space-xl));
      }
      dialog::backdrop {
        background: var(--vui-color-backdrop);
      }
      .surface {
        width: min(32rem, 100vw);
        background: var(--vui-color-surface-raised);
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius-lg);
        box-shadow: var(--vui-shadow-lg);
      }
      :host([size="small"]) .surface { width: min(24rem, 100vw); }
      :host([size="large"]) .surface { width: min(48rem, 100vw); }
      header, .body, footer { padding: var(--vui-panel-padding); }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--vui-space-sm);
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
      }
      h2 {
        margin: 0;
        font-size: var(--vui-heading-3);
        line-height: var(--vui-line-height);
        font-weight: var(--vui-font-weight-strong);
      }
      h2:focus { outline: none; }
      .body { padding-top: var(--vui-space-md); }
      footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--vui-space-sm);
        border-top: var(--vui-border-width) solid var(--vui-color-border);
      }
      footer.hidden { display: none; }
      .close {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--vui-size-control);
        height: var(--vui-size-control);
        border-radius: var(--vui-radius);
        border: var(--vui-border-width) solid transparent;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .close:hover { background: var(--vui-color-surface-hover); }
      .close:focus-visible {
        outline: var(--vui-focus-ring);
        outline-offset: var(--vui-focus-offset);
      }
      .close svg { width: var(--vui-icon-size); height: var(--vui-icon-size); }
    `;
  }

  private settling = false;

  protected afterRender(): void {
    const dialog = this.dialog;
    if (!dialog) return;
    const footer = this.qs<HTMLElement>('footer');
    const footerSlot = this.qs<HTMLSlotElement>('slot[name="footer"]');
    const syncFooter = (): void => {
      footer.classList.toggle('hidden', footerSlot.assignedNodes({ flatten: true }).length === 0);
    };
    footerSlot.addEventListener('slotchange', syncFooter);
    syncFooter();
    this.qs('button.close').addEventListener('click', () => this.close());
    dialog.addEventListener('cancel', (event) => {
      if (!this.dismissable) event.preventDefault();
      else queueMicrotask(() => this.finishClose());
    });
    dialog.addEventListener('close', () => this.finishClose());
    dialog.addEventListener('click', (event) => {
      if (!this.dismissable) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) this.close();
    });
  }

  disconnectedCallback(): void {
    document.removeEventListener('keydown', this.onEscape, true);
  }

  get dismissable(): boolean {
    return !this.hasAttribute('dismissable') || this.getAttribute('dismissable') !== 'false';
  }

  show(): void {
    const dialog = this.dialog;
    if (!dialog) return;
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    if (!this.hasAttribute('open')) this.setAttribute('open', '');
    document.addEventListener('keydown', this.onEscape, true);
    this.qs<HTMLElement>('h2').focus();
  }

  close(): void {
    this.finishClose();
  }

  private readonly onEscape = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || !this.dismissable || !this.hasAttribute('open')) return;
    event.preventDefault();
    this.finishClose();
  };

  private finishClose(): void {
    if (this.settling) return;
    const dialog = this.dialog;
    const wasOpen = this.hasAttribute('open') || Boolean(dialog?.open);
    if (!wasOpen) return;
    this.settling = true;
    if (dialog?.open) dialog.close();
    if (this.hasAttribute('open')) this.removeAttribute('open');
    document.removeEventListener('keydown', this.onEscape, true);
    this.settling = false;
    emitClose(this);
  }

  protected sync(): void {
    const dialog = this.dialog;
    if (!dialog) return;
    const title = this.getAttribute('label') ?? '';
    const heading = this.qs<HTMLElement>('h2');
    heading.textContent = title;
    if (!heading.id) heading.id = `vui-dialog-title-${Math.random().toString(36).slice(2, 8)}`;
    dialog.setAttribute('aria-labelledby', heading.id);
    this.qs('button.close').setAttribute('aria-label', this.getAttribute('close-label') ?? 'Close');
    if (this.settling) return;
    if (this.hasAttribute('open') && !dialog.open) this.show();
    if (!this.hasAttribute('open') && dialog.open) this.finishClose();
  }

  private get dialog(): HTMLDialogElement | null {
    return this.shadow.querySelector('dialog');
  }
}

defineElement('vui-dialog', VuiDialog);
