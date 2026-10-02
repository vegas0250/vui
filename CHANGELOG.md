# Changelog

## Unreleased

- Interaction Layer: фокус, клавиатура, selection, команды, shortcuts, общий overlay, context menu, drag & drop, clipboard и pointer. Граница платформы описана в `PLATFORM.md`.
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
