# Patterns

Pattern — не компонент. Это пример, как собрать типовой экран из публичного API.

| Задача | Что брать |
| --- | --- |
| Кнопка, поле, диалог, таблица | компонент |
| Как поле, вкладка и диалог связаны | composition |
| Форма, настройки, логин, list/detail, поиск, палитра команд, экран данных | pattern: скопировать сборку из Studio |
| Шапка, навигация, основная область, статус | `vui-shell` |
| Готовая структура приложения со стабильными слотами | Templates (плановый слой; см. ниже) |
| Смысл команды, маршрут, файлы, учётная запись | приложение, не VUI |

## Patterns и Templates

**Pattern** остаётся копируемым эталоном в Studio: без своего custom element, без регистрации и без package export.

**Template** — опубликованный слой (см. [docs/templates.md](templates.md), [VISION.md](../VISION.md)): `<vui-template-dashboard>`, `<vui-template-settings>`, `<vui-template-workspace>` со стабильными слотами поверх `vui-shell`. Opt-in: `vui/templates`, `vui/template-*` — не входят в `import 'vui'`.

Тема, UI mode и template — три независимые оси. Patterns не подменяют Templates и не входят в каталог компонентов.

У pattern нет своего custom element, нет регистрации и нет отдельного export. Studio (`pnpm dev`) содержит рабочие сборки:

- Form, Login, Settings, Search, List / detail, Command palette;
- Technical workspace: дерево группировок, дерево правил, панель свойств и строка с метаданными;
- Application Shell;
- Platform Validation: shell, toolbar, search, tree, data grid, detail, dialog, context menu, toast, status bar.

Фильтрация строк в Platform Validation живёт в странице студии: поле пишет `value`, страница заново задаёт `rows`. Таблица не знает запрос.

Командная палитра — `vui-dialog` и `vui-input`, не новый виджет. Контекстное меню — `vui-menu` и `bindTo()`. Карточка — `vui-panel`. Выпадающий список значений — `vui-select`. Меню действий — `vui-menu`. Произвольный якорь — `vui-popover`. Полоса команд — `vui-toolbar`. Изменяемая область — `vui-split-panel`. Окно приложения — `vui-shell`; модальное окно — `vui-dialog`; боковая панель — `vui-drawer`.

Дерево — `vui-file-tree`. Оно показывает переданные пункты и не читает файловую систему. Заголовок рабочей поверхности — `vui-window`. Инспектор — `vui-properties`. Пустой результат — `vui-empty`. Полная карта «имя из словаря → элемент» — в [vocabulary.md](vocabulary.md).

## Раскладки

Одна и та же разметка работает в Web, Desktop и Terminal. Режим задаёт структурные токены в `src/tokens/ui.css` (`--vui-layout-nav`, отступы, радиус, шрифт, тень, движение). Тема задаёт только цвета. Ветки `if (mode)` в приложении не нужны.

Родителю нужен ограниченный размер: высота окна или flex-ребёнок с `min-height: 0`. Дальше `vui-shell`, `vui-split-panel`, `vui-panel` и `vui-scroll-area` прокручивают своё тело сами.

Галерея: `pnpm dev`, затем [layout.html](../layout.html). Переключатели темы, режима и ширины 375 / 768 / 1280 / 1920. Эталоны: Dashboard, Settings, Workspace на опубликованных templates; демо-данные и `bindLayout` — в `src/showcase/layouts.ts`.

### Plain JavaScript

```html
<div class="vui-layout" data-layout="settings">
  <vui-shell label="Application">
    <vui-toolbar slot="toolbar" label="Commands">
      <strong slot="start">Settings</strong>
    </vui-toolbar>
    <vui-nav slot="nav" label="Sections">
      <vui-nav-group label="Account" expanded>
        <vui-nav-item href="#profile" selected>Profile</vui-nav-item>
        <vui-nav-item href="#access">Access</vui-nav-item>
      </vui-nav-group>
    </vui-nav>
    <vui-scroll-area label="Settings">
      <vui-container size="small" padding="lg">
        <vui-panel heading="Profile">
          <vui-input label="Name" value="Ada" required></vui-input>
          <vui-button data-save variant="primary">Save</vui-button>
        </vui-panel>
      </vui-container>
    </vui-scroll-area>
    <vui-status-bar slot="footer">Ready</vui-status-bar>
  </vui-shell>
</div>
```

```ts
import 'vui';
import { setTheme, setUIMode } from 'vui/theme';

setTheme('catppuccin-latte');
setUIMode('web'); // 'desktop' | 'terminal'

const save = document.querySelector('[data-save]');
const name = document.querySelector('vui-input');
save?.addEventListener('click', () => {
  if (!name) return;
  name.invalid = !name.value.trim();
});
```

Основная область shell — слот по умолчанию, не `slot="main"`.

### Next.js

```tsx
'use client';

import { useState } from 'react';
import { Button, Input, Panel, Shell, Stack } from 'vui/react';

export function SettingsForm() {
  const [value, setValue] = useState('Ada');
  const [invalid, setInvalid] = useState(false);
  return (
    <div style={{ height: '24rem' }}>
      <Shell label="Application">
        <Panel heading="Profile">
          <Stack gap="md">
            <Input label="Name" value={value} invalid={invalid}
              onInput={(event) => setValue(event.currentTarget.value)} />
            <Button variant="primary" onClick={() => setInvalid(!value.trim())}>Save</Button>
          </Stack>
        </Panel>
      </Shell>
    </div>
  );
}
```

Импортируйте `vui/themes/tokens`, `vui/themes/ui` и `vui/themes/system` в корневом layout и поставьте на `<html>` атрибуты `data-vui-theme` и `data-vui-ui`.


Сборки, которые Studio показывает целиком:

- Form: поле, подпись, hint, invalid;
- Search: `vui-input type="search"`, фильтр и действия страницы;
- Navigation: `vui-nav` внутри слота shell;
- Data: toolbar, таблица, пагинация, пустое состояние;
- Settings: группа полей и сохранение;
- Desktop: shell, sidebar, split, tree, grid, inspector, status bar.
