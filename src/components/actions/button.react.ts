'use client';

import { createComponent } from '../../utils/react';
import type { VButton } from './button';

export const Button = /* @__PURE__ */ createComponent<VButton, {
  'variant'?: string;
  'size'?: string;
  'type'?: string;
  'disabled'?: boolean;
  'loading'?: boolean;
  'name'?: string;
  'value'?: string;
  'form'?: string;
}>(
  'vui-button', () => import('./button'),
);
