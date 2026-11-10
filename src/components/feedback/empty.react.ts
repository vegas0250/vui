'use client';

import { createComponent } from '../../utils/react';
import type { VEmpty } from './empty';

export const Empty = /* @__PURE__ */ createComponent<VEmpty, {
  'heading'?: string;
  'label'?: string;
}>(
  'vui-empty', () => import('./empty'),
);
