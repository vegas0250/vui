'use client';

import { createComponent } from '../../utils/react';
import type { VDrawer } from './drawer';

export const Drawer = /* @__PURE__ */ createComponent<VDrawer, {
  'open'?: boolean;
  'label'?: string;
  'placement'?: string;
  'close-label'?: string;
  'dismissable'?: boolean;
}>(
  'vui-drawer', () => import('./drawer'), {"closeLabel": "close-label"},
);
