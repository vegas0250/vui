'use client';

import { createComponent } from '../../utils/react';
import type { VToast, VToaster } from './toast';

export const Toast = /* @__PURE__ */ createComponent<VToast, {
  'variant'?: string;
  'heading'?: string;
  'duration'?: string;
  'close-label'?: string;
}>(
  'vui-toast', () => import('./toast'), {"closeLabel": "close-label"},
);
export const Toaster = /* @__PURE__ */ createComponent<VToaster, object>(
  'vui-toaster', () => import('./toast'),
);
