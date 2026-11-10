'use client';

import { createComponent } from '../../utils/react';
import type { VIconButton } from './icon-button';

export const IconButton = /* @__PURE__ */ createComponent<VIconButton, {
  'name'?: string;
  'label'?: string;
  'variant'?: string;
  'size'?: string;
  'type'?: string;
  'disabled'?: boolean;
  'loading'?: boolean;
}>(
  'vui-icon-button', () => import('./icon-button'),
);
