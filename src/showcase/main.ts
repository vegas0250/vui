import {
  CommandRegistry,
  ShortcutRegistry,
  draggable,
  dropTarget,
  getDensity,
  getTheme,
  familyMembers,
  iconNames,
  listCompositions,
  listContracts,
  setDensity,
  setTheme,
  toast,
  type VuiDensity,
  type VuiTheme,
} from '../index';
import { containerBand, prefersForcedColors, prefersReducedMotion, readFoundation } from '../foundation/index';
import './showcase.css';
import type { VDataGrid } from '../components/data/data-grid';
import type { VFileTree } from '../components/desktop/file-tree';
import type { VDialog } from '../components/overlay/dialog';
import type { VMenu } from '../components/overlay/menu';
import { showcaseMarkup } from './markup';
import { studioMarkup } from './studio';

const app = document.querySelector('#app');
if (!app) throw new Error('Showcase root is missing');
app.innerHTML = showcaseMarkup.replace('</main>', `${studioMarkup}</main>`);

const themes = new Set<VuiTheme>(['light', 'dark', 'high-contrast', 'system']);
const densities = new Set<VuiDensity>(['comfortable', 'compact', 'dense']);

const themeSelect = document.querySelector('#theme-select');
const densitySelect = document.querySelector('#density-select');

const themeLabels: Record<VuiTheme, string> = {
  light: 'Light',
  dark: 'Dark',
  'high-contrast': 'High Contrast',
  system: 'System',
};
const densityLabels: Record<VuiDensity, string> = {
  comfortable: 'Comfortable',
  compact: 'Compact',
  dense: 'Dense',
};

const updateResponsiveReadout = (): void => {
  const readout = document.querySelector('#responsive-readout');
  const stage = document.querySelector('#resize-stage');
  if (!readout || !(stage instanceof HTMLElement)) return;
  const width = Math.round(stage.getBoundingClientRect().width);
  readout.textContent = `${themeLabels[getTheme()]} + ${densityLabels[getDensity()]} + ${width}px`;
  paintFoundation(width);
};

const paintFoundation = (stageWidth = 0): void => {
  const list = document.querySelector('#foundation-snapshot');
  if (!(list instanceof HTMLDListElement)) return;
  const snapshot = readFoundation();
  const band = containerBand(stageWidth);
  const rows: Array<[string, string]> = [
    ['theme', snapshot.theme],
    ['density', snapshot.density],
    ['band', stageWidth > 0 ? band : '—'],
    ['background', snapshot.tokens['--vui-color-background'] || '—'],
    ['control', snapshot.tokens['--vui-size-control'] || '—'],
    ['space-md', snapshot.tokens['--vui-space-md'] || '—'],
    ['duration', snapshot.motion.duration || '—'],
    ['dialog z', snapshot.layers.dialog || '—'],
    ['narrow', `${Math.round(snapshot.thresholds.narrow)}px`],
    ['medium', `${Math.round(snapshot.thresholds.medium)}px`],
  ];
  list.replaceChildren();
  for (const [name, value] of rows) {
    const term = document.createElement('dt');
    term.textContent = name;
    const detail = document.createElement('dd');
    detail.textContent = value;
    list.append(term, detail);
  }
  const bandNode = document.querySelector('#foundation-band');
  if (bandNode) {
    bandNode.textContent =
      stageWidth > 0
        ? `Стенд responsive: ${band}, ${Math.round(stageWidth)}px.`
        : 'Полоса появится после измерения стенда.';
  }
  const motion = document.querySelector('#a11y-readout');
  if (motion) {
    motion.textContent = `prefers-reduced-motion: ${prefersReducedMotion() ? 'reduce' : 'no-preference'}. forced-colors: ${prefersForcedColors() ? 'active' : 'none'}.`;
  }
};

if (themeSelect instanceof HTMLElement) {
  themeSelect.addEventListener('change', () => {
    const value = themeSelect.getAttribute('value') ?? '';
    if (themes.has(value as VuiTheme)) setTheme(value as VuiTheme);
    updateResponsiveReadout();
  });
}

if (densitySelect instanceof HTMLElement) {
  densitySelect.addEventListener('change', () => {
    const value = densitySelect.getAttribute('value') ?? '';
    if (densities.has(value as VuiDensity)) setDensity(value as VuiDensity);
    updateResponsiveReadout();
  });
}

const dirSelect = document.querySelector('#dir-select');
if (dirSelect instanceof HTMLElement) {
  dirSelect.addEventListener('change', () => {
    document.documentElement.setAttribute('dir', dirSelect.getAttribute('value') === 'rtl' ? 'rtl' : 'ltr');
  });
}

