import {
  CommandRegistry,
  ShortcutRegistry,
  draggable,
  dropTarget,
  getDensity,
  getTheme,
  iconNames,
  setDensity,
  setTheme,
  toast,
  type VuiDensity,
  type VuiTheme,
} from '../index';
import './showcase.css';
import type { VDataGrid } from '../components/data/data-grid';
import type { VFileTree } from '../components/desktop/file-tree';
import type { VDialog } from '../components/overlay/dialog';
import type { VMenu } from '../components/overlay/menu';
import { showcaseMarkup } from './markup';

const app = document.querySelector('#app');
if (!app) throw new Error('Showcase root is missing');
app.innerHTML = showcaseMarkup;

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

const tree = document.querySelector('#demo-tree');
tree?.addEventListener('change', () => {
  const status = document.querySelector('#status-selection');
  if (!status || !(tree instanceof HTMLElement) || !('selectedItem' in tree)) return;
  const item = (tree as VFileTree).selectedItem;
  status.textContent = item?.getAttribute('label') ?? 'Файл не выбран';
});
