'use client';

import { createComponent } from '../../utils/react';
import type { VDataGrid } from './data-grid';

export const DataGrid = /* @__PURE__ */ createComponent<VDataGrid, {
  'label'?: string;
  'empty-label'?: string;
  'multiple'?: boolean;
  'fill'?: boolean;
}>(
  'vui-data-grid', () => import('./data-grid'), {"emptyLabel": "empty-label"},
);