const icons = document.querySelector('#icon-gallery');
if (icons) {
  for (const name of iconNames) {
    const cell = document.createElement('div');
    cell.className = 'icon-cell';
    const icon = document.createElement('vui-icon');
    icon.setAttribute('name', name);
    icon.setAttribute('label', name);
    const caption = document.createElement('span');
    caption.textContent = name;
    cell.append(icon, caption);
    icons.append(cell);
  }
}

document.querySelector('#save-button')?.addEventListener('click', () => {
  const result = document.querySelector('#save-result');
  if (result) result.textContent = 'Событие click получено от vui-button.';
});

const formResult = document.querySelector('#form-result');
const reportForm = (): void => {
  if (!formResult) return;
  const name = document.querySelector('#name-input');
  const agree = document.querySelector('#agree');
  const notify = document.querySelector('#notify');
  const lang = document.querySelector('#lang-select');
  const nameValue = name?.getAttribute('value') ?? '';
  const langValue = lang?.getAttribute('value') ?? '';
  const agreed = agree?.hasAttribute('checked') ? 'да' : 'нет';
  const notifications = notify?.hasAttribute('checked') ? 'вкл' : 'выкл';
  formResult.textContent = `Имя: ${nameValue || '—'}, согласие: ${agreed}, уведомления: ${notifications}, язык: ${langValue}.`;
};

for (const id of ['name-input', 'agree', 'notify', 'lang-select']) {
  document.querySelector(`#${id}`)?.addEventListener('change', reportForm);
  document.querySelector(`#${id}`)?.addEventListener('input', reportForm);
}

document.querySelector('#toast-button')?.addEventListener('click', () => {
  toast({
    title: 'Сборка завершена',
    message: 'Showcase обновлён без перезагрузки страницы.',
    variant: 'info',
  });
});

const dialog = document.querySelector('#demo-dialog');
document.querySelector('#open-dialog')?.addEventListener('click', () => {
  if (dialog instanceof HTMLElement && 'show' in dialog) {
    (dialog as VDialog).show();
  }
});
document.querySelector('#dialog-cancel')?.addEventListener('click', () => {
  if (dialog instanceof HTMLElement && 'close' in dialog) (dialog as VDialog).close();
});
document.querySelector('#dialog-save')?.addEventListener('click', () => {
  if (dialog instanceof HTMLElement && 'close' in dialog) (dialog as VDialog).close();
  toast({ title: 'Сохранено', message: 'Диалог подтвердил действие.', variant: 'success' });
});

const drawer = document.querySelector('#demo-drawer');
document.querySelector('#open-drawer')?.addEventListener('click', () => {
  if (drawer instanceof HTMLElement && 'show' in drawer) (drawer as VDialog).show();
});
document.querySelector('#drawer-close')?.addEventListener('click', () => {
  if (drawer instanceof HTMLElement && 'close' in drawer) (drawer as VDialog).close();
});

const grid = document.querySelector('#demo-grid');
if (grid && 'columns' in grid && 'rows' in grid) {
  const dataGrid = grid as VDataGrid;
  dataGrid.columns = [
    { key: 'name', title: 'Компонент', width: '40%' },
    { key: 'category', title: 'Категория' },
    { key: 'status', title: 'Статус', align: 'end' },
  ];
  dataGrid.rows = [
    { id: 'button', name: 'Button', category: 'Actions', status: 'Готов' },
    { id: 'input', name: 'Input', category: 'Forms', status: 'Готов' },
    { id: 'dialog', name: 'Dialog', category: 'Overlay', status: 'Готов' },
    { id: 'tabs', name: 'Tabs', category: 'Navigation', status: 'Готов' },
    { id: 'grid', name: 'Data Grid', category: 'Data', status: 'Готов' },
    { id: 'tree', name: 'File Tree', category: 'Desktop', status: 'Готов' },
  ];
  dataGrid.addEventListener('change', () => {
    const result = document.querySelector('#grid-result');
    if (result) result.textContent = `Выбрана строка: ${dataGrid.selectedId || '—'}.`;
  });
}

