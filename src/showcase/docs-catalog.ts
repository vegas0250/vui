/**
 * Public docs catalog grouped by VUI purpose.
 * Child parts stay as custom elements but are not top-level catalog entries.
 */
import type { ComponentContract } from '../contract';
import { componentCatalog } from './component-data';

export const catalogGroups = [
  'actions',
  'forms',
  'navigation',
  'data-content',
  'widgets',
  'feedback',
  'overlay',
  'layout',
  'templates',
] as const;

export type CatalogGroup = (typeof catalogGroups)[number];

export const catalogGroupLabels: Record<CatalogGroup, [string, string]> = {
  actions: ['Действия', 'Actions'],
  forms: ['Формы', 'Forms'],
  navigation: ['Навигация', 'Navigation'],
  'data-content': ['Данные и содержимое', 'Data & Content'],
  widgets: ['Виджеты', 'Widgets'],
  feedback: ['Обратная связь', 'Feedback'],
  overlay: ['Всплывающие элементы', 'Overlays'],
  layout: ['Раскладка', 'Layout'],
  templates: ['Шаблоны', 'Templates'],
};

export const catalogGroupIcons: Record<CatalogGroup, string> = {
  actions: 'play',
  forms: 'form-input',
  navigation: 'waypoints',
  'data-content': 'table',
  widgets: 'images',
  feedback: 'bell',
  overlay: 'layers',
  layout: 'layout-template',
  templates: 'monitor',
};

/** Explicit host → group. Unknown non-child hosts are omitted from the catalog. */
const hostGroups: Record<string, CatalogGroup> = {
  button: 'actions',
  'icon-button': 'actions',
  'button-group': 'actions',
  toggle: 'actions',
  input: 'forms',
  textarea: 'forms',
  checkbox: 'forms',
  radio: 'forms',
  switch: 'forms',
  select: 'forms',
  slider: 'forms',
  rating: 'forms',
  'spin-button': 'forms',
  field: 'forms',
  breadcrumbs: 'navigation',
  toolbar: 'navigation',
  nav: 'navigation',
  tabs: 'navigation',
  pagination: 'navigation',
  'path-bar': 'navigation',
  stepper: 'navigation',
  list: 'data-content',
  'data-grid': 'data-content',
  'file-tree': 'data-content',
  properties: 'data-content',
  avatar: 'data-content',
  'avatar-group': 'data-content',
  persona: 'data-content',
  badge: 'data-content',
  chip: 'data-content',
  kbd: 'data-content',
  text: 'data-content',
  link: 'data-content',
  separator: 'data-content',
  icon: 'data-content',
  carousel: 'widgets',
  gallery: 'widgets',
  alert: 'feedback',
  toast: 'feedback',
  progress: 'feedback',
  spinner: 'feedback',
  skeleton: 'feedback',
  empty: 'feedback',
  tooltip: 'feedback',
  dialog: 'overlay',
  drawer: 'overlay',
  popover: 'overlay',
  menu: 'overlay',
  container: 'layout',
  'scroll-area': 'layout',
  stack: 'layout',
  hstack: 'layout',
  vstack: 'layout',
  grid: 'layout',
  'split-panel': 'layout',
  panel: 'layout',
  shell: 'layout',
  window: 'layout',
  titlebar: 'layout',
  'status-bar': 'layout',
  'template-dashboard': 'templates',
  'template-settings': 'templates',
  'template-workspace': 'templates',
};

/** Child / compound parts — not top-level catalog pages. */
export const catalogChildren = new Set([
  'option',
  'menu-item',
  'nav-item',
  'tab',
  'tab-panel',
  'step',
  'tree-item',
  'list-item',
  'property',
  'toaster',
  'radio-group',
  'checkbox-group',
  'field-group',
  'toggle-group',
]);

export function catalogGroup(tag: string): CatalogGroup | undefined {
  const slug = tag.replace(/^vui-/, '');
  return hostGroups[slug];
}

export function isCatalogChild(tag: string): boolean {
  return catalogChildren.has(tag.replace(/^vui-/, ''));
}

/** Public docs catalog: explicitly grouped hosts; no child parts; no unknown dump bucket. */
export function docsComponentCatalog(): ComponentContract[] {
  return componentCatalog().filter((contract) => {
    if (isCatalogChild(contract.element)) return false;
    return catalogGroup(contract.element) !== undefined;
  });
}

/** Hosts that have a contract but no catalog group (should stay empty). */
export function ungroupedCatalogHosts(): string[] {
  return componentCatalog()
    .filter((contract) => !isCatalogChild(contract.element) && catalogGroup(contract.element) === undefined)
    .map((contract) => contract.element);
}
