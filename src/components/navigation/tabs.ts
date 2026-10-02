import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';

let tabSeq = 0;

export class VuiTab extends VuiElement {
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
        min-height: var(--vui-size-control);
        padding-inline: var(--vui-space-md);
        border-bottom: 2px solid transparent;
        color: var(--vui-color-text-muted);
        cursor: pointer;
        user-select: none;
      }
      :host(:hover) { color: var(--vui-color-text); background: var(--vui-color-surface-hover); }
      :host(:focus-visible) {
        outline: var(--vui-focus-ring);
        outline-offset: -2px;
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

export class VuiTabPanel extends VuiElement {
  static get observedAttributes(): string[] {
    return ['name', 'selected'];
  }

  protected template(): string {
    return `<div part="panel"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; padding-top: var(--vui-space-md); }
      :host([hidden]) { display: none; }
      :host(:focus) { outline: none; }
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

export class VuiTabs extends VuiElement {
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
      :host { display: block; }
      [role="tablist"] {
        display: flex;
        flex-wrap: wrap;
        gap: var(--vui-space-2xs);
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

  private tabs(): VuiTab[] {
    return [...this.querySelectorAll(':scope > vui-tab')].filter((node): node is VuiTab => node instanceof VuiTab);
  }

  private panels(): VuiTabPanel[] {
    return [...this.querySelectorAll(':scope > vui-tab-panel')].filter(
      (node): node is VuiTabPanel => node instanceof VuiTabPanel,
    );
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
    } finally {
      this.linking = false;
    }
  }

  private panelFor(tab: VuiTab, index: number, panels: VuiTabPanel[]): VuiTabPanel | undefined {
    const name = tab.getAttribute('panel');
    if (name) return panels.find((panel) => panel.getAttribute('name') === name) ?? panels[index];
    return panels[index];
  }

  private select(tab: VuiTab): void {
    for (const item of this.tabs()) item.toggleAttribute('selected', item === tab);
    this.link();
  }

  private tabFromEvent(event: Event): VuiTab | null {
    const path = event.composedPath();
    return (path.find((node) => node instanceof VuiTab) as VuiTab | undefined) ?? null;
  }

  private onKeydown(event: KeyboardEvent): void {
    const current = this.tabFromEvent(event);
    if (!current) return;
    const tabs = this.tabs().filter((tab) => !tab.hasAttribute('disabled'));
    const index = tabs.indexOf(current);
    if (index < 0) return;
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    const tab = tabs[next];
    if (!tab) return;
    this.select(tab);
    tab.focusTab();
  }
}

defineElement('vui-tab', VuiTab);
defineElement('vui-tab-panel', VuiTabPanel);
defineElement('vui-tabs', VuiTabs);
