import '../components/actions/button';
import '../components/actions/button-group';
import '../components/actions/icon-button';
import '../components/actions/toggle';
import '../components/content/badge';
import '../components/content/chip';
import '../components/content/kbd';
import '../components/content/link';
import '../components/content/text';
import '../components/data/data-grid';
import '../components/data/list';
import '../components/desktop/file-tree';
import '../components/desktop/shell';
import '../components/desktop/status-bar';
import '../components/desktop/window';
import '../components/feedback/alert';
import '../components/feedback/empty';
import '../components/feedback/toast';
import '../components/feedback/tooltip';
import '../components/forms/checkbox';
import '../components/forms/field';
import '../components/forms/input';
import '../components/forms/radio';
import '../components/forms/select';
import '../components/forms/slider';
import '../components/forms/switch';
import '../components/forms/textarea';
import '../components/layout/scroll-area';
import '../components/layout/split-panel';
import '../components/layout/stack';
import '../components/navigation/breadcrumbs';
import '../components/navigation/nav';
import '../components/navigation/pagination';
import '../components/navigation/stepper';
import '../components/navigation/tabs';
import '../components/navigation/toolbar';
import '../components/overlay/dialog';
import '../components/overlay/drawer';
import '../components/overlay/menu';
import '../components/overlay/popover';
import type { VDataGrid } from '../components/data/data-grid';
import type { VDialog } from '../components/overlay/dialog';
import { componentStyleText } from '../contract/compliance';
import { clearOverlays } from '../core/overlay';
import '../families/catalog';
import { familyMembers } from '../families/registry';
import type { FamilyName } from '../families/types';
import { containerBand } from '../foundation/responsive';
import '../interaction/profiles';
import { getDensity, getTheme, setDensity, setTheme } from '../theme/index';
import { checkComposition, checkFamilyMember } from './check';
import './catalog';
import { compositionForHost, listCompositions } from './registry';

function settle(): Promise<void> {
  return new Promise((resolve) => {
    queueMicrotask(() => resolve());
  });
}

/** Field parts: label, control, description, and invalid. Theme and density do not change the container band. */
export async function checkFormScenario(): Promise<string[]> {
  const failures: string[] = [];
  const themeAttr = document.documentElement.getAttribute('data-vui-theme');
  const densityAttr = document.documentElement.getAttribute('data-vui-density');
  const theme = getTheme();
  const density = getDensity();
  const wide = containerBand(900);
  const narrow = containerBand(200);
  const field = document.createElement('vui-input');
  field.setAttribute('label', 'Email');
  field.setAttribute('hint', 'Work address');
  field.setAttribute('required', '');
  field.setAttribute('invalid', '');
  field.setAttribute('value', 'bad@');
  const agree = document.createElement('vui-checkbox');
  agree.textContent = 'Agree';
  const host = document.createElement('div');
  host.append(field, agree);
  document.body.append(host);

  try {
    const input = field.shadowRoot?.querySelector('input');
    const label = field.shadowRoot?.querySelector('label');
    if (label?.textContent !== 'Email') failures.push('field label is missing');
    if (!input?.hasAttribute('aria-describedby')) failures.push('field description is not linked');
    if (input?.getAttribute('aria-invalid') !== 'true') failures.push('field error does not set aria-invalid');
    if (!input?.required) failures.push('field required does not reach the control');
    input?.focus();
    const focused = document.activeElement === field || field.shadowRoot?.activeElement === input;
    if (!focused) failures.push('field does not take focus');
    field.setAttribute('disabled', '');
    if (!input?.disabled) failures.push('field disabled does not reach the control');
    const css = componentStyleText(field);
    if (!css.includes('var(--vui-color-danger)')) failures.push('field error color is not a theme token');
    if (!css.includes('--vui-font-size')) failures.push('field does not use density type');
    if (!/min-width:\s*0|max-width:\s*100%/.test(css) || !css.includes('36rem')) {
      failures.push('field does not adapt to its container');
    }
    agree.setAttribute('disabled', '');
    if (!agree.shadowRoot?.querySelector('input')?.disabled) failures.push('sibling checkbox does not disable on its own');
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setDensity(density === 'dense' ? 'comfortable' : 'dense');
    if (containerBand(900) !== wide || containerBand(200) !== narrow) {
      failures.push('composition band changes with theme or density');
    }
    failures.push(...checkFamilyMember(field));
  } finally {
    if (themeAttr === null) document.documentElement.removeAttribute('data-vui-theme');
    else setTheme(theme);
    if (densityAttr === null) document.documentElement.removeAttribute('data-vui-density');
    else setDensity(density);
    host.remove();
  }
  return failures;
}

