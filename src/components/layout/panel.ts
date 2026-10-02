import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VPanel extends VuiElement {
  declare heading: string;

  static get observedAttributes(): string[] {
    return ['heading'];
  }

  protected template(): string {
    return `
      <section part="panel">
        <header part="header">
          <slot name="header"><h2 part="title"></h2></slot>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer part="footer"><slot name="footer"></slot></footer>
      </section>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      section {
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius-lg);
        box-shadow: var(--vui-shadow-sm);
      }
      header, .body, footer { padding: var(--vui-panel-padding); min-width: 0; }
      .body { overflow: auto; }
      header {
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
      }
      header.hidden, footer.hidden { display: none; }
      h2 {
        margin: 0;
        font-size: var(--vui-heading-3);
        line-height: var(--vui-line-height);
        font-weight: var(--vui-font-weight-strong);
        overflow-wrap: anywhere;
      }
      footer { border-top: var(--vui-border-width) solid var(--vui-color-border); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot[name="header"]').addEventListener('slotchange', () => this.sync());
    this.qs('slot[name="footer"]').addEventListener('slotchange', () => this.sync());
  }

  protected sync(): void {
    const heading = this.getAttribute('heading') ?? '';
    const title = this.qs<HTMLElement>('h2');
    title.textContent = heading;
    title.hidden = !heading;
    const headerSlot = this.qs<HTMLSlotElement>('slot[name="header"]');
    const footerSlot = this.qs<HTMLSlotElement>('slot[name="footer"]');
    const header = this.qs('header');
    const footer = this.qs('footer');
    header.classList.toggle('hidden', !heading && headerSlot.assignedNodes({ flatten: true }).length === 0);
    footer.classList.toggle('hidden', footerSlot.assignedNodes({ flatten: true }).length === 0);
  }
}

reflectStrings(VPanel, ['heading']);
defineElement('vui-panel', VPanel);
