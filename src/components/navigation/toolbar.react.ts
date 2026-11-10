'use client';

import { createComponent } from '../../utils/react';
import type { VToolbar } from './toolbar';

export const Toolbar = /* @__PURE__ */ createComponent<VToolbar, {
  'label'?: string;
  'wrap'?: boolean;
}>(
  'vui-toolbar', () => import('./toolbar'),
);
