# Публичные компоненты

Правила контракта — в [ARCHITECTURE.md](../ARCHITECTURE.md). Здесь только то, чем можно пользоваться снаружи.

Общие CSS custom properties — семантические токены (`--vui-color-*`, `--vui-space-*`, `--vui-size-control`, `--vui-font-*`, `--vui-radius*`, `--vui-shadow-*`, `--vui-focus-ring`, `--vui-z-*`). Ни один компонент не добавляет собственный цвет. Строковое property без атрибута равно `''`. Булево property равно наличию атрибута.

`vui/runtime` читает текущий снимок Foundation. `vui/contract` регистрирует и проверяет контракт компонента. `vui/composition` описывает, как host собирает части. `vui/families` перечисляет общие правила Action, Field, Overlay, Navigation и Data. У каждого элемента есть `connectionCount`: число подключений. Shadow при повторном mount не пересоздаётся.

События `click`, `input`, `change` и `close` всплывают и проходят через shadow boundary.

## vui-button

Кнопка действия. Внутри нативный `<button>`.

```html
<vui-button variant="primary" size="medium">Сохранить</vui-button>
```

| Attributes | `variant` primary \| secondary \| ghost \| danger, `size` small \| medium \| large, `type` button \| submit \| reset, `disabled`, `loading`, `name`, `value`, `form` |
| Properties | те же имена, типы `string` и `disabled: boolean` |
| Events | `click` |
| Slots | по умолчанию — текст; `icon` |
| Parts | `base`, `busy` |
| Keyboard | Tab, Enter, Space |
| Accessibility | нативный button, `:focus-visible`, disabled не попадает в Tab |

`variant` и `size` без атрибута выглядят как primary и medium.

## vui-icon-button

Кнопка только с иконкой. Имя для доступности обязательно.

```html
<vui-icon-button name="search" label="Поиск"></vui-icon-button>
```

| Attributes | `name`, `label`, `variant` (по умолчанию прозрачная; также primary, secondary, danger), `size`, `type`, `disabled`, `loading` |
| Properties | те же |
| Events | `click` |
| Slots | нет, иконка задаётся `name` |
| Parts | `base`, `icon`, `busy` |
| Keyboard | Tab, Enter, Space |
| Accessibility | `aria-label` с `label`. Если `label` пуст, используется `name` |

## vui-icon

```html
<vui-icon name="folder"></vui-icon>
<vui-icon name="folder" label="Папка"></vui-icon>
```

| Attributes | `name`, `label` |
| Properties | `name`, `label` |
| Events | нет |
| Slots | нет |
| Parts | `base` |
| Accessibility | без `label` иконка `aria-hidden`. С `label` — `role="img"` |

`registerIcon(name, svg)` добавляет SVG-строку. Набор имён — `iconNames`.

## vui-input

Поле, связанное с формой (`formAssociated`).

```html
<vui-input label="Email" type="email" hint="Рабочий адрес" required></vui-input>
```

| Attributes | `label`, `value`, `type` text \| password \| email \| search \| number \| url \| tel \| date \| time \| datetime-local \| color \| file, `placeholder`, `hint`, `name`, `size` small \| medium \| large, `disabled`, `readonly`, `required`, `invalid` |
| Properties | те же, плюс `value` — текущий текст |
| Events | `input` |
| Slots | `prefix`, `suffix` |
| Parts | `label`, `control`, `input`, `hint` |
| Keyboard | обычное текстовое поле |
| Accessibility | `label` связан с полем. `hint` попадает в `aria-describedby`. `invalid` ставит `aria-invalid="true"`. Пока контейнер уже 36rem, подпись, поле и hint стоят столбцом |

## vui-checkbox

```html
<vui-checkbox name="agree" value="yes">Согласен</vui-checkbox>
```

| Attributes | `checked`, `disabled`, `invalid`, `name`, `value` |
| Properties | `checked`, `disabled`, `invalid`, `name`, `value` |
| Events | `change` |
| Slots | подпись |
| Parts | `input`, `label` |
| Keyboard | Tab, Space |
| Accessibility | нативный checkbox. Имя — текст слота. Отмеченный отправляет `value` или `on` |

