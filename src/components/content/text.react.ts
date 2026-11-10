'use client';

import { createComponent } from '../../utils/react';
import type { VText } from './text';

export const Text = /* @__PURE__ */ createComponent<VText, {
  'variant'?: string;
  'level'?: string;
  'muted'?: boolean;
  'truncate'?: boolean;
}>(
  'vui-text', () => import('./text'),
);
