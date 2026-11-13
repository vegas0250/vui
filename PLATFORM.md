# Платформа VUI

VUI — UI/Application Interaction Platform для Web, SPA и Desktop/Electron. Это не слой бизнес-логики и не каркас приложения.

> VUI owns the UI. The application owns the meaning.

VUI — единый источник визуальной правды для приложений: токены, темы, UI mode, компоненты, раскладки и (планово) шаблоны. Приложения не дублируют эту систему самостоятельно.

VUI знает, **как пользователь взаимодействует** с системой. Приложение знает, **что это взаимодействие означает**.

Продуктовое видение — в [VISION.md](VISION.md). Подробный контракт компонентов и механизмов — в [ARCHITECTURE.md](ARCHITECTURE.md). Каталог элементов — в [docs/components.md](docs/components.md). Patterns — в [docs/patterns.md](docs/patterns.md). Паттерны подключения приложений — в [docs/integration.md](docs/integration.md).

## Граница

VUI предоставляет:

- visual primitives;
- design tokens;
- themes (только семантические цвета);
- UI mode (`web` | `desktop` | `terminal`) — структурная шкала, ортогональна теме;
- responsive behavior;
- accessibility;
- Web Components;
- interaction infrastructure;
- keyboard interaction;
- focus management;
- selection;
- commands;
- shortcuts;
- overlays;
- context menus;
- drag & drop primitives;
- clipboard interaction;
- application UI primitives;
- data presentation primitives;
- layout primitives (`stack`, `grid`, `panel`, `container`, `scroll-area`, `split-panel`);
- reference UI patterns (showcase; не exports);
- application shell (`vui-shell`);
- application templates (`vui/template-*`, opt-in; не в `import 'vui'`).

VUI не предоставляет:

- business logic;
- domain model;
- backend/API clients;
- database;
- authentication;
- application-specific services;
- filesystem implementation;
- FTP/SFTP implementation;
- SSH implementation;
- torrent engine;
- media engine;
- browser engine;
- network configuration implementation;
- AI provider implementation;
- MCP infrastructure;
- application-specific routing;
- global application state management;
- a real business application.

Интерфейс для этих возможностей может быть компонентом VUI. Реализация инфраструктуры остаётся у приложения.

```text
VUI
 └── <vui-file-picker>
        ↑
        application provides filesystem implementation
```

```text
VUI
 └── <vui-chat>
        ↑
        application provides AI/MCP implementation
```

```text
VUI
 └── <vui-progress>
        ↑
        application owns actual operation
```

## Состояние

VUI может владеть UI state: open / closed, active / inactive, selected / unselected, expanded / collapsed, focused, disabled, loading, error, pressed, checked, indeterminate.

VUI не владеет domain state и application state.

```text
VUI:          selected row = 5
Application:  selectedFiles = [...]
```

Механизм выбора живёт в VUI. Что означает выбранный объект, решает приложение и узнаёт об этом через properties и DOM-события.

## Три независимые оси

Цветовая тема, UI mode и шаблон приложения — три независимых измерения одного снимка UI.

- **Тема** задаёт семантические цвета; не геометрию и не структуру экрана.
- **UI mode** (`web` | `desktop` | `terminal`) задаёт плотность, типографику, радиусы, elevation и связанные соглашения.
- **Шаблон** (Template) задаёт композицию регионов приложения; не цвета и не бизнес-логику.

Смена темы не ломает раскладку. Смена UI mode не требует другой темы. Смена шаблона не должна требовать переписывать доменный код приложения.

## Слои

```text
VUI
│
├── Foundation
│   ├── Tokens
│   ├── Theme
│   ├── UI mode
│   ├── Responsive
│   ├── Layout
│   ├── Accessibility
│   ├── Motion
│   └── Runtime
│
├── Component contract
│
├── Interaction contract
│   фокус, клавиатура, выбор, команда
│
├── Component families
│   Action, Field, Overlay, Navigation, Data, Feedback, Layout, Content, Desktop
│
├── Composition
│   слот, light DOM, свойство, атрибут, событие
│
├── Components
│
├── Layouts
│   stack, grid, panel, container, scroll-area, split-panel, shell
│
├── Interaction
│   ├── Focus
│   ├── Keyboard
│   ├── Selection
│   ├── Commands
│   ├── Shortcuts
│   ├── Overlay
│   ├── Context Menu
│   ├── Drag & Drop
│   ├── Clipboard
│   └── Pointer
│
├── Patterns
│   reference assemblies в showcase; не package exports
│
├── Templates
│   published slot hosts (Dashboard, Settings, Workspace, …)
│   структура и слоты — VUI; содержимое и смысл — приложение
│
└── Testing / Documentation
```

```text
NOT PART OF VUI
├── Business Logic
├── Domain
├── Backend
├── Database
├── Authentication
├── Filesystem implementation
├── Network implementation
├── Torrent engine
├── Media engine
├── AI/MCP infrastructure
└── Application-specific services
```

## Как слои соединяются

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
   ↓
Layouts (primitives + vui-shell)
   ↓
Patterns (showcase reference)
   ↓
Templates (published application structures)
```

```text
interaction → command → action
```

Компонент описывает своё поведение через общие primitives. Он не копирует менеджер фокуса, стек overlay или обработку стрелок. Составные части говорят через слот, light DOM, свойство, атрибут или стандартное событие. Приложение регистрирует команды и читает selection. Глобального event bus нет: наружу выходят DOM-события компонента (`click`, `input`, `change`, `close`). VUI не знает о Product, Order, User или Invoice.

**Patterns** — копируемые эталоны экранов в Studio; без своего custom element и без export. **Templates** — Custom Elements со стабильными именованными слотами поверх `vui-shell` и layout primitives (`vui/template-*`); без демо-данных, маршрутизации и доменной логики. VUI владеет структурой шаблона, слотами и responsive chrome. Приложение владеет содержимым слотов, маршрутами, состоянием и смыслом команд.

Foundation runtime (`src/foundation`) собирает tokens, тему, UI mode, полосу контейнера, layout, accessibility, motion и z-index в один снимок. Component contract (`src/contract`) описывает, как компонент подключается к этому снимку. Compliance проверяет запись контракта, а не копирует правила внутри каждого теста.
