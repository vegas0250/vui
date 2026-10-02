# Платформа VUI

VUI — UI/Application Interaction Platform для Web, SPA и Desktop/Electron. Это не слой бизнес-логики и не каркас приложения.

> VUI owns the UI. The application owns the meaning.

VUI знает, **как пользователь взаимодействует** с системой. Приложение знает, **что это взаимодействие означает**.

Подробный контракт компонентов и механизмов — в [ARCHITECTURE.md](ARCHITECTURE.md). Каталог элементов — в [docs/components.md](docs/components.md).

## Граница

VUI предоставляет:

- visual primitives;
- design tokens;
- themes;
- density;
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
- data presentation primitives.

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
- global application state management.

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

## Слои

```text
VUI
│
├── Foundation
│
├── Components
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
├── Application UI
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
Component
   ↓
Interaction Primitive
   ↓
DOM / Browser API
```

```text
Application
   ↓
Command / Selection / Data
   ↓
VUI
```

Компонент описывает своё поведение через общие primitives. Он не копирует менеджер фокуса, стек overlay или обработку стрелок. Приложение регистрирует команды и читает selection. Глобального event bus нет: наружу выходят DOM-события компонента (`click`, `input`, `change`, `close`).
