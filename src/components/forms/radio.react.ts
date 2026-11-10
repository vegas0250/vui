'use client';

import { createComponent } from '../../utils/react';
import type { VRadio, VRadioGroup } from './radio';

export const Radio = /* @__PURE__ */ createComponent<VRadio, {
  'checked'?: boolean;
  'name'?: string;
  'value'?: string;
  'disabled'?: boolean;
  'invalid'?: boolean;
}>(
  'vui-radio', () => import('./radio'),
);
export const RadioGroup = /* @__PURE__ */ createComponent<VRadioGroup, {
  'label'?: string;
  'name'?: string;
  'hint'?: string;
  'value'?: string;
  'disabled'?: boolean;
  'invalid'?: boolean;
  'required'?: boolean;
}>(
  'vui-radio-group', () => import('./radio'),
);
