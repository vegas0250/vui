'use client';

import { createComponent } from '../../utils/react';
import type { VWindow } from './window';

export const Window = /* @__PURE__ */ createComponent<VWindow, {
  'label'?: string;
}>(
  'vui-window', () => import('./window'),
);
