'use client';

import { createComponent } from '../../utils/react';
import type { VCheckbox, VCheckboxGroup } from './checkbox';

export const Checkbox = /* @__PURE__ */ createComponent<VCheckbox, {
  'checked'?: boolean;
  'disabled'?: boolean;
  'invalid'?: boolean;
  'name'?: string;
  'value'?: string;
}>(
  'vui-checkbox', () => import('./checkbox'),
);
export const CheckboxGroup = /* @__PURE__ */ createComponent<VCheckboxGroup, {
  'label'?: string;
  'name'?: string;
  'hint'?: string;
  'value'?: string;
  'disabled'?: boolean;
  'invalid'?: boolean;
  'required'?: boolean;
}>(
  'vui-checkbox-group', () => import('./checkbox'),
);
