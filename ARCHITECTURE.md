# Архитектура VUI

VUI — UI/Application Interaction Platform на Web Components. Один и тот же компонент работает в обычном HTML, SPA и Electron. Vue, React, Angular и Svelte в ядро не входят.

> VUI owns the UI. The application owns the meaning.

Граница платформы, UI state и список того, что в VUI не входит, — в [PLATFORM.md](PLATFORM.md).

Публичный контракт важнее внутренней реализации. Реализацию можно менять. Уже опубликованные attributes, properties, events, slots и CSS parts нельзя менять молча: изменение описывается в этом документе и в `CHANGELOG.md`.

Не добавляйте второй способ сделать то же самое. Не вводите DI, event bus, роутер, менеджер состояния приложения и доменные слои. Общие механизмы взаимодействия живут в `src/interaction` и используются компонентами, а не копируются.

## Именование

Класс TypeScript — `V` + PascalCase. Custom element — `vui-` + kebab-case. Третьей схемы нет.

```text
VButton      → <vui-button>      → src/components/actions/button.ts
VIconButton  → <vui-icon-button>
VInput       → <vui-input>
VDialog      → <vui-dialog>
VDataGrid    → <vui-data-grid>
VSplitPanel  → <vui-split-panel>
VFileTree    → <vui-file-tree>
VHStack      → <vui-hstack>
VVStack      → <vui-vstack>
```

Части, которые не живут отдельно от родителя, остаются в его модуле: `VOption` → `vui-option`, `VTab` / `VTabPanel`, `VTreeItem`, `VToaster`.

`VuiElement` — внутренний базовый класс, не custom element. `VuiTheme` и `VuiDensity` — типы темы, не компоненты.

Файл называется по элементу: `button.ts`, `data-grid.ts`, `icon-button.ts`. Категория только реэкспортирует уже существующие компоненты. Импорт `vui/button` и `import { VButton } from 'vui'` — один и тот же класс.

Декларативный API — HTML. Класс нужен, когда свойство нельзя выразить атрибутом (`columns`, `rows`) или когда компонент создают из кода.

## Public API

Контракт компонента состоит только из:

- attributes;
- properties;
- methods;
- events;
- slots;
- CSS parts;
- публичных CSS custom properties, если они есть.

Внутренние классы в shadow, приватные поля и `--vui-overlay-z` контрактом не являются. Каталог текущих компонентов — [docs/components.md](docs/components.md).

### Attributes и properties

Одно имя отвечает за одно состояние.

- Строковое property читает и пишет атрибут. `null` и `undefined` снимают атрибут. Отсутствующий атрибут читается как `''`.
- Булево property — это наличие атрибута: `true` ставит атрибут, `false` снимает.
- Запись property меняет атрибут. `attributeChangedCallback` вызывает `sync()`, и компонент рисует состояние заново.
- Исключения, которые уже были в API, сохранены: `VInput.value` и `VSelect.value` держат текущее значение; `checked` у checkbox и switch; `VDataGrid.columns`, `rows`, `selectedId`; `VSplitPanel.position`, `min` и `max` — числа, и без своих границ позиция остаётся в 10–90; `VDialog.dismissable` означает «можно закрыть снаружи», поэтому `dismissable="false"` выключает закрытие, а отсутствие атрибута оставляет его включённым; `VTreeItem.itemValue` — значение элемента или, если атрибута `value` нет, его `label`.

Общий механизм — `src/core/reflect.ts`. Свойство не добавляется компоненту, которому оно не нужно. `loading` есть у `vui-button` и `vui-icon-button`: кнопка занята и не активируется. Его не добавляют туда, где ждать нечего.

Неверное значение атрибута не подменяется и не роняет компонент: строка остаётся в атрибуте, а стиль срабатывает только на известный `variant`, `size` или `orientation`. Число вне `min`/`max` у split зажимается в границы. Повторный `defineElement` для того же имени ничего не делает. Чужой ребёнок в слоте остаётся в светлом DOM и не участвует в выборе родителя. Отключение снимает слушатели `hold()` и `bind()`; повторное подключение вызывает `sync()` и не создаёт второй shadow.

