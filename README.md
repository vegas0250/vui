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
import 'vui/data-grid';
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

`vui/stack` регистрирует `vui-stack`, `vui-hstack` и `vui-vstack`. `vui/select` регистрирует `vui-select` и `vui-option`. `vui/tabs` регистрирует `vui-tabs`, `vui-tab` и `vui-tab-panel`. `vui/file-tree` регистрирует `vui-file-tree` и `vui-tree-item`. `vui/toast` регистрирует `vui-toast`, `vui-toaster` и экспортирует функцию `toast()`.

## Категории

Сейчас реализованы рабочие компоненты, а не заглушки.

| Категория | Компоненты |
| --- | --- |
| Foundation | `vui-icon`. Цвета, типографика, интервалы, радиус, границы и тени — это tokens, не отдельные элементы |
| Layout | `vui-stack`, `vui-hstack`, `vui-vstack`, `vui-grid`, `vui-panel`, `vui-split-panel` |
| Actions | `vui-button`, `vui-icon-button` |
| Forms | `vui-input`, `vui-checkbox`, `vui-switch`, `vui-select` |
| Feedback | `vui-alert`, `vui-toast`, `vui-tooltip` |
| Overlay | `vui-dialog` |
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

`system` следует `prefers-color-scheme`. Своя тема — это набор тех же custom properties (`--vui-color-primary`, `--vui-color-background`, `--vui-color-surface`, `--vui-color-text`, `--vui-color-border` и остальные семантические tokens) с селектором не слабее встроенных тем.

## Плотность

```html
<html data-vui-density="comfortable">
<html data-vui-density="compact">
<html data-vui-density="dense">
```

Плотность меняет высоту контролов, отступы, gaps, toolbar, строку состояния, строки таблиц и панелей. Для desktop-интерфейса обычно удобны `compact` и `dense`.

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

Откроется `index.html`: демонстрация, короткие примеры использования и ручная проверка тем, плотности и состояний. Showcase собран из компонентов VUI.

## Скрипты

```bash
pnpm dev         # showcase
pnpm test        # vitest
pnpm test:e2e    # playwright
pnpm typecheck
pnpm build       # библиотека в dist/
```

## Структура

```text
vui/
├── src/
│   ├── components/
│   ├── categories/
│   ├── core/
│   ├── icons/
│   ├── theme/
│   ├── tokens/
│   ├── showcase/
│   └── index.ts
├── themes/
├── tests/
├── index.html
└── .cursor/rules/project.mdc
```

## Статус

Версия `0.1.0`, первый рабочий набор компонентов. Архитектура и фактический список компонентов описаны в `.cursor/rules/project.mdc`.
