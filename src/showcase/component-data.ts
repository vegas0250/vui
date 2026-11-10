/** Documentation metadata only. Runtime contracts remain owned by the library. */
import pkg from '../../package.json';
import { listContracts } from '../contract';
import type { ComponentContract } from '../contract';

export const libraryVersion = pkg.version;

const descriptions: Record<string, [string, string]> = {
  button: ['Кнопка действия с вариантами оформления и состоянием загрузки.', 'An action button with variants and a loading state.'],
  'icon-button': ['Компактная кнопка с иконкой и доступным именем.', 'A compact icon action with an accessible name.'],
  'button-group': ['Группа связанных действий.', 'A group of related actions.'],
  toggle: ['Кнопка с переключаемым состоянием.', 'A button with a pressed state.'],
  'toggle-group': ['Связанные переключатели с общим выбором.', 'Related toggles with shared selection.'],
  input: ['Однострочное поле с подписью и валидацией.', 'A single-line field with a label and validation.'],
  textarea: ['Многострочное поле для заметок и сообщений.', 'A multiline field for notes and messages.'],
  checkbox: ['Независимый выбор с нативным флажком.', 'An independent choice backed by a native checkbox.'],
  'checkbox-group': ['Группа флажков с общим значением.', 'A set of checkboxes with a shared value.'],
  radio: ['Один вариант из нескольких взаимоисключающих.', 'One choice among mutually exclusive options.'],
  'radio-group': ['Группа радиокнопок с единым выбором.', 'A radio group with a single selection.'],
  switch: ['Переключение настройки между двумя состояниями.', 'A setting that switches between two states.'],
  select: ['Выбор значения из списка с клавиатуры или мышью.', 'Choose a value from a list using keyboard or pointer.'],
  option: ['Вариант внутри списка выбора; используется вместе с Select.', 'An option inside Select; always used with its parent.'],
  slider: ['Выбор числа в заданном диапазоне.', 'Choose a number within a range.'],
  field: ['Подпись и пояснение для вложенного элемента формы.', 'A label and hint for a nested form control.'],
  'field-group': ['Связанные поля с общим заголовком.', 'Related fields under a shared heading.'],
  dialog: ['Модальный диалог с управлением фокусом.', 'A modal dialog with focus management.'],
  drawer: ['Выдвижная панель для второстепенной задачи.', 'A sliding panel for a secondary task.'],
  popover: ['Всплывающая область, связанная с кнопкой открытия.', 'A floating surface associated with its trigger.'],
  menu: ['Контекстное меню с клавиатурной навигацией.', 'A context menu with keyboard navigation.'],
  'menu-item': ['Команда внутри меню; поддерживает вложенные пункты.', 'An action inside a menu, including nested items.'],
  tabs: ['Переключение связанных панелей содержимого.', 'Switch between related content panels.'],
  tab: ['Заголовок вкладки внутри Tabs.', 'A tab trigger inside Tabs.'],
  'tab-panel': ['Содержимое вкладки, связанное с её заголовком.', 'Tab content associated with a tab trigger.'],
  nav: ['Навигация по разделам с управлением выбором.', 'Section navigation with selection management.'],
  'nav-item': ['Ссылка внутри навигации VUI.', 'A link inside VUI navigation.'],
  breadcrumbs: ['Путь до текущего раздела.', 'The path to the current section.'],
  'path-bar': ['Интерактивная строка пути.', 'An interactive path bar.'],
  pagination: ['Переключение страниц набора данных.', 'Navigate through pages of data.'],
  stepper: ['Последовательность этапов задачи.', 'The steps of a task.'],
  step: ['Этап внутри Stepper.', 'A step inside Stepper.'],
  toolbar: ['Панель действий со слотами начала и конца.', 'An action bar with start and end slots.'],
  tooltip: ['Краткое пояснение при наведении и фокусе.', 'Brief help on hover and focus.'],
  alert: ['Сообщение об ошибке, предупреждении или результате.', 'An error, warning, or result message.'],
  toast: ['Краткое уведомление о выполненном действии.', 'A brief notification about an action.'],
  toaster: ['Область размещения уведомлений Toast.', 'A region that hosts Toast notifications.'],
  progress: ['Индикатор выполнения задачи.', 'A task completion indicator.'],
  spinner: ['Компактный индикатор ожидания.', 'A compact waiting indicator.'],
  skeleton: ['Заглушка для загружаемого содержимого.', 'A placeholder for loading content.'],
  empty: ['Пустое состояние с пояснением и действием.', 'An empty state with an explanation and action.'],
  text: ['Текст с общей типографикой VUI.', 'Text using VUI typography.'],
  link: ['Доступная ссылка с оформлением VUI.', 'An accessible link styled by VUI.'],
  badge: ['Короткая метка состояния.', 'A concise status label.'],
  chip: ['Метка с необязательным действием удаления.', 'A tag with an optional removal action.'],
  kbd: ['Обозначение клавиши или сочетания клавиш.', 'A key or keyboard shortcut label.'],
  icon: ['Иконка: декоративная или с доступным именем.', 'An icon, decorative or with an accessible name.'],
  avatar: ['Представление пользователя с запасными инициалами.', 'A user representation with fallback initials.'],
  'avatar-group': ['Компактная группа участников.', 'A compact group of people.'],
  separator: ['Визуальное разделение связанных областей.', 'A visual division between related regions.'],
  panel: ['Поверхность для связанных элементов интерфейса.', 'A surface for related interface content.'],
  container: ['Ограничение ширины содержимого.', 'A content-width constraint.'],
  'scroll-area': ['Прокручиваемая область содержимого.', 'A scrollable content region.'],
  stack: ['Последовательная раскладка с общими отступами.', 'A sequential layout with shared spacing.'],
  hstack: ['Горизонтальная раскладка элементов.', 'A horizontal layout.'],
  vstack: ['Вертикальная раскладка элементов.', 'A vertical layout.'],
  grid: ['Сетка элементов с общими токенами отступов.', 'A grid using shared spacing tokens.'],
  'split-panel': ['Две области с изменяемой границей.', 'Two panes with a resizable divider.'],
  shell: ['Каркас приложения: навигация, содержимое и панели.', 'An application frame with navigation, content, and panels.'],
  window: ['Область окна приложения.', 'An application window surface.'],
  titlebar: ['Заголовок окна с действиями управления.', 'A window title with window-control actions.'],
  'status-bar': ['Строка состояния приложения.', 'An application status bar.'],
  'file-tree': ['Дерево файлов с раскрытием и выбором.', 'A file tree with expansion and selection.'],
  'tree-item': ['Файл или папка внутри File Tree.', 'A file or folder inside File Tree.'],
  'data-grid': ['Табличные данные с выбором строк и клавиатурой.', 'Tabular data with row selection and keyboard navigation.'],
  list: ['Список с клавиатурным выбором.', 'A list with keyboard selection.'],
  'list-item': ['Выбираемый элемент списка.', 'A selectable list item.'],
  properties: ['Список пар «свойство — значение».', 'A list of property and value pairs.'],
  property: ['Одна пара «свойство — значение».', 'One property and value pair.'],
};
const parents: Record<string, string> = {
  option: 'select', 'radio-group': 'radio', 'checkbox-group': 'checkbox', 'field-group': 'field',
  'toggle-group': 'toggle', 'menu-item': 'menu', tab: 'tabs', 'tab-panel': 'tabs', 'nav-item': 'nav',
  step: 'stepper', toaster: 'toast', 'tree-item': 'file-tree', 'list-item': 'list', property: 'properties',
};
export function componentImport(tag: string): string {
  const slug = tag.replace(/^vui-/, '');
  return `vui/${parents[slug] ?? slug}`;
}
export function componentCatalog(): ComponentContract[] {
  return [...listContracts(), {
    element: 'vui-option', className: 'VOption', attributes: [
      { name: 'value', kind: 'string' as const, reflected: true },
      { name: 'label', kind: 'string' as const, reflected: true },
      { name: 'disabled', kind: 'boolean' as const, reflected: true },
    ], events: [], slots: [''], parts: [], methods: [], keyboard: [], states: [],
    responsive: 'flow' as const, focus: 'native' as const,
  }].sort((a, b) => a.element.localeCompare(b.element));
}
export function description(tag: string, lang: 'ru' | 'en'): string {
  return descriptions[tag.replace(/^vui-/, '')]?.[lang === 'ru' ? 0 : 1] ?? '';
}
export function componentGroup(tag: string): string {
  const entry = pkg.exports[('./' + componentImport(tag).slice(4)) as keyof typeof pkg.exports];
  return typeof entry === 'object' ? entry.import.split('/')[3] : 'forms';
}
export const extraProperties: Record<string, Array<[string, string]>> = {
  'vui-data-grid': [['columns', '{ key, title, width?, align? }[]'], ['rows', '{ id, ...values }[]'], ['selectedId', 'string'], ['selectedIds', 'string[]']],
  'vui-split-panel': [['position', 'number'], ['min', 'number'], ['max', 'number']],
  'vui-menu': [['commands', 'CommandRegistry | null']],
  'vui-path-bar': [['crumbs', '{ label: string, path: string }[]']],
  'vui-option': [['optionValue', 'string (getter)'], ['optionLabel', 'string (getter)'], ['optionDisabled', 'boolean (getter)']],
  'vui-tree-item': [['itemValue', 'string (getter)']],
  'vui-menu-item': [['unavailable', 'boolean (getter)']],
  'vui-file-tree': [['selectedItem', 'VTreeItem | null (read only)']],
};
