import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';

let tooltipSeq = 0;

export class VTooltip extends VuiElement {
  static get observedAttributes(): string[] {
    return ['text', 'placement'];
  }

  private showTimer = 0;
  private readonly tooltipId = `vui-tooltip-${++tooltipSeq}`;

  protected template(): string {
    return `
      <slot></slot>
      <div class="tip" part="tooltip" role="tooltip" hidden></div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; }
      .tip {
        position: fixed;
        z-index: var(--vui-z-tooltip);
        max-width: min(16rem, calc(100vw - var(--vui-overlay-gutter) * 2));
        overflow-wrap: anywhere;
        padding: var(--vui-space-2xs) var(--vui-space-xs);
        border: var(--vui-border-width) solid var(--vui-color-tooltip-border);
        border-radius: var(--vui-radius-sm);
        background: var(--vui-color-tooltip-bg);
        color: var(--vui-color-tooltip-text);
        font-size: var(--vui-font-size-sm);
        line-height: var(--vui-line-height);
        box-shadow: var(--vui-shadow-md);
        pointer-events: none;
      }
    `;
  }

  protected afterRender(): void {
    this.tip.id = this.tooltipId;
    this.addEventListener('pointerenter', () => this.schedule());
    this.addEventListener('pointerleave', () => this.hide());
    this.addEventListener('focusin', () => this.schedule(0));
    this.addEventListener('focusout', (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && this.contains(next)) return;
      this.hide();
    });
    this.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') this.hide();
    });
  }

  disconnectedCallback(): void {
    this.hide();
  }

  protected sync(): void {
    this.tip.textContent = this.getAttribute('text') ?? '';
  }

  private get tip(): HTMLElement {
    return this.qs<HTMLElement>('.tip');
  }

  private schedule(delay = 200): void {
    window.clearTimeout(this.showTimer);
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.showTimer = window.setTimeout(() => this.show(), motion ? 0 : delay);
  }

  private show(): void {
    const text = this.getAttribute('text') ?? '';
    if (!text) return;
    const tip = this.tip;
    tip.hidden = false;
    this.setAttribute('aria-description', text);
    const rect = this.getBoundingClientRect();
    const placement = this.getAttribute('placement') === 'bottom' ? 'bottom' : 'top';
    const tipRect = tip.getBoundingClientRect();
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - tipRect.width - 8);
    tip.style.left = `${left}px`;
    if (placement === 'bottom') tip.style.top = `${rect.bottom + 6}px`;
    else tip.style.top = `${Math.max(8, rect.top - tipRect.height - 6)}px`;
  }

  private hide(): void {
    window.clearTimeout(this.showTimer);
    if (this.shadow.querySelector('.tip')) this.tip.hidden = true;
    this.removeAttribute('aria-description');
  }
}

defineElement('vui-tooltip', VTooltip);
