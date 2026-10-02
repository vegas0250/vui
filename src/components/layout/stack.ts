import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { inlineThreshold, observeInlineSize } from '../../core/responsive';
import { flexAlign, flexJustify, tokenGap } from '../../core/styles';

class VStackBase extends VuiElement {
  static get observedAttributes(): string[] {
    return ['gap', 'align', 'justify', 'wrap', 'direction'];
  }

  protected directionFallback = 'column';
  private stopWatch: (() => void) | null = null;

  protected template(): string {
    return `<slot></slot>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: flex;
        flex-direction: var(--vui-stack-direction, column);
        align-items: var(--vui-stack-align, stretch);
        justify-content: var(--vui-stack-justify, flex-start);
        flex-wrap: var(--vui-stack-wrap, nowrap);
        gap: var(--vui-stack-gap, var(--vui-space-md));
        min-width: 0;
        max-width: 100%;
      }
      :host([data-axis="row"][data-narrow]) { flex-wrap: wrap; }
      ::slotted(*) { max-width: 100%; }
    `;
  }

  protected styleId(): string {
    return 'vui-stack';
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
    this.stopWatch = observeInlineSize(this, (width) => {
      if (width <= 0) return;
      const limit = inlineThreshold(this);
      const narrow = width <= limit;
      if (this.hasAttribute('data-narrow') === narrow) return;
      this.toggleAttribute('data-narrow', narrow);
    });
  }

  protected sync(): void {
    const direction = this.getAttribute('direction') ?? this.directionFallback;
    const row = direction === 'row';
    this.setAttribute('data-axis', row ? 'row' : 'column');
    this.style.setProperty('--vui-stack-direction', row ? 'row' : 'column');
    this.style.setProperty('--vui-stack-gap', tokenGap(this.getAttribute('gap')));
    this.style.setProperty('--vui-stack-align', flexAlign(this.getAttribute('align'), 'stretch'));
    this.style.setProperty('--vui-stack-justify', flexJustify(this.getAttribute('justify')));
    this.style.setProperty('--vui-stack-wrap', this.hasAttribute('wrap') ? 'wrap' : 'nowrap');
  }
}

export class VStack extends VStackBase {}

export class VHStack extends VStackBase {
  protected directionFallback = 'row';
}

export class VVStack extends VStackBase {
  protected directionFallback = 'column';
}

defineElement('vui-stack', VStack);
defineElement('vui-hstack', VHStack);
defineElement('vui-vstack', VVStack);