### Events

Сначала стандартные события: `click`, `input`, `change`, `close`. Они всплывают и composed, поэтому слушатель на custom element их получает. Своё имя события — только когда стандартного нет. Сейчас таких нет. `close` у `vui-menu` не всплывает: слушатель ставится на само меню, и dialog вокруг него не получает чужое закрытие.

### Slots и parts

Слот без `name` — основное содержимое. Именованные слоты перечислены в каталоге. `part` — стабильная точка для внешней стилизации. Новые части добавляются как публичный API.

### CSS custom properties

Компоненты не публикуют собственные цветовые переменные. Они читают токены темы и плотности.

Слои:

- primitive (`src/tokens/tokens.css`) — палитра, семьи шрифтов, motion, z-index, пороги `--vui-layout-narrow`, `--vui-layout-medium`, `--vui-field-inline`, `--vui-overlay-full`;
- semantic (`themes/`) — `--vui-color-*`, `--vui-shadow-*`, `--vui-border-width`, `--vui-focus-ring`. Своя тема переопределяет эти имена. Файлы тем не содержат собственных hex: цвета берутся из палитры;
- component — высоты chrome и размеры overlay, которые шкала сама не задаёт: `--vui-toolbar-height`, `--vui-statusbar-height`, `--vui-row-height`, `--vui-panel-padding`, `--vui-dialog-*`, `--vui-menu-*`, `--vui-toast-inline`, `--vui-tooltip-inline`.

`--vui-panel-padding` на каждой плотности равен `--vui-space-lg`. `themes/system.css` в тёмной схеме ссылается на те же имена палитры, что и `themes/dark.css`.

Исключение для раскладки: `vui-split-panel` выставляет `--vui-split` из `position`. Менять эту переменную снаружи не нужно. `--vui-layout-*` на host — внутренняя проводка `gap`, `padding`, `align`, `justify` и `overflow`.

## Контракт Web Component

Все компоненты наследуют `VuiElement`:

1. Shadow root открытый. `delegatesFocus` включён, кроме вкладок, дерева и случаев, где фокус должен оставаться на host.
2. При первом подключении в документ ставится шаблон и стили. Повторное подключение не пересоздаёт shadow.
3. `sync()` приводит DOM к атрибутам. Рисование не размазано по слушателям.
4. `disabled` — атрибут host. Нативный контрол внутри получает `disabled` и выпадает из Tab.
5. `readonly` есть только у поля ввода и остаётся нативным `readOnly`.
6. `invalid` включает `aria-invalid="true"` и цвет `--vui-color-danger`. Отдельной формы валидации в библиотеке нет: странице достаточно атрибута и, для поля, текста `hint`.
7. Фокус с клавиатуры виден через `:focus-visible` и `--vui-focus-ring`. Кольцо не заменяется на `div role="button"`.
8. Интерактивный элемент — нативный `button`, `input`, `dialog`, `table`, где это возможно. ARIA дополняет нативный элемент, а не подменяет его.

## Accessibility

Интерактивный компонент обязан иметь имя, предсказуемый фокус и клавиатуру, которая соответствует его роли.

- Имя берётся из текста, `label`, `aria-labelledby` или, для иконки без текста, из `label`.
- `disabled` — нативное состояние, не `aria-disabled` на кликабельном `div`.
- `aria-disabled` используется там, где элемент остаётся в дереве, но не активируется: вкладка, пункт списка, ячейка не применяется.
- Фокус виден в `:focus-visible`. Для полей кольцо стоит на оболочке `:has(:focus-visible)`, чтобы клик мышью не включал клавиатурное кольцо.
- `prefers-reduced-motion` отключает анимации в базовых стилях. `forced-colors` учтён у кнопок, checkbox и switch.

