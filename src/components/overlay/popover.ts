import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { emitClose } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { placeLayer, pushOverlay } from '../../interaction/overlay';

export class VPopover extends VuiElement {
  declare label: string;
  declare placement: string;
  declare open: boolean;

  static get observedAttributes(): string[] {
    return ['label', 'placement', 'open'];
  }

  private release: (() => void) | null = null;
  private wasOpen = false;
  private silent = false;

  show(): void {
    this.open = true;
  }

  close(): void {
    this.open = false;
  }

  protected template(): string {
    return `
      <slot></slot>
      <div class="panel" part="panel" tabindex="-1" hidden>
        <slot name="panel"></slot>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; position: relative; max-width: 100%; min-width: 0; vertical-align: middle; }
      .panel {
        position: fixed;
        z-index: var(--vui-overlay-z, var(--vui-z-dropdown));
        box-sizing: border-box;
        min-width: min(12rem, calc(100vw - var(--vui-overlay-gutter) * 2));
        max-width: min(20rem, calc(100vw - var(--vui-overlay-gutter) * 2));
        padding: var(--vui-space-sm);
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
        box-shadow: var(--vui-shadow-md);
      }
      .panel[hidden] { display: none; }
      .panel:focus-visible { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
    `;
  }

  protected afterRender(): void {
    this.addEventListener('click', (event) => {
      if (event.composedPath().includes(this.panel)) return;
      this.open = !this.open;
    });
  }

  override disconnectedCallback(): void {
    this.silent = true;
    this.ensureClosed();
    this.silent = false;
    super.disconnectedCallback();
  }

  protected sync(): void {
    const open = this.open;
    this.panel.hidden = !open;
    const label = this.getAttribute('label') || 'Popover';
    this.panel.setAttribute('aria-label', label);
    if (open) this.ensureOpen();
    else this.ensureClosed();
    if (this.wasOpen && !open && !this.silent) emitClose(this);
    this.wasOpen = open;
  }

  private get panel(): HTMLElement {
    return this.qs<HTMLElement>('.panel');
  }

  private ensureOpen(): void {
    this.panel.hidden = false;
    const first = this.release === null;
    if (first) {
      this.release = pushOverlay({
        owner: this,
        layer: this.panel,
        kind: 'popup',
        dismissable: true,
        dismissOnOutside: true,
        restoreFocus: true,
        onDismiss: () => {
          this.open = false;
        },
      });
    }
    const trigger = [...this.children].find((node) => node.getAttribute('slot') !== 'panel');
    const box = (trigger ?? this).getBoundingClientRect();
    const placement = this.getAttribute('placement') === 'top' ? 'top-start' : 'bottom-start';
    placeLayer(this.panel, { x: box.left, y: box.top, width: box.width, height: box.height }, placement);
    if (!first) return;
    const target = this.panel.querySelector<HTMLElement>('button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    (target ?? this.panel).focus();
  }

  private ensureClosed(): void {
    this.panel.hidden = true;
    if (!this.release) return;
    const release = this.release;
    this.release = null;
    release();
  }
}

reflectStrings(VPopover, ['label', 'placement']);
reflectBooleans(VPopover, ['open']);
defineElement('vui-popover', VPopover);

registerContract({
  element: 'vui-popover',
  className: 'VPopover',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'placement', kind: 'enum', values: ['bottom', 'top'], reflected: true },
    { name: 'open', kind: 'boolean', reflected: true },
  ],
  events: ['close'],
  slots: ['', 'panel'],
  parts: ['panel'],
  methods: ['show', 'close'],
  keyboard: ['Tab', 'Escape'],
  states: [],
  responsive: 'viewport',
  focus: 'native',
});
