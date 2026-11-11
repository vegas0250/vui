import { escapeHTML, tr } from './theme-i18n';
import type { VDataGrid } from '../components/data/data-grid';
import type { VDialog } from '../components/overlay/dialog';
import type { VToaster } from '../components/feedback/toast';
export const previewTemplates = [
  'components',
  'dashboard',
  'settings',
  'login',
  'developer',
] as const;
export const templateLabels = {
  components: 'Components',
  dashboard: 'Dashboard',
  settings: 'Settings',
  login: 'Login',
  developer: 'Developer tools',
};
const t = (s: string) => escapeHTML(tr(s));
const buttons = () =>
  `<vui-hstack gap="sm" wrap><vui-button data-demo-action>${t('Primary')}</vui-button><vui-button variant="secondary" data-demo-action>${t('Secondary')}</vui-button><vui-button variant="ghost" data-demo-action>${t('Ghost')}</vui-button><vui-button data-demo-action tone="accent" variant="solid">${t('Accent')}</vui-button><vui-button disabled>${t('Disabled')}</vui-button></vui-hstack>`;
const fields = () =>
  `<vui-input label="${t('Name')}" value="VUI"></vui-input><vui-textarea label="${t('Notes')}" rows="2"></vui-textarea><vui-select label="${t('Category')}" value="design"><vui-option value="design">${t('Design')}</vui-option><vui-option value="development">${t('Development')}</vui-option></vui-select><vui-checkbox checked>${t('Notifications')}</vui-checkbox><vui-radio-group label="${t('Plan')}" value="monthly"><vui-radio value="monthly" checked>${t('Monthly')}</vui-radio><vui-radio value="yearly">${t('Yearly')}</vui-radio></vui-radio-group><vui-switch checked>${t('Notifications')}</vui-switch><vui-slider label="${t('Volume')}" value="60" min="0" max="100"></vui-slider>`;
const nav = () =>
  `<vui-nav label="${t('Workspace')}"><vui-nav-item href="#theme-studio" selected>${t('Overview')}</vui-nav-item href="#theme-studio">${t('Projects')}</vui-nav-item href="#theme-studio">${t('Settings')}</vui-nav-item></vui-nav>`;
