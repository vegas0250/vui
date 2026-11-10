'use client';

import { createComponent } from '../../utils/react';
import type { VTooltip } from './tooltip';

export const Tooltip = /* @__PURE__ */ createComponent<VTooltip, {
  'text'?: string;
  'placement'?: string;
}>(
  'vui-tooltip', () => import('./tooltip'),
);
