'use client';

import { createComponent } from '../../utils/react';
import type { VSpinButton } from './spin-button';

export const SpinButton = /* @__PURE__ */ createComponent<VSpinButton, {
  'label'?: string;
  'hint'?: string;
  'name'?: string;
  'min'?: string;
  'max'?: string;
  'step'?: string;
  'value'?: string;
  'disabled'?: boolean;
  'invalid'?: boolean;
}>(
  'vui-spin-button', () => import('./spin-button'),
);
