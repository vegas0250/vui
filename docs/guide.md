# Руководство VUI

VUI — UI-платформа на Web Components для обычного HTML, SPA и Electron. Она владеет видом и взаимодействием. Приложение владеет смыслом.

Карта документов:

- этот файл — как подключить и чем пользоваться;
- [ARCHITECTURE.md](../ARCHITECTURE.md) — контракты;
- [PLATFORM.md](../PLATFORM.md) — граница платформы;
- [components.md](components.md) — API элементов;
- [vocabulary.md](vocabulary.md) — какое имя из карты каким элементом закрыто;
- [patterns.md](patterns.md) — когда собирать самому, а когда брать pattern;
- [CONTRIBUTING.md](../CONTRIBUTING.md) — новый компонент.

## Getting Started

```bash
npm install vui
```

```html
<script type="module">
  import 'vui';
  import { setTheme, setDensity } from 'vui/theme';
  setTheme('dark');
  setDensity('compact');
</script>
<vui-button variant="primary">Save</vui-button>
```

Импорт компонента регистрирует элемент и ставит стили. Отдельный CSS нужен только если тема подключается файлом: `vui/themes/light`, `dark`, `high-contrast`, `system`.

Направление текста — атрибут документа, не тема:

```html
<html dir="rtl" data-vui-theme="light" data-vui-density="comfortable">
```

## Architecture

```text
Foundation → Interaction → Contracts → Components → Composition → Patterns → Application Shell → Studio
```

Foundation: tokens, theme, density, responsive, motion, a11y runtime. Interaction: focus, keyboard, selection, commands, overlay, pointer, drag, clipboard. Contracts проверяют attributes, семейства и сборку. Components — custom elements. Composition описывает слоты и детей. Patterns и shell собирают уже опубликованный API.

## Foundation, tokens, themes, density, responsive, layout

Три слоя токенов: primitive (`src/tokens/tokens.css`), semantic (`themes/`), component (высоты chrome). Плотность меняет шкалу, не палитру. Responsive читает ширину контейнера. Пороги 22rem, 36rem и 40rem не зависят от темы. Layout-словарь: `gap`, `padding`, `align`, `justify`, `overflow`.

Своя тема переопределяет semantic properties (`--vui-color-*`, `--vui-shadow-*`, `--vui-focus-ring`), а не имена компонентов.

## Interaction, keyboard, focus

Один стек overlay. Клавиши платформы: Tab, стрелки, Enter, Space, Escape, Home, End, PageUp, PageDown. Команды и shortcuts регистрирует приложение через `vui/interaction`. Компонент не держит глобальный роутер и не хранит доменную выборку.

## Component Contract, composition, families

Контракт элемента: attributes, properties, methods, events, slots, parts. События — `click`, `input`, `change`, `close`.

Семейства Action, Field, Overlay, Navigation, Data, Feedback, Layout, Content и Desktop задают общие правила без базового класса. Общие имена состояний — `componentStates`.

Composition — как host связан с детьми: слот, light DOM, свойство, атрибут, событие. Дети не вызывают методы соседей.

Проверка: `checkCompliance()`, `checkComposition()`, `checkFamilyMember()`.

## Components, patterns, application shell

Компонент — один primitive с собственным именем `vui-*`.

Pattern — страница из этих primitive для типового сценария. У pattern нет элемента и нет импорта `vui/patterns`. Примеры живут в VUI Studio и в [patterns.md](patterns.md).

`vui-shell` — layout infrastructure: header, toolbar, nav, main, aside, footer. Он не знает, какой пункт меню что означает.

## Accessibility

Имя, видимый `:focus-visible`, нативный контрол, `prefers-reduced-motion`, `forced-colors` у кнопок и флажков. High-contrast тема не держит смысл только на тени. `dir` на документе меняет направление; новые layout-правила пишутся через logical properties (`padding-inline`, `inset-inline`, `border-inline`).

Отдельной i18n-системы нет. Подписи по умолчанию английские. Showcase на русском передаёт свои `label`. Форматирование дат и чисел остаётся у приложения.

## Testing, compliance, visual regression

```text
Unit → Compliance → Interaction → Composition → Accessibility → Visual → Build / package
```

`pnpm test` гоняет unit, compliance, interaction и composition. `pnpm test:e2e` гоняет Studio, responsive, accessibility и короткую visual matrix в `visual.html`. Снимки не умножаются на все темы и плотности. Показательный compliance-набор — button, input, dialog, toast, select, data-grid, file-tree. Новые элементы 1.0 проверяются тем же `checkCompliance()` в `tests/unit/platform.test.ts`.

Публичная карта exports заморожена тестом `tests/unit/exports.test.ts`. Удаление ключа — ломающее изменение. CI: TypeScript, unit, сборка, бюджет размера, Playwright. Отдельного runtime-бюджета кадров нет: сначала замер в приложении, потом оптимизация. Дымовая проверка — монтирование длинного списка и снятие слушателей.

## Packaging, tree shaking, public API

Точки входа:

```text
vui
vui/foundation | actions | forms | navigation | data | overlay | feedback | content | layout | desktop
vui/<component>
vui/theme | runtime | contract | composition | families | interaction
vui/themes/*
```

Сборка — ESM, `preserveModules`, declarations, source maps. `lucide` внешний. Селективный импорт не тянет `src/index.ts`. `src/core`, showcase и patterns в exports не входят.

Бюджет после сборки: `pnpm check:budget`. Один JS-файл dist не больше 96 КБ, сумма JS не больше 2 МБ.

## Theming, customization

`setTheme` / `setDensity` или атрибуты `data-vui-theme` и `data-vui-density`. Своя тема — тот же набор semantic properties. `part` — точка внешней стилизации. Внутренние классы shadow контрактом не являются.

## Migration / versioning

Текущая публичная граница — `1.0.0`. Несовместимое изменение attributes, events, slots, parts или ключа exports описывается в `CHANGELOG.md` и обновляет список в `tests/unit/exports.test.ts`. Добавление компонента список расширяет в том же изменении.

Дальше библиотека меняется от реального приложения: ограничение в приложении → правка VUI → выпуск → обновление приложения.
