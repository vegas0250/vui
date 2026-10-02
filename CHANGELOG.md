# Changelog

## Unreleased

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
