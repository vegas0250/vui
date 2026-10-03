import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { applyOverflow } from '../../core/layout';
import { reflectStrings } from '../../core/reflect';
import { containerBand, observeInlineSize } from '../../foundation/responsive';
import { isRtl } from '../../interaction/keyboard';
import { trackPointer } from '../../interaction/pointer';

export class VSplitPanel extends VuiElement {
  declare orientation: string;
  declare label: string;
  declare overflow: string;

  static get observedAttributes(): string[] {
    return ['orientation', 'position', 'label', 'min', 'max', 'overflow'];
  }

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
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;
        min-height: var(--vui-split-min-block);
      }
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
      .pane {
        min-width: 0;
        min-height: 0;
        overflow: var(--vui-layout-overflow, auto);
      }
      .start { flex: 0 0 var(--vui-split, 50%); }
      .end { flex: 1 1 auto; }
      .sep {
        flex: 0 0 var(--vui-size-separator);
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
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.separator.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 10 : 2;
      const vertical = this.getAttribute('orientation') === 'vertical' || this.stacked;
      const rtl = !vertical && isRtl(this);
      const decrease = event.key === 'ArrowUp' || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
      const increase = event.key === 'ArrowDown' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
      if (decrease) this.position -= step;
      else if (increase) this.position += step;
      else if (event.key === 'Home') this.position = Math.min(this.min, this.max);
      else if (event.key === 'End') this.position = Math.max(this.min, this.max);
      else return;
      event.preventDefault();
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.watchSize();
    this.bindPointer();
  }

  private watchSize(): void {
    this.hold('size', observeInlineSize(this, () => this.applyStack()));
  }

  private bindPointer(): void {
    const sep = this.separator;
    this.hold(
      'pointer',
      trackPointer(sep, {
        onStart: (event) => {
          event.stopPropagation();
          this.updateFromPointer(event);
        },
        onMove: (drag) => this.updateFromPointer(drag.current),
      }),
    );
  }

  private get stacked(): boolean {
    return this.hasAttribute('data-stacked');
  }

  private applyStack(): void {
    const vertical = this.getAttribute('orientation') === 'vertical';
    const width = this.getBoundingClientRect().width;
    if (!(width > 0)) return;
    const narrow = containerBand(width, this) === 'narrow';
    const stacked = !vertical && narrow;
    if (this.stacked === stacked) return;
    this.toggleAttribute('data-stacked', stacked);
    const separator = this.shadow.querySelector('.sep');
    if (separator) {
      separator.setAttribute('aria-orientation', vertical || stacked ? 'horizontal' : 'vertical');
    }
  }

  protected sync(): void {
    this.clampPosition();
    const vertical = this.getAttribute('orientation') === 'vertical' || this.stacked;
    this.separator.setAttribute('aria-orientation', vertical ? 'horizontal' : 'vertical');
    const low = Math.min(this.min, this.max);
    const high = Math.max(this.min, this.max);
    this.separator.setAttribute('aria-valuemin', String(low));
    this.separator.setAttribute('aria-valuemax', String(high));
    this.separator.setAttribute('aria-valuenow', String(this.position));
    this.separator.setAttribute('aria-label', this.getAttribute('label') ?? 'Resize');
    this.style.setProperty('--vui-split', `${this.position}%`);
    applyOverflow(this, this.getAttribute('overflow'), 'auto');
  }

  private get separator(): HTMLElement {
    return this.qs<HTMLElement>('.sep');
  }

  get min(): number {
    return this.limit('min', 10);
  }

  set min(value: number) {
    this.setAttribute('min', String(this.limitValue(value, 10)));
  }

  get max(): number {
    return this.limit('max', 90);
  }

  set max(value: number) {
    this.setAttribute('max', String(this.limitValue(value, 90)));
  }

  get position(): number {
    const value = Number(this.getAttribute('position') ?? 50);
    if (!Number.isFinite(value)) return this.bound(50);
    return this.bound(value);
  }

  set position(value: number) {
    const next = Math.round(this.bound(Number.isFinite(value) ? value : 50));
    this.setAttribute('position', String(next));
  }

  private clampPosition(): void {
    if (!this.hasAttribute('position')) return;
    const raw = Number(this.getAttribute('position'));
    const next = Math.round(this.bound(Number.isFinite(raw) ? raw : 50));
    if (this.getAttribute('position') !== String(next)) this.setAttribute('position', String(next));
  }

  private limit(name: 'min' | 'max', fallback: number): number {
    const raw = this.getAttribute(name);
    if (raw == null || raw.trim() === '') return fallback;
    return this.limitValue(Number(raw), fallback);
  }

  private limitValue(value: number, fallback: number): number {
    if (!Number.isFinite(value)) return fallback;
    return Math.min(100, Math.max(0, Math.round(value)));
  }

  private bound(value: number): number {
    const low = Math.min(this.min, this.max);
    const high = Math.max(this.min, this.max);
    return Math.min(high, Math.max(low, value));
  }

  private updateFromPointer(event: PointerEvent): void {
    const rect = this.getBoundingClientRect();
    const vertical = this.getAttribute('orientation') === 'vertical' || this.stacked;
    const size = vertical ? rect.height : rect.width;
    if (size <= 0) return;
    const rtl = !vertical && isRtl(this);
    const along = vertical ? event.clientY - rect.top : rtl ? rect.right - event.clientX : event.clientX - rect.left;
    const ratio = along / size;
    this.position = ratio * 100;
  }
}

reflectStrings(VSplitPanel, ['orientation', 'label', 'overflow']);
defineElement('vui-split-panel', VSplitPanel);

registerContract({
  element: 'vui-split-panel',
  className: 'VSplitPanel',
  attributes: [
    { name: 'orientation', kind: 'enum', values: ['horizontal', 'vertical'], reflected: true },
    { name: 'position', kind: 'number', reflected: true },
    { name: 'min', kind: 'number', reflected: true },
    { name: 'max', kind: 'number', reflected: true },
    { name: 'label', kind: 'string', reflected: true },
    { name: 'overflow', kind: 'string', reflected: true },
  ],
  events: [],
  slots: ['start', 'end'],
  parts: ['split', 'start', 'separator', 'end'],
  methods: [],
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'],
  states: [],
  responsive: 'container',
  focus: 'native',
  role: 'separator',
});
