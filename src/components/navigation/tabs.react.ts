'use client';

import { createComponent } from '../../utils/react';
import type { VTab, VTabPanel, VTabs } from './tabs';

export const Tab = /* @__PURE__ */ createComponent<VTab, {
  'panel'?: string;
  'close-label'?: string;
  'selected'?: boolean;
  'disabled'?: boolean;
  'closable'?: boolean;
}>(
  'vui-tab', () => import('./tabs'), {"closeLabel": "close-label"},
);
export const TabPanel = /* @__PURE__ */ createComponent<VTabPanel, {
  'name'?: string;
  'selected'?: boolean;
}>(
  'vui-tab-panel', () => import('./tabs'),
);
export const Tabs = /* @__PURE__ */ createComponent<VTabs, {
  'label'?: string;
}>(
  'vui-tabs', () => import('./tabs'),
);
