import '../index';
import './showcase.css';
import { mountDocumentation } from './documentation';
import { text } from './examples';

if (new URLSearchParams(location.search).get('legacy') === '1') {
  // The original regression laboratory remains available without loading its
  // demonstrations and application state on every documentation page.
  void import('./legacy-main');
} else {
  const app = document.querySelector('#app');
  if (!app) throw new Error('Documentation root is missing');
  app.innerHTML = `<div class="page"><vui-toolbar class="topbar" label="VUI"><span class="brand" slot="start">VUI</span><div class="header-controls" slot="end"><vui-select id="density-select" label="${text('Плотность', 'Density')}" value="comfortable" size="small"><vui-option value="comfortable">${text('Свободная', 'Comfortable')}</vui-option><vui-option value="compact">${text('Компактная', 'Compact')}</vui-option><vui-option value="dense">${text('Плотная', 'Dense')}</vui-option></vui-select></div></vui-toolbar><main></main></div>`;
  mountDocumentation();
}
