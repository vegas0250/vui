'use client';

import { createComponent } from '../../utils/react';
import type { VTreeItem, VFileTree } from './file-tree';

export const TreeItem = /* @__PURE__ */ createComponent<VTreeItem, {
  'label'?: string;
  'kind'?: string;
  'icon'?: string;
  'summary'?: string;
  'count'?: string;
  'status'?: string;
  'status-variant'?: string;
  'expanded'?: boolean;
  'selected'?: boolean;
  'disabled'?: boolean;
  'loading'?: boolean;
  'value'?: string;
}>(
  'vui-tree-item', () => import('./file-tree'), {"statusVariant": "status-variant"},
);
export const FileTree = /* @__PURE__ */ createComponent<VFileTree, {
  'label'?: string;
}>(
  'vui-file-tree', () => import('./file-tree'),
);
