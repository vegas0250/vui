'use client';

import { createComponent } from '../../utils/react';
import type { VLink } from './link';

export const Link = /* @__PURE__ */ createComponent<VLink, {
  'href'?: string;
  'variant'?: string;
  'target'?: string;
  'rel'?: string;
  'disabled'?: boolean;
}>(
  'vui-link', () => import('./link'),
);
