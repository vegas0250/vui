import '../components/desktop/shell';
import '../components/layout/split-panel';
import { defineElement } from '../utils/define';
import { registerContract } from '../contract/registry';
import { registerComposition } from '../composition/registry';
import { VuiElement } from '../utils/element';
import { reflectBooleans, reflectStrings } from '../utils/reflect';
import type { VShell } from '../components/desktop/shell';
import type { VSplitPanel } from '../components/layout/split-panel';
import {
  syncTemplateShell,
  templateHostStyles,
  templateShellAttributes,
  templateShellContractAttributes,
} from './base';

/**
 * IDE-style chrome: shell + horizontal split for editor and inspector slots.
 */
export class VTemplateWorkspace extends VuiElement {
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
        <vui-split-panel part="main" orientation="horizontal">
          <slot name="editor" slot="start"></slot>
          <slot name="inspector" slot="end"></slot>
        </vui-split-panel>
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
    const split = this.qs<VSplitPanel>('vui-split-panel');
    split.setAttribute('label', this.getAttribute('content-label') || 'Editor and inspector');
  }
}

reflectStrings(VTemplateWorkspace, {
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
reflectBooleans(VTemplateWorkspace, { collapsed: 'collapsed', asideCollapsed: 'aside-collapsed' });
defineElement('vui-template-workspace', VTemplateWorkspace);

registerContract({
  element: 'vui-template-workspace',
  className: 'VTemplateWorkspace',
  attributes: templateShellContractAttributes,
  events: [],
  slots: ['header', 'toolbar', 'nav', 'editor', 'inspector', 'aside', 'footer'],
  parts: ['shell', 'main'],
  methods: [],
  keyboard: ['Tab'],
  states: [],
  responsive: 'container',
  focus: 'native',
});

registerComposition({
  id: 'template-workspace',
  host: 'vui-template-workspace',
  summary: 'Workspace template: shell regions with editor and inspector split slots.',
  links: [
    { from: 'vui-template-workspace', to: 'header', direction: 'parent-child', channel: 'slot', slot: 'header' },
    { from: 'vui-template-workspace', to: 'toolbar', direction: 'parent-child', channel: 'slot', slot: 'toolbar' },
    { from: 'vui-template-workspace', to: 'nav', direction: 'parent-child', channel: 'slot', slot: 'nav' },
    { from: 'vui-template-workspace', to: 'editor', direction: 'parent-child', channel: 'slot', slot: 'editor' },
    { from: 'vui-template-workspace', to: 'inspector', direction: 'parent-child', channel: 'slot', slot: 'inspector' },
    { from: 'vui-template-workspace', to: 'aside', direction: 'parent-child', channel: 'slot', slot: 'aside' },
    { from: 'vui-template-workspace', to: 'footer', direction: 'parent-child', channel: 'slot', slot: 'footer' },
  ],
  emits: [],
});
