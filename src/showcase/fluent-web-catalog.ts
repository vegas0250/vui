/**
 * Docs catalog aligned with Fluent UI Web Controls
 * (developer.microsoft.com/fluentui#/controls/web), not Fluent 2.
 * Child parts (MenuItem, NavItem, …) stay as CEs but are not catalog entries.
 */
import type { ComponentContract } from '../contract';
import { componentCatalog } from './component-data';

/** Fluent UI Web Controls category order. */
export const fluentWebGroups = [
  'basic-inputs',
  'galleries-pickers',
  'items-lists',
  'commands-menus-navs',
  'notification-engagement',
  'progress',
  'surfaces',
  'utilities',
  'application',
] as const;

export type FluentWebGroup = (typeof fluentWebGroups)[number];

export const fluentWebGroupLabels: Record<FluentWebGroup, [string, string]> = {
  'basic-inputs': ['Базовые вводы', 'Basic Inputs'],
  'galleries-pickers': ['Галереи и выбор', 'Galleries & Pickers'],
  'items-lists': ['Элементы и списки', 'Items & Lists'],
  'commands-menus-navs': ['Команды, меню и навигация', 'Commands, Menus & Navs'],
  'notification-engagement': ['Уведомления', 'Notification & Engagement'],
  progress: ['Прогресс', 'Progress'],
  surfaces: ['Поверхности', 'Surfaces'],
  utilities: ['Утилиты', 'Utilities'],
  application: ['Приложение', 'Application'],
};

export const fluentWebGroupIcons: Record<FluentWebGroup, string> = {
  'basic-inputs': 'form-input',
  'galleries-pickers': 'palette',
  'items-lists': 'list',
  'commands-menus-navs': 'waypoints',
  'notification-engagement': 'bell',
  progress: 'loader',
  surfaces: 'layers',
  utilities: 'wrench',
  application: 'monitor',
};

/**
 * Top-level Fluent UI Web Controls → VUI host.
 * Omitted Fabric names are covered by an existing host or deferred (see vocabulary).
 */
const fluentPrimary: Array<{ slug: string; group: FluentWebGroup; fluent: string }> = [
  { slug: 'button', group: 'basic-inputs', fluent: 'Button' },
  { slug: 'checkbox', group: 'basic-inputs', fluent: 'Checkbox' },
  { slug: 'radio', group: 'basic-inputs', fluent: 'ChoiceGroup' },
  { slug: 'select', group: 'basic-inputs', fluent: 'ComboBox / Dropdown' },
  { slug: 'link', group: 'basic-inputs', fluent: 'Link' },
  { slug: 'input', group: 'basic-inputs', fluent: 'TextField / SearchBox' },
  { slug: 'slider', group: 'basic-inputs', fluent: 'Slider' },
  { slug: 'rating', group: 'basic-inputs', fluent: 'Rating' },
  { slug: 'spin-button', group: 'basic-inputs', fluent: 'SpinButton' },
  { slug: 'switch', group: 'basic-inputs', fluent: 'Toggle' },
  { slug: 'textarea', group: 'basic-inputs', fluent: 'TextField (multiline)' },
  { slug: 'list', group: 'items-lists', fluent: 'List' },
  { slug: 'data-grid', group: 'items-lists', fluent: 'DetailsList' },
  { slug: 'panel', group: 'items-lists', fluent: 'DocumentCard' },
  { slug: 'avatar-group', group: 'items-lists', fluent: 'Facepile' },
  { slug: 'persona', group: 'items-lists', fluent: 'Persona' },
  { slug: 'avatar', group: 'items-lists', fluent: 'Avatar' },
  { slug: 'breadcrumbs', group: 'commands-menus-navs', fluent: 'Breadcrumb' },
  { slug: 'toolbar', group: 'commands-menus-navs', fluent: 'CommandBar' },
  { slug: 'menu', group: 'commands-menus-navs', fluent: 'ContextualMenu' },
  { slug: 'nav', group: 'commands-menus-navs', fluent: 'Nav' },
  { slug: 'tabs', group: 'commands-menus-navs', fluent: 'Pivot' },
  { slug: 'alert', group: 'notification-engagement', fluent: 'MessageBar' },
  { slug: 'toast', group: 'notification-engagement', fluent: 'MessageBar / Toast' },
  { slug: 'progress', group: 'progress', fluent: 'ProgressIndicator' },
  { slug: 'skeleton', group: 'progress', fluent: 'Shimmer' },
  { slug: 'spinner', group: 'progress', fluent: 'Spinner' },
  { slug: 'popover', group: 'surfaces', fluent: 'Callout / HoverCard' },
  { slug: 'dialog', group: 'surfaces', fluent: 'Dialog / Modal' },
  { slug: 'drawer', group: 'surfaces', fluent: 'Panel' },
  { slug: 'scroll-area', group: 'surfaces', fluent: 'ScrollablePane' },
  { slug: 'tooltip', group: 'surfaces', fluent: 'Tooltip' },
  { slug: 'icon', group: 'utilities', fluent: 'Icon' },
  { slug: 'separator', group: 'utilities', fluent: 'Separator' },
  { slug: 'stack', group: 'utilities', fluent: 'Stack' },
  { slug: 'text', group: 'utilities', fluent: 'Text / Label' },
  { slug: 'field', group: 'utilities', fluent: 'Label + Field' },
];

/** Child / compound parts — not Fluent top-level Controls pages. */
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

/**
 * Present in VUI but not Fluent UI Web Controls top-level.
 * Kept under Application (desktop/shell), not removed from the library.
 */
const applicationExtras = [
  'icon-button',
  'button-group',
  'toggle',
  'badge',
  'chip',
  'kbd',
  'empty',
  'carousel',
  'lightbox',
  'container',
  'grid',
  'hstack',
  'vstack',
  'split-panel',
  'shell',
  'window',
  'titlebar',
  'status-bar',
  'file-tree',
  'properties',
  'pagination',
  'path-bar',
  'stepper',
];

/** Fluent Web Controls still missing as first-class VUI hosts. */
export const fluentWebMissing = [
  'ActivityItem',
  'OverflowSet',
  'Coachmark',
  'TeachingBubble',
  'PeoplePicker',
  'ColorPicker',
  'Calendar',
  'DatePicker',
  'TimePicker',
  'SwatchColorPicker',
  'GroupedList',
  'DocumentCard (dedicated)',
  'HoverCard (dedicated)',
  'Announced',
  'FocusZone / FocusTrapZone',
  'Image',
  'Layer / Overlay / Popup',
  'ResizeGroup',
  'MarqueeSelection',
  'Keytips',
  'Charts',
] as const;

const primaryBySlug = new Map(fluentPrimary.map((entry) => [entry.slug, entry]));

export function fluentWebGroup(tag: string): FluentWebGroup {
  const slug = tag.replace(/^vui-/, '');
  const primary = primaryBySlug.get(slug);
  if (primary) return primary.group;
  if (applicationExtras.includes(slug)) return 'application';
  return 'application';
}

export function fluentAlias(tag: string): string {
  const slug = tag.replace(/^vui-/, '');
  return primaryBySlug.get(slug)?.fluent ?? '';
}

export function isCatalogChild(tag: string): boolean {
  return catalogChildren.has(tag.replace(/^vui-/, ''));
}

/** Public docs catalog: Fluent Web hosts + Application extras; no child parts. */
export function docsComponentCatalog(): ComponentContract[] {
  return componentCatalog().filter((contract) => !isCatalogChild(contract.element));
}
