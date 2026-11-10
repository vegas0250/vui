'use client';

import { createComponent } from '../../utils/react';
import type { VPanel } from './panel';

export const Panel = /* @__PURE__ */ createComponent<VPanel, {
  'heading'?: string;
  'padding'?: string;
  'overflow'?: string;
}>(
  'vui-panel', () => import('./panel'),
);
