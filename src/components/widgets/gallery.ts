import { registerContract } from '../../contract/registry';
import { defineElement } from '../../utils/define';
import { VuiElement } from '../../utils/element';
import { reflectNumbers, reflectStrings } from '../../utils/reflect';
import { pushOverlay } from '../../interaction/overlay';
import '../actions/icon-button';

interface MediaItem {
  href: string;
  alt: string;
  thumb: string;
}

/** Media viewer — Stimulus Gallery analog without lightGallery. */
export class VGallery extends VuiElement {
  declare label: string;
  declare index: number;

  private items: MediaItem[] = [];
  private release: (() => void) | null = null;
  private stage: HTMLElement | null = null;

  static get observedAttributes(): string[] {
    return ['label', 'index'];
  }

  protected template(): string {
    return `<div class="grid" part="grid" role="group"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
        gap: var(--vui-space-sm);
      }
      ::slotted(a) {
        display: block;
        min-width: 0;
        border-radius: var(--vui-radius-box, var(--vui-radius));
        overflow: hidden;
        border: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
        background: var(--vui-color-surface);
      }
      ::slotted(a:focus-visible) { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
      ::slotted(img) {
        display: block;
        width: 100%;
        height: auto;
        aspect-ratio: 1;
        object-fit: cover;
      }
    `;
  }

  protected afterRender(): void {
    this.addEventListener('click', (event) => {
      const link = event.composedPath().find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement);
      if (!link || !this.contains(link)) return;
      const href = link.getAttribute('href');
      if (!href) return;
      event.preventDefault();
      const index = this.items.findIndex((item) => item.href === href);
      this.open(index >= 0 ? index : 0);
    });
    this.qs('slot').addEventListener('slotchange', () => this.collect());
  }

  protected sync(): void {
    this.qs('.grid').setAttribute('aria-label', this.getAttribute('label') ?? 'Media gallery');
    this.collect();
  }

  disconnectedCallback(): void {
    this.close();
    super.disconnectedCallback();
  }

  open(index = 0): void {
    this.collect();
    if (this.items.length === 0) return;
    const next = Math.max(0, Math.min(this.items.length - 1, index));
    this.index = next;
    this.setAttribute('index', String(next));
    if (!this.stage) this.mountStage();
    this.renderStage();
    if (!this.release) {
      this.release = pushOverlay({
        owner: this.stage!,
        kind: 'modal',
        dismissable: true,
        dismissOnOutside: true,
        restoreFocus: true,
        lockScroll: true,
        trapFocus: true,
        onDismiss: () => this.close(),
      });
    }
    this.setAttribute('open', '');
    this.stage?.querySelector<HTMLElement>('.close')?.focus({ preventScroll: true });
  }

  close(): void {
    this.removeAttribute('open');
    const release = this.release;
    this.release = null;
    release?.();
    this.stage?.remove();
    this.stage = null;
    this.dispatchEvent(new Event('close'));
  }

  next(): void {
    if (this.items.length === 0) return;
    this.open((this.current() + 1) % this.items.length);
  }

  previous(): void {
    if (this.items.length === 0) return;
    this.open((this.current() - 1 + this.items.length) % this.items.length);
  }

  private current(): number {
    const value = Number(this.getAttribute('index') ?? this.index ?? 0);
    return Number.isFinite(value) ? value : 0;
  }

  private collect(): void {
    const slot = this.qs<HTMLSlotElement>('slot');
    this.items = slot
      .assignedElements({ flatten: true })
      .filter((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement)
      .map((link) => {
        const img = link.querySelector('img');
        return {
          href: link.href || link.getAttribute('href') || '',
          alt: img?.getAttribute('alt') ?? link.getAttribute('aria-label') ?? '',
          thumb: img?.currentSrc || img?.src || link.href,
        };
      })
      .filter((item) => item.href.length > 0);
  }

  private mountStage(): void {
    const stage = document.createElement('div');
    stage.className = 'vui-gallery-stage';
    stage.setAttribute('role', 'dialog');
    stage.setAttribute('aria-modal', 'true');
    stage.setAttribute('aria-label', this.getAttribute('label') ?? 'Media viewer');
    stage.innerHTML = `
      <style>
        .vui-gallery-stage {
          position: fixed;
          inset: 0;
          z-index: var(--vui-overlay-z, var(--vui-z-modal, 1300));
          display: grid;
          grid-template-rows: auto 1fr auto;
          gap: var(--vui-space-sm);
          padding: var(--vui-space-lg);
          background: color-mix(in srgb, var(--vui-color-text) 72%, transparent);
          color: var(--vui-color-surface, #fff);
        }
        .vui-gallery-stage .toolbar,
        .vui-gallery-stage .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--vui-space-sm);
        }
        .vui-gallery-stage .body {
          display: grid;
          place-items: center;
          min-height: 0;
        }
        .vui-gallery-stage img {
          max-width: min(100%, 72rem);
          max-height: calc(100dvh - 8rem);
          object-fit: contain;
          border-radius: var(--vui-radius-box, var(--vui-radius));
          background: var(--vui-color-surface);
        }
        .vui-gallery-stage .nav { display: flex; gap: var(--vui-space-xs); }
      </style>
      <div class="toolbar">
        <span class="caption"></span>
        <vui-icon-button class="close" name="x" label="Close" variant="ghost"></vui-icon-button>
      </div>
      <div class="body"><img alt="" /></div>
      <div class="footer">
        <span class="count"></span>
        <div class="nav">
          <vui-icon-button class="prev" name="chevron-left" label="Previous" variant="ghost"></vui-icon-button>
          <vui-icon-button class="next" name="chevron-right" label="Next" variant="ghost"></vui-icon-button>
        </div>
      </div>
    `;
    stage.querySelector('.close')?.addEventListener('click', () => this.close());
    stage.querySelector('.prev')?.addEventListener('click', () => this.previous());
    stage.querySelector('.next')?.addEventListener('click', () => this.next());
    stage.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.previous();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.next();
      }
    });
    document.body.append(stage);
    this.stage = stage;
  }

  private renderStage(): void {
    if (!this.stage) return;
    const item = this.items[this.current()];
    if (!item) return;
    const img = this.stage.querySelector('img');
    if (img) {
      img.src = item.href;
      img.alt = item.alt;
    }
    const caption = this.stage.querySelector('.caption');
    if (caption) caption.textContent = item.alt;
    const count = this.stage.querySelector('.count');
    if (count) count.textContent = `${this.current() + 1} / ${this.items.length}`;
  }
}

reflectStrings(VGallery, ['label']);
reflectNumbers(VGallery, ['index']);
defineElement('vui-gallery', VGallery);

registerContract({
  element: 'vui-gallery',
  className: 'VGallery',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'index', kind: 'number', reflected: true },
  ],
  events: ['close'],
  slots: [''],
  parts: ['grid'],
  methods: ['open', 'close', 'next', 'previous'],
  keyboard: ['Escape', 'ArrowLeft', 'ArrowRight'],
  states: [],
  responsive: 'flow',
  focus: 'native',
  role: 'group',
});
