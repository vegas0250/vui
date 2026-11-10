'use client';

import { createComponent } from '../../utils/react';
import type { VSpinner } from './spinner';

export const Spinner = /* @__PURE__ */ createComponent<VSpinner, {
  'label'?: string;
}>(
  'vui-spinner', () => import('./spinner'),
);
