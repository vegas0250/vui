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
        <div class="tabs" part="tabs"><slot name="tabs"></slot></div>
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
      .mark { display: inline-flex; flex: 0 0 auto; align-self: center; color: var(--vui-color-primary); }
      .mark:empty, .mark:not(:has(*)) { display: none; }
      .tabs {
        display: flex;
        align-items: flex-end;
        flex: 0 1 auto;
        align-self: stretch;
        min-width: 0;
        max-width: 100%;
      }
      .title {
        min-width: 0;
        align-self: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: var(--vui-font-weight-strong);
      }
      .with-tabs {
        align-items: flex-end;
        gap: var(--vui-space-2xs);
        background: var(--vui-color-surface-sunken);
        border-bottom: 0;
      }
      :host(:has(.with-tabs)) {
        background: var(--vui-color-surface-sunken);
        border-bottom: 0;
      }
      .with-tabs .tabs { flex: 1 1 auto; }
      .with-tabs .title { display: none; }
      .with-tabs .tools,
      .with-tabs .controls,
      .with-tabs .mark { align-self: center; }
      slot[name="tabs"]::slotted(vui-icon-button) {
        align-self: center;
        margin-inline: var(--vui-space-2xs) var(--vui-space-sm);
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
    this.qs('.bar').addEventListener('dblclick', (event) => {
      const path = event.composedPath();
      const interactive = path.some((node) => node instanceof Element && (
        node.localName === 'button'
        || node.localName === 'vui-tab'
        || node.localName === 'vui-tabs'
        || node.localName === 'vui-icon-button'
      ));
      if (interactive) return;
      this.dispatchEvent(new Event('maximize', { bubbles: true }));
    });
    this.qs<HTMLSlotElement>('slot[name="tabs"]').addEventListener('slotchange', () => this.syncTabs());
  }

  private syncTabs(): void {
    const filled = this.qs<HTMLSlotElement>('slot[name="tabs"]').assignedElements().length > 0;
    this.qs('.bar').classList.toggle('with-tabs', filled);
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
    this.syncTabs();
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
  slots: ['icon', 'tabs', 'tools'],
  parts: ['bar', 'icon', 'tabs', 'title', 'tools', 'controls', 'minimize', 'maximize', 'close'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