## vui-switch

```html
<vui-switch checked label="Уведомления">Уведомления</vui-switch>
```

| Attributes | `checked`, `disabled`, `name`, `value`, `label` |
| Properties | те же |
| Events | `change` |
| Slots | видимая подпись |
| Parts | `input`, `label` |
| Keyboard | Tab, Space |
| Accessibility | checkbox с `role="switch"`. `label` задаёт `aria-label`, если нужна подпись отдельно от слота |

## vui-select

В том же модуле живёт `vui-option`.

```html
<vui-select label="Язык" value="en">
  <vui-option value="en">English</vui-option>
  <vui-option value="ru" disabled>Русский</vui-option>
</vui-select>
```

| vui-select attributes | `label`, `value`, `placeholder`, `name`, `size`, `disabled`, `invalid` |
| Properties | те же; `value` — выбранное значение |
| Events | `change`, когда значение действительно изменилось |
| Slots | дочерние `vui-option` |
| Parts | `label`, `trigger`, `listbox` |
| Keyboard | Arrow Up/Down, Home, End, Enter, Space, Escape, печать префикса |
| Accessibility | trigger — `combobox`, список — `listbox`, пункт — `option` с `aria-selected` и `aria-disabled`. Список закрывается снаружи и по Escape |

`vui-option`: attributes и properties `value`, `label`, `disabled`. `optionValue` — `value` или текст, `optionLabel` — `label` или текст. Событий и слотов нет.

## vui-dialog

Модальное окно на нативном `<dialog>`.

```html
<vui-button id="open">Открыть</vui-button>
<vui-dialog id="dialog" label="Сохранить" size="medium">
  <p>Текст</p>
  <vui-button slot="footer">ОК</vui-button>
</vui-dialog>
<script type="module">
  document.querySelector('#open').addEventListener('click', () => {
    document.querySelector('#dialog').show();
  });
</script>
```

| Attributes | `open`, `label`, `size` small \| medium \| large, `close-label`, `alert`, `dismissable="false"` |
| Properties | `open`, `label`, `size`, `closeLabel`, `dismissable` |
| Methods | `show()`, `close()` |
| Events | `close` |
| Slots | содержимое; `footer` |
| Parts | `dialog`, `surface`, `header`, `title`, `close`, `body`, `footer` |
| Keyboard | Tab внутри окна. Escape закрывает, кроме `dismissable="false"` |
| Accessibility | нативный modal dialog, `aria-labelledby` на заголовок, `aria-modal="true"` пока открыт. Фокус после закрытия возвращается на элемент, который был активен до `show()` |

`dismissable` по умолчанию включён. Свойство `false` или атрибут `dismissable="false"` оставляет только явное `close()`. На узком viewport (до 30rem) окно занимает экран.

## vui-menu

Контекстное и вложенное меню. Слой, фокус, клавиатура и команды берутся из Interaction Layer. Приложение регистрирует команды само.

```html
<vui-menu id="file-menu" label="Файл">
  <vui-menu-item label="Сохранить" command="file.save"></vui-menu-item>
  <vui-menu-item label="Поделиться">
    <vui-menu slot="submenu" label="Поделиться">
      <vui-menu-item label="Копировать ссылку"></vui-menu-item>
    </vui-menu>
  </vui-menu-item>
</vui-menu>
```

```ts
import { CommandRegistry } from 'vui/interaction';

const commands = new CommandRegistry();
commands.register({
  id: 'file.save',
  label: 'Сохранить',
  shortcut: 'Ctrl+S',
  execute: () => save(),
});
menu.commands = commands;
menu.bindTo(target);
menu.showAt(x, y);
```

