'use client';

import { createComponent } from '../../utils/react';
import type { VGallery } from './gallery';

export const Gallery = /* @__PURE__ */ createComponent<VGallery, {
  'label'?: string;
  'index'?: number;
}>(
  'vui-gallery', () => import('./gallery'),
);
