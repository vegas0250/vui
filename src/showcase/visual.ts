import '../index';
import { VDataGrid } from '../components/data/data-grid';
import { VDialog } from '../components/overlay/dialog';
import { VDrawer } from '../components/overlay/drawer';

const themes = new Set(['light', 'dark', 'high-contrast', 'system', 'neon-green', 'neon-magenta', 'neon-cyan']);
const uiModes = new Set(['web', 'desktop', 'terminal']);
const params = new URLSearchParams(location.search);
const theme = params.get('theme') ?? 'light';
const rawUI = params.get('ui') ?? params.get('density') ?? 'web';
const uiMode =
  rawUI === 'terminal'
    ? 'terminal'
    : rawUI === 'desktop' || rawUI === 'compact' || rawUI === 'dense'
      ? 'desktop'
      : 'web';
const dir = params.get('dir');
document.documentElement.setAttribute('data-vui-theme', themes.has(theme) ? theme : 'light');
document.documentElement.setAttribute('data-vui-ui', uiModes.has(uiMode) ? uiMode : 'web');
if (dir === 'rtl' || dir === 'ltr') document.documentElement.setAttribute('dir', dir);

const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    background: var(--vui-color-background);
    color: var(--vui-color-text);
    font-family: var(--vui-font-sans);
  }
  #board, #keyboard-fixture, #menu-states, #families {
    width: min(720px, 100%);
    box-sizing: border-box;
    padding: 16px;
  }
  #menu-states vui-menu {
    position: static;
    margin-top: 8px;
  }
  #keyboard-fixture { padding-top: 0; }
  section { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .pad { display: inline-block; padding: 8px; }
  .layout-demo { height: 6rem; }
  .scroll-demo { height: 4.5rem; width: 100%; }
  .shell-demo { min-height: 10rem; }
  h1, h2 { font: inherit; margin: 0 0 8px; }
  h1 { font-size: var(--vui-heading-2); }
  h2 { font-size: var(--vui-heading-3); color: var(--vui-color-text-muted); }
`;
document.head.append(style);

const board = document.createElement('main');
board.id = 'board';
board.innerHTML = `
  <h1>VUI states</h1>
  <section>
    <h2>Button</h2>
    <div class="row">
      <span class="pad" id="btn-wrap"><vui-button id="btn-primary" variant="primary">Save</vui-button></span>
      <vui-button variant="secondary">Cancel</vui-button>
      <vui-button variant="ghost">More</vui-button>
      <vui-button variant="danger">Delete</vui-button>
      <vui-button id="btn-disabled" variant="primary" disabled>Disabled</vui-button>
      <vui-button size="small" variant="secondary">Small</vui-button>
      <vui-button-group>
        <vui-button variant="primary">Apply</vui-button>
        <vui-button variant="secondary">Dismiss</vui-button>
      </vui-button-group>
      <vui-toggle-group label="Format" value="bold">
        <vui-toggle value="bold">B</vui-toggle>
        <vui-toggle value="italic">I</vui-toggle>
      </vui-toggle-group>
      <vui-icon name="folder" label="Folder"></vui-icon>
    </div>
  </section>
  <section>
    <h2>Input</h2>
    <vui-input id="input-default" label="Name" value="Ada" placeholder="Name"></vui-input>
    <vui-input id="input-invalid" label="Email" value="ada@" invalid hint="Enter a valid email"></vui-input>
    <vui-input label="Notes" value="Read only" readonly></vui-input>
    <vui-input label="Locked" value="Disabled" disabled></vui-input>
    <vui-textarea label="Bio" rows="2" value="Short note"></vui-textarea>
    <vui-field label="Alias" hint="Shown beside the control"><input aria-label="Alias" value="Ada" /></vui-field>
  </section>
  <section>
    <h2>Checkbox and switch</h2>
    <div class="row">
      <vui-checkbox id="check-off">Off</vui-checkbox>
      <vui-checkbox id="check-on" checked>On</vui-checkbox>
      <vui-checkbox disabled>Disabled</vui-checkbox>
      <vui-switch id="switch-off">Off</vui-switch>
      <vui-switch id="switch-on" checked>On</vui-switch>
      <vui-switch disabled>Disabled</vui-switch>
    </div>
    <vui-checkbox-group label="Notify" value="email">
      <vui-checkbox value="email">Email</vui-checkbox>
      <vui-checkbox value="browser">Browser</vui-checkbox>
    </vui-checkbox-group>
    <vui-radio-group label="Plan" value="free">
      <vui-radio name="plan" value="free">Personal</vui-radio>
      <vui-radio name="plan" value="team">Team</vui-radio>
    </vui-radio-group>
  </section>
  <section>
    <h2>Select</h2>
    <vui-select id="select" label="Language" value="en">
      <vui-option value="en">English</vui-option>
      <vui-option value="ru">Russian</vui-option>
    </vui-select>
  </section>
  <section>
    <h2>Navigation</h2>
    <vui-toolbar label="Actions">
      <span slot="start">Atlas</span>
      <vui-button size="small" variant="secondary">Edit</vui-button>
      <vui-badge slot="end">Ready</vui-badge>
    </vui-toolbar>
    <vui-path-bar value="/home/projects/atlas"></vui-path-bar>
    <vui-pagination label="Pages" pages="5" page="2"></vui-pagination>
    <vui-stepper label="Steps" value="details">
      <vui-step value="details" selected>Details</vui-step>
      <vui-step value="review">Review</vui-step>
    </vui-stepper>
  </section>
  <section>
    <h2>Layout</h2>
    <vui-container size="small">
      <vui-stack gap="sm">
        <vui-hstack gap="sm">
          <vui-text>Stack</vui-text>
          <vui-link href="#layout">Link</vui-link>
        </vui-hstack>
        <vui-separator></vui-separator>
        <vui-grid columns="2" gap="sm">
          <vui-panel padding="sm">A</vui-panel>
          <vui-panel padding="sm">B</vui-panel>
        </vui-grid>
        <vui-scroll-area class="scroll-demo" label="Rows">
          <vui-vstack gap="xs">
            <vui-text>Row 1</vui-text>
            <vui-text>Row 2</vui-text>
            <vui-text>Row 3</vui-text>
            <vui-text>Row 4</vui-text>
          </vui-vstack>
        </vui-scroll-area>
      </vui-stack>
    </vui-container>
    <vui-split-panel class="layout-demo" label="Pane size" position="40">
      <span slot="start">Start</span>
      <span slot="end">End</span>
    </vui-split-panel>
    <vui-shell class="shell-demo" collapsed label="Shell">
      <vui-toolbar slot="toolbar" label="Shell bar"><span>Shell</span></vui-toolbar>
      <vui-nav slot="nav" label="Sections">
        <vui-nav-item selected>Overview</vui-nav-item>
        <vui-nav-item>Data</vui-nav-item>
      </vui-nav>
      <vui-panel heading="Main" padding="sm">Body</vui-panel>
      <vui-status-bar slot="footer" label="Status"><span>Ready</span></vui-status-bar>
    </vui-shell>
  </section>
  <section>
    <h2>Feedback</h2>
    <div class="row">
      <vui-spinner label="Loading"></vui-spinner>
      <vui-skeleton style="width:8rem;height:1.5rem"></vui-skeleton>
      <vui-avatar label="Ada Lovelace"></vui-avatar>
      <vui-avatar-group label="Team">
        <vui-avatar label="Ada Lovelace"></vui-avatar>
        <vui-avatar label="Grace Hopper"></vui-avatar>
      </vui-avatar-group>
    </div>
  </section>
  <section>
    <h2>Overlay</h2>
    <div class="row">
      <vui-button id="open-drawer">Open drawer</vui-button>
    </div>
    <vui-drawer id="state-drawer" label="Filters" placement="end" close-label="Close">
      <vui-text>Drawer body</vui-text>
      <vui-button slot="footer" variant="primary">Apply</vui-button>
    </vui-drawer>
  </section>
  <section>
    <h2>Tree</h2>
    <vui-file-tree id="state-tree" label="Groups">
      <vui-tree-item label="LAN" icon="network" kind="folder" expanded summary="10.0.0.0/8" count="2" status="on" status-variant="success" selected>
        <vui-tree-item label="dns" icon="globe" summary="example.net" count="4"></vui-tree-item>
        <vui-tree-item label="archive" icon="file-archive" disabled></vui-tree-item>
      </vui-tree-item>
    </vui-file-tree>
  </section>
  <section>
    <h2>Data grid</h2>
    <vui-data-grid id="grid" label="Components"></vui-data-grid>
  </section>
  <section>
    <h2>Toast</h2>
    <vui-toast variant="success" heading="Saved" duration="0">Changes stored.</vui-toast>
  </section>
`;

const fixture = document.createElement('div');
fixture.id = 'keyboard-fixture';
fixture.innerHTML = `
  <h2>Keyboard</h2>
  <div class="row">
    <button id="before" type="button">Before</button>
    <vui-button id="open-dialog">Open dialog</vui-button>
    <vui-button id="key-next">Next</vui-button>
    <vui-tooltip id="tip" text="More detail"><vui-button id="tip-target">Hint</vui-button></vui-tooltip>
  </div>
  <vui-dialog id="focus-dialog" label="Confirm changes" close-label="Close">
    <vui-button id="inside">Keep editing</vui-button>
    <vui-button id="save" slot="footer" variant="primary">Save</vui-button>
  </vui-dialog>
  <vui-tabs id="tabs" label="Sections">
    <vui-tab slot="tab" panel="a">One</vui-tab>
    <vui-tab slot="tab" panel="b">Two</vui-tab>
    <vui-tab-panel slot="panel" name="a">Panel one</vui-tab-panel>
    <vui-tab-panel slot="panel" name="b">Panel two</vui-tab-panel>
  </vui-tabs>
`;

const families = document.createElement('section');
families.id = 'families';
families.innerHTML = `
  <h2>Families</h2>
  <div class="row">
    <vui-button variant="primary">Save</vui-button>
    <vui-button disabled>Disabled</vui-button>
    <vui-icon-button name="settings" label="Settings"></vui-icon-button>
    <vui-toggle pressed>Pressed</vui-toggle>
    <vui-button-group>
      <vui-button size="small">One</vui-button>
      <vui-button size="small" variant="secondary">Two</vui-button>
    </vui-button-group>
    <vui-toggle-group label="Align" value="left">
      <vui-toggle value="left">L</vui-toggle>
      <vui-toggle value="right">R</vui-toggle>
    </vui-toggle-group>
    <vui-icon name="search" label="Search"></vui-icon>
  </div>
  <vui-input label="Email" value="ada@" invalid hint="Enter a valid email"></vui-input>
  <vui-textarea label="Notes" rows="2" value="Family note"></vui-textarea>
  <vui-field label="Code" hint="Optional"><input aria-label="Code" value="A1" /></vui-field>
  <div class="row">
    <vui-checkbox checked>Checked</vui-checkbox>
    <vui-slider label="Level" value="30"></vui-slider>
  </div>
  <vui-checkbox-group label="Channels" value="mail">
    <vui-checkbox value="mail">Mail</vui-checkbox>
    <vui-checkbox value="push">Push</vui-checkbox>
  </vui-checkbox-group>
  <vui-radio-group label="Tier" value="basic">
    <vui-radio name="tier" value="basic">Basic</vui-radio>
    <vui-radio name="tier" value="pro">Pro</vui-radio>
  </vui-radio-group>
  <vui-breadcrumbs label="Path"><span>Studio</span><span aria-current="page">Families</span></vui-breadcrumbs>
  <vui-path-bar value="/studio/families"></vui-path-bar>
  <vui-pagination label="Pages" pages="4" page="1"></vui-pagination>
  <vui-stepper label="Wizard">
    <vui-step value="one" selected>One</vui-step>
    <vui-step value="two">Two</vui-step>
  </vui-stepper>
  <vui-toolbar label="Family bar"><span slot="start">Tools</span><vui-button size="small">Run</vui-button></vui-toolbar>
  <vui-nav label="Sections">
    <vui-nav-item href="#a" selected>Overview</vui-nav-item>
    <vui-nav-item href="#b">Data</vui-nav-item>
  </vui-nav>
  <vui-list label="Items" value="a">
    <vui-list-item value="a" selected>Alpha</vui-list-item>
    <vui-list-item value="b">Beta</vui-list-item>
  </vui-list>
  <vui-properties label="Inspector"><vui-property label="State">Ready</vui-property></vui-properties>
  <vui-alert variant="danger">Error state</vui-alert>
  <vui-empty heading="Empty" label="Empty">Nothing here.</vui-empty>
  <vui-progress label="Loading" value="40" max="100"></vui-progress>
  <div class="row">
    <vui-spinner label="Busy"></vui-spinner>
    <vui-skeleton style="width:6rem;height:1.25rem"></vui-skeleton>
  </div>
  <vui-popover label="More"><vui-button variant="secondary">Popover</vui-button><span slot="panel">Panel</span></vui-popover>
  <vui-tooltip text="Hint"><vui-button variant="ghost">Tooltip</vui-button></vui-tooltip>
  <vui-panel heading="Panel"><vui-text>Content</vui-text><vui-separator></vui-separator><vui-link href="#panel">Open docs</vui-link></vui-panel>
  <vui-container size="small">
    <vui-hstack gap="sm">
      <vui-stack gap="xs"><vui-text variant="caption">Stack</vui-text></vui-stack>
      <vui-grid columns="2" gap="xs"><span>G1</span><span>G2</span></vui-grid>
    </vui-hstack>
  </vui-container>
  <vui-scroll-area class="scroll-demo" label="Scroll"><vui-text>Line A</vui-text><vui-text>Line B</vui-text><vui-text>Line C</vui-text></vui-scroll-area>
  <vui-split-panel class="layout-demo" label="Split" position="45"><span slot="start">L</span><span slot="end">R</span></vui-split-panel>
  <vui-shell class="shell-demo" collapsed>
    <vui-panel heading="Compact" padding="sm">Shell</vui-panel>
  </vui-shell>
  <div class="row">
    <vui-badge variant="info">Badge</vui-badge>
    <vui-chip>Chip</vui-chip>
    <vui-kbd>Ctrl</vui-kbd>
    <vui-avatar label="Ada"></vui-avatar>
    <vui-avatar-group label="Crew">
      <vui-avatar label="Ada"></vui-avatar>
      <vui-avatar label="Grace"></vui-avatar>
    </vui-avatar-group>
  </div>
  <vui-window label="Window"><span slot="controls">Controls</span><p>Body</p></vui-window>
  <vui-status-bar label="Status"><span>Ready</span><span slot="end">UTF-8</span></vui-status-bar>
  <div class="row">
    <vui-button id="families-open-drawer">Drawer</vui-button>
  </div>
  <vui-drawer id="families-drawer" label="More" close-label="Close">
    <vui-text>Drawer panel</vui-text>
  </vui-drawer>
`;

document.body.append(board, fixture);
if (params.get('strip') === '1') document.body.append(families);

if (params.get('states') === 'menu') {
  const menuStates = document.createElement('section');
  menuStates.id = 'menu-states';
  menuStates.innerHTML = `
    <h2>Menu</h2>
    <vui-menu id="state-menu" label="Actions" open>
      <vui-menu-item id="menu-save" label="Save" shortcut="Ctrl+S"></vui-menu-item>
      <vui-menu-item label="Disabled" disabled></vui-menu-item>
      <vui-menu-item label="Checked" checked></vui-menu-item>
    </vui-menu>
  `;
  document.body.append(menuStates);
}

const grid = document.querySelector('#grid');
if (grid instanceof VDataGrid) {
  grid.columns = [
    { key: 'name', title: 'Name' },
    { key: 'status', title: 'Status' },
    { key: 'owner', title: 'Owner', priority: 'secondary' },
  ];
  grid.rows = [
    { id: '1', name: 'Button', status: 'Ready', owner: 'Core' },
    { id: '2', name: 'Dialog', status: 'Ready', owner: 'Overlay' },
  ];
  grid.selectedId = '1';
}

document.querySelector('#open-dialog')?.addEventListener('click', () => {
  const dialog = document.querySelector('#focus-dialog');
  if (dialog instanceof VDialog) dialog.show();
});

document.querySelector('#open-drawer')?.addEventListener('click', () => {
  const drawer = document.querySelector('#state-drawer');
  if (drawer instanceof VDrawer) drawer.show();
});

document.querySelector('#families-open-drawer')?.addEventListener('click', () => {
  const drawer = document.querySelector('#families-drawer');
  if (drawer instanceof VDrawer) drawer.show();
});