export function previewMarkup(
  template: (typeof previewTemplates)[number],
): string {
  const content = {
    components: `<div class="ts-preview-grid"><vui-panel heading="${t('Components')}"><vui-vstack gap="md">${buttons()}${fields()}</vui-vstack></vui-panel><vui-panel heading="${t('Live components')}"><vui-vstack gap="md">${['success', 'warning', 'danger', 'info'].map((v) => `<vui-alert variant="${v}">${t(v === 'danger' ? 'Error' : v[0].toUpperCase() + v.slice(1))}</vui-alert>`).join('')}<vui-hstack gap="sm" wrap><vui-badge variant="success">${t('Ready')}</vui-badge><vui-avatar label="Ada Lovelace"></vui-avatar><vui-tooltip text="${t('Help')}"><vui-button variant="secondary">${t('Help')}</vui-button></vui-tooltip></vui-hstack><vui-progress label="${t('Upload')}" value="65"></vui-progress><vui-tabs label="${t('Overview')}"><vui-tab panel="overview" selected>${t('Overview')}</vui-tab><vui-tab panel="details">${t('Details')}</vui-tab><vui-tab-panel name="overview">VUI</vui-tab-panel><vui-tab-panel name="details">${t('Ready')}</vui-tab-panel></vui-tabs><vui-popover label="${t('Settings')}"><vui-button variant="secondary">${t('Settings')}</vui-button><vui-checkbox slot="panel" checked>${t('Notifications')}</vui-checkbox></vui-popover><vui-button data-preview-modal>${t('Open dialog')}</vui-button><vui-button data-preview-toast>${t('Show toast')}</vui-button><vui-skeleton></vui-skeleton><vui-data-grid data-preview-grid label="${t('Projects')}"></vui-data-grid><vui-pagination pages="5" page="1" label="${t('Projects')}"></vui-pagination></vui-vstack></vui-panel></div>`,
    dashboard: `<div class="ts-dashboard">${nav()}<div><vui-toolbar label="${t('Dashboard')}" wrap><strong slot="start">${t('Dashboard')}</strong><vui-button slot="end" data-demo-action>${t('Save')}</vui-button></vui-toolbar><div class="ts-statistics">${[
      ['Visits', '12,840'],
      ['Revenue', '24,800'],
      ['Active projects', '12'],
    ]
      .map(
        ([title, n]) =>
          `<vui-panel heading="${t(title)}"><strong class="ts-stat">${n}</strong></vui-panel>`,
      )
      .join(
        '',
      )}</div><vui-panel heading="${t('Activity')}"><vui-data-grid data-preview-grid label="${t('Projects')}"></vui-data-grid></vui-panel></div></div>`,
    settings: `<vui-panel heading="${t('Settings')}"><form class="ts-preview-form"><vui-input label="${t('Name')}" value="Ada"></vui-input><vui-input label="${t('Email')}" type="email" value="ada@example.com"></vui-input><vui-select label="${t('Plan')}" value="monthly"><vui-option value="monthly">${t('Monthly')}</vui-option><vui-option value="yearly">${t('Yearly')}</vui-option></vui-select><vui-switch checked>${t('Notifications')}</vui-switch><vui-button type="submit" data-demo-action>${t('Save')}</vui-button></form></vui-panel>`,
    login: `<vui-panel class="ts-login" heading="${t('Sign in')}"><form class="ts-preview-form"><vui-input label="${t('Email')}" type="email"></vui-input><vui-input label="${t('Password')}" type="password"></vui-input><vui-button type="submit" data-demo-action>${t('Sign in')}</vui-button><vui-link href="#theme-integration">${t('Documentation')}</vui-link><p>${t('Demo only. No credentials are sent.')}</p></form></vui-panel>`,
    developer: `<vui-panel heading="${t('Developer tools')}"><vui-toolbar label="${t('Developer tools')}" wrap><vui-button slot="start" data-copy-code>${t('Copy')}</vui-button><vui-button slot="end" data-demo-action>${t('Run preview')}</vui-button></vui-toolbar><vui-textarea data-code-input label="${t('Code')}" rows="9" value="&lt;vui-button&gt;VUI&lt;/vui-button&gt;"></vui-textarea><vui-alert variant="info">${t('Ready')}</vui-alert><vui-button data-preview-toast>${t('Show toast')}</vui-button></vui-panel>`,
  };
  return `${content[template]}<p class="ts-preview-result" role="status"></p><vui-dialog data-preview-dialog heading="${t('Confirm action')}"><p>${t('A real VUI dialog using your draft tokens.')}</p><vui-button data-preview-close>${t('Close')}</vui-button></vui-dialog><vui-toaster data-preview-toaster></vui-toaster>`;
}
export function wirePreview(root: HTMLElement): void {
  for (const grid of root.querySelectorAll<VDataGrid>('[data-preview-grid]')) {
    grid.columns = [
      { key: 'name', title: tr('Project') },
      { key: 'status', title: tr('Status') },
    ];
    grid.rows = [
      { id: 'vui', name: 'VUI', status: tr('Ready') },
      { id: 'documentation', name: 'VUI Docs', status: tr('Ready') },
    ];
  }
  root.addEventListener('click', async (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest(
            '[data-preview-modal],[data-preview-close],[data-preview-toast],[data-demo-action],[data-copy-code]',
          )
        : null;
    if (!target) return;
    if (target.hasAttribute('data-preview-modal'))
      root.querySelector<VDialog>('[data-preview-dialog]')?.show();
    if (target.hasAttribute('data-preview-close'))
      root.querySelector<VDialog>('[data-preview-dialog]')?.close();
    if (target.hasAttribute('data-preview-toast'))
      root
        .querySelector<VToaster>('[data-preview-toaster]')
        ?.show({ message: tr('Saved locally.'), variant: 'success' });
    if (target.hasAttribute('data-demo-action')) {
      const result = root.querySelector('[role=status]');
      if (result) result.textContent = tr('Example action completed.');
    }
    if (target.hasAttribute('data-copy-code')) {
      let message = 'Copied.';
      try {
        await navigator.clipboard.writeText(
          root.querySelector('[data-code-input]')?.getAttribute('value') ?? '',
        );
      } catch {
        message = 'Clipboard unavailable. Use the download action.';
      }
      const result = root.querySelector('[role=status]');
      if (result) result.textContent = tr(message);
    }
  });
  root.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = root.querySelector('[role=status]');
    if (result) result.textContent = tr('Example action completed.');
  });
}
