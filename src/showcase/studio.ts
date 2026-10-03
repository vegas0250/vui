/** Reference compositions. They use public elements only and are not a package export. */
export const studioMarkup = `
<section class="category" id="content">
  <h2>Content</h2>
  <div class="stack-gap">
    <vui-panel heading="Badge, avatar, separator">
      <vui-hstack gap="sm" wrap align="center">
        <vui-badge>Neutral</vui-badge>
        <vui-badge variant="info">Info</vui-badge>
        <vui-badge variant="success">Ready</vui-badge>
        <vui-badge variant="warning">Review</vui-badge>
        <vui-badge variant="danger">Blocked</vui-badge>
        <vui-avatar label="Ada Lovelace"></vui-avatar>
        <vui-avatar-group label="People">
          <vui-avatar label="Ada" size="small"></vui-avatar>
          <vui-avatar label="VUI" size="small"></vui-avatar>
        </vui-avatar-group>
        <vui-chip>Draft</vui-chip>
        <vui-chip variant="info" removable close-label="Убрать">Filter</vui-chip>
        <vui-kbd>Ctrl</vui-kbd>
        <vui-kbd>K</vui-kbd>
        <vui-separator orientation="vertical" label="Section"></vui-separator>
        <span>After separator</span>
      </vui-hstack>
    </vui-panel>
    <vui-panel heading="Typography">
      <vui-vstack gap="xs">
        <vui-text variant="heading" level="2">Заголовок</vui-text>
        <vui-text>Обычный текст интерфейса, который переносится внутри контейнера.</vui-text>
        <vui-text variant="caption" muted>Подпись</vui-text>
        <vui-text variant="code">vui-text</vui-text>
        <vui-link href="#components">К компонентам</vui-link>
      </vui-vstack>
    </vui-panel>
      <vui-vstack gap="sm">
        <vui-progress label="Upload" value="40" max="100"></vui-progress>
        <vui-progress label="Waiting"></vui-progress>
        <vui-hstack gap="sm" align="center">
          <vui-spinner label="Loading"></vui-spinner>
          <vui-spinner label="Saving">Saving</vui-spinner>
        </vui-hstack>
        <vui-skeleton></vui-skeleton>
        <vui-skeleton variant="text"></vui-skeleton>
      </vui-vstack>
    </vui-panel>
    <vui-panel heading="Popover">
      <vui-popover label="Columns">
        <vui-button variant="secondary">Columns</vui-button>
        <vui-vstack slot="panel" gap="xs">
          <vui-checkbox checked>Name</vui-checkbox>
          <vui-checkbox checked>Status</vui-checkbox>
        </vui-vstack>
      </vui-popover>
    </vui-panel>
  </div>
</section>

<section class="category" id="patterns">
  <h2>Patterns</h2>
  <p class="section-lead">
    Pattern — устойчивая сборка публичных компонентов. У неё нет своего элемента и нет скрытого API.
    Форму, настройки и палитру команд собирает страница. VUI даёт поля, слои и раскладку.
  </p>
  <div class="pattern-grid">
    <vui-panel heading="Form">
      <vui-vstack gap="sm">
        <vui-input label="Name" name="name"></vui-input>
        <vui-textarea label="Notes" rows="3"></vui-textarea>
        <vui-button variant="primary" type="submit">Save</vui-button>
      </vui-vstack>
    </vui-panel>
    <vui-panel heading="Login">
      <vui-vstack gap="sm">
        <vui-input label="Email" type="email"></vui-input>
        <vui-input label="Password" type="password"></vui-input>
        <vui-button variant="primary">Sign in</vui-button>
      </vui-vstack>
    </vui-panel>
    <vui-panel heading="Settings">
      <vui-vstack gap="sm">
        <vui-select label="Theme" value="system">
          <vui-option value="system">System</vui-option>
          <vui-option value="dark">Dark</vui-option>
        </vui-select>
        <vui-switch checked>Compact density</vui-switch>
        <vui-radio-group label="Start page" name="start" value="studio">
          <vui-radio value="studio" checked>Studio</vui-radio>
          <vui-radio value="files">Files</vui-radio>
        </vui-radio-group>
      </vui-vstack>
    </vui-panel>
    <vui-panel heading="Search">
      <vui-vstack gap="sm">
        <vui-input type="search" label="Query" placeholder="Filter"></vui-input>
        <vui-badge variant="info">Results stay in the page</vui-badge>
      </vui-vstack>
    </vui-panel>
    <vui-panel heading="List / detail">
      <vui-split-panel label="List" position="40">
        <vui-vstack slot="start" gap="xs">
          <vui-button variant="ghost">Alpha</vui-button>
          <vui-button variant="ghost">Beta</vui-button>
        </vui-vstack>
        <vui-panel slot="end" heading="Alpha">
          <p>Detail is another component, not a mode of the list.</p>
        </vui-panel>
      </vui-split-panel>
    </vui-panel>
    <vui-panel heading="Command palette">
      <vui-button id="pattern-command" variant="secondary">Open commands</vui-button>
      <vui-dialog id="pattern-palette" label="Commands">
        <vui-input label="Command" type="search" placeholder="Search commands"></vui-input>
        <vui-button variant="ghost">Toggle navigation</vui-button>
      </vui-dialog>
    </vui-panel>
  </div>
</section>

<section class="category" id="shell">
  <h2>Application Shell</h2>
  <p class="section-lead">
    <code>vui-shell</code> раскладывает header, toolbar, navigation, main, aside и status bar.
    Уже на 40rem колонки складываются. <code>collapsed</code> убирает навигацию. Смысл пунктов задаёт страница.
  </p>
  <div class="platform-frame">
    <vui-shell label="Reference shell" skip-label="К содержанию">
      <vui-toolbar slot="header" label="Header">
        <strong slot="start">Shell</strong>
        <vui-button id="shell-collapse" slot="end" size="small" variant="ghost">Navigation</vui-button>
      </vui-toolbar>
      <vui-toolbar slot="toolbar" label="Toolbar">
        <vui-button-group slot="start" label="File">
          <vui-button size="small" variant="ghost">New</vui-button>
          <vui-button size="small" variant="ghost">Open</vui-button>
        </vui-button-group>
      </vui-toolbar>
      <vui-vstack slot="nav" gap="xs">
        <vui-nav label="Shell">
          <vui-nav-item href="#shell" selected>Library</vui-nav-item>
          <vui-nav-item href="#patterns">Patterns</vui-nav-item>
        </vui-nav>
      </vui-vstack>
      <vui-panel heading="Main">
        <vui-breadcrumbs label="Path">
          <span>Studio</span>
          <span aria-current="page">Shell</span>
        </vui-breadcrumbs>
        <p>Main content uses the default slot.</p>
      </vui-panel>
      <vui-panel slot="aside" heading="Inspector">
        <vui-properties label="Inspector">
          <vui-property label="Area">Main</vui-property>
          <vui-property label="Mode">Reference</vui-property>
        </vui-properties>
      </vui-panel>
      <vui-status-bar slot="footer" label="Status">
        <span>Ready</span>
        <span slot="end">UTF-8</span>
      </vui-status-bar>
    </vui-shell>
  </div>
</section>

<section class="category" id="platform">
  <h2>Platform Validation</h2>
  <p class="section-lead">
    Одна reference-сборка: тема, плотность, направление, shell, дерево, таблица, поиск, диалог, меню и toast.
    Это не приложение. Данные статичны, фильтрация живёт в странице студии.
  </p>
  <div class="platform-frame">
    <vui-shell id="platform-shell" label="Platform">
      <vui-toolbar slot="header" label="Header">
        <strong slot="start">Platform</strong>
        <vui-button id="platform-collapse" slot="end" size="small" variant="ghost">Sidebar</vui-button>
        <vui-button id="platform-command" slot="end" size="small" variant="secondary">Commands</vui-button>
        <vui-tooltip slot="end" text="Opens the command list">
          <vui-button id="platform-drawer-open" size="small" variant="ghost">Filters</vui-button>
        </vui-tooltip>
      </vui-toolbar>
      <vui-toolbar slot="toolbar" label="Search">
        <vui-input id="platform-search" slot="start" type="search" label="Search" placeholder="Filter"></vui-input>
        <vui-select id="platform-filter" slot="start" label="Area" size="small" value="all">
          <vui-option value="all">All</vui-option>
          <vui-option value="Actions">Actions</vui-option>
          <vui-option value="Forms">Forms</vui-option>
          <vui-option value="Data">Data</vui-option>
          <vui-option value="Desktop">Desktop</vui-option>
        </vui-select>
        <vui-button-group slot="end" label="Actions">
          <vui-button id="platform-open" size="small">Inspect</vui-button>
        </vui-button-group>
      </vui-toolbar>
      <vui-nav slot="nav" label="Sections">
        <vui-nav-item href="#platform" selected>Overview</vui-nav-item>
        <vui-nav-item href="#data">Data</vui-nav-item>
        <vui-nav-item href="#patterns">Settings</vui-nav-item>
      </vui-nav>
      <vui-split-panel label="Workspace" position="36" style="min-height: 18rem">
        <vui-file-tree id="platform-tree" slot="start" label="Sources">
          <vui-tree-item label="catalog" kind="folder" expanded>
            <vui-tree-item label="components" kind="file"></vui-tree-item>
            <vui-tree-item label="patterns" kind="file"></vui-tree-item>
          </vui-tree-item>
        </vui-file-tree>
        <vui-scroll-area slot="end" label="Records">
          <vui-tabs label="Workspace">
            <vui-tab panel="records" selected>Records</vui-tab>
            <vui-tab panel="notes">Notes</vui-tab>
            <vui-tab-panel name="records">
              <vui-data-grid id="platform-grid" label="Records" empty-label="No rows"></vui-data-grid>
              <vui-empty id="platform-empty" heading="No results" label="No results" hidden>Change the filter.</vui-empty>
              <vui-pagination id="platform-pages" page="1" pages="3" label="Pages"></vui-pagination>
            </vui-tab-panel>
            <vui-tab-panel name="notes">
              <vui-empty heading="No notes" label="No notes">Notes stay on the page.</vui-empty>
            </vui-tab-panel>
          </vui-tabs>
        </vui-scroll-area>
      </vui-split-panel>
      <vui-panel slot="aside" heading="Detail">
        <vui-vstack gap="sm">
          <vui-avatar label="Record"></vui-avatar>
          <vui-properties label="Record">
            <vui-property id="platform-prop-name" label="Name">Select a row.</vui-property>
            <vui-property id="platform-prop-area" label="Area">—</vui-property>
          </vui-properties>
          <vui-field label="Note" hint="Stored by the page">
            <vui-input id="platform-note" label="Note"></vui-input>
          </vui-field>
          <vui-badge id="platform-badge" variant="info">Reference</vui-badge>
        </vui-vstack>
      </vui-panel>
      <vui-status-bar slot="footer" label="Status">
        <vui-spinner label="Idle">Idle</vui-spinner>
        <span slot="end" id="platform-status">No selection</span>
      </vui-status-bar>
    </vui-shell>
  </div>
  <vui-dialog id="platform-dialog" label="Record">
    <p id="platform-dialog-copy">The dialog belongs to the page.</p>
    <div slot="footer">
      <vui-button id="platform-close">Close</vui-button>
    </div>
  </vui-dialog>
  <vui-dialog id="platform-palette" label="Commands">
    <vui-input label="Command" type="search" placeholder="Search commands"></vui-input>
    <vui-button id="platform-palette-sidebar" variant="ghost">Toggle sidebar</vui-button>
  </vui-dialog>
  <vui-menu id="platform-menu" label="Row">
    <vui-menu-item id="platform-inspect" label="Inspect"></vui-menu-item>
  </vui-menu>
  <vui-drawer id="platform-drawer" label="Filters" close-label="Close">
    <vui-checkbox-group label="Areas">
      <vui-checkbox value="actions" checked>Actions</vui-checkbox>
      <vui-checkbox value="data" checked>Data</vui-checkbox>
    </vui-checkbox-group>
    <vui-button id="platform-drawer-close" slot="footer" variant="secondary">Close</vui-button>
  </vui-drawer>
</section>
`;