| vui-menu | attribute и property `label`. Property `commands` — `CommandRegistry` или `null`. Методы `showAt(x, y)`, `close()`, `bindTo(target)`. Событие `close` не всплывает, чтобы внешний dialog не принял его за своё закрытие. Слот — пункты. Part `menu` |
| vui-menu-item | attributes `label`, `command`, `shortcut`, `disabled`, `checked`. Событие `click`. Вложенный `vui-menu` со `slot="submenu"`. Parts `check`, `label`, `shortcut`, `caret` |
| Keyboard | стрелки, Home, End, PageUp, PageDown, Enter, Space, Escape, Tab. В `dir="rtl"` вложенное меню открывается в сторону inline start. Shift+F10 и правый щелчок через `bindTo` |
| Accessibility | `role="menu"` / `menuitem`, `aria-disabled`, `aria-checked` у отмеченного пункта, `aria-haspopup` и `aria-expanded` у пункта с подменю |
| Responsive | меню не шире viewport и прокручивается, если пунктов больше, чем помещается по высоте |

`command` — id из реестра, который приложение положило в `commands`. VUI не создаёт команды `file.save` сам. Пункт без `command` просто шлёт `click`. Отключённая команда (`enabled: false`) не активируется.

## Interaction

Публичные функции без custom element: `import { CommandRegistry, ShortcutRegistry, SelectionModel } from 'vui/interaction'`.

| API | Назначение |
| --- | --- |
| `CommandRegistry` | регистрация и `execute(id)` |
| `ShortcutRegistry` | `register`, `pushContext`, `attach(target)`, `handle` |
| `SelectionModel` | `none` / `single` / `multiple`, жесты `replace`, `toggle`, `range` |
| `openFocusScope` | сохранить и вернуть фокус, вложенные scope |
| `moveInList` / `isRtl` | стрелки списка. `rtl` разворачивает горизонтальные стрелки по `dir` |
| `pushOverlay` / `placeLayer` | стек слоёв и позиция popup |
| `bindContextMenu` | правый щелчок и Shift+F10 |
| `draggable` / `dropTarget` | перенос. `beginDrag` и `completeDrop` — тот же контракт с клавиатуры |
| `copyText` / `cutText` / `pasteText` | текст. `writeClipboard({ items })` — structured data рядом с текстом |

Реестры не глобальные. Shortcut с тем же аккордом в том же `context` регистрировать нельзя. Разные context могут делить `Ctrl+S`.

## vui-tabs

```html
<vui-tabs label="Разделы">
  <vui-tab slot="tab" panel="one">Один</vui-tab>
  <vui-tab slot="tab" panel="two">Два</vui-tab>
  <vui-tab-panel slot="panel" name="one">Первый</vui-tab-panel>
  <vui-tab-panel slot="panel" name="two">Второй</vui-tab-panel>
</vui-tabs>
```

| vui-tabs | attribute и property `label`. Слоты `tab` и `panel`. Part `tablist` |
| vui-tab | `panel`, `close-label`, `selected`, `disabled`, `closable`. Part `label` и `close`. Роль `tab`. `closable` шлёт `close` и не выбирает вкладку |
| vui-tab-panel | `name`, `selected`. Part `panel`. Роль `tabpanel` |
| Events | нет, выбор записан в `selected` |
| Keyboard | Arrow Left/Right, Home, End. В `dir="rtl"` стрелки влево и вправо меняются местами |
| Accessibility | `tablist` / `tab` / `tabpanel`, `aria-selected`, `aria-controls`, `aria-disabled` на выключенной вкладке. Список вкладок прокручивается, а не сжимает подписи |

## vui-tooltip

```html
<vui-tooltip text="Подробнее" placement="top">
  <vui-button>Hint</vui-button>
</vui-tooltip>
```

| Attributes | `text`, `placement` top \| bottom |
| Properties | `text`, `placement` |
| Events | нет |
| Slots | триггер |
| Parts | `tooltip` |
| Keyboard | Escape скрывает |
| Accessibility | `role="tooltip"`. Пока подсказка видна, у сфокусированного элемента внутри стоит `aria-describedby` |

Появляется по hover и focus.

## vui-alert

```html
<vui-alert variant="warning" closable close-label="Закрыть">Проверьте данные</vui-alert>
```

| Attributes | `variant` info \| success \| warning \| danger, `closable`, `close-label` |
| Properties | `variant`, `closable`, `closeLabel` |
| Events | `close` после скрытия |
| Slots | текст |
| Parts | `alert`, `icon`, `content`, `close` |
| Keyboard | Tab на кнопку закрытия, если `closable` |
| Accessibility | `status`, для warning и danger — `alert` |

