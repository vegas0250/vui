import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';

export class VToolbar extends VuiElement {
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
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;
        container-type: inline-size;
        container-name: vui-toolbar;
      }
      .bar {
        display: flex;
        align-items: center;
        gap: var(--vui-space-sm);
        min-height: var(--vui-toolbar-height);
        min-width: 0;
        padding-inline: var(--vui-space-sm);
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
      }
      :host([wrap]) .bar { flex-wrap: wrap; height: auto; }
      .group {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--vui-space-xs);
        min-width: 0;
        max-width: 100%;
      }
      .center { flex: 1 1 auto; justify-content: center; min-width: 0; }
      .end { margin-left: auto; flex: 0 0 auto; }
      @container vui-toolbar (max-width: 40rem) {
        .bar { flex-wrap: wrap; }
        .group { flex: 1 1 100%; }
        .center { order: 3; justify-content: flex-start; }
        .end { margin-left: 0; }
      }
    `;
  }

  protected sync(): void {
    this.qs('[role="toolbar"]').setAttribute('aria-label', this.getAttribute('label') ?? 'Toolbar');
  }
}

defineElement('vui-toolbar', VToolbar);
