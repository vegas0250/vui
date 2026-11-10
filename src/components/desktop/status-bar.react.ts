'use client';

import { createComponent } from '../../utils/react';
import type { VStatusBar } from './status-bar';

export const StatusBar = /* @__PURE__ */ createComponent<VStatusBar, {
  'label'?: string;
}>(
  'vui-status-bar', () => import('./status-bar'),
);
