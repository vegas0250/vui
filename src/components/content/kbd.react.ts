'use client';

import { createComponent } from '../../utils/react';
import type { VKbd } from './kbd';

export const Kbd = /* @__PURE__ */ createComponent<VKbd, object>(
  'vui-kbd', () => import('./kbd'),
);
