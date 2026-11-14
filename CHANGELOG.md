# Unreleased (proposed 1.4.0)

Design system modernization. Specification: `docs/design-system.md`.

- Tokens: typography (`--vui-font-size-xs`, `--vui-line-height-sm|heading`,
  `--vui-tracking-heading|caps`, `--vui-font-weight-medium|control`, `--vui-measure`),
  icon geometry (`--vui-icon-size-sm|lg|xl`, `--vui-icon-stroke`, `--vui-icon-gap`),
  chrome/overlay geometry (`--vui-header-height`, `--vui-field-gap`,
  `--vui-dialog-padding`, `--vui-popover-padding`, `--vui-menu-padding`,
  `--vui-menu-item-height`), `--vui-space-3xl`, breakpoints (`--vui-breakpoint-*`),
  containers (`--vui-container-*`), `--vui-size-touch`, semantic gaps
  (`--vui-gap-related|group|section`, `--vui-form-gap`, `--vui-container-gutter`).
- Web mode follows Radix/shadcn conventions: radii 6/8 (was 2/4), 2px focus ring,
  fluid h1/h2, 40px rows, 24px dialog padding. Desktop aligns to the Fluent 2
  type ramp (body 14/20, subtitle 16, title 20/24) and icon grid (12/16/20/24,
  1.75 stroke). Terminal stays monospace, square, motionless.
- Touch pointers (`pointer: coarse`) grow web/desktop controls, rows, menu and
  nav items to 40–48px targets; carousel dots get a 24px hit area.
- `vui-icon`: `size` attribute, mode-driven stroke weight, `focusable="false"`;
  54 new built-in icons (67 → 121) (chevron-up, external-link, filter, upload, user, calendar,
  lock/unlock, circle-x/help, more-vertical, undo/redo, zoom, …).
- `vui-container`: `size="xlarge"` and `size="full"`; widths from tokens.
- `vui-text`: heading line height/tracking/balance, levels 4–6, label uses primary text.
- Field labels use primary text color + medium weight; buttons use
  `--vui-font-weight-control`; all disabled states use `--vui-opacity-disabled`.
- Menu, dialog, drawer, popover, tabs and icon-button geometry read the new tokens.

# 1.3.5

- Compact hierarchical sidebar navigation on `vui-nav`: `vui-nav-group`
  categories, nestable `vui-nav-item` branches, tree guides, chevrons, and
  optional icons. UI-mode tokens (`--vui-nav-*`, `--vui-layout-nav`).
- Keyboard expand/collapse, soft selected state, docs/visual examples for the
  Generators → Libraries sidebar pattern. Flat `vui-nav-item` text leaves stay
  compatible.

# 1.3.4

- Docs catalog sidebar: file-tree navigation (folder/file icons, tree
  connectors outside the active row, final-child guide stop).
- Soften selected/checked menu item chrome (background + accent text, no
  inset accent bar); nested inline menus no longer draw a border guide by
  default so hosts can own tree geometry.
- Keep select/menu overlays inside the viewport; docs shell polish (favicons,
  header/search chrome).

# 1.3.3

- Publish opt-in Templates (`vui/templates`, `vui/template-dashboard`,
  `vui/template-settings`, `vui/template-workspace`) and React adapters
  (`TemplateDashboard` / `TemplateSettings` / `TemplateWorkspace`).
- Document supported integration patterns (`docs/integration.md`): plain CE, React,
  Next.js, Electron; Web / Desktop / Terminal UI modes; preferred app stack
  Next.js + React 19 + native Turbopack. Next example builds with Turbopack
  (removed `--webpack`); `check:next` covers `/templates`.
- Layout Gallery and e2e cover Dashboard / Settings / Workspace across UI modes.

# 1.3.2

- Pack portal consumer release: web UI mode focus/elevation recipes, widgets/gallery, menu extensions, and docs.tokens contract fix for vui-field.
- Extend `vui-menu` with `orientation`, `inline`, expandable nested groups (caret), and `href`/`selected` items; docs sidebar uses inline menus. Add Icons docs section with grouped `iconNames`. Add widgets category: `vui-carousel` and `vui-gallery` (renamed from lightbox). Docs catalog groups widgets separately.
- Theme Studio chrome uses `vui-*` (toolbar, select, input, slider, checkbox, button, icon-button, panel). Dense color token rows keep native color/text inputs. Docs theme control and catalog search use `vui-select` / `vui-input`.
- Structural focus recipes (`--vui-focus-ring` / `--vui-focus-shadow`) belong only to UI mode (`src/tokens/ui.css`). Static themes keep elevation ink only (`--vui-shadow-ink`, `--vui-shadow-strength-*`, optional neon `--vui-shadow-glow`); `--vui-shadow-sm|md|lg` are composed in `ui.css` per UI mode (terminal: none); high-contrast thickens focus and clears shadows after the mode scale. Custom themes export `--vui-shadow-ink`.
- `system` theme is complete for light OS preference and no longer uses a higher-specificity `:root` selector that overrode terminal/desktop focus.
- Fix CSS leaked into HTML templates in menu, list, data-grid, and file-tree. Ghost `vui-icon-button` no longer inherits a primary border; loading hides the icon.
- Normalize disabled opacity, selection accent width, toolbar wrap, select flip height, shell resizers, drawer width, and scrollbar metrics on UI-mode tokens.
- Visual harness covers nearly every public component; regression boards add terminal + tablet. Copied HTML examples are runnable (`exampleCode` with theme/UI mode). `setUIMode` emits `vui-ui-change`.

# 1.3.1

- Preserve source component registration in optimized website builds, and add a production-build browser check alongside development checks.

# 1.3.0

- Add a bilingual documentation website with four sections, direct pages for all 69 visual components, shared live/copyable examples, and real interface compositions.
- Separate library and website artifacts and publishing workflows. Keep documentation preferences isolated when embedded in the vegas0250 VUI subproject.
- Include the typed React adapters and Next.js integration from the preceding architecture work without breaking existing Custom Element or theme entry points.

# 1.2.3

- Add Midnight, Emerald and Minimal Light through the existing semantic theme engine. Retain all existing preset IDs and system defaults.

# Changelog

## Unreleased`n`n# 1.3.2`n`n- Pack portal consumer release: web UI mode focus/elevation recipes, widgets/gallery, menu extensions, and docs.tokens contract fix for vui-field.`n`n# Was Unreleased`n`n- Add optional React 19 adapters through `vui/react`, with browser-only element registration, native events, typed refs and post-upgrade object properties. Existing Custom Element and theme exports remain available.
- Add a Next.js App Router example and packed-package checks for prerendering, request-time SSR, hydration and interaction. SSR emits light DOM; shadow controls initialize in the browser.
- Consolidate private helpers in `src/utils`, remove focus/overlay re-export wrappers, colocate component tests, derive build entries from package exports, and enable tree shaking for unused React adapters.

- `neon-green` — зелёный киберпанк для рабочего стола: тёмный графит, резкий радиус, тонкая зелёная кромка. Масштаб по-прежнему задаёт плотность, не тема.
- Подменю `vui-menu` открывается по движению указателя, в том числе по внутренней разметке пункта. Слот `bar` рисует нижнюю полосу, `layout="stack"` ставит иконку над подписью.
- Правый щелчок по строке `vui-data-grid` не сдвигает прокрутку таблицы и предков. `fill` держит прокрутку внутри кадра.

## 1.2.2

- Добавлена оригинальная светлая тема Modern Light. Семантические токены и проверки контраста используют общий движок; системные темы по умолчанию не изменены.

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
