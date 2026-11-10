'use client';

import { createComponent } from '../../utils/react';
import type { VMenuItem, VMenu } from './menu';

export const MenuItem = /* @__PURE__ */ createComponent<VMenuItem, {
  'label'?: string;
  'command'?: string;
  'shortcut'?: string;
  'icon'?: string;
  'disabled'?: boolean;
  'checked'?: boolean;
  'variant'?: string;
  'layout'?: string;
}>(
  'vui-menu-item', () => import('./menu'),
);
export const Menu = /* @__PURE__ */ createComponent<VMenu, {
  'label'?: string;
}>(
  'vui-menu', () => import('./menu'),
);
