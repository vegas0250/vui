'use client';

import { createComponent } from '../../utils/react';
import type { VButtonGroup } from './button-group';

export const ButtonGroup = /* @__PURE__ */ createComponent<VButtonGroup, {
  'label'?: string;
  'orientation'?: string;
  'disabled'?: boolean;
}>(
  'vui-button-group', () => import('./button-group'),
);
