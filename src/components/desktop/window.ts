import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VWindow extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `
      <section part="window">
        <header part="header">
          <h2 part="title"></h2>
          <div part="controls"><slot name="controls"></slot></div>
        </header>
        <div part="body"><slot></slot></div>
      </section>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: flex; flex-direction: column; min-width: 0; max-width: 100%; min-height: 0; }
      section {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        flex: 1 1 auto;
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
      }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--vui-space-sm);
        min-width: 0;
        min-height: var(--vui-toolbar-height);
        padding-inline: var(--vui-space-sm);
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
      }
      h2 {
        margin: 0;
        min-width: 0;
        overflow-wrap: anywhere;
        font-size: var(--vui-font-size);
        font-weight: var(--vui-font-weight-strong);
      }
      [part="controls"] { display: inline-flex; align-items: center; gap: var(--vui-space-2xs); min-width: 0; }
      [part="controls"]:empty { display: none; }
      [part="body"] { min-width: 0; min-height: 0; overflow: auto; padding: var(--vui-panel-padding); }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot[name="controls"]').addEventListener('slotchange', () => this.sync());
  }

  protected sync(): void {
    const title = this.qs('h2');
    title.textContent = this.getAttribute('label') ?? '';
    const section = this.qs('section');
    if (title.textContent) section.setAttribute('aria-label', title.textContent);
    else section.removeAttribute('aria-label');
  }
}

reflectStrings(VWindow, ['label']);
defineElement('vui-window', VWindow);

registerContract({
  element: 'vui-window',
  className: 'VWindow',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: [],
  slots: ['', 'controls'],
  parts: ['window', 'header', 'title', 'controls', 'body'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
