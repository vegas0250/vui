'use client';

import { createComponent } from '../../utils/react';
import type { VRating } from './rating';

export const Rating = /* @__PURE__ */ createComponent<VRating, {
  'label'?: string;
  'max'?: string;
  'value'?: string;
  'disabled'?: boolean;
  'readonly'?: boolean;
}>(
  'vui-rating', () => import('./rating'),
);