## vui-toast

```html
<vui-toast variant="success" heading="Сохранено" duration="0">Готово</vui-toast>
```

| Attributes | `variant` info \| success \| warning \| danger, `heading`, `duration`, `close-label` |
| Properties | `variant`, `heading`, `duration`, `closeLabel` |
| Methods | `start()`, `dismiss()` |
| Events | `close` |
| Slots | сообщение |
| Parts | `toast`, `icon`, `title`, `message`, `close` |
| Keyboard | Tab на закрытие. Escape toast не закрывает |
| Accessibility | warning и danger — `alert`, остальные — `status`. Кнопка закрытия имеет имя |

`duration="0"` не скрывает toast сам. `toast('Текст')` и `toast({ title, message, variant, duration })` показывают его в `vui-toaster`, создавая контейнер при необходимости. Toaster фиксирован в нижнем правом углу и не закрывается по Escape.

## vui-toolbar

```html
<vui-toolbar label="Главная">
  <vui-button slot="start">Файл</vui-button>
  <span>Центр</span>
  <vui-icon-button slot="end" name="search" label="Поиск"></vui-icon-button>
</vui-toolbar>
```

| Attributes | `label`, `wrap` |
| Properties | `label`, `wrap` |
| Events | нет |
| Slots | `start`, по умолчанию, `end` |
| Parts | `bar` |
| Accessibility | `role="toolbar"` и `aria-label`. До 40rem каждая группа занимает свою строку |

## vui-panel

Нейтральная поверхность: фон, граница, радиус и тень из tokens. Это контейнер, не сценарий приложения.

| Attributes | `heading`, `padding` 2xs \| xs \| sm \| md \| lg \| xl \| 2xl, `overflow` visible \| auto \| hidden \| scroll |
| Properties | те же |
| Events | нет |
| Slots | `header`, содержимое, `footer` |
| Parts | `panel`, `header`, `title`, `body`, `footer` |
| Accessibility | заголовок — `h2`, если не подставлен свой `header` |
| Responsive | `min-width: 0`, `max-width: 100%`. Тело прокручивается, пока `overflow` не задан иначе |

Без `padding` отступ равен `--vui-panel-padding`.

## vui-stack, vui-hstack, vui-vstack

| Attributes | `gap` и `padding` 2xs \| xs \| sm \| md \| lg \| xl \| 2xl, `align` start \| center \| end \| stretch \| baseline, `justify` start \| center \| end \| space-between \| space-around, `wrap`, `direction` row \| column, `overflow` visible \| auto \| hidden \| scroll |
| Properties | те же; `wrap` — boolean |
| Events | нет |
| Slots | дети |
| Keyboard | нет |
| Responsive | горизонтальный stack переносит детей на ширине до `--vui-layout-narrow` |

`vui-hstack` по умолчанию row, `vui-vstack` и `vui-stack` — column. Без `padding` отступа нет. Без `overflow` содержимое видимо.

## vui-grid

| Attributes | `columns` 1–12, `min` (px, rem, em, %), `gap`, `padding`, `align`, `justify`, `overflow` |
| Properties | те же строки |
| Events | нет |
| Slots | дети |
| Responsive | `columns` — максимум. Треки схлопываются через `auto-fit` и `min(100%, ...)` |

`gap`, `padding`, `align`, `justify` и `overflow` значат то же, что у stack.

## vui-split-panel

```html
<vui-split-panel label="Размер" position="40" min="15" max="70">
  <div slot="start">Лево</div>
  <div slot="end">Право</div>
</vui-split-panel>
```

| Attributes | `orientation` horizontal \| vertical, `position`, `min`, `max`, `label`, `overflow` |
| Properties | `orientation`, `label`, `overflow`, `position`, `min`, `max`. Числа. Без `min` и `max` позиция остаётся в 10–90 |
| Events | нет |
| Slots | `start`, `end` |
| Parts | `split`, `start`, `separator`, `end` |
| Keyboard | стрелки меняют позицию на 2, Shift — на 10, Home и End — границы `min` и `max` |
| Accessibility | separator с `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-orientation`, `aria-label` |
| Responsive | горизонтальная панель складывается уже `--vui-layout-narrow`. Вложенный split меняет только свою позицию |

