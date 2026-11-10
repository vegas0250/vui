'use client';

import { createComponent } from '../../utils/react';
import type { VTitlebar } from './titlebar';

export const Titlebar = /* @__PURE__ */ createComponent<VTitlebar, {
  onMinimize?: (event: Event & { currentTarget: VTitlebar }) => void;
  onMaximize?: (event: Event & { currentTarget: VTitlebar }) => void;
  'label'?: string;
  'minimize-label'?: string;
  'maximize-label'?: string;
  'restore-label'?: string;
  'close-label'?: string;
  'maximized'?: boolean;
}>(
  'vui-titlebar', () => import('./titlebar'), {"minimizeLabel": "minimize-label", "maximizeLabel": "maximize-label", "restoreLabel": "restore-label", "closeLabel": "close-label"},
);
