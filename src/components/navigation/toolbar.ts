import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';

export class VuiToolbar extends VuiElement {
  static get observedAttributes(): string[] {
    return ['label', 'wrap'];
  }

  protected template(): string {
    return `
      <div class="bar" part="bar" role="toolbar">
        <div class="group"><slot name="start"></slot></div>
        <div class="group center"><slot></slot></div>
        <div class="group end"><slot name="end"></slot></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; }
      .bar {
        display: flex;
        align-items: center;
        gap: var(--vui-space-sm);
        min-height: var(--vui-toolbar-height);
        padding-inline: var(--vui-space-sm);
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
      }
      :host([wrap]) .bar { flex-wrap: wrap; height: auto; }
      .group { display: flex; align-items: center; gap: var(--vui-space-xs); min-width: 0; }
      .center { flex: 1 1 auto; justify-content: center; }
      .end { margin-left: auto; }
    `;
  }

  protected sync(): void {
    this.qs('[role="toolbar"]').setAttribute('aria-label', this.getAttribute('label') ?? 'Toolbar');
  }
}

defineElement('vui-toolbar', VuiToolbar);
