'use client';

import { createComponent } from '../../utils/react';
import type { VPathBar } from './path-bar';

export const PathBar = /* @__PURE__ */ createComponent<VPathBar, {
  'label'?: string;
  'value'?: string;
  'disabled'?: boolean;
}>(
  'vui-path-bar', () => import('./path-bar'),
);
