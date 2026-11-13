import '../index';
import { listThemes, setTheme, setUIMode, type VuiUIMode } from '../theme';
import { exampleMarkup } from './examples';
import { bindLayout, layoutExample, type LayoutId } from './layouts';
import './examples.css';
import './layout-gallery.css';

const apps: LayoutId[] = ['dashboard', 'settings', 'workspace'];
const modes: VuiUIMode[] = ['web', 'desktop', 'terminal'];
const widths = ['375', '768', '1280', '1920', 'full'] as const;
const params = new URLSearchParams(location.search);

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

const state = {
  app: pick(params.get('app'), apps, 'dashboard'),
  ui: pick(params.get('ui'), modes, 'web'),
  theme: params.get('theme') || 'catppuccin-latte',
  width: pick(params.get('width'), widths, 'full'),
};

const themeIds = new Set(listThemes().map((theme) => theme.id));
if (!themeIds.has(state.theme) && !['light', 'dark', 'high-contrast', 'system'].includes(state.theme)) {
  state.theme = 'catppuccin-latte';
}

function remember(): void {
  const next = new URLSearchParams({
    lang: 'en',
    app: state.app,
    ui: state.ui,
    theme: state.theme,
    width: state.width,
  });
  history.replaceState(null, '', `${location.pathname}?${next}`);
}

function applyChrome(): void {
  setTheme(state.theme);
  setUIMode(state.ui);
  const theme = document.querySelector<HTMLElement & { value: string }>('#layout-theme');
  const ui = document.querySelector<HTMLElement & { value: string }>('#layout-ui');
  const app = document.querySelector<HTMLElement & { value: string }>('#layout-app');
  if (theme) theme.value = state.theme;
  if (ui) ui.value = state.ui;
  if (app) app.value = state.app;
  const frame = document.querySelector<HTMLElement>('#frame');
  if (!frame) return;
  if (state.width === 'full') frame.removeAttribute('data-width');
  else {
    frame.dataset.width = state.width;
    frame.style.setProperty('--frame-width', `${state.width}px`);
  }
  for (const button of document.querySelectorAll<HTMLElement>('#chrome [data-width]')) {
    button.setAttribute('variant', button.dataset.width === state.width ? 'secondary' : 'ghost');
    button.toggleAttribute('aria-pressed', button.dataset.width === state.width);
  }
}

function showApp(): void {
  const frame = document.querySelector('#frame');
  if (!frame) return;
  frame.innerHTML = exampleMarkup(layoutExample(state.app));
  const example = frame.querySelector<HTMLElement>('[data-example]');
  if (example) bindLayout(example);
}

const themeOptions = listThemes()
  .map((theme) => `<vui-option value="${theme.id}">${theme.name}</vui-option>`)
  .join('');
const widthButtons = widths
  .map((width) => `<vui-button size="small" variant="ghost" data-width="${width}" aria-pressed="false">${width === 'full' ? 'Full' : width}</vui-button>`)
  .join('');

const app = document.querySelector('#app');
if (!app) throw new Error('Layout gallery root is missing');
app.innerHTML = `<div id="chrome"><vui-toolbar label="Layout gallery"><strong slot="start">Layouts</strong><vui-select id="layout-app" label="Layout" value="${state.app}"><vui-option value="dashboard">Dashboard</vui-option><vui-option value="settings">Settings</vui-option><vui-option value="workspace">Workspace</vui-option></vui-select><vui-select id="layout-ui" label="UI mode" value="${state.ui}"><vui-option value="web">Web</vui-option><vui-option value="desktop">Desktop</vui-option><vui-option value="terminal">Terminal</vui-option></vui-select><vui-select id="layout-theme" label="Theme" value="${state.theme}">${themeOptions}</vui-select></vui-toolbar><vui-toolbar label="Viewport"><vui-button-group slot="start" label="Viewport">${widthButtons}</vui-button-group></vui-toolbar></div><div id="stage"><div id="frame"></div></div>`;

const read = (id: string) => document.querySelector<HTMLElement & { value: string }>(id)?.value ?? '';
for (const id of ['#layout-app', '#layout-ui', '#layout-theme']) {
  document.querySelector(id)?.addEventListener('change', () => {
    state.app = pick(read('#layout-app'), apps, state.app);
    state.ui = pick(read('#layout-ui'), modes, state.ui);
    const theme = read('#layout-theme');
    if (theme) state.theme = theme;
    remember();
    applyChrome();
    if (id === '#layout-app') showApp();
  });
}
for (const button of document.querySelectorAll<HTMLElement>('[data-width]')) {
  button.addEventListener('click', () => {
    state.width = pick(button.dataset.width ?? null, widths, 'full');
    remember();
    applyChrome();
  });
}

applyChrome();
showApp();
