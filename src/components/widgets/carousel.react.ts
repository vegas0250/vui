'use client';

import { createComponent } from '../../utils/react';
import type { VCarousel } from './carousel';

export const Carousel = /* @__PURE__ */ createComponent<VCarousel, {
  'label'?: string;
  'index'?: number;
  'loop'?: boolean;
  'autoplay'?: boolean;
  'interval'?: number;
}>(
  'vui-carousel', () => import('./carousel'),
);
