'use client';

import { createComponent } from '../../utils/react';
import type { VProperty, VProperties } from './properties';

export const Property = /* @__PURE__ */ createComponent<VProperty, {
  'label'?: string;
}>(
  'vui-property', () => import('./properties'),
);
export const Properties = /* @__PURE__ */ createComponent<VProperties, {
  'label'?: string;
}>(
  'vui-properties', () => import('./properties'),
);
