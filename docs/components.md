# Публичные компоненты

Правила контракта — в [ARCHITECTURE.md](../ARCHITECTURE.md). Здесь только то, чем можно пользоваться снаружи.

Общие CSS custom properties — семантические токены (`--vui-color-*`, `--vui-space-*`, `--vui-size-control`, `--vui-font-*`, `--vui-radius*`, `--vui-shadow-*`, `--vui-focus-ring`, `--vui-z-*`). Ни один компонент не добавляет собственный цвет. Строковое property без атрибута равно `''`. Булево property равно наличию атрибута.

События `click`, `input`, `change` и `close` всплывают и проходят через shadow boundary.

## vui-button

Кнопка действия. Внутри нативный `<button>`.

```html
<vui-button variant="primary" size="medium">Сохранить</vui-button>
```

| Attributes | `variant` primary \| secondary \| ghost \| danger, `size` small \| medium \| large, `type` button \| submit \| reset, `disabled`, `name`, `value`, `form` |
| Properties | те же имена, типы `string` и `disabled: boolean` |
| Events | `click` |
| Slots | по умолчанию — текст; `icon` |
| Parts | `base` |
| Keyboard | Tab, Enter, Space |
| Accessibility | нативный button, `:focus-visible`, disabled не попадает в Tab |

`variant` и `size` без атрибута выглядят как primary и medium.

## vui-icon-button

Кнопка только с иконкой. Имя для доступности обязательно.

```html
<vui-icon-button name="search" label="Поиск"></vui-icon-button>
```

| Attributes | `name`, `label`, `variant` (по умолчанию прозрачная; также primary, secondary, danger), `size`, `type`, `disabled` |
| Properties | те же |
| Events | `click` |
| Slots | нет, иконка задаётся `name` |
| Parts | `base`, `icon` |
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

| Attributes | `label`, `value`, `type` text \| password \| email \| search \| number \| url \| tel, `placeholder`, `hint`, `name`, `size` small \| medium \| large, `disabled`, `readonly`, `required`, `invalid` |
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

| Attributes | `open`, `label`, `size` small \| medium \| large, `close-label`, `dismissable="false"` |
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
| Keyboard | стрелки, Home, End, PageUp, PageDown, Enter, Space, Escape, Tab. Shift+F10 и правый щелчок через `bindTo` |
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
| vui-tab | `panel`, `selected`, `disabled` и те же properties. Part `label`. Роль `tab` |
| vui-tab-panel | `name`, `selected`. Part `panel`. Роль `tabpanel` |
| Events | нет, выбор записан в `selected` |
| Keyboard | Arrow Left/Right, Home, End |
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

| Attributes | `heading` |
| Properties | `heading` |
| Events | нет |
| Slots | `header`, содержимое, `footer` |
| Parts | `panel`, `header`, `title`, `body`, `footer` |
| Accessibility | заголовок — `h2`, если не подставлен свой `header` |

## vui-stack, vui-hstack, vui-vstack

| Attributes | `gap` 2xs \| xs \| sm \| md \| lg \| xl \| 2xl, `align` start \| center \| end \| stretch \| baseline, `justify` start \| center \| end \| space-between \| space-around, `wrap`, `direction` row \| column |
| Properties | те же; `wrap` — boolean |
| Events | нет |
| Slots | дети |
| Keyboard | нет |
| Responsive | горизонтальный stack переносит детей на ширине до `--vui-layout-narrow` |

`vui-hstack` по умолчанию row, `vui-vstack` и `vui-stack` — column.

## vui-grid

| Attributes | `columns` 1–12, `min` (px, rem, em, %), `gap` |
| Properties | `columns`, `min`, `gap` — строки |
| Events | нет |
| Slots | дети |
| Responsive | `columns` — максимум. Треки схлопываются через `auto-fit` и `min(100%, ...)` |

## vui-split-panel

```html
<vui-split-panel label="Размер" position="40">
  <div slot="start">Лево</div>
  <div slot="end">Право</div>
</vui-split-panel>
```

| Attributes | `orientation` horizontal \| vertical, `position`, `label` |
| Properties | `orientation`, `label`, `position` — число от 10 до 90 |
| Events | нет |
| Slots | `start`, `end` |
| Parts | `split`, `separator` |
| Keyboard | стрелки, Shift+стрелки, Home, End |
| Accessibility | separator с `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-orientation`, `aria-label` |
| Responsive | горизонтальная панель складывается уже `--vui-layout-narrow` |

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

| Attributes | `label`, `empty-label`, `selected` |
| Properties | `label`, `emptyLabel`, `selectedId`, `columns`, `rows` |
| Events | `change` при смене выбранной строки |
| Slots | нет, данные задаются свойствами |
| Parts | `frame` |
| Keyboard | стрелки, Home, End, PageUp, PageDown. Ctrl/Cmd+C копирует текст активной ячейки |
| Accessibility | `role="grid"`, `aria-rowcount`, `aria-selected` на строке. Фокус ячейки — `:focus-visible` |
| Responsive | горизонтальная прокрутка. Колонка `priority: "secondary"` скрывается на ширине до `--vui-layout-medium`, и клавиатура её пропускает |

`columns`: `{ key, title, width?, align?: start | center | end, priority?: primary | secondary }`. `width` — только простое число с `px`, `rem`, `em` или `%`. `rows`: `{ id, [key]: string }`.
