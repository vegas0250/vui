# Patterns

Pattern — не компонент. Это пример, как собрать типовой экран из публичного API.

| Задача | Что брать |
| --- | --- |
| Кнопка, поле, диалог, таблица | компонент |
| Как поле, вкладка и диалог связаны | composition |
| Форма, настройки, логин, list/detail, поиск, палитра команд, экран данных | pattern: скопировать сборку из Studio |
| Шапка, навигация, основная область, статус | `vui-shell` |
| Смысл команды, маршрут, файлы, учётная запись | приложение, не VUI |

У pattern нет своего custom element, нет регистрации и нет отдельного export. Studio (`pnpm dev`) содержит рабочие сборки:

- Form, Login, Settings, Search, List / detail, Command palette;
- Application Shell;
- Platform Validation: shell, toolbar, search, tree, data grid, detail, dialog, context menu, toast, status bar.

Фильтрация строк в Platform Validation живёт в странице студии: поле пишет `value`, страница заново задаёт `rows`. Таблица не знает запрос.

Командная палитра — `vui-dialog` и `vui-input`, не новый виджет. Контекстное меню — `vui-menu` и `bindTo()`. Карточка — `vui-panel`. Выпадающий список значений — `vui-select`. Меню действий — `vui-menu`. Произвольный якорь — `vui-popover`. Полоса команд — `vui-toolbar`. Изменяемая область — `vui-split-panel`. Окно приложения — `vui-shell`; модальное окно — `vui-dialog`; боковая панель — `vui-drawer`.

Дерево — `vui-file-tree`. Оно показывает переданные пункты и не читает файловую систему. Заголовок рабочей поверхности — `vui-window`. Инспектор — `vui-properties`. Пустой результат — `vui-empty`. Полная карта «имя из словаря → элемент» — в [vocabulary.md](vocabulary.md).

Сборки, которые Studio показывает целиком:

- Form: поле, подпись, hint, invalid;
- Search: `vui-input type="search"`, фильтр и действия страницы;
- Navigation: `vui-nav` внутри слота shell;
- Data: toolbar, таблица, пагинация, пустое состояние;
- Settings: группа полей и сохранение;
- Desktop: shell, sidebar, split, tree, grid, inspector, status bar.
