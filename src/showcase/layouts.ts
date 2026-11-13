import '../templates';
import { docsLocale } from './theme-i18n';

const text = (ru: string, en: string): string => (docsLocale === 'ru' ? ru : en);

export type LayoutId = 'dashboard' | 'settings' | 'workspace';

type GridHost = HTMLElement & {
  columns: Array<Record<string, string>>;
  rows: Array<Record<string, string>>;
};

const longToken = 'Northwind-International-Account-VeryLongUnbrokenIdentifier-0042';

function editorLines(): string {
  const rows = Array.from({ length: 48 }, (_, index) => {
    const body = index === 3 ? longToken : `const value${index} = ${index};`;
    return `<vui-text variant="code">${body}</vui-text>`;
  });
  return rows.join('');
}

function activityLines(): string {
  return Array.from({ length: 16 }, (_, index) => `<vui-text variant="caption">12:${String(index).padStart(2, '0')}  sync batch ${index} · ${index === 2 ? longToken : 'ok'}</vui-text>`).join('');
}

function frame(id: LayoutId, body: string): string {
  return `<div class="vui-layout" data-layout="${id}">${body}</div>`;
}

function dashboard(): string {
  const stats = [
    [text('Открытые', 'Open'), '12'],
    [text('Просрочены', 'Overdue'), '3'],
    [text('Черновики', 'Drafts'), '4'],
    [text('Готово за неделю', 'Done this week'), '18'],
  ]
    .map(
      ([label, value]) =>
        `<vui-panel heading="${label}"><vui-text variant="heading" level="2">${value}</vui-text></vui-panel>`,
    )
    .join('');
  const main = `<vui-vstack gap="lg" padding="lg"><vui-alert tone="danger" closable>${text('Экспорт счёта не прошёл', 'Invoice export failed')} — ${longToken}</vui-alert><vui-grid columns="4" min="12rem" gap="md">${stats}</vui-grid><vui-panel heading="${text('Заказы', 'Orders')}"><vui-hstack gap="sm" wrap><vui-input data-filter label="${text('Фильтр', 'Filter')}"></vui-input><vui-select data-status label="${text('Статус', 'Status')}" value="all"><vui-option value="all">${text('Все', 'All')}</vui-option><vui-option value="active">${text('Активный', 'Active')}</vui-option><vui-option value="draft">${text('Черновик', 'Draft')}</vui-option></vui-select></vui-hstack><vui-data-grid label="${text('Заказы', 'Orders')}" empty-label="${text('Нет заказов', 'No matching orders')}"></vui-data-grid></vui-panel><vui-panel heading="${text('Журнал', 'Activity')}"><vui-scroll-area data-nested-scroll label="${text('Журнал', 'Activity')}" style="height:12rem;flex:none">${activityLines()}</vui-scroll-area></vui-panel><vui-grid columns="2" min="16rem" gap="md"><vui-panel heading="${text('Входящие', 'Inbox')}"><vui-empty heading="${text('Нет писем', 'No messages')}">${text('Когда клиент напишет, цепочка появится здесь.', 'When a customer writes, the thread shows up here.')}<vui-button slot="action" variant="secondary">${text('Обновить', 'Refresh')}</vui-button></vui-empty></vui-panel><vui-panel heading="${text('Отчёт', 'Report')}"><vui-spinner label="${text('Загрузка отчёта', 'Loading report')}">${text('Считаем метрики', 'Refreshing metrics')}</vui-spinner></vui-panel></vui-grid></vui-vstack>`;
  const nav = `<vui-nav slot="nav" label="${text('Разделы', 'Sections')}"><vui-nav-item selected>${text('Обзор', 'Overview')}</vui-nav-item><vui-nav-item>${text('Заказы', 'Orders')}</vui-nav-item><vui-nav-item>${text('Клиенты', 'Customers')}</vui-nav-item></vui-nav>`;
  const toolbar = `<vui-toolbar slot="toolbar" label="${text('Команды', 'Commands')}"><strong slot="start">Northwind</strong><vui-button slot="start" data-collapse variant="ghost">${text('Навигация', 'Navigation')}</vui-button><vui-button slot="end" variant="primary">${text('Новый', 'New')}</vui-button></vui-toolbar>`;
  const footer = `<vui-status-bar slot="footer" label="${text('Состояние', 'Status')}"><span>${text('12 открытых', '12 open')}</span><span slot="end">${text('Готово', 'Ready')}</span></vui-status-bar>`;
  return frame(
    'dashboard',
    `<vui-template-dashboard label="${text('Приложение', 'Application')}" content-label="${text('Обзор', 'Overview')}">${toolbar}${nav}${main}${footer}</vui-template-dashboard>`,
  );
}

