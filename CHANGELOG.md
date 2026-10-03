# Changelog

## Unreleased

## 1.2.1

- У `vui-shell` левую панель можно тянуть за разделитель. `aside-collapsed` прячет правую панель и оставляет стрелку, которая её открывает.
- Вкладки рисуются как в браузере: верхние скругления, активная сливается с содержимым. У `vui-titlebar` слот `tabs` для этой полосы.
- Вкладка, добавленная в уже открытую `vui-tabs`, попадает в полосу. Раньше именованный слот её не показывал.
- `neon-green` — спокойная desktop-тема: мягкий зелёный акцент, обычные тени и более свободные отступы, радиус и высота строк.
- Вкладка рисуется плашкой с фоном, а не одной линией. Выбранный пункт навигации отличается фоном.
- Боковые панели `vui-shell` имеют внутренний отступ. `vui-data-grid` с `fill` больше не занимает высоту родителя целиком и не выталкивает соседние панели.

## 1.2.0

- Темы `neon-green`, `neon-magenta` и `neon-cyan`: тёмный неон, общий словарь токенов.
- `vui-titlebar` — рамка окна без системных кнопок. Слоты `icon` и `tools`. События `minimize`, `maximize`, `close`. `maximized` меняет значок разворота.
- `vui-tab` с `closable` показывает закрытие и шлёт `close`.
- Колонка `vui-data-grid` принимает `iconKey`: имя иконки из поля строки рисуется перед текстом.
- `vui-menu-item` принимает `icon`.

## 1.1.0

- `vui-data-grid` от 100 строк рисует окно строк, а не весь набор. `aria-rowcount` и `aria-rowindex` остаются абсолютными. `fill` делает `frame` областью прокрутки на высоте родителя.
- `multiple` включает несколько строк. `selectedIds` — набор id. Shift расширяет диапазон, Ctrl/Cmd со стрелкой двигает курсор, Ctrl/Cmd+Space переключает строку. `selected` по-прежнему id активной строки.
- Слот `main` у `vui-shell` занимает оставшуюся высоту колонки. Содержимое основной области может заполнить её и прокручиваться само.

## 1.0.0

Первая законченная граница платформы. Дальше компоненты появляются из реального приложения, а не из расширения списка ради полноты.

- Словарь сведён к одному API: карта имён и сознательно не добавленные элементы — в `docs/vocabulary.md`.
- Новые элементы: text, link, kbd, chip, avatar group, toggle, toggle group, field, field group, checkbox group, slider, nav, stepper, list, properties, empty, drawer, window.
- Кнопка умеет `loading`. Dialog с `alert` — alertdialog. Alert умеет `banner` и `neutral`. Input принимает date, time, datetime-local, color и file.
- Checkbox и switch шлют `change`, как остальные поля.
- Семейства дополнены Feedback, Layout, Content и Desktop. Общие имена состояний — `componentStates`.
- Studio показывает эти элементы и reference UI: shell, навигация, поиск, фильтр, таблица, дерево, инспектор, drawer, dialog, меню, пустое состояние.
- Версия пакета — `1.0.0`. Карта exports расширена и по-прежнему заморожена тестом.
- Горизонтальные стрелки, split, дерево и вложенное меню следуют `dir`. Раскладка toolbar, status bar, toast, switch и дерева использует logical properties.
- Контракт зарегистрирован у каждого custom element, кроме `vui-option`. `checkCompliance()` проверяет весь реестр.
- Цепочка component → category → `import 'vui'` проверяется тестом. Неизвестная тема, плотность, enum и чужой ребёнок дают одно предупреждение и не подменяют значение. Повторная регистрация другого класса не затирает элемент.
- Выбор строки `vui-data-grid` обновляет выделение на месте. `vui-list` синхронизирует детей одним проходом, а не на каждый `slotchange`. Studio показывает `vui-window`, `vui-field-group` и reference-сборку: список, popover, toast, loading и error.
- `pnpm check:consumer` ставит собранный пакет во временный Vite-проект, собирает production build и в браузере рендерит button, input, select, dialog, tabs, data grid, list, file tree и тему. В пакет не входят tests, showcase и scripts.
- Studio показывает `vui-stack` и `vui-container`. Overlay-стек документирует dialog, drawer, popover, menu, select, tooltip и toaster.

## 0.2.0

Публичная граница платформы: vocabulary, patterns, application shell и VUI Studio.

- Новые элементы: `vui-button-group`, `vui-textarea`, `vui-radio`, `vui-radio-group`, `vui-badge`, `vui-avatar`, `vui-separator`, `vui-progress`, `vui-spinner`, `vui-skeleton`, `vui-popover`, `vui-breadcrumbs`, `vui-pagination`, `vui-scroll-area`, `vui-container`, `vui-shell`.
- Категория `vui/content`. Shell входит в `vui/desktop` и `vui/shell`.
- Patterns и Platform Validation живут в Studio и не являются пакетом. Карта exports проверяется тестом. CI собирает библиотеку и сверяет бюджет размера.
- `dir` на документе — направление текста. Отдельной i18n-системы нет.
- Composition contract: слот, light DOM, свойство, атрибут и стандартное событие. Select, tabs, tree, toast, dialog, data grid, toolbar, split и menu собраны одним механизмом.
- Interaction contract: общая клавиатура, фокус, `SelectionModel.active` и путь `interaction → command → action`.
- Семейства Action, Field, Overlay, Navigation и Data — общие правила без иерархии классов. Showcase и compliance проверяют сценарии Form, Navigation, Data и Overlay.
- Foundation runtime: `readFoundation()`, `containerBand()` и подключение стилей через `VuiElement`. Тема, плотность и ширина контейнера остаются тремя независимыми измерениями.
- Component contract: `registerContract()` и `checkCompliance()` для button, input, dialog, toast, select, data-grid и file-tree. Повторное подключение не пересоздаёт shadow и снимает слушатели `hold()` / `bind()`.
- Showcase показывает снимок Foundation, lifecycle и таблицу зарегистрированных контрактов.
- Foundation: primitive palette, semantic themes и component tokens. Темы ссылаются на палитру, а не на собственные hex. Плотность остаётся одной шкалой; padding панели равен `--vui-space-lg`.
- Layout использует общие `gap`, `padding`, `align`, `justify` и `overflow`. `vui-split-panel` принимает `min` и `max`; без них позиция по-прежнему 10–90.
- Showcase показывает Foundation, контракт компонента и вложенный split.
- `vui-menu` и `vui-menu-item` используют этот слой. Приложение регистрирует свои команды.
- Tabs, select, file tree, data grid и split panel переведены на общие primitives. Публичные attributes этих компонентов не заменены.
- Публичные properties отражают уже существующие attributes. Набор attributes не заменён.
- `vui-dialog` возвращает фокус на элемент, который его открыл, держит общий стек overlay и ставит `aria-modal` только пока открыт.
- Escape вложенного select закрывает список раньше dialog.
- Tooltip описывается через `aria-describedby`. Hint поля связан с input тем же атрибутом.
- Кольцо фокуса у полей и таблицы показывается на `:focus-visible`.
- Добавлены visual regression и проверки accessibility tree в Playwright.

## 0.1.0

Первый рабочий набор компонентов.
