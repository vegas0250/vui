import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VStatusBar extends VuiElement {
  declare label: string;

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
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
      .group {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--vui-space-sm);
        min-width: 0;
        max-width: 100%;
      }
      .end { margin-inline-start: auto; }
      @container vui-status-bar (max-width: 22rem) {
        .bar { flex-wrap: wrap; align-items: flex-start; }
        .end { margin-inline-start: 0; }
      }
    `;
  }

  protected sync(): void {
    this.qs('.bar').setAttribute('role', 'group');
    this.qs('.bar').setAttribute('aria-label', this.getAttribute('label') ?? 'Status bar');
  }
}

reflectStrings(VStatusBar, ['label']);
defineElement('vui-status-bar', VStatusBar);

registerContract({
  element: 'vui-status-bar',
  className: 'VStatusBar',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: [],
  slots: ['', 'end'],
  parts: ['bar'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'container',
  focus: 'native',
  role: 'group',
});
