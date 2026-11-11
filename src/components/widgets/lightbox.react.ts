'use client';

import { createComponent } from '../../utils/react';
import type { VLightbox } from './lightbox';

export const Lightbox = /* @__PURE__ */ createComponent<VLightbox, {
  'label'?: string;
  'index'?: number;
}>(
  'vui-lightbox', () => import('./lightbox'),
);
