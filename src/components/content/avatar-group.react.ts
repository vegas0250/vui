'use client';

import { createComponent } from '../../utils/react';
import type { VAvatarGroup } from './avatar-group';

export const AvatarGroup = /* @__PURE__ */ createComponent<VAvatarGroup, {
  'label'?: string;
}>(
  'vui-avatar-group', () => import('./avatar-group'),
);
