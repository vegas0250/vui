'use client';

import { createComponent } from '../../utils/react';
import type { VPopover } from './popover';

export const Popover = /* @__PURE__ */ createComponent<VPopover, {
  'label'?: string;
  'placement'?: string;
  'open'?: boolean;
}>(
  'vui-popover', () => import('./popover'),
);