ARIA ставится только на фактическое состояние:

| Атрибут | Где |
| --- | --- |
| `aria-label` / `aria-labelledby` | icon button, dialog, select, tabs, toolbar, tree, grid, split separator |
| `aria-describedby` | hint поля; tooltip указывает на свой `role="tooltip"` |
| `aria-expanded` | select, пункт-папка дерева, пункт меню с вложенным меню |
| `aria-selected` | option, tab, строка grid, пункт дерева |
| `aria-checked` | нативный checkbox; switch — это checkbox с `role="switch"` |
| `aria-disabled` | вкладка и пункт select, которые не являются нативным disabled-контролом |
| `aria-controls` | select → listbox, tab → panel |
| `aria-hidden` | декоративные иконки и скрытая вторичная колонка |
| `aria-modal` | открытый `vui-dialog` |
| `aria-invalid` | input, checkbox, select с `invalid` |
| `aria-activedescendant` | открытый select |

`aria-description` не используется: это не стандартный атрибут. Tooltip связан через `aria-describedby`.

## Клавиатура

Обрабатываются только клавиши, которые следуют из роли.

| Компонент | Клавиши |
| --- | --- |
| Button, icon button | Tab, Enter и Space активируют нативный `button` |
| Input | обычное поле: Tab, ввод, выделение |
| Checkbox, switch | Tab, Space переключает |
| Select | Arrow Up/Down, Home, End, Enter, Space, Escape, набор символов. Стрелка открывает список, Enter фиксирует значение |
| Dialog | Tab не выходит из модального `dialog`. Escape закрывает, если `dismissable` не равен `false` |
| Tooltip | Escape скрывает |
| Tabs | Arrow Left/Right, Home, End. Автоматически выбирает вкладку |
| File tree | Arrow Up/Down/Left/Right, Home, End, PageUp, PageDown, Enter, Space. Ctrl/Cmd+C копирует значение пункта |
| Data grid | Arrow Up/Down/Left/Right, Home, End, PageUp, PageDown. Скрытая вторичная колонка пропускается. Ctrl/Cmd+C копирует текст ячейки |
| Menu | Arrow Up/Down, Home, End, PageUp, PageDown, Arrow Right открывает вложенное меню, Arrow Left закрывает его, Enter и Space выполняют пункт, Escape и Tab закрывают |
| Split panel | стрелки меняют `position` на 2, Shift — на 10, Home и End ставят границы `min` и `max` (по умолчанию 10 и 90) |

Alert, toast, panel, stack, grid и status bar клавиатурного поведения сверх обычного Tab не добавляют. У toast есть кнопка закрытия.

## Focus

Реализация — `src/interaction/focus.ts`. `src/core/focus.ts` только реэкспортирует её.

- Обычный контрол получает фокус через нативный элемент в shadow и `delegatesFocus`.
- Кольцо — `outline: var(--vui-focus-ring)` на `:focus-visible`. Программный фокус внутри меню дополнительно подсвечивает пункт через `:focus`, потому что roving tabindex переносит фокус из обработчика клавиши.
- `openFocusScope()` запоминает `document.activeElement`, если это не `body` и не сам владелец. Вложенные scope закрываются по одному и возвращают фокус на предыдущий уровень.
- Если сфокусированный потомок удалён, верхний scope переносит фокус на следующий доступный элемент внутри владельца.
- `cycleTab()` циклически переносит Tab. У `vui-dialog` он выключен: ловушку делает нативный `<dialog>`.
- `vui-dialog` после открытия фокусирует сам `<dialog>` (`tabindex="-1"`), чтобы имя диалога было объявлено. Следующий Tab идёт по кнопке закрытия и содержимому. Нативный modal dialog не выпускает Tab наружу.

Цикл dialog:

```text
show / open
→ фокус внутри dialog
→ Tab остаётся внутри
→ Escape, кнопка закрытия или клик по backdrop
→ фокус возвращается на элемент, который открыл dialog
```