const responsiveGrid = document.querySelector('#responsive-grid');
if (responsiveGrid && 'columns' in responsiveGrid && 'rows' in responsiveGrid) {
  const grid = responsiveGrid as VDataGrid;
  grid.columns = [
    { key: 'name', title: 'Компонент', width: '12rem' },
    { key: 'category', title: 'Категория', width: '10rem' },
    { key: 'status', title: 'Статус', width: '8rem', priority: 'secondary' },
    { key: 'note', title: 'Примечание', width: '14rem', priority: 'secondary' },
  ];
  grid.rows = [
    { id: 'button', name: 'Button', category: 'Actions', status: 'Готов', note: 'Всегда виден' },
    { id: 'toolbar', name: 'Toolbar', category: 'Navigation', status: 'Готов', note: 'Сжимается по контейнеру' },
    { id: 'grid', name: 'Data Grid', category: 'Data', status: 'Готов', note: 'Лишние колонки скрываются' },
  ];
}

const stage = document.querySelector('#resize-stage');
const handle = document.querySelector('#resize-handle');
const widths: Record<string, string> = {
  'size-wide': 'calc(100% - 0.75rem)',
  'size-medium': '40rem',
  'size-narrow': '18rem',
};

if (stage instanceof HTMLElement) {
  for (const [id, width] of Object.entries(widths)) {
    document.querySelector(`#${id}`)?.addEventListener('click', () => {
      stage.style.width = width;
      updateResponsiveReadout();
    });
  }
}

if (stage instanceof HTMLElement && handle instanceof HTMLElement) {
  let dragging = false;
  const resizeTo = (clientX: number): void => {
    const parent = stage.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const next = Math.min(rect.width - 12, Math.max(160, clientX - rect.left));
    stage.style.width = `${Math.round(next)}px`;
    updateResponsiveReadout();
  };
  handle.addEventListener('pointerdown', (event) => {
    dragging = true;
    handle.setPointerCapture(event.pointerId);
    resizeTo(event.clientX);
  });
  handle.addEventListener('pointermove', (event) => {
    if (dragging) resizeTo(event.clientX);
  });
  handle.addEventListener('pointerup', () => {
    dragging = false;
  });
  handle.addEventListener('pointercancel', () => {
    dragging = false;
  });
  handle.addEventListener('keydown', (event) => {
    const current = stage.getBoundingClientRect().width;
    const parent = stage.parentElement?.clientWidth ?? current;
    const step = event.shiftKey ? 80 : 24;
    if (event.key === 'ArrowLeft') stage.style.width = `${Math.max(160, Math.round(current - step))}px`;
    else if (event.key === 'ArrowRight') stage.style.width = `${Math.min(parent - 12, Math.round(current + step))}px`;
    else return;
    event.preventDefault();
    updateResponsiveReadout();
  });
}

updateResponsiveReadout();
window.addEventListener('resize', updateResponsiveReadout);

const lifecycleHost = document.querySelector('#lifecycle-host');
const lifecycleSample = document.createElement('vui-button');
lifecycleSample.textContent = 'Образец';
let lifecycleShadow: ShadowRoot | null = null;
const paintLifecycle = (): void => {
  const readout = document.querySelector('#lifecycle-readout');
  if (!readout) return;
  const count =
    'connectionCount' in lifecycleSample && typeof lifecycleSample.connectionCount === 'number'
      ? lifecycleSample.connectionCount
      : 0;
  const same = lifecycleSample.shadowRoot === lifecycleShadow;
  readout.textContent = `Подключений: ${count}. Shadow ${same ? 'сохранён' : 'пересоздан'}.`;
};
if (lifecycleHost) {
  lifecycleHost.append(lifecycleSample);
  lifecycleShadow = lifecycleSample.shadowRoot;
  paintLifecycle();
}
document.querySelector('#lifecycle-cycle')?.addEventListener('click', () => {
  if (!lifecycleHost) return;
  lifecycleSample.remove();
  lifecycleHost.append(lifecycleSample);
  paintLifecycle();
});

const compositionGrid = document.querySelector('#composition-grid');
if (compositionGrid && 'columns' in compositionGrid && 'rows' in compositionGrid) {
  const dataGrid = compositionGrid as VDataGrid;
  dataGrid.columns = [
    { key: 'name', title: 'Часть', width: '40%' },
    { key: 'role', title: 'Роль' },
    { key: 'note', title: 'Примечание', priority: 'secondary' },
  ];
  dataGrid.rows = [
    { id: 'field', name: 'Field', role: 'Form', note: 'Label и hint внутри поля' },
    { id: 'tabs', name: 'Tabs', role: 'Navigation', note: 'Панель связана атрибутом' },
    { id: 'dialog', name: 'Dialog', role: 'Overlay', note: 'Действия в слоте footer' },
  ];
  dataGrid.addEventListener('change', () => {
    const result = document.querySelector('#composition-grid-result');
    if (result) result.textContent = `Выбрана строка: ${dataGrid.selectedId || '—'}.`;
  });
}

