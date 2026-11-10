'use client';

import { createComponent } from '../../utils/react';
import type { VStep, VStepper } from './stepper';

export const Step = /* @__PURE__ */ createComponent<VStep, {
  'value'?: string;
  'disabled'?: boolean;
  'selected'?: boolean;
}>(
  'vui-step', () => import('./stepper'),
);
export const Stepper = /* @__PURE__ */ createComponent<VStepper, {
  'label'?: string;
  'value'?: string;
}>(
  'vui-stepper', () => import('./stepper'),
);
