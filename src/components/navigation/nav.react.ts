'use client';

import { createComponent } from '../../utils/react';
import type { VNavItem, VNav } from './nav';

export const NavItem = /* @__PURE__ */ createComponent<VNavItem, {
  'href'?: string;
  'disabled'?: boolean;
  'selected'?: boolean;
}>(
  'vui-nav-item', () => import('./nav'),
);
export const Nav = /* @__PURE__ */ createComponent<VNav, {
  'label'?: string;
  'orientation'?: string;
}>(
  'vui-nav', () => import('./nav'),
);
