'use client';

import { createComponent } from '../../utils/react';
import type { VSplitPanel } from './split-panel';

export const SplitPanel = /* @__PURE__ */ createComponent<VSplitPanel, {
  'orientation'?: string;
  'position'?: number;
  'min'?: number;
  'max'?: number;
  'label'?: string;
  'overflow'?: string;
}>(
  'vui-split-panel', () => import('./split-panel'),
);