## Overlay

Один стек: `src/interaction/overlay.ts`. `src/core/overlay.ts` реэкспортирует его. Dialog, select, tooltip, toaster и menu регистрируются в нём. Будущие dropdown, popover, drawer и command palette должны использовать его, а не заводить второй менеджер.

`pushOverlay()` кладёт слой в стек и возвращает функцию закрытия.

- `kind`: `popup` (1000), `modal` (1300), `toast` (1400), `tooltip` (1500). К базе прибавляется позиция в стеке, поэтому более поздний слой того же вида оказывается выше. Переменная на слое — `--vui-overlay-z`, с запасным значением из токена.
- Escape закрывает верхний слой, который можно закрыть. Toast пропускается. Незакрываемый modal или popup останавливает Escape и не закрывает то, что под ним.
- Pointerdown снаружи закрывает верхний `popup` с `dismissOnOutside`. Modal этот жест не перехватывает: backdrop dialog обрабатывает сам dialog.
- `restoreFocus` открывает focus scope и возвращает фокус после снятия со стека. Включён у dialog и menu.
- `group` связывает вложенные слои. Указатель снаружи закрывает всю группу сверху вниз. Escape по-прежнему закрывает только верхний слой. Так закрывается цепочка Dialog → Menu → вложенное меню.
- `lockScroll` ставит `data-vui-scroll-lock` на `<html>`, пока открыт хотя бы один такой слой. Скролл страницы скрыт. У dialog это включено вместе с нативным modal.
- `trapFocus` циклически переносит Tab внутри владельца. У dialog он выключен: ловушку делает платформенный `<dialog>`. Для будущего drawer, у которого нет нативного dialog, ловушка уже есть.
- Несколько слоёв живут в одном стеке. Select, открытый внутри dialog, закрывается первым Escape. Следующий Escape закрывает dialog.

Z-index токены остаются в `src/tokens/tokens.css`: `--vui-z-dropdown`, `--vui-z-sticky`, `--vui-z-overlay`, `--vui-z-dialog`, `--vui-z-toast`, `--vui-z-tooltip`. `placeLayer()` ставит popup у якоря и не выпускает его за viewport.

## Interaction

```text
Component
   ↓
Interaction Primitive
   ↓
DOM / Browser API
```

```text
Application
   ↓
Command / Selection / Data
   ↓
VUI
```

Импорт: `vui/interaction` или именованный импорт из `vui`. Примитивы не регистрируют custom elements. Глобального singleton и event bus нет: приложение создаёт `CommandRegistry` и `ShortcutRegistry` само и вешает shortcut на нужный элемент.

| Модуль | Контракт |
| --- | --- |
| `focus.ts` | `openFocusScope`, `cycleTab`, `focusableElements`, `deepestActiveElement`, `isWithin` |
| `keyboard.ts` | `moveInList`, `stepIndex`, `nextEnabled`, `applyRovingTabIndex`, `isActivation`. Стрелки, Home, End, PageUp, PageDown. Tab остаётся платформенным, кроме `cycleTab` у слоя с `trapFocus` |
| `selection.ts` | `SelectionModel`: `none`, `single`, `multiple`; жесты `replace`, `toggle`, `range`. Идентификатор выбирает компонент. Смысл идентификатора — у приложения |
| `commands.ts` | `Command`: `id`, `label`, `description?`, `icon?`, `enabled`, `visible`, `checked?`, `shortcut?`, `execute`. `CommandRegistry.register / get / list / execute` |
| `shortcuts.ts` | `ShortcutRegistry` на свой `CommandRegistry`. `keys`, `command`, `context?`, `enabled`. `Mod` — Ctrl, на Apple — Meta. Конфликт в одном context отклоняется. Внутренний context побеждает запись без context. Неперехваченная буква из текстового поля не забирается |
| `overlay.ts` | `pushOverlay`, `placeLayer`, `overlayDepth` |
| `context-menu.ts` | `bindContextMenu`: правый щелчок, ContextMenu и Shift+F10. Позицию и меню даёт вызывающий код |
| `drag-drop.ts` | `draggable`, `dropTarget`, `beginDrag`, `completeDrop`, `cancelDrag`. Тип и данные задаёт приложение. Клавиатурный путь — те же `beginDrag` / `completeDrop`, без отдельного gesture engine |
| `clipboard.ts` | `copyText`, `cutText`, `pasteText`, `writeClipboard`, `readClipboard`. Текст уходит в Clipboard API, structured `items` остаются в памяти вызова |
| `pointer.ts` | `trackPointer` для захвата указателя, `pointerClickKind` для click / double / context |

