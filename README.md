# VUI

Универсальная модульная UI-система готовых визуальных компонентов для Web, SPA и Desktop/Electron с поддержкой тем и различной плотности интерфейса.

VUI — персональная библиотека визуальных компонентов для личного использования автора. Проект не позиционируется как production-ready коммерческий UI framework. Если вы решите использовать VUI в своём проекте, делайте это на свой страх и риск. Обратная совместимость, стабильность API и отсутствие ошибок не гарантируются.

## Назначение

Один набор готовых визуальных компонентов для обычного HTML, SPA и Desktop/Electron. Компоненты не требуют Vue, React, Angular или Svelte. Вид задаётся design tokens: тема и плотность переключаются атрибутами на странице.

Целевые платформы:

- обычный HTML;
- SPA;
- Electron и другие desktop runtime на базе Web.

## Особенности

- Web Components и Custom Elements;
- три уровня подключения: вся библиотека, категория, отдельный компонент;
- темы Light, Dark, High Contrast и System (`prefers-color-scheme`);
- плотность Comfortable, Compact и Dense;
- desktop-компоненты используют те же tokens, темы и плотность, что и остальные;
- доступность закладывается в интерактивные компоненты: клавиатура, ARIA, фокус, нативный `dialog`.

Слои, на которых собирается следующий компонент:

```text
Foundation
    ↓
Interaction
    ↓
Component Contract
    ↓
Component Family
    ↓
Component
    ↓
Composition
```

Foundation runtime читает tokens, тему, плотность и полосу контейнера. Component contract регистрируется через `registerContract()` и проверяется `checkCompliance()`. Композиция и семейства — `vui/composition` и `vui/families`. Подробности — в [ARCHITECTURE.md](ARCHITECTURE.md).

```ts
import { readFoundation, containerBand } from 'vui/runtime';
import { registerContract, checkCompliance } from 'vui/contract';
import { registerComposition, checkComposition } from 'vui/composition';
import { listFamilies } from 'vui/families';
```

## Установка

```bash
pnpm add vui
```

Стили тем подключаются автоматически при импорте компонентов. Отдельные CSS-файлы можно подключить и напрямую, если нужно переопределить порядок каскада.

## Использование

```html
<script type="module">
  import 'vui';
</script>

<vui-button variant="primary">Сохранить</vui-button>
```

```html
<html data-vui-theme="dark" data-vui-density="compact">
```

Декларативный API — Custom Elements. Класс TypeScript — тот же компонент, если он нужен из кода. Строковые и булевы properties пишут те же attributes: `button.disabled = true` равносильно `disabled` в разметке. Полный контракт — в [docs/components.md](docs/components.md), правила — в [ARCHITECTURE.md](ARCHITECTURE.md).

```ts
import { VButton } from 'vui';
```

Имена связаны однозначно: `V` + PascalCase в TypeScript и `vui-` + kebab-case в HTML.

```text
VButton    → <vui-button>
VDialog    → <vui-dialog>
VDataGrid  → <vui-data-grid>
```

Кнопка использует обычное событие `click`:

```ts
document.querySelector('vui-button')?.addEventListener('click', () => {
  // ...
});
```

## Подключение

Полная библиотека регистрирует все реализованные компоненты:

```ts
import 'vui';
```

Категория:

```ts
import 'vui/forms';
import 'vui/desktop';
```

Отдельный компонент:

```ts
import 'vui/button';
import 'vui/dialog';
import 'vui/menu';
import 'vui/data-grid';
import { CommandRegistry } from 'vui/interaction';
```

Тема и плотность из кода:

```ts
import { setTheme, setDensity } from 'vui/theme';

setTheme('dark');
setDensity('dense');
```

CSS тем, если они нужны отдельным файлом:

```ts
import 'vui/themes/light';
import 'vui/themes/dark';
import 'vui/themes/high-contrast';
```

`vui/stack` регистрирует `vui-stack`, `vui-hstack` и `vui-vstack`. `vui/select` регистрирует `vui-select` и `vui-option`. `vui/tabs` регистрирует `vui-tabs`, `vui-tab` и `vui-tab-panel`. `vui/file-tree` регистрирует `vui-file-tree` и `vui-tree-item`. `vui/toast` регистрирует `vui-toast`, `vui-toaster` и экспортирует функцию `toast()`. `vui/menu` регистрирует `vui-menu` и `vui-menu-item`.

`vui/interaction` экспортирует фокус, клавиатуру, selection, команды, shortcuts, overlay, context menu, drag & drop, clipboard и pointer. Команды и сочетания клавиш регистрирует приложение. Граница платформы — в [PLATFORM.md](PLATFORM.md).

## Категории

Сейчас реализованы рабочие компоненты, а не заглушки.

| Категория | Компоненты |
| --- | --- |
| Foundation | `vui-icon`. Цвета, типографика, интервалы, радиус, границы и тени — это tokens, не отдельные элементы |
| Layout | `vui-stack`, `vui-hstack`, `vui-vstack`, `vui-grid`, `vui-panel`, `vui-split-panel` |
| Actions | `vui-button`, `vui-icon-button` |
| Forms | `vui-input`, `vui-checkbox`, `vui-switch`, `vui-select` |
| Feedback | `vui-alert`, `vui-toast`, `vui-tooltip` |
| Overlay | `vui-dialog`, `vui-menu` |
| Navigation | `vui-tabs`, `vui-toolbar` |
| Data | `vui-data-grid` |
| Desktop | `vui-toolbar`, `vui-status-bar`, `vui-file-tree`, `vui-split-panel` |

