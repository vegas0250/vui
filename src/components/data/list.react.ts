'use client';

import { createComponent } from '../../utils/react';
import type { VListItem, VList } from './list';

export const ListItem = /* @__PURE__ */ createComponent<VListItem, {
  'value'?: string;
  'disabled'?: boolean;
  'selected'?: boolean;
}>(
  'vui-list-item', () => import('./list'),
);
export const List = /* @__PURE__ */ createComponent<VList, {
  'label'?: string;
  'value'?: string;
  'multiple'?: boolean;
}>(
  'vui-list', () => import('./list'),
);
