'use client';

import { createComponent } from '../../utils/react';
import type { VField, VFieldGroup } from './field';

export const Field = /* @__PURE__ */ createComponent<VField, {
  'label'?: string;
  'hint'?: string;
  'disabled'?: boolean;
  'invalid'?: boolean;
  'required'?: boolean;
}>(
  'vui-field', () => import('./field'),
);
export const FieldGroup = /* @__PURE__ */ createComponent<VFieldGroup, {
  'label'?: string;
  'hint'?: string;
  'disabled'?: boolean;
}>(
  'vui-field-group', () => import('./field'),
);
