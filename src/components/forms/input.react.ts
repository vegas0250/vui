'use client';

import { createComponent } from '../../utils/react';
import type { VInput } from './input';

export const Input = /* @__PURE__ */ createComponent<VInput, {
  'label'?: string;
  'value'?: string;
  'type'?: string;
  'placeholder'?: string;
  'hint'?: string;
  'name'?: string;
  'size'?: string;
  'disabled'?: boolean;
  'invalid'?: boolean;
  'required'?: boolean;
  'readonly'?: boolean;
}>(
  'vui-input', () => import('./input'),
);