## vui-titlebar

Рамка окна приложения. Системные кнопки сворачивания сюда не входят: их рисует сама панель и шлёт события наружу.

```html
<vui-titlebar label="Vortex" minimize-label="Свернуть" maximize-label="Развернуть" restore-label="Восстановить" close-label="Закрыть">
  <vui-icon slot="icon" name="folder"></vui-icon>
</vui-titlebar>
```

| Attributes | `label`, `minimize-label`, `maximize-label`, `restore-label`, `close-label`, `maximized` |
| Events | `minimize`, `maximize`, `close`. Двойной щелчок по заголовку тоже шлёт `maximize` |
| Slots | `icon`, `tabs`, `tools` |
| Parts | `bar`, `icon`, `tabs`, `title`, `tools`, `controls`, `minimize`, `maximize`, `close` |

`maximized` меняет значок средней кнопки. Область заголовка перетаскивает окно (`app-region: drag`), кнопки и слоты `tabs` и `tools` — нет. Слот `tabs` прячет текстовый заголовок и сажает полосу вкладок в верхний ряд.

## vui-status-bar

| Attributes | `label` |
| Properties | `label` |
| Events | нет |
| Slots | по умолчанию, `end` |
| Parts | `bar` |
| Accessibility | группа с `aria-label`. Содержимое переносится, а не растягивает страницу |

## vui-file-tree

```html
<vui-file-tree label="Файлы">
  <vui-tree-item label="src" kind="folder" expanded>
    <vui-tree-item label="button.ts" value="src/button.ts"></vui-tree-item>
  </vui-tree-item>
</vui-file-tree>
```

| vui-file-tree | `label`. Событие `change`. Слот — пункты. Part `tree`. Свойство `selectedItem` |
| vui-tree-item | attributes `label`, `kind` file \| folder, `expanded`, `selected`, `value`. Properties `label`, `kind`, `expanded`, `selected`. `itemValue` — `value` или `label`. Parts `row`, `icon`, `label` |
| Keyboard | Arrow Up/Down/Left/Right, Home, End, PageUp, PageDown, Enter, Space. Ctrl/Cmd+C копирует `itemValue` |
| Accessibility | `tree` / `treeitem`, `aria-expanded` у папки, `aria-selected` |

## vui-data-grid

```html
<vui-data-grid label="Компоненты"></vui-data-grid>
```

```ts
grid.columns = [
  { key: 'name', title: 'Имя' },
  { key: 'owner', title: 'Владелец', priority: 'secondary' },
];
grid.rows = [{ id: '1', name: 'Button', owner: 'Core' }];
grid.selectedId = '1';
```

| Attributes | `label`, `empty-label`, `selected`, `multiple`, `fill` |
| Properties | `label`, `emptyLabel`, `selectedId`, `selectedIds`, `columns`, `rows`, `multiple`, `fill` |
| Events | `change` при смене набора выбранных строк пользователем |
| Slots | нет, данные задаются свойствами |
| Parts | `frame` |
| Keyboard | стрелки, Home, End, PageUp, PageDown. Ctrl/Cmd+C копирует текст активной ячейки. С `multiple` Shift расширяет диапазон, Ctrl/Cmd со стрелкой двигает курсор, Ctrl/Cmd+Space переключает строку |
| Accessibility | `role="grid"`, `aria-rowcount`, `aria-multiselectable`, `aria-selected` на строке. Фокус ячейки — `:focus-visible` |
| Responsive | горизонтальная прокрутка. Колонка `priority: "secondary"` скрывается на ширине до `--vui-layout-medium`, и клавиатура её пропускает. `fill` отдаёт таблице высоту родителя, и прокрутка идёт внутри `frame` |

`columns`: `{ key, title, width?, align?: start | center | end, priority?: primary | secondary, iconKey? }`. `iconKey` — поле строки с именем иконки VUI, оно рисуется перед текстом ячейки. `width` — только простое число с `px`, `rem`, `em` или `%`. `rows`: `{ id, [key]: string }`.

