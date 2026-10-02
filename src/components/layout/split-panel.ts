import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { inlineThreshold, observeInlineSize } from '../../core/responsive';

export class VSplitPanel extends VuiElement {
  static get observedAttributes(): string[] {
    return ['orientation', 'position'];
  }

  private dragging = false;
  private stopWatch: (() => void) | null = null;

  protected template(): string {
    return `
      <div class="split" part="split">
        <div class="pane start" part="start"><slot name="start"></slot></div>
        <div class="sep" part="separator" role="separator" tabindex="0"></div>
        <div class="pane end" part="end"><slot name="end"></slot></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; min-height: 8rem; }
      :host([data-stacked]) .split { flex-direction: column; }
      :host([data-stacked]) .sep { cursor: row-resize; }
      :host([data-stacked]) .sep::before {
        width: 100%;
        height: var(--vui-border-width);
        align-self: center;
      }
      .split {
        display: flex;
        width: 100%;
        height: 100%;
        min-height: inherit;
      }
      :host([orientation="vertical"]) .split { flex-direction: column; }
      .pane { min-width: 0; min-height: 0; overflow: auto; }
      .start { flex: 0 0 var(--vui-split, 50%); }
      .end { flex: 1 1 auto; }
      .sep {
        flex: 0 0 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: col-resize;
        touch-action: none;
      }
      :host([orientation="vertical"]) .sep { cursor: row-resize; }
      .sep::before {
        content: "";
        background: var(--vui-color-border-strong);
        width: var(--vui-border-width);
        align-self: stretch;
      }
      :host([orientation="vertical"]) .sep::before {
        width: 100%;
        height: var(--vui-border-width);
        align-self: center;
      }
      .sep:focus-visible {
        outline: var(--vui-focus-ring);
        outline-offset: -2px;
      }
    `;
  }

  protected afterRender(): void {
    const sep = this.separator;
    sep.addEventListener('pointerdown', (event) => {
      this.dragging = true;
      sep.setPointerCapture(event.pointerId);
      this.updateFromPointer(event);
    });
    sep.addEventListener('pointermove', (event) => {
      if (!this.dragging) return;
      this.updateFromPointer(event);
    });
    sep.addEventListener('pointerup', () => {
      this.dragging = false;
    });
    sep.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 10 : 2;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') this.setPosition(this.position - step);
      else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') this.setPosition(this.position + step);
      else if (event.key === 'Home') this.setPosition(10);
      else if (event.key === 'End') this.setPosition(90);
      else return;
      event.preventDefault();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.watchSize();
  }

  disconnectedCallback(): void {
    this.stopWatch?.();
    this.stopWatch = null;
  }

  private watchSize(): void {
    this.stopWatch?.();
    this.stopWatch = observeInlineSize(this, () => this.applyStack());
  }

  private get stacked(): boolean {
    return this.hasAttribute('data-stacked');
  }

  private applyStack(): void {
    const vertical = this.getAttribute('orientation') === 'vertical';
    const width = this.getBoundingClientRect().width;
    if (width <= 0) return;
    const narrow = width <= inlineThreshold(this);
    const stacked = !vertical && narrow;
    if (this.stacked === stacked) return;
    this.toggleAttribute('data-stacked', stacked);
    const separator = this.shadow.querySelector('.sep');
    if (separator) {
      separator.setAttribute('aria-orientation', vertical || stacked ? 'horizontal' : 'vertical');
    }
  }

  protected sync(): void {
    const vertical = this.getAttribute('orientation') === 'vertical' || this.stacked;
    this.separator.setAttribute('aria-orientation', vertical ? 'horizontal' : 'vertical');
    this.separator.setAttribute('aria-valuemin', '10');
    this.separator.setAttribute('aria-valuemax', '90');
    this.separator.setAttribute('aria-valuenow', String(this.position));
    this.separator.setAttribute('aria-label', this.getAttribute('label') ?? 'Resize');
    this.style.setProperty('--vui-split', `${this.position}%`);
  }

  private get separator(): HTMLElement {
    return this.qs<HTMLElement>('.sep');
  }

  private get position(): number {
    const value = Number(this.getAttribute('position') ?? 50);
    if (!Number.isFinite(value)) return 50;
    return Math.min(90, Math.max(10, value));
  }

  private setPosition(value: number): void {
    const next = Math.round(Math.min(90, Math.max(10, value)));
    this.setAttribute('position', String(next));
  }

  private updateFromPointer(event: PointerEvent): void {
    const rect = this.getBoundingClientRect();
    const vertical = this.getAttribute('orientation') === 'vertical' || this.stacked;
    const ratio = vertical
      ? (event.clientY - rect.top) / rect.height
      : (event.clientX - rect.left) / rect.width;
    this.setPosition(ratio * 100);
  }
}

defineElement('vui-split-panel', VSplitPanel);
