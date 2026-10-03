import { registerContract } from '../../contract/registry';
import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { ownedChildren } from '../../composition/dom';
import { applyRovingTabIndex, isRtl, moveInList } from '../../interaction/keyboard';

let tabSeq = 0;

export class VTab extends VuiElement {
  declare panel: string;
  declare selected: boolean;
  declare disabled: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['selected', 'disabled', 'panel'];
  }

  protected template(): string {
    return `<span part="label"><slot></slot></span>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto;
        min-height: var(--vui-size-control);
        padding-inline: var(--vui-space-md);
        border-bottom: var(--vui-border-width-strong) solid transparent;
        color: var(--vui-color-text-muted);
        max-width: 100%;
        cursor: pointer;
        user-select: none;
      }
      :host(:hover) { color: var(--vui-color-text); background: var(--vui-color-surface-hover); }
      :host(:focus-visible) {
        outline: var(--vui-focus-ring);
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      :host([selected]) {
        color: var(--vui-color-text);
        border-bottom-color: var(--vui-color-primary);
        font-weight: var(--vui-font-weight-strong);
      }
      :host([disabled]) { opacity: 0.5; cursor: not-allowed; }
    `;
  }

  protected sync(): void {
    const selected = this.hasAttribute('selected');
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
        <div role="tablist" part="tablist"><slot name="tab"></slot></div>
        <div class="panels"><slot name="panel"></slot></div>
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
        container-name: vui-tabs;
      }
      [role="tablist"] {
        display: flex;
        flex-wrap: nowrap;
        gap: var(--vui-space-2xs);
        width: 100%;
        min-width: 0;
        overflow-x: auto;
        scrollbar-width: thin;
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
      }
    `;
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

  private linking = false;

  protected sync(): void {
    const label = this.getAttribute('label') ?? 'Tabs';
    this.qs('[role="tablist"]').setAttribute('aria-label', label);
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

reflectStrings(VTab, ['panel']);
reflectBooleans(VTab, ['selected', 'disabled']);
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
    { name: 'selected', kind: 'boolean', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['label'],
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
  slots: ['tab', 'panel'],
  parts: ['tablist'],
  methods: [],
  keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
  states: [],
  responsive: 'container',
  focus: 'roving',
  role: 'tablist',
});
