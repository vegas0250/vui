'use client';

import { createComponent } from '../../utils/react';
import type { VPagination } from './pagination';

export const Pagination = /* @__PURE__ */ createComponent<VPagination, {
  'label'?: string;
  'page'?: number;
  'pages'?: number;
}>(
  'vui-pagination', () => import('./pagination'),
);
