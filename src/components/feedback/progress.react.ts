'use client';

import { createComponent } from '../../utils/react';
import type { VProgress } from './progress';

export const Progress = /* @__PURE__ */ createComponent<VProgress, {
  'label'?: string;
  'value'?: number;
  'max'?: number;
}>(
  'vui-progress', () => import('./progress'),
);