const compositionDialog = document.querySelector('#composition-dialog');
document.querySelector('#composition-open')?.addEventListener('click', () => {
  if (compositionDialog instanceof HTMLElement && 'show' in compositionDialog) (compositionDialog as VDialog).show();
});
document.querySelector('#composition-dialog-close')?.addEventListener('click', () => {
  if (compositionDialog instanceof HTMLElement && 'close' in compositionDialog) (compositionDialog as VDialog).close();
});

const familyBody = document.querySelector('#family-table tbody');
if (familyBody) {
  for (const member of familyMembers()) {
    const row = document.createElement('tr');
    for (const value of [member.family, member.element, member.rules.join(', ')]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    familyBody.append(row);
  }
}

const compositionBody = document.querySelector('#composition-table tbody');
if (compositionBody) {
  for (const contract of listCompositions()) {
    const row = document.createElement('tr');
    const channels = contract.links.map((link) => `${link.direction} ${link.channel}`).join(', ');
    for (const value of [contract.id, contract.host, channels]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    compositionBody.append(row);
  }
}

const complianceBody = document.querySelector('#compliance-table tbody');
if (complianceBody) {
  for (const contract of listContracts()) {
    const row = document.createElement('tr');
    for (const value of [
      contract.element,
      contract.className,
      contract.states.length ? contract.states.join(', ') : '—',
      contract.responsive,
      contract.events.join(', '),
    ]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    complianceBody.append(row);
  }
}

const commands = new CommandRegistry();
const note = (id: string, text: string): void => {
  const node = document.querySelector(id);
  if (node) node.textContent = text;
};
commands.register({
  id: 'file.save',
  label: 'Сохранить',
  shortcut: 'Ctrl+S',
  execute: () => note('#menu-result', 'Команда file.save выполнена.'),
});
commands.register({
  id: 'file.delete',
  label: 'Удалить',
  enabled: false,
  execute: () => note('#menu-result', 'Удаление не должно выполняться.'),
});
commands.register({
  id: 'file.copyLink',
  label: 'Копировать ссылку',
  execute: () => note('#menu-result', 'Команда file.copyLink выполнена.'),
});
const demoMenu = document.querySelector('#demo-menu');
if (demoMenu instanceof HTMLElement && 'showAt' in demoMenu && 'bindTo' in demoMenu) {
  const menu = demoMenu as VMenu;
  menu.commands = commands;
  const target = document.querySelector('#menu-target');
  if (target instanceof HTMLElement) menu.bindTo(target);
  document.querySelector('#open-menu')?.addEventListener('click', () => {
    const anchor = document.querySelector('#open-menu');
    if (!(anchor instanceof HTMLElement)) return;
    const rect = anchor.getBoundingClientRect();
    menu.showAt(rect.left, rect.bottom);
  });
}
const shortcuts = new ShortcutRegistry(commands);
shortcuts.attach(document);
shortcuts.register({ keys: 'Ctrl+S', command: 'file.save', context: 'showcase' });
shortcuts.pushContext('showcase');

const dragSource = document.querySelector('#drag-source');
const dropZone = document.querySelector('#drop-target');
if (dragSource instanceof HTMLElement) {
  draggable(dragSource, () => ({ type: 'chip', data: 'sample' }));
}
if (dropZone instanceof HTMLElement) {
  dropTarget(dropZone, {
    accept: (payload) => payload.type === 'chip',
    onDrop: () => note('#drop-result', 'Элемент отпущен. Смысл переноса задаёт приложение.'),
  });
}

const shellDemo = document.querySelector('#shell-collapse')?.closest('vui-shell');
document.querySelector('#shell-collapse')?.addEventListener('click', () => {
  shellDemo?.toggleAttribute('collapsed');
});

document.querySelector('#pattern-command')?.addEventListener('click', () => {
  const palette = document.querySelector('#pattern-palette');
  if (palette instanceof HTMLElement && 'show' in palette) (palette as VDialog).show();
});

const platformRows = [
  { id: 'button', name: 'Button', area: 'Actions' },
  { id: 'input', name: 'Input', area: 'Forms' },
  { id: 'shell', name: 'Shell', area: 'Desktop' },
  { id: 'grid', name: 'Data grid', area: 'Data' },
];

const platformGrid = document.querySelector('#platform-grid');
const paintPlatform = (query = '', area = 'all'): void => {
  if (!(platformGrid instanceof HTMLElement) || !('columns' in platformGrid) || !('rows' in platformGrid)) return;
  const grid = platformGrid as VDataGrid;
  const needle = query.trim().toLowerCase();
  grid.columns = [
    { key: 'name', title: 'Name', width: '40%' },
    { key: 'area', title: 'Area' },
  ];
  grid.rows = platformRows.filter((row) => {
    const matchesText = row.name.toLowerCase().includes(needle) || row.area.toLowerCase().includes(needle);
    const matchesArea = area === 'all' || row.area === area;
    return matchesText && matchesArea;
  });
  const empty = document.querySelector('#platform-empty');
  if (empty instanceof HTMLElement) empty.hidden = grid.rows.length > 0;
  const list = document.querySelector('#platform-list');
  if (list) {
    list.replaceChildren();
    for (const row of grid.rows) {
      const item = document.createElement('vui-list-item');
      item.setAttribute('value', String(row.id));
      item.textContent = String(row.name);
      list.append(item);
    }
  }
};

if (platformGrid instanceof HTMLElement && 'columns' in platformGrid) {
  paintPlatform();
  const grid = platformGrid as VDataGrid;
  grid.addEventListener('change', () => {
    const row = platformRows.find((item) => item.id === grid.selectedId);
    const name = document.querySelector('#platform-prop-name');
    const area = document.querySelector('#platform-prop-area');
    const status = document.querySelector('#platform-status');
    const nameText = row?.name ?? 'Select a row.';
    const areaText = row?.area ?? '—';
    if (name) name.textContent = nameText;
    if (area) area.textContent = areaText;
    if (status) status.textContent = row ? `${row.name} · ${row.area}` : 'No selection';
  });
}

const platformSearch = document.querySelector('#platform-search');
const platformFilter = document.querySelector('#platform-filter');
const readPlatform = (): void => {
  const query = platformSearch?.getAttribute('value') ?? '';
  const area = platformFilter?.getAttribute('value') || 'all';
  paintPlatform(query, area);
};
if (platformSearch) {
  platformSearch.addEventListener('input', readPlatform);
  new MutationObserver(readPlatform).observe(platformSearch, { attributes: true, attributeFilter: ['value'] });
}
if (platformFilter) {
  platformFilter.addEventListener('change', readPlatform);
  new MutationObserver(readPlatform).observe(platformFilter, { attributes: true, attributeFilter: ['value'] });
}

const platformShell = document.querySelector('#platform-shell');
const togglePlatformNav = (): void => {
  platformShell?.toggleAttribute('collapsed');
};
document.querySelector('#platform-collapse')?.addEventListener('click', togglePlatformNav);
document.querySelector('#platform-palette-sidebar')?.addEventListener('click', togglePlatformNav);

const platformDialog = document.querySelector('#platform-dialog');
const platformPalette = document.querySelector('#platform-palette');
document.querySelector('#platform-open')?.addEventListener('click', () => {
  if (platformDialog instanceof HTMLElement && 'show' in platformDialog) (platformDialog as VDialog).show();
});
document.querySelector('#platform-close')?.addEventListener('click', () => {
  if (platformDialog instanceof HTMLElement && 'close' in platformDialog) (platformDialog as VDialog).close();
  toast({ title: 'Closed', message: 'The page owns this toast.', variant: 'info' });
});
document.querySelector('#platform-command')?.addEventListener('click', () => {
  if (platformPalette instanceof HTMLElement && 'show' in platformPalette) (platformPalette as VDialog).show();
});

const platformDrawer = document.querySelector('#platform-drawer');
document.querySelector('#platform-drawer-open')?.addEventListener('click', () => {
  if (platformDrawer instanceof HTMLElement && 'show' in platformDrawer) (platformDrawer as VDialog).show();
});
document.querySelector('#platform-drawer-close')?.addEventListener('click', () => {
  if (platformDrawer instanceof HTMLElement && 'close' in platformDrawer) (platformDrawer as VDialog).close();
});

const platformMenu = document.querySelector('#platform-menu');
if (platformMenu instanceof HTMLElement && 'bindTo' in platformMenu && platformGrid instanceof HTMLElement) {
  (platformMenu as VMenu).bindTo(platformGrid);
}

const tree = document.querySelector('#demo-tree');
tree?.addEventListener('change', () => {
  const status = document.querySelector('#status-selection');
  if (!status || !(tree instanceof HTMLElement) || !('selectedItem' in tree)) return;
  const item = (tree as VFileTree).selectedItem;
  status.textContent = item?.getAttribute('label') ?? 'Файл не выбран';
});