`selectedIds` — массив id выбранных строк. Это свойство, не атрибут: id может содержать запятую. Запись `selectedIds` и `selectedId` не шлёт `change`. `selected` остаётся id активной строки.

От 100 строк таблица держит в DOM только окно вокруг прокрутки и `aria-rowindex` абсолютной строки. `fill` нужен, чтобы окно считалось по высоте родителя, а не по высоте всех строк.

## vui-button-group

Группа действий. Дети остаются обычными кнопками.

| Attributes | `label`, `orientation` horizontal \| vertical, `disabled` |
| Events | нет |
| Slots | по умолчанию |
| Parts | `group` |
| Keyboard | Tab по детям. `disabled` ставит `inert` на группу |

## vui-textarea

Многострочное поле. Контракт поля такой же, как у `vui-input`: `label`, `value`, `hint`, `invalid`, `disabled`, `readonly`, `required`, `name`, плюс `rows`. События `input` и `change`. Parts `label`, `control`, `input`, `hint`.

## vui-radio

| vui-radio | `checked`, `name`, `value`, `disabled`, `invalid`. Слот — подпись. Событие `change` |
| vui-radio-group | `label`, `name`, `value`, `hint`, `disabled`, `invalid`, `required`. Стрелки переносят выбор между прямыми `vui-radio` |

Одинаковое `name` снимает `checked` с остальных `vui-radio`. Группа копирует своё `name` на прямых детей.

## vui-badge

`variant`: neutral, info, success, warning, danger. Слот — текст. Part `badge`.

## vui-avatar

`label` — доступное имя и источник инициалов, если слот пуст. `size`: small, medium, large. Parts `avatar`, `initials`.

## vui-separator

`orientation` horizontal \| vertical. Без `label` разделитель декоративный (`aria-hidden`). С `label` это `role="separator"`. Part `rule`.

## vui-progress

`label`, `value`, `max`. Без `value` индикатор неопределённый и `aria-busy`. Part `track` — `progressbar`, part `bar`.

## vui-spinner

`label`, по умолчанию Loading, если в слоте нет текста. `role="status"`. Parts `spinner`, `mark`, `label`.

## vui-skeleton

Декоративный блок. `variant`: block, text, circle. На host стоит `aria-hidden`.

## vui-popover

Якорь — слот по умолчанию, содержимое — `slot="panel"`. `open`, `label`, `placement` bottom \| top. Методы `show()` и `close()`. Событие `close`. Слой — общий overlay: Escape и указатель снаружи закрывают, фокус возвращается.

## vui-breadcrumbs

`label` — имя `nav`. Дети — светлый DOM. Текущую страницу страница помечает `aria-current="page"`. Part `nav`, `list`.

## vui-pagination

`label`, `page`, `pages`. Событие `change`. Клавиатура кнопок — Tab, Enter, Space. Part `nav`, `prev`, `next`, `pages`.

## vui-scroll-area

Слот прокручивается. `label` — имя области. Стрелки, Home, End, PageUp, PageDown. Горизонталь учитывает `dir`. Part `viewport`.

## vui-container

Ограничивает ширину содержимого: `size` small \| medium \| large. `padding` — шаг layout. Part `body`.

## vui-shell

Раскладка приложения. Слоты: `header`, `toolbar`, `nav`, по умолчанию, `aside`, `footer`.

| Attributes | `label`, `nav-label`, `aside-label`, `skip-label`, `resize-label`, `aside-expand-label`, `aside-collapse-label`, `collapsed`, `aside-collapsed` |
| Parts | `shell`, `skip`, `header`, `toolbar`, `body`, `nav`, `nav-resize`, `main`, `aside`, `aside-toggle`, `footer` |
| Keyboard | Tab. Ссылка skip переносит фокус в main. Стрелки на `nav-resize` меняют ширину левой панели |
| Responsive | ниже 40rem колонки складываются. `collapsed` скрывает nav. `aside-collapsed` прячет правую панель и оставляет стрелку. Слот `main` растягивается на оставшуюся высоту, чтобы вложенный вид мог прокручиваться сам |