/** Tabs: roving selection, disabled skip, and panel link through attributes. */
export async function checkNavigationScenario(): Promise<string[]> {
  const failures: string[] = [];
  const tabs = document.createElement('vui-tabs');
  tabs.setAttribute('label', 'Sections');
  tabs.innerHTML = `
    <vui-tab panel="one" selected>One</vui-tab>
    <vui-tab panel="two">Two</vui-tab>
    <vui-tab panel="three" disabled>Three</vui-tab>
    <vui-tab-panel name="one">First</vui-tab-panel>
    <vui-tab-panel name="two">Second</vui-tab-panel>
    <vui-tab-panel name="three">Third</vui-tab-panel>
  `;
  document.body.append(tabs);
  await settle();
  const tabButtons = [...tabs.querySelectorAll('vui-tab')];
  const panels = [...tabs.querySelectorAll('vui-tab-panel')];
  const press = (tab: Element | undefined, key: string): void => {
    tab?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
  };
  if (tabButtons[0]?.getAttribute('aria-selected') !== 'true') failures.push('first tab is not selected');
  if (tabButtons[0]?.getAttribute('aria-controls') !== panels[0]?.id) failures.push('tab is not linked to its panel');
  if (panels[1]?.hasAttribute('hidden') !== true) failures.push('unselected panel stays visible');
  press(tabButtons[0], 'ArrowRight');
  if (tabButtons[1]?.hasAttribute('selected') !== true) failures.push('arrow does not move selection');
  if (panels[1]?.hasAttribute('hidden')) failures.push('selected panel stays hidden');
  press(tabButtons[1], 'ArrowRight');
  if (tabButtons[0]?.hasAttribute('selected') !== true) failures.push('disabled tab is not skipped');
  if (tabButtons[2]?.getAttribute('aria-disabled') !== 'true') failures.push('disabled tab is not exposed');
  press(tabButtons[0], 'End');
  if (tabButtons[1]?.hasAttribute('selected') !== true) failures.push('end does not stop on the last enabled tab');
  tabButtons[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
  press(tabButtons[2], 'ArrowLeft');
  if (tabButtons[1]?.hasAttribute('selected') !== true && tabButtons[0]?.hasAttribute('selected') !== true) {
    failures.push('click and keyboard do not share selection');
  }
  failures.push(...checkComposition(tabs));
  tabs.remove();
  return failures;
}

/** Grid keyboard, single selection, hidden secondary column, and horizontal overflow. */
export async function checkDataScenario(): Promise<string[]> {
  const failures: string[] = [];
  const grid = document.createElement('vui-data-grid') as VDataGrid;
  grid.setAttribute('label', 'Rows');
  grid.setAttribute('data-compact', '');
  document.body.append(grid);
  grid.columns = [
    { key: 'name', title: 'Name' },
    { key: 'note', title: 'Note', priority: 'secondary' },
  ];
  grid.rows = [
    { id: 'a', name: 'Alpha', note: 'one' },
    { id: 'b', name: 'Beta', note: 'two' },
  ];
  const hidden = grid.shadowRoot?.querySelector('td[hidden]');
  if (!hidden) failures.push('secondary column stays visible in a compact container');
  const css = componentStyleText(grid);
  if (!css.includes('overflow: auto')) failures.push('grid does not scroll overflow');
  if (!css.includes('--vui-row-height')) failures.push('grid row height does not follow density');
  grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  if (grid.selectedId !== 'b') failures.push('arrow does not select the next row');
  grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
  if (grid.selectedId !== 'a') failures.push('arrow does not select the previous row');
  failures.push(...checkComposition(grid));
  grid.remove();
  return failures;
}

/** Dialog slots, focus restoration, Escape, and a nested select that closes first. */
export async function checkOverlayScenario(): Promise<string[]> {
  const failures: string[] = [];
  clearOverlays();
  const opener = document.createElement('button');
  opener.textContent = 'Open';
  const dialog = document.createElement('vui-dialog') as VDialog;
  dialog.setAttribute('label', 'Edit');
  const field = document.createElement('vui-input');
  field.setAttribute('label', 'Name');
  field.setAttribute('value', 'VUI');
  const select = document.createElement('vui-select');
  select.setAttribute('label', 'Status');
  select.innerHTML = '<vui-option value="ready">Ready</vui-option><vui-option value="draft">Draft</vui-option>';
  const action = document.createElement('vui-button');
  action.setAttribute('slot', 'footer');
  action.textContent = 'Close';
  dialog.append(field, select, action);
  document.body.append(opener, dialog);
  opener.focus();
  dialog.show();
  const active = dialog.shadowRoot?.activeElement ?? document.activeElement;
  const inside = active === dialog || Boolean(dialog.shadowRoot?.contains(active ?? null)) || dialog.contains(active ?? null);
  if (!dialog.open || !inside) failures.push('dialog does not move focus inside');
  const footer = dialog.shadowRoot?.querySelector('slot[name="footer"]');
  const assigned = footer instanceof HTMLSlotElement ? footer.assignedElements() : [];
  if (!assigned.includes(action)) failures.push('dialog action is not in the footer slot');
  let clicks = 0;
  action.addEventListener('click', () => {
    clicks += 1;
  });
  action.shadowRoot?.querySelector('button')?.click();
  if (clicks !== 1 || !dialog.open) failures.push('dialog action is not an independent button');
  const trigger = select.shadowRoot?.querySelector('button');
  trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  if (trigger?.getAttribute('aria-expanded') !== 'true') failures.push('nested select does not open');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  if (trigger?.getAttribute('aria-expanded') !== 'false' || !dialog.open) {
    failures.push('escape does not close the nested select before the dialog');
  }
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  if (dialog.open) failures.push('escape does not close the dialog');
  await settle();
  if (document.activeElement !== opener) failures.push('dialog does not restore focus');
  failures.push(...checkComposition(dialog));
  dialog.remove();
  opener.remove();
  clearOverlays();
  return failures;
}

const hosts = [
  'vui-select',
  'vui-tabs',
  'vui-file-tree',
  'vui-toaster',
  'vui-dialog',
  'vui-data-grid',
  'vui-toolbar',
  'vui-split-panel',
  'vui-menu',
];

/** Every registered host matches its composition contract. */
export function checkCompositionHosts(): string[] {
  const failures: string[] = [];
  const found = listCompositions().map((contract) => contract.host);
  for (const host of hosts) {
    if (!found.includes(host)) failures.push(`${host} has no composition contract`);
  }
  for (const host of found) {
    const element = document.createElement(host);
    document.body.append(element);
    failures.push(...checkComposition(element, compositionForHost(host)!));
    element.remove();
  }
  return failures;
}

const familyHosts: Record<FamilyName, string[]> = {
  action: ['vui-button', 'vui-button-group', 'vui-icon-button', 'vui-toggle', 'vui-link', 'vui-menu-item'],
  field: ['vui-input', 'vui-textarea', 'vui-select', 'vui-checkbox', 'vui-checkbox-group', 'vui-radio', 'vui-radio-group', 'vui-switch', 'vui-slider', 'vui-field'],
  overlay: ['vui-dialog', 'vui-drawer', 'vui-popover', 'vui-tooltip', 'vui-menu', 'vui-toaster'],
  navigation: ['vui-tabs', 'vui-tab', 'vui-tab-panel', 'vui-nav', 'vui-stepper', 'vui-file-tree', 'vui-tree-item', 'vui-menu', 'vui-menu-item', 'vui-breadcrumbs', 'vui-pagination'],
  data: ['vui-data-grid', 'vui-list'],
  feedback: ['vui-alert', 'vui-empty', 'vui-badge'],
  layout: ['vui-stack'],
  content: ['vui-text', 'vui-chip', 'vui-kbd'],
  desktop: ['vui-shell', 'vui-window', 'vui-status-bar'],
};

/** Every family member matches the rules it claims. */
export function checkFamilies(): string[] {
  const failures: string[] = [];
  for (const [family, elements] of Object.entries(familyHosts) as Array<[FamilyName, string[]]>) {
    for (const name of elements) {
      const joined = familyMembers(name).some((member) => member.family === family);
      if (!joined) failures.push(`${name} is missing from ${family}`);
      const element = document.createElement(name);
      document.body.append(element);
      const memberFailures = checkFamilyMember(element).filter((failure) => failure.startsWith(`${family}:`) || failure.includes('not a'));
      failures.push(...memberFailures);
      element.remove();
    }
  }
  return failures;
}
