'use client';

import { createComponent } from '../utils/react';
import type { VTemplateWorkspace } from './workspace';

const aliases = {
  navLabel: 'nav-label',
  asideLabel: 'aside-label',
  skipLabel: 'skip-label',
  resizeLabel: 'resize-label',
  asideExpandLabel: 'aside-expand-label',
  asideCollapseLabel: 'aside-collapse-label',
  asideResizeLabel: 'aside-resize-label',
  asideCollapsed: 'aside-collapsed',
  contentLabel: 'content-label',
};

export const TemplateWorkspace = /* @__PURE__ */ createComponent<VTemplateWorkspace, {
  'label'?: string;
  'nav-label'?: string;
  'aside-label'?: string;
  'skip-label'?: string;
  'resize-label'?: string;
  'aside-expand-label'?: string;
  'aside-collapse-label'?: string;
  'aside-resize-label'?: string;
  'content-label'?: string;
  'collapsed'?: boolean;
  'aside-collapsed'?: boolean;
}>(
  'vui-template-workspace',
  () => import('./workspace'),
  aliases,
);
