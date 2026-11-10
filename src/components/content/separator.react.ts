'use client';

import { createComponent } from '../../utils/react';
import type { VSeparator } from './separator';

export const Separator = /* @__PURE__ */ createComponent<VSeparator, {
  'orientation'?: string;
  'label'?: string;
}>(
  'vui-separator', () => import('./separator'),
);
