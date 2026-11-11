'use client';

import { createComponent } from '../../utils/react';
import type { VMenuItem, VMenu } from './menu';

export const MenuItem = /* @__PURE__ */ createComponent<VMenuItem, {
  'label'?: string;
  'command'?: string;
  'shortcut'?: string;
  'icon'?: string;
  'href'?: string;
  'disabled'?: boolean;
  'checked'?: boolean;
  'selected'?: boolean;
  'expanded'?: boolean;
  'variant'?: string;
  'layout'?: string;
}>(
  'vui-menu-item', () => import('./menu'),
);
export const Menu = /* @__PURE__ */ createComponent<VMenu, {
  'label'?: string;
  'orientation'?: string;
  'inline'?: boolean;
}>(
  'vui-menu', () => import('./menu'),
);
