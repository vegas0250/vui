'use client';

import { createComponent } from '../../utils/react';
import type { VSwitch } from './switch';

export const Switch = /* @__PURE__ */ createComponent<VSwitch, {
  'checked'?: boolean;
  'disabled'?: boolean;
  'name'?: string;
  'value'?: string;
  'label'?: string;
}>(
  'vui-switch', () => import('./switch'),
);
