'use client';

import { createComponent } from '../../utils/react';
import type { VOption, VSelect } from './select';

export const Option = /* @__PURE__ */ createComponent<VOption, {
  'value'?: string;
  'label'?: string;
  'disabled'?: boolean;
}>(
  'vui-option', () => import('./select'),
);
export const Select = /* @__PURE__ */ createComponent<VSelect, {
  'label'?: string;
  'value'?: string;
  'placeholder'?: string;
  'name'?: string;
  'size'?: string;
  'disabled'?: boolean;
  'invalid'?: boolean;
}>(
  'vui-select', () => import('./select'),
);
