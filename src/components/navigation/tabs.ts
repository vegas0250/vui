import '../foundation/icon';
import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { ownedChildren } from '../../composition/dom';
import { reportUnexpectedChildren } from '../../core/dev';
import { applyRovingTabIndex, isRtl, moveInList } from '../../interaction/keyboard';

let tabSeq = 0;

export class VTab extends VuiElement {
  declare panel: string;
  declare closeLabel: string;
  declare selected: boolean;
  declare disabled: boolean;
  declare closable: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['selected', 'disabled', 'closable', 'panel', 'close-label'];
  }

  protected template(): string {
    return `
      <span part="label"><slot></slot></span>
      <button part="close" type="button" hidden><vui-icon name="x"></vui-icon></button>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-2xs);
        flex: 0 0 auto;
        width: 12rem;
        height: 2rem;
        min-height: 2rem;
        margin: 0;
        padding-inline: var(--vui-space-sm) var(--vui-space-2xs);
        border: 0;
        border-radius: var(--vui-radius) var(--vui-radius) 0 0;
        background: transparent;
        color: var(--vui-color-text-muted);
        min-width: 0;
        max-width: 14rem;
        cursor: pointer;
        user-select: none;
      }
      [part="label"] {
        display: flex;
        align-items: center;
        gap: var(--vui-space-xs);
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
      }
      ::slotted(span) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }
      :host(:hover) { color: var(--vui-color-text); background: var(--vui-color-surface-hover); }
      :host(:focus-visible) {
        outline: var(--vui-focus-ring);
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      :host([selected]) {
        color: var(--vui-color-text);
        background: var(--vui-color-background);
        box-shadow: inset 0 2px 0 var(--vui-color-primary);
        font-weight: var(--vui-font-weight-strong);
        z-index: 1;
      }
      :host([disabled]) { opacity: 0.5; cursor: not-allowed; }
      button {
        display: none;
        align-items: center;
        justify-content: center;
        width: 1.25rem;
        height: 1.25rem;
        margin-inline-start: var(--vui-space-2xs);
        padding: 0;
        border: 0;
        border-radius: var(--vui-radius-sm);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      :host([closable]) button { display: inline-flex; opacity: 0; }
      :host([closable][selected]) button,
      :host([closable]:hover) button,
      :host([closable]:focus-within) button { opacity: 1; }
      button:hover { background: var(--vui-color-surface-hover); }
      button:focus-visible { outline: var(--vui-focus-ring); outline-offset: calc(var(--vui-focus-offset) * -1); }
      vui-icon { width: 0.85em; height: 0.85em; }
    `;
  }

  protected afterRender(): void {
    this.qs('button').addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
    });
  }

  protected sync(): void {
    const selected = this.hasAttribute('selected');
    const close = this.qs<HTMLButtonElement>('button');
    close.hidden = !this.hasAttribute('closable');
    close.disabled = this.hasAttribute('disabled');
    close.setAttribute('aria-label', this.getAttribute('close-label') || 'Close');
    this.setAttribute('role', 'tab');
    this.setAttribute('aria-selected', selected ? 'true' : 'false');
    this.tabIndex = this.hasAttribute('disabled') ? -1 : selected ? 0 : -1;
    this.setAttribute('aria-disabled', this.hasAttribute('disabled') ? 'true' : 'false');
    if (!this.id) this.id = `vui-tab-${++tabSeq}`;
  }

  focusTab(): void {
    this.focus();
  }

  setControls(panelId: string): void {
    this.setAttribute('aria-controls', panelId);
  }
}

export class VTabPanel extends VuiElement {
  declare name: string;
  declare selected: boolean;

  static get observedAttributes(): string[] {
    return ['name', 'selected'];
  }

  protected template(): string {
    return `<div part="panel"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; padding-top: var(--vui-space-md); }
      :host([hidden]) { display: none; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
    `;
  }

  protected sync(): void {
    const selected = this.hasAttribute('selected');
    this.setAttribute('role', 'tabpanel');
    this.hidden = !selected;
    this.tabIndex = selected ? 0 : -1;
    if (!this.id) this.id = `vui-panel-${++tabSeq}`;
  }
}

