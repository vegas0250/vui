'use client';

import { createComponent } from '../../utils/react';
import type { VScrollArea } from './scroll-area';

export const ScrollArea = /* @__PURE__ */ createComponent<VScrollArea, {
  'label'?: string;
}>(
  'vui-scroll-area', () => import('./scroll-area'),
);
