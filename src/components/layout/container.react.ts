'use client';

import { createComponent } from '../../utils/react';
import type { VContainer } from './container';

export const Container = /* @__PURE__ */ createComponent<VContainer, {
  'size'?: string;
  'padding'?: string;
}>(
  'vui-container', () => import('./container'),
);