function settings(): string {
  const main = `<vui-vstack gap="lg"><vui-panel heading="${text('Профиль', 'Profile')}"><vui-vstack gap="md"><vui-input label="${text('Имя', 'Name')}" value="Ada" required></vui-input><vui-input label="${text('Почта', 'Email')}" type="email" value="ada@" invalid hint="${text('Введите почту', 'Enter a valid email')}"></vui-input><vui-select label="${text('Язык', 'Language')}" value="en"><vui-option value="en">English</vui-option><vui-option value="ru">Русский</vui-option></vui-select><vui-textarea label="${text('Подпись', 'Signature')}" rows="3" value="Northwind"></vui-textarea></vui-vstack></vui-panel><vui-panel heading="${text('Уведомления', 'Notifications')}"><vui-vstack gap="sm"><vui-switch checked>${text('Почта', 'Email')}</vui-switch><vui-switch>${text('Пуш', 'Push')}</vui-switch></vui-vstack></vui-panel><vui-alert tone="warning">${text('В рабочем пространстве закончились места.', 'This workspace is over its seat limit.')}</vui-alert><vui-hstack gap="sm" wrap><vui-button data-save variant="primary">${text('Сохранить', 'Save')}</vui-button><vui-button variant="secondary">${text('Отмена', 'Cancel')}</vui-button></vui-hstack></vui-vstack>`;
  const nav = `<vui-nav slot="nav" label="${text('Разделы', 'Sections')}"><vui-nav-item selected>${text('Профиль', 'Profile')}</vui-nav-item><vui-nav-item>${text('Уведомления', 'Notifications')}</vui-nav-item><vui-nav-item>${text('Доступ', 'Access')}</vui-nav-item></vui-nav>`;
  const toolbar = `<vui-toolbar slot="toolbar" label="${text('Команды', 'Commands')}"><strong slot="start">${text('Настройки', 'Settings')}</strong><vui-button slot="start" data-collapse variant="ghost">${text('Навигация', 'Navigation')}</vui-button></vui-toolbar>`;
  const footer = `<vui-status-bar slot="footer" label="${text('Состояние', 'Status')}"><span>${text('Черновик', 'Draft')}</span><span slot="end">${text('Не сохранено', 'Unsaved')}</span></vui-status-bar>`;
  return frame(
    'settings',
    `<vui-template-settings label="${text('Приложение', 'Application')}" content-label="${text('Настройки', 'Settings')}">${toolbar}${nav}${main}${footer}</vui-template-settings>`,
  );
}

function workspace(): string {
  const tree = `<vui-file-tree slot="nav" label="${text('Файлы', 'Files')}"><vui-tree-item label="src" kind="folder" expanded><vui-tree-item label="app.ts" kind="file" selected></vui-tree-item><vui-tree-item label="${longToken}.ts" kind="file"></vui-tree-item></vui-tree-item><vui-tree-item label="README.md" kind="file"></vui-tree-item></vui-file-tree>`;
  const editor = `<vui-scroll-area slot="editor" data-editor-scroll label="${text('Редактор', 'Editor')}"><vui-vstack gap="xs" padding="md">${editorLines()}</vui-vstack></vui-scroll-area>`;
  const inspector = `<vui-scroll-area slot="inspector" label="${text('Инспектор', 'Inspector')}"><vui-vstack gap="md" padding="md"><vui-properties label="${text('Файл', 'File')}"><vui-property label="${text('Путь', 'Path')}">src/app.ts</vui-property><vui-property label="${text('Владелец', 'Owner')}">Ada</vui-property><vui-property label="${text('Идентификатор', 'Identifier')}">${longToken}</vui-property></vui-properties><vui-empty heading="${text('Нет ошибок', 'No problems')}">${text('Файл без диагностик.', 'This file has no diagnostics.')}</vui-empty></vui-vstack></vui-scroll-area>`;
  const toolbar = `<vui-toolbar slot="toolbar" label="${text('Команды', 'Commands')}"><vui-button slot="start" data-collapse variant="ghost">${text('Навигация', 'Navigation')}</vui-button><vui-text slot="start">src/app.ts</vui-text><vui-button slot="end" variant="primary">${text('Запуск', 'Run')}</vui-button></vui-toolbar>`;
  const header = `<vui-titlebar slot="header" label="Atlas"></vui-titlebar>`;
  const footer = `<vui-status-bar slot="footer" label="${text('Состояние', 'Status')}"><span>Ln 12</span><span slot="end">UTF-8</span></vui-status-bar>`;
  return frame(
    'workspace',
    `<vui-template-workspace label="${text('Рабочая область', 'Workspace')}" content-label="${text('Редактор и инспектор', 'Editor and inspector')}">${header}${toolbar}${tree}${editor}${inspector}${footer}</vui-template-workspace>`,
  );
}

const markup: Record<LayoutId, () => string> = {
  dashboard,
  settings,
  workspace,
};

export function layoutMarkup(id: string): string {
  const render = markup[id as LayoutId];
  if (!render) throw new Error(`Unknown layout: ${id}`);
  return render();
}

export function layoutExample(id: string): { id: string; html: string; script: string } {
  return { id: `layout-${id}`, html: layoutMarkup(id), script: layoutScript() };
}

