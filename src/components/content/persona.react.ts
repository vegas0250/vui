'use client';

import { createComponent } from '../../utils/react';
import type { VPersona } from './persona';

export const Persona = /* @__PURE__ */ createComponent<VPersona, {
  'label'?: string;
  'secondary'?: string;
  'size'?: string;
}>(
  'vui-persona', () => import('./persona'),
);
