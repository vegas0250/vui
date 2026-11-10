'use client';

import { createComponent } from '../../utils/react';
import type { VAlert } from './alert';

export const Alert = /* @__PURE__ */ createComponent<VAlert, {
  'variant'?: string;
  'closable'?: boolean;
  'banner'?: boolean;
  'close-label'?: string;
}>(
  'vui-alert', () => import('./alert'), {"closeLabel": "close-label"},
);
