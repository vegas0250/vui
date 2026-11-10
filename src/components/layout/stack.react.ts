'use client';

import { createComponent } from '../../utils/react';
import type { VStack as StackElement, VHStack, VVStack } from './stack';

export const Stack = /* @__PURE__ */ createComponent<StackElement, {
  gap?: string;
  align?: string;
  justify?: string;
  direction?: string;
  padding?: string;
  overflow?: string;
  wrap?: boolean;
}>(
  'vui-stack', () => import('./stack'),
);
export const HStack = /* @__PURE__ */ createComponent<VHStack, {
  gap?: string;
  align?: string;
  justify?: string;
  direction?: string;
  padding?: string;
  overflow?: string;
  wrap?: boolean;
}>(
  'vui-hstack', () => import('./stack'),
);
export const VStack = /* @__PURE__ */ createComponent<VVStack, {
  gap?: string;
  align?: string;
  justify?: string;
  direction?: string;
  padding?: string;
  overflow?: string;
  wrap?: boolean;
}>(
  'vui-vstack', () => import('./stack'),
);
