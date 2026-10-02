import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { emitClose } from '../../core/events';
import { pushOverlay } from '../../interaction/overlay';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

const closeIcon = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <path d="M18 6 6 18"></path>
  <path d="m6 6 12 12"></path>
</svg>`;

export class VDialog extends VuiElement {
  declare open: boolean;
  declare label: string;
  declare size: string;
  declare closeLabel: string;

  static get observedAttributes(): string[] {
    return ['open', 'label', 'dismissable', 'size', 'close-label'];
  }

  private releaseOverlay: (() => void) | null = null;

  protected template(): string {
    return `
      <dialog part="dialog" tabindex="-1">
        <div class="surface" part="surface">
          <header part="header">
            <h2 part="title"></h2>
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
        width: var(--vui-dialog-inline);
        max-width: calc(100vw - var(--vui-overlay-gutter) * 2);
        max-height: var(--vui-dialog-block);
      }
      dialog:focus {
        outline: none;
      }
      dialog::backdrop {
        background: var(--vui-color-backdrop);
      }
      .surface {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-height: var(--vui-dialog-block);
        min-width: 0;
        background: var(--vui-color-surface-raised);
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius-lg);
        box-shadow: var(--vui-shadow-lg);
      }
      :host([size="small"]) dialog { width: var(--vui-dialog-inline-sm); }
      :host([size="large"]) dialog { width: var(--vui-dialog-inline-lg); }
      header, .body, footer { padding: var(--vui-panel-padding); min-width: 0; }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--vui-space-sm);
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
      }
      h2 {
        margin: 0;
        min-width: 0;
        overflow-wrap: anywhere;
        font-size: var(--vui-heading-3);
        line-height: var(--vui-line-height);
        font-weight: var(--vui-font-weight-strong);
      }
      .body {
        padding-top: var(--vui-space-md);
        overflow: auto;
        min-height: 0;
      }
      footer {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: var(--vui-space-sm);
        border-top: var(--vui-border-width) solid var(--vui-color-border);
      }
      @media (max-width: 30rem) {
        dialog {
          width: 100vw;
          max-width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          margin: 0;
        }
        .surface {
          width: 100%;
          height: 100%;
          max-height: 100dvh;
          border-radius: 0;
        }
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
    this.releaseOverlay?.();
    this.releaseOverlay = null;
  }

  get dismissable(): boolean {
    return !this.hasAttribute('dismissable') || this.getAttribute('dismissable') !== 'false';
  }

  set dismissable(value: boolean) {
    if (value) this.removeAttribute('dismissable');
    else this.setAttribute('dismissable', 'false');
  }

  show(): void {
    const dialog = this.dialog;
    if (!dialog) return;
    if (!this.releaseOverlay) {
      this.releaseOverlay = pushOverlay({
        owner: this,
        kind: 'modal',
        dismissable: () => this.dismissable,
        lockScroll: true,
        restoreFocus: true,
        onDismiss: () => this.close(),
      });
    }
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    if (!this.hasAttribute('open')) this.setAttribute('open', '');
    dialog.focus();
  }

  close(): void {
    this.finishClose();
  }

  private finishClose(): void {
    if (this.settling) return;
    const dialog = this.dialog;
    const wasOpen = this.hasAttribute('open') || Boolean(dialog?.open);
    if (!wasOpen) return;
    this.settling = true;
    if (dialog?.open) dialog.close();
    if (this.hasAttribute('open')) this.removeAttribute('open');
    const release = this.releaseOverlay;
    this.releaseOverlay = null;
    this.settling = false;
    release?.();
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
    if (this.hasAttribute('open')) dialog.setAttribute('aria-modal', 'true');
    else dialog.removeAttribute('aria-modal');
    this.qs('button.close').setAttribute('aria-label', this.getAttribute('close-label') ?? 'Close');
    if (this.settling) return;
    if (this.hasAttribute('open') && !dialog.open) this.show();
    if (!this.hasAttribute('open') && dialog.open) this.finishClose();
  }

  private get dialog(): HTMLDialogElement | null {
    return this.shadow.querySelector('dialog');
  }
}

reflectBooleans(VDialog, ['open']);
reflectStrings(VDialog, { label: 'label', size: 'size', closeLabel: 'close-label' });
defineElement('vui-dialog', VDialog);