`vui-tabs`, `vui-select`, `vui-file-tree` и `vui-data-grid` ходят по клавиатуре через `keyboard.ts`. Таблица и дерево держат текущий выбор в `SelectionModel` и по-прежнему сообщают его через `selectedId`, `selectedItem` и `change`. Ctrl/Cmd+C копирует видимый текст ячейки или `itemValue`. `vui-split-panel` двигает разделитель через `trackPointer`. `vui-menu` собирает overlay, focus, keyboard и commands.

Горизонтальные стрелки, разделитель split и вложенное меню следуют `dir`. `ArrowLeft` в `rtl` двигает к концу строки, открывает ветку дерева и вложенное меню. Вертикальные стрелки не меняются. `isRtl()` читает вычисленное `direction`, а если движок не применил `dir`, сам атрибут.

Active descendant остаётся только у `vui-select`: фокус держит кнопка, список не забирает его. Остальные композиты используют roving tabindex.

## Responsive

Компонент подстраивается под ширину контейнера. Отдельных mobile-компонентов нет. Тема и плотность от viewport не зависят: Dark + Compact + узкий контейнер допустимы так же, как Light + Comfortable + широкий.

Пороги на `:root`:

- `--vui-layout-narrow` — 22rem;
- `--vui-layout-medium` — 40rem;
- `--vui-field-inline` — 36rem;
- `--vui-overlay-full` — 30rem, полноэкранный dialog. `@media` повторяет эту длину, потому что не читает `var()`.

`@container` не умеет читать `var()`, поэтому в CSS компонентов те же длины записаны явно. JavaScript читает токены через `inlineThreshold()`.

| Viewport / контейнер | Поведение |
| --- | --- |
| wide, шире 40rem | toolbar в одну строку, вторичные колонки grid видны, поле может поставить label рядом с контролом |
| medium, 22–40rem | группы toolbar складываются, вторичные колонки `vui-data-grid` скрываются |
| narrow, до 22rem | row stack переносится, `vui-split-panel` складывается, status bar сжимается |
| viewport до 30rem | `vui-dialog` занимает весь экран |

`vui-tabs` прокручивает список вкладок. `vui-grid` схлопывает колонки через `auto-fit`. Select-список позиционируется по viewport (`position: fixed`), а не по контейнеру поля.

## Theme

Цвета интерфейса задаются семантическими токенами. Hex живёт в primitive palette. Компонент не содержит литералов цвета.

```html
<html data-vui-theme="light | dark | high-contrast | system">
```

`system` следует `prefers-color-scheme`. Тёмные значения в `themes/system.css` совпадают с `themes/dark.css`.

Компонент использует `--vui-color-text`, `--vui-color-background`, `--vui-color-surface`, `--vui-color-border`, `--vui-color-primary`, `--vui-color-danger`, `--vui-color-warning`, `--vui-color-success`, `--vui-color-info`, `--vui-color-focus` и парные hover, active, surface и on-color токены. Фокус — `--vui-focus-ring`. Тени — `--vui-shadow-*`.

Своя тема переопределяет те же custom properties. Новую палитру и новый набор имён заводить не нужно.

