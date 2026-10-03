import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { deepestActiveElement, isWithin } from '../../interaction/focus';
import { pushOverlay } from '../../interaction/overlay';
import { reflectStrings } from '../../core/reflect';
import { readLength } from '../../core/responsive';

let tooltipSeq = 0;

export class VTooltip extends VuiElement {
  declare text: string;
  declare placement: string;

  static get observedAttributes(): string[] {
    return ['text', 'placement'];
  }

  private showTimer = 0;
  private releaseOverlay: (() => void) | null = null;
  private described: { el: HTMLElement; previous: string | null } | null = null;
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
        z-index: var(--vui-overlay-z, var(--vui-z-tooltip));
        max-width: min(var(--vui-tooltip-inline), calc(100vw - var(--vui-overlay-gutter) * 2));
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
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
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
    super.disconnectedCallback();
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
    this.linkDescription();
    if (!this.releaseOverlay) {
      this.releaseOverlay = pushOverlay({
        owner: this,
        kind: 'tooltip',
        layer: tip,
        dismissable: true,
        onDismiss: () => this.hide(),
      });
    }
    const rect = this.getBoundingClientRect();
    const placement = this.getAttribute('placement') === 'bottom' ? 'bottom' : 'top';
    const tipRect = tip.getBoundingClientRect();
    const gutter = readLength(this, '--vui-space-sm', 8);
    const offset = readLength(this, '--vui-space-xs', 4);
    const left = Math.min(Math.max(gutter, rect.left), window.innerWidth - tipRect.width - gutter);
    tip.style.left = `${left}px`;
    if (placement === 'bottom') tip.style.top = `${rect.bottom + offset}px`;
    else tip.style.top = `${Math.max(gutter, rect.top - tipRect.height - offset)}px`;
  }

  private hide(): void {
    window.clearTimeout(this.showTimer);
    if (this.shadow.querySelector('.tip')) this.tip.hidden = true;
    this.unlinkDescription();
    this.releaseOverlay?.();
    this.releaseOverlay = null;
  }

  private linkDescription(): void {
    this.unlinkDescription();
    const active = deepestActiveElement();
    const target = active && isWithin(this, active) ? active : this;
    const previous = target.getAttribute('aria-describedby');
    this.described = { el: target, previous };
    const next = [previous, this.tooltipId].filter(Boolean).join(' ');
    target.setAttribute('aria-describedby', next);
  }

  private unlinkDescription(): void {
    if (!this.described) return;
    const { el, previous } = this.described;
    if (previous) el.setAttribute('aria-describedby', previous);
    else el.removeAttribute('aria-describedby');
    this.described = null;
  }
}

reflectStrings(VTooltip, ['text', 'placement']);
defineElement('vui-tooltip', VTooltip);

registerContract({
  element: 'vui-tooltip',
  className: 'VTooltip',
  attributes: [
    { name: 'text', kind: 'string', reflected: true },
    { name: 'placement', kind: 'enum', values: ['top', 'bottom'], reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['tooltip'],
  methods: [],
  keyboard: ['Escape'],
  states: [],
  responsive: 'viewport',
  focus: 'native',
  role: 'tooltip',
});