Остальные компоненты из общей карты библиотеки намеренно не добавлены, пока для них нет полноценной реализации.

## Темы

```html
<html data-vui-theme="light">
<html data-vui-theme="dark">
<html data-vui-theme="high-contrast">
<html data-vui-theme="system">
```

`system` следует `prefers-color-scheme`. Цвета тем ссылаются на одну primitive palette. Своя тема задаёт те же semantic properties (`--vui-color-primary`, `--vui-color-background`, `--vui-color-surface`, `--vui-color-text`, `--vui-color-border` и остальные) селектором не слабее встроенных тем. Компонент не проверяет, какая тема активна.

## Плотность

```html
<html data-vui-density="comfortable">
<html data-vui-density="compact">
<html data-vui-density="dense">
```

Плотность — общая шкала: высота контролов, отступы, gaps, toolbar, панель, строка состояния и строки таблицы. Для desktop-интерфейса обычно удобны `compact` и `dense`. Тема, плотность и ширина контейнера независимы: Dark + Dense + узкий контейнер допустимы так же, как Light + Comfortable + широкий.

## Layout

`vui-stack`, `vui-hstack`, `vui-vstack`, `vui-grid`, `vui-panel` и `vui-split-panel` используют одни имена: `gap`, `padding`, `align`, `justify`, `overflow`. Шаг — `2xs|xs|sm|md|lg|xl|2xl`.

```html
<vui-hstack gap="sm" align="center" justify="space-between">
  <vui-button>Слева</vui-button>
  <vui-button>Справа</vui-button>
</vui-hstack>

<vui-split-panel position="32" min="15" max="70" label="Боковая панель">
  <div slot="start">Начало</div>
  <div slot="end">Конец</div>
</vui-split-panel>
```

Без `min` и `max` разделитель остаётся в диапазоне 10–90. Горизонтальный split складывается, когда его контейнер не шире `--vui-layout-narrow`. Вложенные панели меняют только свой `position`.

## Responsive Design

VUI рассчитан на обычный Web, SPA и Desktop/Electron, включая маленькие и большие окна, split view и вложенные панели. Компонент подстраивается под **ширину своего контейнера**, а не под отдельный mobile-компонент и не только под ширину окна.

```html
<vui-toolbar>
  <vui-button slot="start">Файл</vui-button>
  <vui-icon-button slot="end" name="search" label="Поиск"></vui-icon-button>
</vui-toolbar>
```

В широком контейнере панель показывает действия в одну строку. В узком группы переносятся сами: странице не нужно измерять компонент и переключать его режим.

То же относится к layout (`vui-stack`, `vui-grid`, `vui-split-panel`), полям, вкладкам, строке состояния и таблице. `vui-data-grid` оставляет горизонтальную прокрутку и минимальную ширину колонок; колонка с `priority: "secondary"` скрывается, когда контейнер не шире `--vui-layout-medium`. Диалог ограничивается viewport и прокручивает содержимое.

Responsive не заменяет тему и плотность. Сочетания вроде Dark + Compact + узкий контейнер и Light + Comfortable + широкий контейнер одинаково допустимы. Плотность задаёт масштаб контролов, responsive — раскладку в доступном месте.

## Иконки

```html
<vui-icon name="folder"></vui-icon>
```

Встроенный набор собран из [Lucide](https://lucide.dev). Публичная регистрация дополнительных иконок принимает SVG-строку и не требует типов Lucide:

```ts
import { registerIcon } from 'vui/icon';

registerIcon('mark', '<svg viewBox="0 0 24 24">...</svg>');
```

## Showcase

```bash
pnpm install
pnpm dev
```

Откроется `index.html`: Foundation, темы, плотность, layout, контракт компонентов и responsive. Showcase собран из компонентов VUI.

## Скрипты

```bash
pnpm dev         # showcase
pnpm test        # vitest: контракт, клавиатура, overlay
pnpm test:e2e    # showcase, responsive, accessibility, visual regression
pnpm typecheck
pnpm build       # библиотека в dist/
```

Проверки идут слоями: unit, связка компонентов, e2e, accessibility, visual regression. Визуальная матрица — Light/Comfortable/desktop, Dark/Comfortable/desktop, Light/Compact/desktop, Dark/Compact/mobile, без перемножения всех тем на все плотности. Как добавлять компонент — в [CONTRIBUTING.md](CONTRIBUTING.md).

## Структура

```text
vui/
├── src/
│   ├── components/
│   ├── categories/
│   ├── core/
│   ├── interaction/  focus, keyboard, selection, commands, shortcuts, overlay, context menu, drag & drop, clipboard, pointer
│   ├── icons/
│   ├── theme/
│   ├── tokens/
│   ├── showcase/
│   └── index.ts
├── themes/
├── tests/
│   ├── unit/
│   └── e2e/          showcase, responsive, a11y, visual
├── visual.html       харнес снимков и accessibility
├── ARCHITECTURE.md
├── PLATFORM.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── docs/components.md
├── index.html
└── .cursor/rules/project.mdc
```

## Статус

Версия `0.1.0`, первый рабочий набор компонентов. Архитектурный контракт — в `ARCHITECTURE.md`. Краткий список для изменений в репозитории — в `.cursor/rules/project.mdc`.
