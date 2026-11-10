'use client';

import { createComponent } from '../../utils/react';
import type { VBadge } from './badge';

export const Badge = /* @__PURE__ */ createComponent<VBadge, {
  'variant'?: string;
}>(
  'vui-badge', () => import('./badge'),
);