export class VTabs extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `
      <div class="tabs">
        <div role="tablist" part="tablist">
          <div class="strip"><slot name="tab"></slot></div>
          <slot name="action"></slot>
        </div>
        <div class="panels"><slot name="panel"></slot></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: block;
        flex: 1 1 auto;
        align-self: stretch;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        container-type: inline-size;
        container-name: vui-tabs;
      }
      .tabs {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
      }
      [role="tablist"] {
        display: flex;
        flex-wrap: nowrap;
        align-items: flex-end;
        gap: var(--vui-space-2xs);
        width: 100%;
        min-width: 0;
        min-height: 2.4rem;
        padding-top: var(--vui-space-xs);
        background: transparent;
      }
      .strip {
        display: flex;
        align-items: flex-end;
        gap: var(--vui-space-2xs);
        flex: 0 1 auto;
        width: max-content;
        max-width: 100%;
        min-width: 0;
        overflow-x: auto;
        scrollbar-width: thin;
      }
      ::slotted([slot="action"]) {
        flex: 0 0 auto;
        align-self: center;
        margin-bottom: var(--vui-space-2xs);
      }
      [role="tablist"]::after {
        content: "";
        flex: 1 1 auto;
        align-self: stretch;
        -webkit-app-region: drag;
        app-region: drag;
      }
    `;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.watchChildren();
  }

  protected afterRender(): void {
    this.qs('slot[name="tab"]').addEventListener('slotchange', () => this.link());
    this.qs('slot[name="panel"]').addEventListener('slotchange', () => this.link());
    this.addEventListener('click', (event) => {
      const tab = this.tabFromEvent(event);
      if (!tab || tab.hasAttribute('disabled')) return;
      this.select(tab);
    });
    this.addEventListener('keydown', (event) => this.onKeydown(event));
    this.link();
    queueMicrotask(() => this.link());
  }

  /** Named slots do not notify when a tab is appended without `slot`. */
  private watchChildren(): void {
    const observer = new MutationObserver(() => this.link());
    observer.observe(this, { childList: true });
    this.hold('tabs-children', () => observer.disconnect());
  }

  private linking = false;

  protected sync(): void {
    const label = this.getAttribute('label') ?? 'Tabs';
    this.qs('[role="tablist"]').setAttribute('aria-label', label);
    reportUnexpectedChildren(this, ['vui-tab', 'vui-tab-panel']);
    this.link();
  }

  private tabs(): VTab[] {
    return ownedChildren(this, 'vui-tab', (node): node is VTab => node instanceof VTab);
  }

  private panels(): VTabPanel[] {
    return ownedChildren(this, 'vui-tab-panel', (node): node is VTabPanel => node instanceof VTabPanel);
  }

  private link(): void {
    if (this.linking) return;
    this.linking = true;
    try {
      const tabs = this.tabs();
      const panels = this.panels();
      for (const tab of tabs) {
        if (tab.getAttribute('slot') !== 'tab') tab.setAttribute('slot', 'tab');
      }
      for (const panel of panels) {
        if (panel.getAttribute('slot') !== 'panel') panel.setAttribute('slot', 'panel');
      }
      const selected = tabs.filter((tab) => tab.hasAttribute('selected') && !tab.hasAttribute('disabled'));
      if (selected.length === 0) {
        (tabs.find((tab) => !tab.hasAttribute('disabled')) ?? tabs[0])?.setAttribute('selected', '');
      } else if (selected.length > 1) {
        for (const tab of selected.slice(1)) tab.removeAttribute('selected');
      }
      for (const [index, tab] of tabs.entries()) {
        const panel = this.panelFor(tab, index, panels);
        panel?.toggleAttribute('selected', tab.hasAttribute('selected'));
        if (panel && tab.id) panel.setAttribute('aria-labelledby', tab.id);
        if (panel?.id) tab.setControls(panel.id);
      }
      const enabled = tabs.filter((tab) => !tab.hasAttribute('disabled'));
      applyRovingTabIndex(
        enabled,
        enabled.findIndex((tab) => tab.hasAttribute('selected')),
      );
      for (const tab of tabs) {
        if (tab.hasAttribute('disabled')) tab.tabIndex = -1;
      }
    } finally {
      this.linking = false;
    }
  }

  private panelFor(tab: VTab, index: number, panels: VTabPanel[]): VTabPanel | undefined {
    const name = tab.getAttribute('panel');
    if (name) return panels.find((panel) => panel.getAttribute('name') === name) ?? panels[index];
    return panels[index];
  }

  private select(tab: VTab): void {
    for (const item of this.tabs()) item.toggleAttribute('selected', item === tab);
    this.link();
  }

  private tabFromEvent(event: Event): VTab | null {
    const path = event.composedPath();
    return (path.find((node) => node instanceof VTab) as VTab | undefined) ?? null;
  }

  private onKeydown(event: KeyboardEvent): void {
    const current = this.tabFromEvent(event);
    if (!current) return;
    const tabs = this.tabs().filter((tab) => !tab.hasAttribute('disabled'));
    const index = tabs.indexOf(current);
    if (index < 0) return;
    const next = moveInList(index, tabs.length, event.key, { orientation: 'horizontal', loop: true, rtl: isRtl(this) });
    if (next === null) return;
    event.preventDefault();
    const tab = tabs[next];
    if (!tab) return;
    this.select(tab);
    tab.focusTab();
  }
}

reflectStrings(VTab, { panel: 'panel', closeLabel: 'close-label' });
reflectBooleans(VTab, ['selected', 'disabled', 'closable']);
reflectStrings(VTabPanel, ['name']);
reflectBooleans(VTabPanel, ['selected']);
reflectStrings(VTabs, ['label']);
defineElement('vui-tab', VTab);
defineElement('vui-tab-panel', VTabPanel);
defineElement('vui-tabs', VTabs);

registerContract({
  element: 'vui-tab',
  className: 'VTab',
  attributes: [
    { name: 'panel', kind: 'string', reflected: true },
    { name: 'close-label', kind: 'string', property: 'closeLabel', reflected: true },
    { name: 'selected', kind: 'boolean', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'closable', kind: 'boolean', reflected: true },
  ],
  events: ['close'],
  slots: [''],
  parts: ['label', 'close'],
  methods: [],
  keyboard: [],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'roving',
});

registerContract({
  element: 'vui-tab-panel',
  className: 'VTabPanel',
  attributes: [
    { name: 'name', kind: 'string', reflected: true },
    { name: 'selected', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['panel'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});

registerContract({
  element: 'vui-tabs',
  className: 'VTabs',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: [],
  slots: ['tab', 'action', 'panel'],
  parts: ['tablist'],
  methods: [],
  keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
  states: [],
  responsive: 'container',
  focus: 'roving',
  role: 'tablist',
});
