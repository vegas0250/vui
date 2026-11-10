'use client';

import { createComponent } from '../../utils/react';
import type { VSlider } from './slider';

export const Slider = /* @__PURE__ */ createComponent<VSlider, {
  'label'?: string;
  'hint'?: string;
  'name'?: string;
  'min'?: string;
  'max'?: string;
  'step'?: string;
  'value'?: string;
  'value-end'?: string;
  'disabled'?: boolean;
  'invalid'?: boolean;
}>(
  'vui-slider', () => import('./slider'),
);
