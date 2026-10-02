import { beforeEach, describe, expect, it } from 'vitest';
import { defineElement } from '../../src/core/define';
import {
  VAlert,
  VButton,
  VCheckbox,
  VDataGrid,
  VDialog,
  VFileTree,
  VGrid,
  VHStack,
  VIcon,
  VIconButton,
  VInput,
  VOption,
  VPanel,
  VSelect,
  VSplitPanel,
  VStack,
  VStatusBar,
  VSwitch,
  VTab,
  VTabPanel,
  VTabs,
  VToast,
  VToaster,
  VToolbar,
  VTooltip,
  VTreeItem,
  VVStack,
} from '../../src/index';

const registry = [
  ['vui-button', VButton],
  ['vui-icon-button', VIconButton],
  ['vui-icon', VIcon],
  ['vui-input', VInput],
  ['vui-checkbox', VCheckbox],
  ['vui-switch', VSwitch],
  ['vui-select', VSelect],
  ['vui-option', VOption],
  ['vui-dialog', VDialog],
  ['vui-tabs', VTabs],
  ['vui-tab', VTab],
  ['vui-tab-panel', VTabPanel],
  ['vui-tooltip', VTooltip],
  ['vui-alert', VAlert],
  ['vui-toast', VToast],
  ['vui-toaster', VToaster],
  ['vui-panel', VPanel],
  ['vui-stack', VStack],
  ['vui-hstack', VHStack],
  ['vui-vstack', VVStack],
  ['vui-grid', VGrid],
  ['vui-split-panel', VSplitPanel],
  ['vui-toolbar', VToolbar],
  ['vui-status-bar', VStatusBar],
  ['vui-file-tree', VFileTree],
  ['vui-tree-item', VTreeItem],
  ['vui-data-grid', VDataGrid],
] as const;

describe('component naming', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('binds each V class to one vui- custom element', () => {
    for (const [name, ctor] of registry) {
      expect(customElements.get(name), name).toBe(ctor);
    }
  });

  it('does not throw when a custom element is registered twice', () => {
    expect(() => defineElement('vui-button', VButton)).not.toThrow();
    expect(() => defineElement('vui-dialog', VDialog)).not.toThrow();
    expect(customElements.get('vui-button')).toBe(VButton);
    expect(customElements.get('vui-dialog')).toBe(VDialog);
  });
});
