'use client';

import { createComponent } from '../../utils/react';
import type { VNavItem, VNavGroup, VNav } from './nav';

export const NavItem = /* @__PURE__ */ createComponent<VNavItem, {
  'href'?: string;
  'label'?: string;
  'icon'?: string;
  'disabled'?: boolean;
  'selected'?: boolean;
  'expanded'?: boolean;
}>(
  'vui-nav-item', () => import('./nav'),
);
export const NavGroup = /* @__PURE__ */ createComponent<VNavGroup, {
  'label'?: string;
  'icon'?: string;
  'expanded'?: boolean;
}>(
  'vui-nav-group', () => import('./nav'),
);
export const Nav = /* @__PURE__ */ createComponent<VNav, {
  'label'?: string;
  'orientation'?: string;
}>(
  'vui-nav', () => import('./nav'),
);
