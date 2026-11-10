'use client';

import { createComponent } from '../../utils/react';
import type { VDialog } from './dialog';

export const Dialog = /* @__PURE__ */ createComponent<VDialog, {
  'open'?: boolean;
  'label'?: string;
  'size'?: string;
  'close-label'?: string;
  'dismissable'?: boolean;
  'alert'?: boolean;
}>(
  'vui-dialog', () => import('./dialog'), {"closeLabel": "close-label"},
);
