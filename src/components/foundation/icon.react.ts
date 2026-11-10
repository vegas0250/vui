'use client';

import { createComponent } from '../../utils/react';
import type { VIcon } from './icon';

export const Icon = /* @__PURE__ */ createComponent<VIcon, {
  'name'?: string;
  'label'?: string;
}>(
  'vui-icon', () => import('./icon'),
);
