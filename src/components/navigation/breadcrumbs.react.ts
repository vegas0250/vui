'use client';

import { createComponent } from '../../utils/react';
import type { VBreadcrumbs } from './breadcrumbs';

export const Breadcrumbs = /* @__PURE__ */ createComponent<VBreadcrumbs, {
  'label'?: string;
}>(
  'vui-breadcrumbs', () => import('./breadcrumbs'),
);
