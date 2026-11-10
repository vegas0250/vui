'use client';

import { createComponent } from '../../utils/react';
import type { VTextarea } from './textarea';

export const Textarea = /* @__PURE__ */ createComponent<VTextarea, {
  'label'?: string;
  'value'?: string;
  'placeholder'?: string;
  'hint'?: string;
  'name'?: string;
  'rows'?: string;
  'disabled'?: boolean;
  'invalid'?: boolean;
  'required'?: boolean;
  'readonly'?: boolean;
}>(
  'vui-textarea', () => import('./textarea'),
);