`installVuiStyles()` добавляет один элемент `#vui-styles`. CSS-файлы тем можно подключить и отдельно.

## Density

Имена уже приняты в проекте и не переименовываются:

```html
<html data-vui-density="comfortable | compact | dense">
```

Плотность меняет токены размера: `--vui-size-control`, `--vui-space-*`, `--vui-font-size*`, `--vui-row-height`, `--vui-toolbar-height`, `--vui-statusbar-height`, `--vui-panel-padding`, `--vui-icon-size`, радиусы. `--vui-panel-padding` — это `--vui-space-lg`. Остальные высоты chrome заданы в `density.css` один раз на шаг шкалы. Компонент эти токены читает и для другой плотности не переписывается. По умолчанию — `comfortable`.

## Foundation runtime

`src/foundation` — исполняемый слой этих правил. `VuiElement` при подключении вызывает `connectFoundation()` и ставит один набор стилей. Компонент не инициализирует тему сам.

`readFoundation()` читает текущие тему, плотность, semantic и component tokens, motion, z-index tokens и пороги контейнера. `containerBand(width)` возвращает `narrow`, `medium` или `wide`. Полоса зависит только от ширины. Смена темы или плотности её не меняет, и смена ширины не выбирает тему.

```text
Foundation
├── Tokens          readToken, каталог primitive / semantic / component
├── Theme           setTheme / getTheme
├── Density         setDensity / getDensity
├── Responsive      containerBand, пороги
├── Layout          gap, padding, align, justify, overflow
├── Accessibility   prefersReducedMotion, prefersForcedColors, focus ring
├── Motion          --vui-duration, --vui-easing
└── Runtime         connectFoundation, readFoundation
```

Импорт: `vui/runtime`. `vui/foundation` остаётся категорией иконки. Порог в CSS по-прежнему записан явно, потому что `@container` и `@media` не читают `var()`. JavaScript берёт число через runtime, а не второй константой в компоненте.

Z-index tokens читаются здесь. Стек слоёв, Escape и возврат фокуса остаются в `src/interaction/overlay.ts`.

## Контракт компонента

Кроме публичных attributes и событий, каждый новый компонент регистрирует запись:

```ts
registerContract({
  element: 'vui-button',
  className: 'VButton',
  attributes: [],
  events: ['click'],
  slots: [''],
  parts: ['base'],
  methods: [],
  keyboard: ['Tab', 'Enter', 'Space'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'native',
});
```

`events` принимают только `click`, `input`, `change` и `close`. `states` — это то, что компонент реально реализует: `disabled`, `invalid`, и `loading`, если он нужен. Объявленный `loading` обязан выставлять `aria-busy`. Пустой `states` допустим.

`responsive`: `container` или `flow` требуют `min-width: 0` или `max-width: 100%`. `viewport` — для overlay, который ограничен viewport. `focus: 'roving'` означает, что кольцо рисует дочерний элемент, а не stylesheet host.

Lifecycle общий для всех наследников `VuiElement`:

- shadow открывается в конструкторе и заполняется один раз;
- повторное подключение вызывает `sync()` и не пересоздаёт shadow;
- `connectionCount` растёт на каждое подключение;
- `hold(name, dispose)` и `bind(name, target, type, listener)` заменяются по имени и снимаются в `disconnectedCallback`.

Импорт регистрации: `vui/contract`. Контракт есть у каждого custom element, кроме `vui-option`: это light DOM значение select, без shadow. `checkCompliance()` проходит по всему реестру.

## Compliance

`checkCompliance(element, contract)` проверяет подключённый элемент: custom element зарегистрирован, shadow открыт и переживает `remount()`, в CSS нет цветовых литералов, стили ссылаются на Foundation tokens и базовые theme, density и reduced-motion правила, responsive-ограничение на месте, слоты, parts, методы и роль совпадают с записью, reflected properties пишут свои attributes, `disabled` доходит до нативного контрола, `invalid` ставит `aria-invalid`, `loading` ставит `aria-busy`.

