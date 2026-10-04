import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

export class VToolbar extends VuiElement {
  declare label: string;
  declare wrap: boolean;

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
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
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
      .center > slot {
        display: flex;
        flex: 1 1 auto;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-width: 0;
      }
      .center > slot::slotted(vui-input),
      .center > slot::slotted(vui-path-bar) {
        flex: 1 1 auto;
        width: 100%;
        min-width: 0;
      }
      .end { margin-inline-start: auto; flex: 0 0 auto; }
      @container vui-toolbar (max-width: 40rem) {
        .bar { flex-wrap: wrap; }
        .group { flex: 1 1 100%; }
        .center { order: 3; justify-content: flex-start; }
        .end { margin-inline-start: 0; }
      }
    `;
  }

  protected sync(): void {
    this.qs('[role="toolbar"]').setAttribute('aria-label', this.getAttribute('label') ?? 'Toolbar');
  }
}

reflectStrings(VToolbar, ['label']);
reflectBooleans(VToolbar, ['wrap']);
defineElement('vui-toolbar', VToolbar);

registerContract({
  element: 'vui-toolbar',
  className: 'VToolbar',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'wrap', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: ['start', '', 'end'],
  parts: ['bar'],
  methods: [],
  keyboard: ['Tab'],
  states: [],
  responsive: 'container',
  focus: 'native',
  role: 'toolbar',
});
