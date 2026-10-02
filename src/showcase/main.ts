import {
  iconNames,
  setDensity,
  setTheme,
  toast,
  type VuiDensity,
  type VuiTheme,
} from '../index';
import './showcase.css';
import type { VuiDataGrid } from '../components/data/data-grid';
import type { VuiFileTree } from '../components/desktop/file-tree';
import type { VuiDialog } from '../components/overlay/dialog';
import { showcaseMarkup } from './markup';

const app = document.querySelector('#app');
if (!app) throw new Error('Showcase root is missing');
app.innerHTML = showcaseMarkup;

const themes = new Set<VuiTheme>(['light', 'dark', 'high-contrast', 'system']);
const densities = new Set<VuiDensity>(['comfortable', 'compact', 'dense']);

const themeSelect = document.querySelector('#theme-select');
const densitySelect = document.querySelector('#density-select');

if (themeSelect instanceof HTMLElement) {
  themeSelect.addEventListener('change', () => {
    const value = themeSelect.getAttribute('value') ?? '';
    if (themes.has(value as VuiTheme)) setTheme(value as VuiTheme);
  });
}

if (densitySelect instanceof HTMLElement) {
  densitySelect.addEventListener('change', () => {
    const value = densitySelect.getAttribute('value') ?? '';
    if (densities.has(value as VuiDensity)) setDensity(value as VuiDensity);
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
    (dialog as VuiDialog).show();
  }
});
document.querySelector('#dialog-cancel')?.addEventListener('click', () => {
  if (dialog instanceof HTMLElement && 'close' in dialog) (dialog as VuiDialog).close();
});
document.querySelector('#dialog-save')?.addEventListener('click', () => {
  if (dialog instanceof HTMLElement && 'close' in dialog) (dialog as VuiDialog).close();
  toast({ title: 'Сохранено', message: 'Диалог подтвердил действие.', variant: 'success' });
});

const grid = document.querySelector('#demo-grid');
if (grid && 'columns' in grid && 'rows' in grid) {
  const dataGrid = grid as VuiDataGrid;
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

const tree = document.querySelector('#demo-tree');
tree?.addEventListener('change', () => {
  const status = document.querySelector('#status-selection');
  if (!status || !(tree instanceof HTMLElement) || !('selectedItem' in tree)) return;
  const item = (tree as VuiFileTree).selectedItem;
  status.textContent = item?.getAttribute('label') ?? 'Файл не выбран';
});
