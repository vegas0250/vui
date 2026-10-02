import { registerInteraction } from './contract';

registerInteraction({
  element: 'vui-button',
  focus: ['native'],
  keyboard: ['Tab', 'Enter', 'Space'],
  selectionOwner: 'none',
  active: 'none',
  command: false,
  primitives: ['native'],
});

registerInteraction({
  element: 'vui-icon-button',
  focus: ['native'],
  keyboard: ['Tab', 'Enter', 'Space'],
  selectionOwner: 'none',
  active: 'none',
  command: false,
  primitives: ['native'],
});

registerInteraction({
  element: 'vui-input',
  focus: ['native'],
  keyboard: ['Tab'],
  selectionOwner: 'attribute',
  active: 'none',
  command: false,
  primitives: ['native'],
});

registerInteraction({
  element: 'vui-checkbox',
  focus: ['native'],
  keyboard: ['Tab', 'Space'],
  selectionOwner: 'attribute',
  active: 'none',
  command: false,
  primitives: ['native'],
});

registerInteraction({
  element: 'vui-switch',
  focus: ['native'],
  keyboard: ['Tab', 'Space'],
  selectionOwner: 'attribute',
  active: 'none',
  command: false,
  primitives: ['native'],
});

registerInteraction({
  element: 'vui-select',
  focus: ['native', 'active-descendant', 'nested-overlay'],
  keyboard: ['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', 'Space', 'Escape'],
  selectionOwner: 'attribute',
  active: 'cursor',
  command: false,
  primitives: ['nextEnabled', 'isActivation', 'pushOverlay'],
});

registerInteraction({
  element: 'vui-dialog',
  focus: ['native', 'trap', 'restore', 'nested-overlay'],
  keyboard: ['Tab', 'Escape'],
  selectionOwner: 'none',
  active: 'none',
  command: false,
  primitives: ['native', 'pushOverlay'],
});

registerInteraction({
  element: 'vui-tooltip',
  focus: ['native'],
  keyboard: ['Escape'],
  selectionOwner: 'none',
  active: 'none',
  command: false,
  primitives: ['pushOverlay'],
});

registerInteraction({
  element: 'vui-toast',
  focus: ['native'],
  keyboard: ['Tab'],
  selectionOwner: 'none',
  active: 'none',
  command: false,
  primitives: ['native'],
});

registerInteraction({
  element: 'vui-toaster',
  focus: ['native'],
  keyboard: [],
  selectionOwner: 'none',
  active: 'none',
  command: false,
  primitives: ['pushOverlay'],
});

registerInteraction({
  element: 'vui-tabs',
  focus: ['roving'],
  keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
  selectionOwner: 'attribute',
  active: 'selection',
  command: false,
  primitives: ['moveInList', 'applyRovingTabIndex'],
});

registerInteraction({
  element: 'vui-file-tree',
  focus: ['roving'],
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', 'Space'],
  selectionOwner: 'model',
  active: 'selection',
  command: false,
  primitives: ['moveInList', 'applyRovingTabIndex', 'SelectionModel'],
});

registerInteraction({
  element: 'vui-data-grid',
  focus: ['native', 'roving'],
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'],
  selectionOwner: 'model',
  active: 'cursor',
  command: false,
  primitives: ['moveInList', 'stepIndex', 'applyRovingTabIndex', 'SelectionModel'],
});

registerInteraction({
  element: 'vui-menu',
  focus: ['roving', 'restore', 'nested-overlay'],
  keyboard: ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', 'Space', 'Escape'],
  selectionOwner: 'none',
  active: 'cursor',
  command: true,
  primitives: ['moveInList', 'applyRovingTabIndex', 'isActivation', 'pushOverlay', 'placeLayer', 'CommandRegistry'],
});

registerInteraction({
  element: 'vui-toolbar',
  focus: ['native'],
  keyboard: ['Tab'],
  selectionOwner: 'none',
  active: 'none',
  command: false,
  primitives: ['native'],
});

registerInteraction({
  element: 'vui-split-panel',
  focus: ['native'],
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'],
  selectionOwner: 'none',
  active: 'none',
  command: false,
  primitives: ['trackPointer'],
});
