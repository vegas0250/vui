'use client';

import { createComponent } from '../../utils/react';
import type { VChip } from './chip';

export const Chip = /* @__PURE__ */ createComponent<VChip, {
  'variant'?: string;
  'removable'?: boolean;
  'close-label'?: string;
}>(
  'vui-chip', () => import('./chip'), {"closeLabel": "close-label"},
);