Нарушение возвращается строкой. Тест показательного набора падает, если список не пуст. Это путь и для следующего компонента: зарегистрировать контракт и вызвать ту же функцию.

## Композиция

Составной компонент — обычная часть платформы. Он не заводит свой канал связи.

Допустимые направления:

- parent → child: слот, прямой light-DOM ребёнок или свойство, которым родитель владеет сам;
- child → parent: стандартное событие (`click`, `input`, `change`, `close`). Ребёнок не вызывает методы родителя;
- sibling ↔ sibling: только общий атрибут, который читает родитель. Сосед не вызывает соседа.

Каналы записаны в `src/composition`: `slot`, `light-dom`, `property`, `attribute`, `event`. Прямых детей ищет `ownedChildren()`. Select, tabs, file tree и menu пользуются им. `registerComposition()` описывает host, связи и события наружу. `checkComposition()` проверяет слоты, свойства и что клавиатура host совпадает с interaction profile.

| Сценарий | Как собран |
| --- | --- |
| Select → Option | родитель читает прямых `vui-option`. Пункт не знает о select |
| Tabs → Tab → TabPanel | слоты `tab` и `panel`. Связь `panel` / `name` разрешает родитель |
| File tree → TreeItem | прямой ребёнок. Вложенный пункт — тот же parent → child |
| Toast → Toaster | toaster принимает toast слотом. Закрытие — событие `close` |
| Dialog → content / actions | слоты по умолчанию и `footer`. Кнопка остаётся самостоятельным action |
| Data grid → rows / cells | `columns` и `rows` — свойства. Ячейка не элемент и не доменная сущность |
| Toolbar → actions | слоты `start`, по умолчанию и `end`. Протокола toolbar item нет |
| Split panel → panels | слоты `start` и `end`. Дети не знают о `position` |
| Menu → MenuItem | прямой ребёнок. Вложенное меню — `slot="submenu"`. Активация идёт через команду |

Импорт: `vui/composition`.

## Interaction contract

`src/interaction/contract.ts` фиксирует клавиатуру, фокус, выбор и путь команды. Компонент объявляет клавиши в component contract. Profile повторяет тот же список и называет primitive, которым клавиша исполняется.

Клавиши платформы: Tab, Shift+Tab, Arrow keys, Enter, Space, Escape, Home, End, PageUp, PageDown. Другое сочетание в profile не принимается.

Фокус: `native`, `roving`, `trap`, `restore`, `active-descendant`, `nested-overlay`. Roving tabindex ставит `applyRovingTabIndex()`. Ловушка dialog — нативный `<dialog>`. Возврат фокуса и вложенные слои — `pushOverlay()`.

Выбор: `none`, `single`, `multiple`, `range` живут в `SelectionModel`, когда идентификатор не является значением поля. `active` — курсор. Он следует за `select()` и может сдвинуться через `setActive()` отдельно от набора. У select и tabs выбор — отражённый атрибут (`value`, `selected`): это значение поля, а не вторая модель. У data grid курсор ячейки двумерный, а выбранная строка — `SelectionModel`.

Команда:

```text
interaction → command → action
```

`runCommand()` вызывает `CommandRegistry.execute()`. Компонент не держит свою таблицу shortcuts. Shortcuts остаются у приложения.

Разделитель split меняет число `position`. Это не список, поэтому `moveInList()` ему не нужен. Указатель идёт через `trackPointer()`.

## Семейства

Семейство — общий список правил, не базовый класс. Член называет те правила, которые у него есть. `loading` есть у кнопки, потому что действие может ждать. Его не добавляют туда, где ждать нечего.

