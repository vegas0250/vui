import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { emitClose } from '../../core/events';
import { pushOverlay } from '../../interaction/overlay';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

const closeIcon = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <path d="M18 6 6 18"></path>
  <path d="m6 6 12 12"></path>
</svg>`;

export class VDrawer extends VuiElement {
  declare open: boolean;
  declare label: string;
  declare placement: string;
  declare closeLabel: string;

  static get observedAttributes(): string[] {
    return ['open', 'label', 'placement', 'close-label', 'dismissable'];
  }

  private releaseOverlay: (() => void) | null = null;
  private settling = false;

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
      :host { position: fixed; width: 0; height: 0; overflow: visible; }
      dialog {
        position: fixed;
        inset-block: 0;
        inset-inline-end: 0;
        margin: 0;
        padding: 0;
        border: 0;
        width: min(24rem, 100%);
        max-width: 100%;
        height: 100dvh;
        max-height: 100dvh;
        background: transparent;
        color: inherit;
      }
      :host([placement="start"]) dialog {
        inset-inline-end: auto;
        inset-inline-start: 0;
      }
      dialog:focus { outline: none; }
      dialog::backdrop { background: var(--vui-color-backdrop); }
      .surface {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        min-width: 0;
        background: var(--vui-color-surface-raised);
        color: var(--vui-color-text);
        border-inline-start: var(--vui-border-width) solid var(--vui-color-border);
        box-shadow: var(--vui-shadow-lg);
      }
      :host([placement="start"]) .surface { border-inline-start: 0; border-inline-end: var(--vui-border-width) solid var(--vui-color-border); }
      header, .body, footer { padding: var(--vui-panel-padding); min-width: 0; }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--vui-space-sm);
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
      }
      h2 { margin: 0; min-width: 0; overflow-wrap: anywhere; font-size: var(--vui-heading-3); }
      .body { overflow: auto; flex: 1 1 auto; min-height: 0; }
      footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--vui-space-sm); border-top: var(--vui-border-width) solid var(--vui-color-border); }
      footer.hidden { display: none; }
      .close {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--vui-size-control);
        height: var(--vui-size-control);
        border: 0;
        border-radius: var(--vui-radius);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .close:hover { background: var(--vui-color-surface-hover); }
      .close:focus-visible { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
      @media (max-width: 30rem) {
        dialog { width: 100%; }
      }
    `;
  }

  protected afterRender(): void {
    const dialog = this.dialog;
    if (!dialog) return;
    const footer = this.qs('footer');
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
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
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
    if (!heading.id) heading.id = `vui-drawer-title-${Math.random().toString(36).slice(2, 8)}`;
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

reflectBooleans(VDrawer, ['open']);
reflectStrings(VDrawer, { label: 'label', placement: 'placement', closeLabel: 'close-label' });
defineElement('vui-drawer', VDrawer);

registerContract({
  element: 'vui-drawer',
  className: 'VDrawer',
  attributes: [
    { name: 'open', kind: 'boolean', reflected: true },
    { name: 'label', kind: 'string', reflected: true },
    { name: 'placement', kind: 'enum', values: ['end', 'start'], reflected: true },
    { name: 'close-label', kind: 'string', property: 'closeLabel', reflected: true },
    { name: 'dismissable', kind: 'boolean', reflected: true, inverted: true },
  ],
  events: ['close'],
  slots: ['', 'footer'],
  parts: ['dialog', 'surface', 'header', 'title', 'close', 'body', 'footer'],
  methods: ['show', 'close'],
  keyboard: ['Tab', 'Escape'],
  states: [],
  responsive: 'viewport',
  focus: 'native',
});
