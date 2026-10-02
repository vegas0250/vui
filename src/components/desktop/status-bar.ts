import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';

export class VStatusBar extends VuiElement {
  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `
      <div class="bar" part="bar">
        <div class="group"><slot></slot></div>
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
        container-name: vui-status-bar;
      }
      .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--vui-space-sm);
        min-height: var(--vui-statusbar-height);
        min-width: 0;
        padding-inline: var(--vui-space-sm);
        background: var(--vui-color-surface-sunken);
        color: var(--vui-color-text-muted);
        border-top: var(--vui-border-width) solid var(--vui-color-border);
        font-size: var(--vui-font-size-sm);
      }
      .group {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--vui-space-sm);
        min-width: 0;
        max-width: 100%;
      }
      .end { margin-left: auto; }
      @container vui-status-bar (max-width: 22rem) {
        .bar { flex-wrap: wrap; align-items: flex-start; }
        .end { margin-left: 0; }
      }
    `;
  }

  protected sync(): void {
    this.qs('.bar').setAttribute('role', 'group');
    this.qs('.bar').setAttribute('aria-label', this.getAttribute('label') ?? 'Status bar');
  }
}

defineElement('vui-status-bar', VStatusBar);
