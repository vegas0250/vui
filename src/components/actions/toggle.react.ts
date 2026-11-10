'use client';

import { createComponent } from '../../utils/react';
import type { VToggle, VToggleGroup } from './toggle';

export const Toggle = /* @__PURE__ */ createComponent<VToggle, {
  'value'?: string;
  'disabled'?: boolean;
  'pressed'?: boolean;
}>(
  'vui-toggle', () => import('./toggle'),
);
export const ToggleGroup = /* @__PURE__ */ createComponent<VToggleGroup, {
  'label'?: string;
  'orientation'?: string;
  'value'?: string;
  'disabled'?: boolean;
  'multiple'?: boolean;
}>(
  'vui-toggle-group', () => import('./toggle'),
);
