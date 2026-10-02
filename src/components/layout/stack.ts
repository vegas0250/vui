import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { flexAlign, flexJustify, tokenGap } from '../../core/styles';

class VuiStackBase extends VuiElement {
  static get observedAttributes(): string[] {
    return ['gap', 'align', 'justify', 'wrap', 'direction'];
  }

  protected directionFallback = 'column';

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
      }
    `;
  }

  protected styleId(): string {
    return 'vui-stack';
  }

  protected sync(): void {
    const direction = this.getAttribute('direction') ?? this.directionFallback;
    this.style.setProperty('--vui-stack-direction', direction === 'row' ? 'row' : 'column');
    this.style.setProperty('--vui-stack-gap', tokenGap(this.getAttribute('gap')));
    this.style.setProperty('--vui-stack-align', flexAlign(this.getAttribute('align'), 'stretch'));
    this.style.setProperty('--vui-stack-justify', flexJustify(this.getAttribute('justify')));
    this.style.setProperty('--vui-stack-wrap', this.hasAttribute('wrap') ? 'wrap' : 'nowrap');
  }
}

export class VuiStack extends VuiStackBase {}

export class VuiHStack extends VuiStackBase {
  protected directionFallback = 'row';
}

export class VuiVStack extends VuiStackBase {
  protected directionFallback = 'column';
}

defineElement('vui-stack', VuiStack);
defineElement('vui-hstack', VuiHStack);
defineElement('vui-vstack', VuiVStack);
