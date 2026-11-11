import '../index';
import './showcase.css';
import { getUIMode } from '../theme';
import { mountDocumentation } from './documentation';
import { text } from './examples';

const brandMark = `<svg class="brand-mark" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false"><rect x="1.5" y="1.5" width="25" height="25" rx="7" fill="var(--vui-color-surface)" stroke="var(--vui-color-border)" stroke-width="1"/><path d="M7.2 8.2h3.1l3.7 9.2 3.7-9.2h3.1L15.2 20.2h-2.4L7.2 8.2Z" fill="var(--vui-color-primary)"/><circle cx="21.2" cy="7.4" r="1.35" fill="var(--vui-color-primary)"/></svg>`;

if (new URLSearchParams(location.search).get('legacy') === '1') {
  // The original regression laboratory remains available without loading its
  // demonstrations and application state on every documentation page.
  void import('./legacy-main');
} else {
  const app = document.querySelector('#app');
  if (!app) throw new Error('Documentation root is missing');
  const uiMode = getUIMode();
  app.innerHTML = `<div class="page"><vui-toolbar class="topbar" wrap label="VUI"><a class="brand" slot="start" href="#/" aria-label="VUI">${brandMark}<span class="brand-text">VUI</span></a><div class="header-controls" slot="end"><vui-select id="ui-mode-select" label="${text('Режим UI', 'UI mode')}" value="${uiMode}" size="small"><vui-option value="web">${text('Web design', 'Web design')}</vui-option><vui-option value="desktop">${text('Desktop design', 'Desktop design')}</vui-option><vui-option value="terminal">${text('Terminal design', 'Terminal design')}</vui-option></vui-select></div></vui-toolbar><main></main></div>`;
  mountDocumentation();
}
