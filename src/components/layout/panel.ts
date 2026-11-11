import { registerContract } from '../../contract/registry';
import { defineElement } from '../../utils/define';
import { VuiElement } from '../../utils/element';
import { applyOverflow, applySpace } from '../../utils/layout';
import { reflectStrings } from '../../utils/reflect';

export class VPanel extends VuiElement {
  declare heading: string;
  declare padding: string;
  declare overflow: string;

  static get observedAttributes(): string[] {
    return ['heading', 'padding', 'overflow'];
  }

  protected template(): string {
    return `
      <section part="panel">
        <header part="header">
          <div class="heading"><slot name="header"><h2 part="title"></h2></slot></div>
          <div class="tools" part="actions" hidden><slot name="actions"></slot></div>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer part="footer"><slot name="footer"></slot></footer>
      </section>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
      section {
        background: var(--vui-color-card, var(--vui-color-surface));
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
        border-radius: var(--vui-radius-box, var(--vui-radius));
        box-shadow: var(--vui-shadow-sm);
        min-width: 0;
        max-width: 100%;
      }
      header, .body, footer {
        padding: var(--vui-layout-padding, var(--vui-panel-padding));
        min-width: 0;
      }
      .body { overflow: var(--vui-layout-overflow, auto); }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--vui-space-sm);
        border-bottom: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
      }
      .heading { min-width: 0; flex: 1 1 auto; }
      .tools {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-2xs);
        flex: 0 0 auto;
      }
      .tools[hidden] { display: none; }
      header.hidden, footer.hidden { display: none; }
      h2 {
        margin: 0;
        font-size: var(--vui-heading-3);
        line-height: var(--vui-line-height);
        font-weight: var(--vui-font-weight-strong);
        overflow-wrap: anywhere;
      }
      footer { border-top: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border)); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot[name="header"]').addEventListener('slotchange', () => this.sync());
    this.qs('slot[name="actions"]').addEventListener('slotchange', () => this.sync());
    this.qs('slot[name="footer"]').addEventListener('slotchange', () => this.sync());
    queueMicrotask(() => {
      if (this.isConnected) this.sync();
    });
  }

  protected sync(): void {
    const heading = this.getAttribute('heading') ?? '';
    const title = this.qs<HTMLElement>('h2');
    title.textContent = heading;
    title.hidden = !heading;
    const headerSlot = this.qs<HTMLSlotElement>('slot[name="header"]');
    const actionsSlot = this.qs<HTMLSlotElement>('slot[name="actions"]');
    const footerSlot = this.qs<HTMLSlotElement>('slot[name="footer"]');
    const header = this.qs('header');
    const footer = this.qs('footer');
    const tools = this.qs<HTMLElement>('.tools');
    const hasActions = actionsSlot.assignedNodes({ flatten: true }).length > 0;
    tools.hidden = !hasActions;
    header.classList.toggle('hidden', !heading && headerSlot.assignedNodes({ flatten: true }).length === 0 && !hasActions);
    footer.classList.toggle('hidden', footerSlot.assignedNodes({ flatten: true }).length === 0);
    const padding = this.getAttribute('padding');
    if (padding) applySpace(this, '--vui-layout-padding', padding, 'var(--vui-panel-padding)');
    else this.style.removeProperty('--vui-layout-padding');
    applyOverflow(this, this.getAttribute('overflow'), 'auto');
  }
}

reflectStrings(VPanel, ['heading', 'padding', 'overflow']);
defineElement('vui-panel', VPanel);

registerContract({
  element: 'vui-panel',
  className: 'VPanel',
  attributes: [
    { name: 'heading', kind: 'string', reflected: true },
    { name: 'padding', kind: 'string', reflected: true },
    { name: 'overflow', kind: 'string', reflected: true },
  ],
  events: [],
  slots: ['header', 'actions', '', 'footer'],
  parts: ['panel', 'header', 'title', 'actions', 'body', 'footer'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
