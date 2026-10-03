import '../foundation/icon';
import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import type { VIcon } from '../foundation/icon';

export class VTitlebar extends VuiElement {
  declare label: string;
  declare minimizeLabel: string;
  declare maximizeLabel: string;
  declare restoreLabel: string;
  declare closeLabel: string;
  declare maximized: boolean;

  static get observedAttributes(): string[] {
    return ['label', 'minimize-label', 'maximize-label', 'restore-label', 'close-label', 'maximized'];
  }

  protected template(): string {
    return `
      <div class="bar" part="bar">
        <span class="mark" part="icon"><slot name="icon"></slot></span>
        <div class="title" part="title"></div>
        <div class="tools" part="tools"><slot name="tools"></slot></div>
        <div class="controls" part="controls">
          <button part="minimize" type="button"><vui-icon name="minus"></vui-icon></button>
          <button part="maximize" type="button"><vui-icon name="square"></vui-icon></button>
          <button part="close" type="button"><vui-icon name="x"></vui-icon></button>
        </div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: block;
        flex: 0 0 auto;
        min-width: 0;
        max-width: 100%;
        color: var(--vui-color-text);
        background: var(--vui-color-surface);
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
        -webkit-app-region: drag;
        app-region: drag;
        user-select: none;
      }
      .bar {
        display: flex;
        align-items: center;
        gap: var(--vui-space-xs);
        min-width: 0;
        min-height: var(--vui-toolbar-height);
        padding-inline-start: var(--vui-space-sm);
      }
      .mark { display: inline-flex; flex: 0 0 auto; color: var(--vui-color-primary); }
      .mark:empty, .mark:not(:has(*)) { display: none; }
      .title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: var(--vui-font-weight-strong);
      }
      .tools {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-2xs);
        margin-inline-start: auto;
        min-width: 0;
      }
      .controls { display: inline-flex; flex: 0 0 auto; }
      button, .tools, ::slotted(*) {
        -webkit-app-region: no-drag;
        app-region: no-drag;
      }
      button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--vui-toolbar-height);
        height: var(--vui-toolbar-height);
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      button:hover { background: var(--vui-color-surface-hover); }
      button:focus-visible { outline: var(--vui-focus-ring); outline-offset: calc(var(--vui-focus-offset) * -1); }
      [part="close"]:hover {
        background: var(--vui-color-danger);
        color: var(--vui-color-on-danger);
      }
      vui-icon { width: var(--vui-icon-size); height: var(--vui-icon-size); }
    `;
  }

  protected afterRender(): void {
    this.qs('[part="minimize"]').addEventListener('click', () => {
      this.dispatchEvent(new Event('minimize', { bubbles: true }));
    });
    this.qs('[part="maximize"]').addEventListener('click', () => {
      this.dispatchEvent(new Event('maximize', { bubbles: true }));
    });
    this.qs('[part="close"]').addEventListener('click', () => {
      this.dispatchEvent(new Event('close', { bubbles: true }));
    });
    this.qs('[part="title"]').addEventListener('dblclick', () => {
      this.dispatchEvent(new Event('maximize', { bubbles: true }));
    });
  }

  protected sync(): void {
    const title = this.getAttribute('label') ?? '';
    this.qs('[part="title"]').textContent = title;
    if (title) this.setAttribute('aria-label', title);
    const maximized = this.hasAttribute('maximized');
    this.qs('[part="minimize"]').setAttribute('aria-label', this.getAttribute('minimize-label') || 'Minimize');
    this.qs('[part="maximize"]').setAttribute('aria-label', maximized
      ? this.getAttribute('restore-label') || 'Restore'
      : this.getAttribute('maximize-label') || 'Maximize');
    this.qs('[part="close"]').setAttribute('aria-label', this.getAttribute('close-label') || 'Close');
    const icon = this.qs<VIcon>('[part="maximize"] vui-icon');
    icon.setAttribute('name', maximized ? 'copy' : 'square');
  }
}

reflectStrings(VTitlebar, {
  label: 'label',
  minimizeLabel: 'minimize-label',
  maximizeLabel: 'maximize-label',
  restoreLabel: 'restore-label',
  closeLabel: 'close-label',
});
reflectBooleans(VTitlebar, ['maximized']);
defineElement('vui-titlebar', VTitlebar);

registerContract({
  element: 'vui-titlebar',
  className: 'VTitlebar',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'minimize-label', kind: 'string', property: 'minimizeLabel', reflected: true },
    { name: 'maximize-label', kind: 'string', property: 'maximizeLabel', reflected: true },
    { name: 'restore-label', kind: 'string', property: 'restoreLabel', reflected: true },
    { name: 'close-label', kind: 'string', property: 'closeLabel', reflected: true },
    { name: 'maximized', kind: 'boolean', reflected: true },
  ],
  events: ['minimize', 'maximize', 'close'],
  slots: ['icon', 'tools'],
  parts: ['bar', 'icon', 'title', 'tools', 'controls', 'minimize', 'maximize', 'close'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