| Семейство | Правила | Кто входит |
| --- | --- | --- |
| Action | disabled, loading, focus, keyboard, activation, label; icon, если она есть | button, icon button, button group, toggle, link, menu item |
| Field | value, disabled, invalid, required, label, description, focus. Ошибка — это `invalid` и `hint`, отдельного `error` нет | input, textarea, select, checkbox, radio, switch, slider, field, группы |
| Overlay | open, close, Escape, focus restoration, positioning, layering через один стек | dialog, drawer, popover, tooltip, menu, toaster |
| Navigation | roving focus, keyboard, selection | tabs, nav, stepper, file tree, menu, breadcrumbs, pagination |
| Data | keyboard, selection, cursor | data grid, list, properties |
| Feedback | variant, status | alert, empty, badge, toast |
| Layout | общий словарь раскладки | stack, grid, panel и соседи |
| Content | текст и метки | text, chip, kbd |
| Desktop | области без прикладного смысла | shell, window, status bar |

Импорт: `vui/families`. `componentStates` — общий словарь состояний. Поле с собственной подписью — `vui-input`, `vui-textarea`, `vui-select`, `vui-slider`. `vui-field` оборачивает контрол, у которого подписи нет. Группа взаимоисключающего выбора — `vui-radio-group`. Несколько флажков — `vui-checkbox-group`.

Эталонные сценарии Form, Navigation, Data и Overlay проверяют фокус, клавиатуру, disabled, invalid, выбор, слои, тему, плотность и ширину контейнера вместе. Смена темы или плотности не меняет полосу контейнера. Showcase показывает те же сборки и reference UI в разделе Platform.

## Матрица качества

```text
Component
  → Unit          регистрация, properties, клавиатура без раскладки
  → Integration   несколько компонентов: select внутри dialog
  → E2E           showcase и responsive в браузере
  → Accessibility роли, имена, фокус, клавиатура
  → Visual        theme × density × viewport
```

Не каждый layout-компонент обязан иметь все пять слоёв. Button, input, checkbox, switch, select, dialog, tabs, tooltip, data grid и file tree покрываются unit- или e2e-проверкой поведения. Визуальная матрица намеренно короткая:

- Light + Comfortable + desktop;
- Dark + Comfortable + desktop;
- Light + Compact + desktop;
- Dark + Compact + mobile;

Плюс отдельные кадры hover, focus, открытого dialog и меню (фокус, disabled, checked) на desktop и узком viewport. Dense и high-contrast не порождают новых раскладок: dense масштабирует compact, high-contrast меняет те же токены. Их проверяет showcase и unit-тест установки темы.

Состояния в кадре — только существующие: default, hover, focus, disabled, invalid. `active` у кнопки есть, но стабильный кадр `:active` не фиксируется. `loading` есть у кнопки и icon button; отдельный кадр спиннера не фиксируется.

Харнес: `visual.html`. Снимки обновляются сознательно:

```bash
pnpm test:e2e -- tests/e2e/visual.spec.ts --update-snapshots
```

## Сборка и импорты

`pnpm build` собирает ESM с `preserveModules` и декларации через `tsc -p tsconfig.build.json`. Точка входа не импортирует showcase. Селективный импорт не тянет `src/index.ts`. `pnpm check:shake` после сборки сравнивает три бандла: `import 'vui'`, `import 'vui/forms'` и `import 'vui/button'`. Более узкий импорт должен быть меньше. `lucide` остаётся внешней зависимостью.

Стили тем ставятся побочным эффектом при импорте компонента.

## Patterns и shell

Pattern не регистрирует элемент. Это разметка из публичных компонентов в VUI Studio и в `docs/patterns.md`. `vui-shell` — единственная новая раскладка приложения: слоты header, toolbar, nav, main, aside и footer. Ниже 40rem тело складывается в колонку. `collapsed` скрывает навигацию. Shell не интерпретирует детей.

`src/core`, showcase и `src/showcase/studio.ts` не входят в `package.json` `exports`. Стабильный список ключей держит `tests/unit/exports.test.ts`.

Направление текста задаёт `dir` на документе. Компоненты раскладки используют logical properties. Локаль и формат чисел остаются у страницы.
