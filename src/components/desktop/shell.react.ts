'use client';

import { createComponent } from '../../utils/react';
import type { VShell } from './shell';

export const Shell = /* @__PURE__ */ createComponent<VShell, {
  'label'?: string;
  'nav-label'?: string;
  'aside-label'?: string;
  'skip-label'?: string;
  'resize-label'?: string;
  'aside-expand-label'?: string;
  'aside-collapse-label'?: string;
  'aside-resize-label'?: string;
  'collapsed'?: boolean;
  'aside-collapsed'?: boolean;
}>(
  'vui-shell', () => import('./shell'), {"navLabel": "nav-label", "asideLabel": "aside-label", "skipLabel": "skip-label", "resizeLabel": "resize-label", "asideExpandLabel": "aside-expand-label", "asideCollapseLabel": "aside-collapse-label", "asideResizeLabel": "aside-resize-label", "asideCollapsed": "aside-collapsed"},
);
