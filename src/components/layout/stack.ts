import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { applyAlign, applyJustify, applyOverflow, applySpace, tokenGap } from '../../core/layout';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { containerBand, observeInlineSize } from '../../foundation/responsive';

class VStackBase extends VuiElement {
  declare gap: string;
  declare align: string;
  declare justify: string;
  declare direction: string;
  declare padding: string;
  declare overflow: string;
  declare wrap: boolean;

  static get observedAttributes(): string[] {
    return ['gap', 'align', 'justify', 'wrap', 'direction', 'padding', 'overflow'];
  }

  protected directionFallback = 'column';

  protected template(): string {
    return `<slot></slot>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: flex;
        flex-direction: var(--vui-layout-direction, column);
        align-items: var(--vui-layout-align, stretch);
        justify-content: var(--vui-layout-justify, flex-start);
        flex-wrap: var(--vui-layout-wrap, nowrap);
        gap: var(--vui-layout-gap, var(--vui-space-md));
        padding: var(--vui-layout-padding, 0);
        overflow: var(--vui-layout-overflow, visible);
        min-width: 0;
        max-width: 100%;
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
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

  private watchSize(): void {
    this.hold(
      'size',
      observeInlineSize(this, (width) => {
        if (!(width > 0)) return;
        const narrow = containerBand(width, this) === 'narrow';
        if (this.hasAttribute('data-narrow') === narrow) return;
        this.toggleAttribute('data-narrow', narrow);
      }),
    );
  }

  protected sync(): void {
    const direction = this.getAttribute('direction') ?? this.directionFallback;
    const row = direction === 'row';
    this.setAttribute('data-axis', row ? 'row' : 'column');
    this.style.setProperty('--vui-layout-direction', row ? 'row' : 'column');
    this.style.setProperty('--vui-layout-gap', tokenGap(this.getAttribute('gap')));
    applyAlign(this, this.getAttribute('align'), 'stretch');
    applyJustify(this, this.getAttribute('justify'));
    applySpace(this, '--vui-layout-padding', this.getAttribute('padding'), '0');
    applyOverflow(this, this.getAttribute('overflow'), 'visible');
    this.style.setProperty('--vui-layout-wrap', this.hasAttribute('wrap') ? 'wrap' : 'nowrap');
  }
}

export class VStack extends VStackBase {}

export class VHStack extends VStackBase {
  protected directionFallback = 'row';
}

export class VVStack extends VStackBase {
  protected directionFallback = 'column';
}

reflectStrings(VStackBase, ['gap', 'align', 'justify', 'direction', 'padding', 'overflow']);
reflectBooleans(VStackBase, ['wrap']);
defineElement('vui-stack', VStack);
defineElement('vui-hstack', VHStack);
defineElement('vui-vstack', VVStack);

const stackContract = {
  attributes: [
    { name: 'gap', kind: 'string' as const, reflected: true },
    { name: 'align', kind: 'string' as const, reflected: true },
    { name: 'justify', kind: 'string' as const, reflected: true },
    { name: 'direction', kind: 'string' as const, reflected: true },
    { name: 'padding', kind: 'string' as const, reflected: true },
    { name: 'overflow', kind: 'string' as const, reflected: true },
    { name: 'wrap', kind: 'boolean' as const, reflected: true },
  ],
  events: [],
  slots: [''],
  parts: [],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow' as const,
  focus: 'native' as const,
};

registerContract({ element: 'vui-stack', className: 'VStack', ...stackContract });
registerContract({ element: 'vui-hstack', className: 'VHStack', ...stackContract });
registerContract({ element: 'vui-vstack', className: 'VVStack', ...stackContract });
