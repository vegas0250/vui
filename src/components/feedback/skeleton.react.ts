'use client';

import { createComponent } from '../../utils/react';
import type { VSkeleton } from './skeleton';

export const Skeleton = /* @__PURE__ */ createComponent<VSkeleton, {
  'variant'?: string;
}>(
  'vui-skeleton', () => import('./skeleton'),
);
