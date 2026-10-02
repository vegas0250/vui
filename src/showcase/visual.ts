import '../index';
import { VDataGrid } from '../components/data/data-grid';
import { VDialog } from '../components/overlay/dialog';

const themes = new Set(['light', 'dark', 'high-contrast', 'system']);
const densities = new Set(['comfortable', 'compact', 'dense']);
const params = new URLSearchParams(location.search);
const theme = params.get('theme') ?? 'light';
const density = params.get('density') ?? 'comfortable';
document.documentElement.setAttribute('data-vui-theme', themes.has(theme) ? theme : 'light');
document.documentElement.setAttribute('data-vui-density', densities.has(density) ? density : 'comfortable');

const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    background: var(--vui-color-background);
    color: var(--vui-color-text);
    font-family: var(--vui-font-sans);
  }
  #board, #keyboard-fixture, #menu-states {
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
    </div>
  </section>
  <section>
    <h2>Input</h2>
    <vui-input id="input-default" label="Name" value="Ada" placeholder="Name"></vui-input>
    <vui-input id="input-invalid" label="Email" value="ada@" invalid hint="Enter a valid email"></vui-input>
    <vui-input label="Notes" value="Read only" readonly></vui-input>
    <vui-input label="Locked" value="Disabled" disabled></vui-input>
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
  </section>
  <section>
    <h2>Select</h2>
    <vui-select id="select" label="Language" value="en">
      <vui-option value="en">English</vui-option>
      <vui-option value="ru">Russian</vui-option>
    </vui-select>
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

document.body.append(board, fixture);

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
