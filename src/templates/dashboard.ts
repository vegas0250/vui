import '../components/desktop/shell';
import '../components/layout/scroll-area';
import { defineElement } from '../utils/define';
import { registerContract } from '../contract/registry';
import { registerComposition } from '../composition/registry';
import { VuiElement } from '../utils/element';
import { reflectBooleans, reflectStrings } from '../utils/reflect';
import type { VShell } from '../components/desktop/shell';
import type { VScrollArea } from '../components/layout/scroll-area';
import {
  syncTemplateShell,
  templateHostStyles,
  templateShellAttributes,
  templateShellContractAttributes,
} from './base';

/**
 * Application chrome for overview screens: shell regions + scrollable main.
 * Theme and UI mode stay on the document; this host does not branch on them.
 */
export class VTemplateDashboard extends VuiElement {
  declare label: string;
  declare navLabel: string;
  declare asideLabel: string;
  declare skipLabel: string;
  declare resizeLabel: string;
  declare asideExpandLabel: string;
  declare asideCollapseLabel: string;
  declare asideResizeLabel: string;
  declare contentLabel: string;
  declare collapsed: boolean;
  declare asideCollapsed: boolean;

  static get observedAttributes(): string[] {
    return [...templateShellAttributes, 'content-label'];
  }

  protected template(): string {
    return `
      <vui-shell part="shell">
        <slot name="header" slot="header"></slot>
        <slot name="toolbar" slot="toolbar"></slot>
        <slot name="nav" slot="nav"></slot>
        <vui-scroll-area part="main">
          <slot></slot>
        </vui-scroll-area>
        <slot name="aside" slot="aside"></slot>
        <slot name="footer" slot="footer"></slot>
      </vui-shell>
    `;
  }

  protected componentStyles(): string {
    return templateHostStyles;
  }

  protected sync(): void {
    const shell = this.qs<VShell>('vui-shell');
    syncTemplateShell(this, shell);
    const main = this.qs<VScrollArea>('vui-scroll-area');
    main.setAttribute('label', this.getAttribute('content-label') || 'Content');
  }
}

reflectStrings(VTemplateDashboard, {
  label: 'label',
  navLabel: 'nav-label',
  asideLabel: 'aside-label',
  skipLabel: 'skip-label',
  resizeLabel: 'resize-label',
  asideExpandLabel: 'aside-expand-label',
  asideCollapseLabel: 'aside-collapse-label',
  asideResizeLabel: 'aside-resize-label',
  contentLabel: 'content-label',
});
reflectBooleans(VTemplateDashboard, { collapsed: 'collapsed', asideCollapsed: 'aside-collapsed' });
defineElement('vui-template-dashboard', VTemplateDashboard);

registerContract({
  element: 'vui-template-dashboard',
  className: 'VTemplateDashboard',
  attributes: templateShellContractAttributes,
  events: [],
  slots: ['header', 'toolbar', 'nav', '', 'aside', 'footer'],
  parts: ['shell', 'main'],
  methods: [],
  keyboard: ['Tab'],
  states: [],
  responsive: 'container',
  focus: 'native',
});

registerComposition({
  id: 'template-dashboard',
  host: 'vui-template-dashboard',
  summary: 'Dashboard template: shell regions with a scrollable main slot. App owns slot content.',
  links: [
    { from: 'vui-template-dashboard', to: 'header', direction: 'parent-child', channel: 'slot', slot: 'header' },
    { from: 'vui-template-dashboard', to: 'toolbar', direction: 'parent-child', channel: 'slot', slot: 'toolbar' },
    { from: 'vui-template-dashboard', to: 'nav', direction: 'parent-child', channel: 'slot', slot: 'nav' },
    { from: 'vui-template-dashboard', to: 'main', direction: 'parent-child', channel: 'slot', slot: '' },
    { from: 'vui-template-dashboard', to: 'aside', direction: 'parent-child', channel: 'slot', slot: 'aside' },
    { from: 'vui-template-dashboard', to: 'footer', direction: 'parent-child', channel: 'slot', slot: 'footer' },
  ],
  emits: [],
});