Пустой слот скрывает свою область. Shell не читает содержимое слотов.

## vui-text

Текст. `variant`: body, heading, caption, code, label. У heading `level` 1–6 задаёт `aria-level`. Размеры 1–3 берут `--vui-heading-*`, остальные — размер текста. `muted`, `truncate`. Part `text`.

## vui-link

Ссылка. `href`, `target`, `rel`, `disabled`, `variant` inline или button. `target="_blank"` получает `rel="noopener noreferrer"`, если свой `rel` не задан. `disabled` ставит `aria-disabled` и не переходит. Part `link`.

## vui-kbd

Клавиша. Слот — подпись. Part `kbd`.

## vui-chip

Метка. `variant` neutral, info, success, warning, danger. `removable` показывает кнопку. `close-label`. Событие `close`. Parts `chip`, `remove`.

## vui-avatar-group

Ряд аватаров. `label` — имя группы. Part `group`.

## vui-toggle

Кнопка с `aria-pressed`. `value`, `pressed`, `disabled`. События `click` и `change`. Внутри `vui-toggle-group` выбор ведёт группа.

## vui-toggle-group

`label`, `value`, `orientation` horizontal или vertical, `disabled`, `multiple`. Событие `change`. Стрелки двигают выбор. Узкий контейнер складывает ряд. Part `group`. `vui-toggle` — прямые дети.

## vui-field

Подпись, слот контрола и hint. `label`, `hint`, `disabled`, `invalid`, `required`. `invalid` красит hint и ставит `aria-invalid`. Отдельного `error` нет. Parts `field`, `label`, `control`, `hint`. На ширине от 36rem подпись встаёт рядом, как у `vui-input`.

## vui-field-group

`fieldset`. `label`, `hint`, `disabled`. Parts `group`, `label`, `body`, `hint`.

## vui-checkbox-group

Как radio group, но можно отметить несколько. `value` — значения через запятую. Модуль `vui/checkbox`.

## vui-slider

`label`, `value`, `min`, `max`, `step`, `hint`, `disabled`, `invalid`. `value-end` показывает второй ползунок. События `input` и `change`. Parts `label`, `control`, `input`, `end`, `hint`.

## vui-nav

`label`, `orientation` vertical или horizontal. Дети `vui-nav-item`: `href`, `selected`, `disabled`. Стрелки меняют текущий пункт (`aria-current="page"`). Событие `change`. Уже 22rem ряд становится столбцом.

## vui-stepper

`label`, `value`. Дети `vui-step`: `value`, `selected`, `disabled`. Текущий шаг — `aria-current="step"`. Событие `change`.

## vui-list

`label`, `value`, `multiple`. Дети `vui-list-item`: `value`, `selected`, `disabled`. Стрелки выбирают. С `multiple` Shift расширяет диапазон, Ctrl или Meta переключает пункт. Идентификатор — `value` пункта, не доменная сущность. Событие `change`. Part `list` — `listbox`.

## vui-properties

`label`. Дети `vui-property` с `label` и слотом значения. Уже 22rem подпись встаёт над значением.

## vui-empty

`heading`, `label`. Слот по умолчанию и `action`. `role="status"`. Parts `empty`, `heading`, `body`, `action`.

## vui-drawer

Боковая панель на нативном dialog и общем стеке overlay. `open`, `label`, `placement` end или start, `close-label`, `dismissable="false"`. Методы `show()` и `close()`. Событие `close`. Слоты по умолчанию и `footer`. До 30rem занимает ширину экрана.

## vui-window

Рамка с заголовком. `label`. Слот `controls` — кнопки страницы, не системные кнопки окна. Parts `window`, `header`, `title`, `controls`, `body`.

## Дополнения существующих элементов

`vui-button` и `vui-icon-button` принимают `loading`: кнопка занята (`aria-busy`) и не активируется.

`vui-dialog alert` ставит `role="alertdialog"`.

`vui-alert` принимает `banner` и `variant="neutral"`.

`vui-input` дополнительно принимает `type` date, time, datetime-local, color и file.

`vui-checkbox` и `vui-switch` шлют `change`, как и остальные поля.
