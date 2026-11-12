# Словарь VUI 1.0

Аудит перед 1.0. Один сценарий — один API. Второе имя ниже не является вторым элементом.

Граница: компонент — primitive. Composition — как части связаны. Pattern — пример страницы в Studio, без своего элемента. Shell — раскладка приложения, без смысла команд.

Каталог документации Web mode выстроен по [Fluent UI Web Controls](https://developer.microsoft.com/en-us/fluentui#/controls/web), не по Fluent 2. Дочерние части (`menu-item`, `nav-item`, `tab`, `option`…) не являются отдельными страницами каталога.

## Уже было

Button, icon button, button group, input, textarea, checkbox, radio, radio group, switch, select, dialog, menu, menu item, popover, tooltip, tabs, breadcrumbs, pagination, toolbar, alert, progress, spinner, skeleton, toast, toaster, panel, container, scroll area, stack, grid, split panel, data grid, file tree, shell, status bar, icon, avatar, badge, separator.

## Доведено в 1.0

| Элемент | Зачем |
| --- | --- |
| `vui-text` | Text, heading, caption, code, label: `variant` и `level` |
| `vui-link` | Ссылка. `variant="button"` — link button, это по-прежнему `<a>` |
| `vui-toggle`, `vui-toggle-group` | Нажатое состояние действия. `multiple` разрешает несколько |
| `vui-field`, `vui-field-group` | Общая подпись, hint и invalid вокруг слота. У input, textarea и select поле уже внутри |
| `vui-checkbox-group` | Несколько флажков, `value` через запятую. Живёт в `vui/checkbox` |
| `vui-slider` | Одно значение. `value-end` включает второй ползунок |
| `vui-nav`, `vui-nav-item` | Боковая и горизонтальная навигация, roving tabindex |
| `vui-stepper`, `vui-step` | Шаги |
| `vui-list`, `vui-list-item` | Список в светлом DOM. Выбор через `SelectionModel`, не через доменную модель |
| `vui-properties`, `vui-property` | Описание и инспектор: подпись и значение |
| `vui-empty` | Пустое состояние |
| `vui-chip`, `vui-kbd`, `vui-avatar-group` | Метка, клавиша, группа аватаров |
| `vui-drawer` | Боковой слой на общем overlay |
| `vui-window` | Заголовок и слот `controls`. Не окно операционной системы |
| `vui-button` `loading` | `aria-busy` и недоступная кнопка, пока действие ждёт |
| `vui-dialog` `alert` | `role="alertdialog"` |
| `vui-alert` `banner` | Полоса на ширину контейнера. `variant` включает `neutral` |
| `vui-input` `type` | `date`, `time`, `datetime-local`, `color`, `file` — нативный контрол |

## Одно API, без второго компонента

| Имя из карты | Что использовать |
| --- | --- |
| Heading, caption, code, label | `vui-text` |
| Link button | `vui-link variant="button"` |
| Search, password, number | `vui-input type` |
| Date, time, datetime, color, file | `vui-input type`. Отдельного календаря нет: его рисует платформа |
| Combobox | `vui-select` |
| Multi-select короткого списка | `vui-checkbox-group` |
| Checkbox / radio | уже есть |
| Field label, description, error | `label` и `hint`. Ошибка — `invalid` плюс `hint`. Атрибута `error` нет |
| Toolbar item | слоты `start` и `end` у `vui-toolbar` |
| Split button | `vui-button-group`: кнопка и `vui-menu` |
| Menu group | соседние пункты и вложенный `vui-menu` |
| Context menu | `vui-menu` и `bindTo()` |
| Modal | `vui-dialog` |
| Alert dialog | `vui-dialog alert` |
| Dropdown | `vui-select`, `vui-menu` или `vui-popover` |
| Tab bar | `vui-tabs` |
| Sidebar | слот `nav` у `vui-shell` и `vui-nav` |
| Tree | `vui-file-tree`. Имя историческое: файловую систему элемент не читает |
| Table, grid row, grid cell | `vui-data-grid`. Строки задаёт страница |
| Card | `vui-panel` |
| Banner | `vui-alert banner` |
| Progress bar | `vui-progress` |
| Toast container | `vui-toaster` |
| Status, indicator | `vui-badge` |
| Inline | `vui-hstack` |
| Command bar, resizable region, split view | `vui-toolbar`, `vui-split-panel` |
| Application shell | `vui-shell` |
| Command palette | pattern: `vui-dialog` и `vui-input` |
| Inspector | `vui-properties` и поля |
| Carousel / slides | `vui-carousel` |
| Lightbox / media viewer | `vui-lightbox` |
| Sidebar / nav menu | `vui-menu inline` или `vui-nav` |

## Fluent UI Web: закрыто / ещё нет

| Fluent UI Web | VUI |
| --- | --- |
| Button, Checkbox, ChoiceGroup, ComboBox/Dropdown, Link, TextField/SearchBox, Slider, SpinButton, Rating, Toggle | `vui-button`, `vui-checkbox`, `vui-radio`, `vui-select`, `vui-link`, `vui-input`, `vui-slider`, `vui-spin-button`, `vui-rating`, `vui-switch` |
| List, DetailsList, Facepile, Persona, DocumentCard | `vui-list`, `vui-data-grid`, `vui-avatar-group`, `vui-persona`, `vui-panel` |
| Breadcrumb, CommandBar, ContextualMenu, Nav, Pivot | `vui-breadcrumbs`, `vui-toolbar`, `vui-menu`, `vui-nav`, `vui-tabs` |
| MessageBar, ProgressIndicator, Shimmer, Spinner | `vui-alert` / `vui-toast`, `vui-progress`, `vui-skeleton`, `vui-spinner` |
| Callout, Dialog/Modal, Panel, ScrollablePane, Tooltip | `vui-popover`, `vui-dialog`, `vui-drawer`, `vui-scroll-area`, `vui-tooltip` |
| Icon, Separator, Stack, Text/Label | `vui-icon`, `vui-separator`, `vui-stack`, `vui-text` / `vui-field` |

Дочерние части (`vui-menu-item`, `vui-nav-item`, …) — не отдельные страницы каталога.

Ещё нет как отдельных хостов (часть закрыта нативным `input` или deferred): ActivityItem, OverflowSet, Coachmark, TeachingBubble, PeoplePicker, ColorPicker, Calendar, DatePicker, TimePicker, Image, Charts, FocusZone.

## Не входит в 1.0

Этого нет, потому что существующего API хватает, либо измерение ещё не показало нужду. Не добавлять заранее.

- Виртуальный список и tree grid. `vui-list` и `vui-data-grid` держат переданные элементы. Виртуализация — после замера в приложении.
- Свой календарь, диапазон дат и цветовая поверхность поверх нативного `input`.
- Отдельные spacer, aspect-ratio, image, markdown и code block. Это примитивы браузера или содержимое страницы.
- Dock и группа окон. Это сборка `vui-shell` и `vui-window`.
- Мобильная копия компонента. Узкая ширина — поведение того же элемента.

Состояния, которые могут встретиться, названы одинаково: `default`, `hover`, `active`, `focus`, `focus-visible`, `disabled`, `readonly`, `loading`, `selected`, `checked`, `pressed`, `expanded`, `open`, `invalid`, `required`, `dragging`, `drop-target`. Компонент реализует только свои. Список — `componentStates` из `vui/families`.
