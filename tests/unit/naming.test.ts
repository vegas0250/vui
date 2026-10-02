import { beforeEach, describe, expect, it } from 'vitest';
import { defineElement } from '../../src/core/define';
import {
  VAlert,
  VAvatar,
  VBadge,
  VBreadcrumbs,
  VButton,
  VButtonGroup,
  VCheckbox,
  VContainer,
  VDataGrid,
  VDialog,
  VFileTree,
  VMenu,
  VMenuItem,
  VGrid,
  VHStack,
  VIcon,
  VIconButton,
  VInput,
  VOption,
  VPagination,
  VPanel,
  VPopover,
  VProgress,
  VRadio,
  VRadioGroup,
  VScrollArea,
  VSelect,
  VSeparator,
  VShell,
  VSkeleton,
  VSpinner,
  VSplitPanel,
  VStack,
  VStatusBar,
  VSwitch,
  VTab,
  VTabPanel,
  VTabs,
  VTextarea,
  VToast,
  VToaster,
  VToolbar,
  VTooltip,
  VTreeItem,
  VVStack,
} from '../../src/index';

const registry = [
  ['vui-button', VButton],
  ['vui-button-group', VButtonGroup],
  ['vui-icon-button', VIconButton],
  ['vui-avatar', VAvatar],
  ['vui-badge', VBadge],
  ['vui-separator', VSeparator],
  ['vui-icon', VIcon],
  ['vui-input', VInput],
  ['vui-textarea', VTextarea],
  ['vui-checkbox', VCheckbox],
  ['vui-radio', VRadio],
  ['vui-radio-group', VRadioGroup],
  ['vui-switch', VSwitch],
  ['vui-select', VSelect],
  ['vui-option', VOption],
  ['vui-dialog', VDialog],
  ['vui-menu', VMenu],
  ['vui-menu-item', VMenuItem],
  ['vui-popover', VPopover],
  ['vui-tabs', VTabs],
  ['vui-breadcrumbs', VBreadcrumbs],
  ['vui-pagination', VPagination],
  ['vui-tab', VTab],
  ['vui-tab-panel', VTabPanel],
  ['vui-tooltip', VTooltip],
  ['vui-alert', VAlert],
  ['vui-progress', VProgress],
  ['vui-spinner', VSpinner],
  ['vui-skeleton', VSkeleton],
  ['vui-toast', VToast],
  ['vui-toaster', VToaster],
  ['vui-panel', VPanel],
  ['vui-container', VContainer],
  ['vui-scroll-area', VScrollArea],
  ['vui-stack', VStack],
  ['vui-hstack', VHStack],
  ['vui-vstack', VVStack],
  ['vui-grid', VGrid],
  ['vui-split-panel', VSplitPanel],
  ['vui-toolbar', VToolbar],
  ['vui-status-bar', VStatusBar],
  ['vui-shell', VShell],
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
