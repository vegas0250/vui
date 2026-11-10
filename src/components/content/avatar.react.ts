'use client';

import { createComponent } from '../../utils/react';
import type { VAvatar } from './avatar';

export const Avatar = /* @__PURE__ */ createComponent<VAvatar, {
  'label'?: string;
  'size'?: string;
}>(
  'vui-avatar', () => import('./avatar'),
);
