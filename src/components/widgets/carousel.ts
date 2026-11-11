import { registerContract } from '../../contract/registry';
import { defineElement } from '../../utils/define';
import { emitChange } from '../../utils/events';
import { VuiElement } from '../../utils/element';
import { reflectBooleans, reflectNumbers, reflectStrings } from '../../utils/reflect';
import '../actions/icon-button';

/** Slide deck — Stimulus Carousel analog without Swiper. */
export class VCarousel extends VuiElement {
  declare label: string;
  declare index: number;
  declare loop: boolean;
  declare autoplay: boolean;
  declare interval: number;

  private timer: number | null = null;
  private slides: HTMLElement[] = [];

  static get observedAttributes(): string[] {
    return ['label', 'index', 'loop', 'autoplay', 'interval'];
  }

  protected template(): string {
    return `
      <div class="frame" part="frame" role="region">
        <div class="viewport" part="viewport">
          <div class="track" part="track"><slot></slot></div>
        </div>
        <vui-icon-button class="prev" part="previous" name="chevron-left" label="Previous slide" size="small"></vui-icon-button>
        <vui-icon-button class="next" part="next" name="chevron-right" label="Next slide" size="small"></vui-icon-button>
        <div class="dots" part="dots" role="tablist"></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;
        position: relative;
      }
      .frame {
        display: grid;
        gap: var(--vui-space-sm);
        min-width: 0;
      }
      .viewport {
        overflow: hidden;
        border: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
        border-radius: var(--vui-radius-box, var(--vui-radius));
        background: var(--vui-color-surface);
      }
      .track {
        display: flex;
        transition: transform var(--vui-duration) var(--vui-easing);
      }
      :host([data-reduced]) .track { transition: none; }
      ::slotted(*) {
        flex: 0 0 100%;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        padding: var(--vui-space-lg);
      }
      .prev, .next {
        position: absolute;
        top: 50%;
        translate: 0 -50%;
        z-index: 1;
      }
      .prev { inset-inline-start: var(--vui-space-sm); }
      .next { inset-inline-end: var(--vui-space-sm); }
      .dots {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--vui-space-2xs);
      }
      .dot {
        appearance: none;
        width: 0.55rem;
        height: 0.55rem;
        padding: 0;
        border: 0;
        border-radius: 999px;
        background: var(--vui-color-border);
        cursor: pointer;
      }
      .dot[aria-selected="true"] { background: var(--vui-color-interactive-text, var(--vui-color-primary)); }
      .dot:focus-visible { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
      @media (prefers-reduced-motion: reduce) {
        .track { transition: none; }
      }
    `;
  }

  protected afterRender(): void {
    this.qs('.prev').addEventListener('click', () => this.previous());
    this.qs('.next').addEventListener('click', () => this.next());
    this.qs('slot').addEventListener('slotchange', () => this.collect());
    this.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.previous();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.next();
      } else if (event.key === 'Home') {
        event.preventDefault();
        this.goTo(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        this.goTo(this.slides.length - 1);
      }
    });
    const onVis = () => this.syncAutoplay();
    document.addEventListener('visibilitychange', onVis);
    this.hold('visibility', () => document.removeEventListener('visibilitychange', onVis));
  }

  protected sync(): void {
    const frame = this.qs('.frame');
    frame.setAttribute('aria-roledescription', 'carousel');
    frame.setAttribute('aria-label', this.getAttribute('label') ?? 'Carousel');
    this.tabIndex = 0;
    this.collect();
    this.renderDots();
    this.applyIndex(false);
    this.syncAutoplay();
  }

  disconnectedCallback(): void {
    this.clearTimer();
    super.disconnectedCallback();
  }

  next(): void {
    this.goTo(this.current() + 1);
  }

  previous(): void {
    this.goTo(this.current() - 1);
  }

  goTo(index: number): void {
    const total = this.slides.length;
    if (total === 0) return;
    let next = index;
    if (this.hasAttribute('loop')) {
      next = ((index % total) + total) % total;
    } else {
      next = Math.max(0, Math.min(total - 1, index));
    }
    if (next === this.current()) {
      this.applyIndex(false);
      return;
    }
    this.index = next;
    this.setAttribute('index', String(next));
    this.applyIndex(true);
    emitChange(this);
  }

  private current(): number {
    const value = Number(this.getAttribute('index') ?? this.index ?? 0);
    return Number.isFinite(value) ? value : 0;
  }

  private collect(): void {
    const slot = this.qs<HTMLSlotElement>('slot');
    this.slides = slot.assignedElements({ flatten: true }).filter((node): node is HTMLElement => node instanceof HTMLElement);
    for (const [i, slide] of this.slides.entries()) {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} / ${this.slides.length}`);
      slide.toggleAttribute('aria-hidden', i !== this.current());
    }
    this.renderDots();
    this.applyIndex(false);
  }

  private renderDots(): void {
    const host = this.qs('.dots');
    host.replaceChildren();
    for (const [i] of this.slides.entries()) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dot';
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-label', `Go to slide ${i + 1}`);
      button.setAttribute('aria-selected', i === this.current() ? 'true' : 'false');
      button.addEventListener('click', () => this.goTo(i));
      host.append(button);
    }
  }

  private applyIndex(announce: boolean): void {
    const index = this.current();
    const track = this.qs<HTMLElement>('.track');
    track.style.transform = `translateX(-${index * 100}%)`;
    for (const [i, slide] of this.slides.entries()) slide.toggleAttribute('aria-hidden', i !== index);
    for (const [i, dot] of [...this.qs('.dots').children].entries()) {
      if (dot instanceof HTMLElement) dot.setAttribute('aria-selected', i === index ? 'true' : 'false');
    }
    if (announce) this.setAttribute('aria-live', 'polite');
  }

  private syncAutoplay(): void {
    this.clearTimer();
    if (!this.hasAttribute('autoplay') || document.hidden || this.slides.length < 2) return;
    const ms = Math.max(1000, Number(this.getAttribute('interval') ?? this.interval ?? 5000) || 5000);
    this.timer = window.setInterval(() => this.next(), ms);
  }

  private clearTimer(): void {
    if (this.timer != null) window.clearInterval(this.timer);
    this.timer = null;
  }
}

reflectStrings(VCarousel, ['label']);
reflectNumbers(VCarousel, ['index', 'interval']);
reflectBooleans(VCarousel, ['loop', 'autoplay']);
defineElement('vui-carousel', VCarousel);

registerContract({
  element: 'vui-carousel',
  className: 'VCarousel',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'index', kind: 'number', reflected: true },
    { name: 'loop', kind: 'boolean', reflected: true },
    { name: 'autoplay', kind: 'boolean', reflected: true },
    { name: 'interval', kind: 'number', reflected: true },
  ],
  events: ['change'],
  slots: [''],
  parts: ['frame', 'viewport', 'track', 'previous', 'next', 'dots'],
  methods: ['next', 'previous', 'goTo'],
  keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
  states: [],
  responsive: 'flow',
  focus: 'native',
  role: 'region',
});
