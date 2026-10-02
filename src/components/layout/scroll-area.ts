import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

const step = 48;

export class VScrollArea extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `<div part="viewport" tabindex="0"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; min-height: 0; max-height: 100%; }
      [part="viewport"] {
        overflow: auto;
        max-width: 100%;
        max-height: 100%;
        min-width: 0;
        min-height: 0;
        overscroll-behavior: contain;
      }
      [part="viewport"]:focus-visible { outline: var(--vui-focus-ring); outline-offset: calc(var(--vui-focus-offset) * -1); }
    `;
  }

  protected afterRender(): void {
    const view = this.qs<HTMLElement>('[part="viewport"]');
    view.addEventListener('keydown', (event) => {
      const rtl = getComputedStyle(this).direction === 'rtl';
      const page = Math.max(view.clientHeight - 16, step);
      const horizontal = (amount: number): void => {
        view.scrollLeft += rtl ? -amount : amount;
      };
      const actions: Record<string, () => void> = {
        ArrowDown: () => {
          view.scrollTop += step;
        },
        ArrowUp: () => {
          view.scrollTop -= step;
        },
        ArrowRight: () => horizontal(step),
        ArrowLeft: () => horizontal(-step),
        PageDown: () => {
          view.scrollTop += page;
        },
        PageUp: () => {
          view.scrollTop -= page;
        },
        Home: () => {
          view.scrollTop = 0;
          view.scrollLeft = 0;
        },
        End: () => {
          view.scrollTop = view.scrollHeight;
        },
      };
      const run = actions[event.key];
      if (!run) return;
      event.preventDefault();
      run();
    });
  }

  protected sync(): void {
    this.qs('[part="viewport"]').setAttribute('aria-label', this.getAttribute('label') || 'Scrollable region');
  }
}

reflectStrings(VScrollArea, ['label']);
defineElement('vui-scroll-area', VScrollArea);

registerContract({
  element: 'vui-scroll-area',
  className: 'VScrollArea',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: [],
  slots: [''],
  parts: ['viewport'],
  methods: [],
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