export function layoutScript(): string {
  return `const root = document.querySelector('[data-layout]') ?? document.body;
const grid = root.querySelector('vui-data-grid');
const rows = [
  { id: '1', name: 'Atlas', owner: 'Ada', region: 'EU', status: 'active', state: 'active', updated: 'Mar 2', notes: 'Priority' },
  { id: '2', name: 'Orion', owner: 'Grace', region: 'US', status: 'draft', state: 'draft', updated: 'Mar 4', notes: '${longToken}' },
];
if (grid) {
  grid.columns = [
    { key: 'name', title: 'Project' },
    { key: 'owner', title: 'Owner' },
    { key: 'region', title: 'Region', priority: 'secondary' },
    { key: 'status', title: 'Status' },
    { key: 'updated', title: 'Updated', priority: 'secondary' },
    { key: 'notes', title: 'Notes' },
  ];
  const apply = () => {
    const query = (root.querySelector('[data-filter]')?.value ?? '').toLowerCase();
    const status = root.querySelector('[data-status]')?.value ?? 'all';
    grid.rows = rows.filter((row) => row.name.toLowerCase().includes(query) && (status === 'all' || row.state === status));
  };
  root.querySelector('[data-filter]')?.addEventListener('input', apply);
  root.querySelector('[data-status]')?.addEventListener('change', apply);
  apply();
}
root.querySelector('[data-save]')?.addEventListener('click', () => {
  const name = root.querySelector('vui-input');
  let result = root.querySelector('[data-result]') ?? root.parentElement?.querySelector('[data-result]');
  if (!name) return;
  if (!result) {
    result = document.createElement('output');
    result.setAttribute('data-result', '');
    result.setAttribute('aria-live', 'polite');
    root.append(result);
  }
  name.invalid = !name.value.trim();
  result.textContent = name.invalid ? 'Enter a name' : 'Saved: ' + name.value;
  if (name.invalid) name.focus();
});
root.querySelector('[data-collapse]')?.addEventListener('click', () => {
  root.querySelector('vui-template-dashboard, vui-template-settings, vui-template-workspace, vui-shell')?.toggleAttribute('collapsed');
});`;
}

export function bindLayout(root: ParentNode): void {
  const scope = root instanceof HTMLElement && root.matches('[data-layout]') ? root : root.querySelector<HTMLElement>('[data-layout]');
  if (!scope) return;
  const grid = scope.querySelector<GridHost>('vui-data-grid');
  const rows = [
    { id: '1', name: 'Atlas', owner: 'Ada', region: 'EU', status: text('Активный', 'Active'), state: 'active', updated: 'Mar 2', notes: text('Приоритет', 'Priority') },
    { id: '2', name: 'Orion', owner: 'Grace', region: 'US', status: text('Черновик', 'Draft'), state: 'draft', updated: 'Mar 4', notes: longToken },
    { id: '3', name: 'Nova', owner: 'Lin', region: 'APAC', status: text('Активный', 'Active'), state: 'active', updated: 'Mar 8', notes: 'Renewal' },
    { id: '4', name: 'Helios', owner: 'Maya', region: 'EU', status: text('Черновик', 'Draft'), state: 'draft', updated: 'Mar 9', notes: 'Legal review' },
    { id: '5', name: 'Quasar', owner: 'Noah', region: 'US', status: text('Активный', 'Active'), state: 'active', updated: 'Mar 11', notes: longToken },
    { id: '6', name: 'Vega', owner: 'Iris', region: 'EU', status: text('Активный', 'Active'), state: 'active', updated: 'Mar 12', notes: 'Onboarding' },
  ];
  if (grid) {
    grid.columns = [
      { key: 'name', title: text('Проект', 'Project') },
      { key: 'owner', title: text('Владелец', 'Owner') },
      { key: 'region', title: text('Регион', 'Region'), priority: 'secondary' },
      { key: 'status', title: text('Статус', 'Status') },
      { key: 'updated', title: text('Обновлён', 'Updated'), priority: 'secondary' },
      { key: 'notes', title: text('Заметки', 'Notes') },
    ];
    const apply = () => {
      const filter = scope.querySelector<HTMLElement & { value: string }>('[data-filter]');
      const status = scope.querySelector<HTMLElement & { value: string }>('[data-status]');
      const query = filter?.value.toLowerCase() ?? '';
      const state = status?.value ?? 'all';
      grid.rows = rows.filter((row) => row.name.toLowerCase().includes(query) && (state === 'all' || row.state === state));
    };
    scope.querySelector('[data-filter]')?.addEventListener('input', apply);
    scope.querySelector('[data-status]')?.addEventListener('change', apply);
    apply();
  }
  scope.querySelector('[data-save]')?.addEventListener('click', () => {
    const name = scope.querySelector<HTMLElement & { value: string; invalid: boolean }>('vui-input');
    const result = scope.querySelector<HTMLElement>('[data-result]') ?? scope.parentElement?.querySelector<HTMLElement>('[data-result]');
    if (!name || !result) return;
    name.invalid = !name.value.trim();
    result.textContent = name.invalid ? text('Введите имя', 'Enter a name') : `${text('Сохранено', 'Saved')}: ${name.value}`;
    if (name.invalid) name.focus();
  });
  scope.querySelector('[data-collapse]')?.addEventListener('click', () => {
    scope
      .querySelector('vui-template-dashboard, vui-template-settings, vui-template-workspace, vui-shell')
      ?.toggleAttribute('collapsed');
  });
}
