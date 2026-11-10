'use client';

import { createComponent } from '../../utils/react';
import type { VGrid } from './grid';

export const Grid = /* @__PURE__ */ createComponent<VGrid, {
  'columns'?: string;
  'min'?: string;
  'gap'?: string;
  'align'?: string;
  'justify'?: string;
  'padding'?: string;
  'overflow'?: string;
}>(
  'vui-grid', () => import('./grid'),
);
