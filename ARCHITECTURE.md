# Архитектура VUI

VUI — библиотека Web Components. Один и тот же компонент работает в обычном HTML, SPA и Electron. Vue, React, Angular и Svelte в ядро не входят.

Публичный контракт важнее внутренней реализации. Реализацию можно менять. Уже опубликованные attributes, properties, events, slots и CSS parts нельзя менять молча: изменение описывается в этом документе и в `CHANGELOG.md`.

Не добавляйте второй способ сделать то же самое. Не вводите DI, event bus и доменные слои: общего базового класса, отражения атрибутов и стека overlay достаточно.

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
- Исключения, которые уже были в API, сохранены: `VInput.value` и `VSelect.value` держат текущее значение; `checked` у checkbox и switch; `VDataGrid.columns`, `rows`, `selectedId`; `VSplitPanel.position` — число 10–90; `VDialog.dismissable` означает «можно закрыть снаружи», поэтому `dismissable="false"` выключает закрытие, а отсутствие атрибута оставляет его включённым; `VTreeItem.itemValue` — значение элемента или, если атрибута `value` нет, его `label`.

Общий механизм — `src/core/reflect.ts`. Свойство не добавляется компоненту, которому оно не нужно. `loading` нет ни у одного текущего компонента, и добавлять его «для единообразия» не нужно.

### Events

Сначала стандартные события: `click`, `input`, `change`, `close`. Они всплывают и composed, поэтому слушатель на custom element их получает. Своё имя события — только когда стандартного нет. Сейчас таких нет.

### Slots и parts

Слот без `name` — основное содержимое. Именованные слоты перечислены в каталоге. `part` — стабильная точка для внешней стилизации. Новые части добавляются как публичный API.

### CSS custom properties

Компоненты не публикуют собственные цветовые переменные. Они читают токены темы и плотности. Исключение для раскладки: `vui-split-panel` выставляет `--vui-split` из `position`. Менять эту переменную снаружи не нужно.

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
| `aria-expanded` | select, пункт-папка дерева |
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
| File tree | Arrow Up/Down/Left/Right, Home, End, Enter, Space |
| Data grid | Arrow Up/Down/Left/Right, Home, End. Скрытая вторичная колонка пропускается |
| Split panel | стрелки меняют `position` на 2, Shift — на 10, Home = 10, End = 90 |

Alert, toast, panel, stack, grid и status bar клавиатурного поведения сверх обычного Tab не добавляют. У toast есть кнопка закрытия.

## Focus

- Обычный контрол получает фокус через нативный элемент в shadow и `delegatesFocus`.
- Кольцо — `outline: var(--vui-focus-ring)` на `:focus-visible`.
- Overlay при открытии запоминает `document.activeElement`, если это не `body` и не сам overlay.
- Модальный слой возвращает фокус туда после закрытия.
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

Один стек: `src/core/overlay.ts`. Это не компонент и не публичный пакетный экспорт. Dialog, select, tooltip и toaster уже регистрируются в нём. Будущие dropdown, popover, drawer, context menu и command palette должны использовать его, а не заводить второй менеджер.

`pushOverlay()` кладёт слой в стек и возвращает функцию закрытия.

- `kind`: `popup` (1000), `modal` (1300), `toast` (1400), `tooltip` (1500). К базе прибавляется позиция в стеке, поэтому более поздний слой того же вида оказывается выше. Переменная на слое — `--vui-overlay-z`, с запасным значением из токена.
- Escape закрывает верхний слой, который можно закрыть. Toast пропускается. Незакрываемый modal или popup останавливает Escape и не закрывает то, что под ним.
- Pointerdown снаружи закрывает верхний `popup` с `dismissOnOutside`. Modal этот жест не перехватывает: backdrop dialog обрабатывает сам dialog.
- `restoreFocus` запоминает предыдущий элемент и возвращает фокус после снятия со стека. Включён у dialog.
- `lockScroll` ставит `data-vui-scroll-lock` на `<html>`, пока открыт хотя бы один такой слой. Скролл страницы скрыт. У dialog это включено вместе с нативным modal.
- `trapFocus` циклически переносит Tab внутри владельца. У dialog он выключен: ловушку делает платформенный `<dialog>`. Для будущего drawer, у которого нет нативного dialog, ловушка уже есть.
- Несколько слоёв живут в одном стеке. Select, открытый внутри dialog, закрывается первым Escape. Следующий Escape закрывает dialog.

Z-index токены остаются в `src/tokens/tokens.css`: `--vui-z-dropdown`, `--vui-z-sticky`, `--vui-z-overlay`, `--vui-z-dialog`, `--vui-z-toast`, `--vui-z-tooltip`.

## Responsive

Компонент подстраивается под ширину контейнера. Отдельных mobile-компонентов нет. Тема и плотность от viewport не зависят: Dark + Compact + узкий контейнер допустимы так же, как Light + Comfortable + широкий.

Пороги на `:root`:

- `--vui-layout-narrow` — 22rem;
- `--vui-layout-medium` — 40rem;
- `--vui-field-inline` — 36rem.

`@container` не умеет читать `var()`, поэтому в CSS компонентов те же длины записаны явно. JavaScript читает токены через `inlineThreshold()`.

| Viewport / контейнер | Поведение |
| --- | --- |
| wide, шире 40rem | toolbar в одну строку, вторичные колонки grid видны, поле может поставить label рядом с контролом |
| medium, 22–40rem | группы toolbar складываются, вторичные колонки `vui-data-grid` скрываются |
| narrow, до 22rem | row stack переносится, `vui-split-panel` складывается, status bar сжимается |
| viewport до 30rem | `vui-dialog` занимает весь экран |

`vui-tabs` прокручивает список вкладок. `vui-grid` схлопывает колонки через `auto-fit`. Select-список позиционируется по viewport (`position: fixed`), а не по контейнеру поля.

## Theme

Цвета интерфейса задаются семантическими токенами, не литералами в компоненте.

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

Плотность меняет токены размера: `--vui-size-control`, `--vui-space-*`, `--vui-font-size*`, `--vui-row-height`, `--vui-toolbar-height`, `--vui-statusbar-height`, `--vui-panel-padding`, `--vui-icon-size`, радиусы. Компонент эти токены читает и для другой плотности не переписывается. По умолчанию — `comfortable`.

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

Плюс отдельные кадры hover, focus и открытого dialog на desktop и mobile. Dense и high-contrast не порождают новых раскладок: dense масштабирует compact, high-contrast меняет те же токены. Их проверяет showcase и unit-тест установки темы.

Состояния в кадре — только существующие: default, hover, focus, disabled, invalid. `active` у кнопки есть, но стабильный кадр `:active` не фиксируется. `loading` в библиотеке нет.

Харнес: `visual.html`. Снимки обновляются сознательно:

```bash
pnpm test:e2e -- tests/e2e/visual.spec.ts --update-snapshots
```

## Сборка и импорты

`pnpm build` собирает ESM с `preserveModules` и декларации через `tsc -p tsconfig.build.json`. Точка входа не импортирует showcase. Селективный импорт не тянет `src/index.ts`.

Стили тем ставятся побочным эффектом при импорте компонента.
