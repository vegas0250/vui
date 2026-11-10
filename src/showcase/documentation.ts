import {
  applyTheme,
  builtInThemes,
  defaultThemes,
  getThemePreference,
  initializeTheme,
  saveThemePreference,
  themeStorageKey,
} from '../theme';
import { docsLocale, escapeHTML, tr } from './theme-i18n';
import { mountDocumentationSite } from './site';
import { documentationStorage } from './preferences';
import { mountThemeStudio } from './theme-studio';
export function mountDocumentation(): void {
  document.documentElement.lang = docsLocale;
  document.querySelector('meta[name="description"]')?.setAttribute('content', docsLocale === 'ru'
    ? 'Библиотека компонентов VUI: рабочие примеры, документация и редактор тем.'
    : 'VUI component library: working examples, documentation and theme editor.');
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://vui.vegas0250.ru/${docsLocale === 'en' ? '?lang=en' : ''}`);
  try {
    initializeTheme(document.documentElement, documentationStorage);
  } catch {
    applyTheme(
      defaultThemes[
        matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      ],
    );
  }
  const old = document.querySelector('#theme-select');
  if (old) {
    old.id = 'legacy-theme-select';
    (old as HTMLElement).hidden = true;
  }
  const controls = document.querySelector('.header-controls');
  const label = document.createElement('label');
  label.className = 'docs-theme-control';
  label.textContent = tr('Theme');
  const select = document.createElement('select');
  select.id = 'docs-theme';
  select.setAttribute('aria-label', tr('Theme'));
  select.add(new Option(tr('Follow system'), 'system'));
  for (const p of builtInThemes) select.add(new Option(p.name, p.id));
  label.append(select);
  controls?.prepend(label);
  const sync = () => {
    let pref: ReturnType<typeof getThemePreference> = null;
    try {
      pref = getThemePreference(documentationStorage);
    } catch {
      /* private browsing */
    }
    if (pref && typeof pref === 'object') {
      if (!select.querySelector('[value=custom]'))
        select.add(new Option(tr('Custom documentation theme'), 'custom'));
      select.value = 'custom';
    } else select.value = pref ?? 'system';
  };
  sync();
  document.documentElement.addEventListener('vui-theme-change', sync);
  select.addEventListener('change', () => {
    if (select.value === 'custom') return;
    try {
      if (select.value === 'system') {
        documentationStorage.removeItem(themeStorageKey);
        applyTheme(
          defaultThemes[
            matchMedia('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
          ],
        );
      } else {
        saveThemePreference(select.value, documentationStorage);
        applyTheme(select.value);
      }
    } catch {
      if (select.value !== 'system') applyTheme(select.value);
    }
    sync();
  });
  const language = document.createElement('a');
  language.href = docsLocale === 'ru' ? '?lang=en' : '?lang=ru';
  language.lang = docsLocale === 'ru' ? 'en' : 'ru';
  language.textContent = docsLocale === 'ru' ? 'English' : 'Русский';
  controls?.append(language);
  const studio = document.createElement('section');
  const intro = document.querySelector('main > .intro');
  if (intro) intro.after(studio);
  else document.querySelector('main')?.prepend(studio);
  mountThemeStudio(studio);
  const internalNav = document.querySelector('.lab-nav');
  for (const [id, text] of [
    ['theme-studio', 'Theme Studio'],
    ['theme-integration', 'Theme integration'],
  ]) {
    const link = document.createElement('a');
    link.href = '#' + id;
    link.textContent = tr(text);
    internalNav?.prepend(link);
  }
  const tools = document.createElement('div');
  tools.className = 'docs-tools';
  tools.innerHTML = `<label>${escapeHTML(tr('Search components'))}<input type="search" id="docs-component-search"/></label><a href="#theme-studio">${escapeHTML(tr('Theme Studio'))} ↗</a>`;
  document.querySelector('#components')?.prepend(tools);
  const panels = [
    ...document.querySelectorAll<HTMLElement>('vui-panel'),
  ].filter((p) => !p.closest('#theme-studio'));
  for (const p of panels) p.classList.add('docs-catalog-panel');
  tools.querySelector('input')?.addEventListener('input', (event) => {
    const search = (event.target as HTMLInputElement).value
      .toLowerCase()
      .trim();
    for (const p of panels) {
      const content = `${p.textContent} ${p.getAttribute('heading')} ${[...p.querySelectorAll('*')].map((el) => el.localName).join(' ')}`;
      p.hidden = !content.toLowerCase().includes(search);
    }
  });
  const addCopy = (pre: HTMLPreElement) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'docs-example-copy';
    button.textContent = tr('Copy example');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.textContent ?? '');
        button.textContent = tr('Copied.');
      } catch {
        button.textContent = tr(
          'Clipboard unavailable. Use the download action.',
        );
      }
    });
    pre.after(button);
  };
  for (const pre of document.querySelectorAll<HTMLPreElement>('pre.code'))
    addCopy(pre);
  const integration = document.createElement('section');
  integration.id = 'theme-integration';
  integration.className = 'category';
  integration.innerHTML = `<h2>${escapeHTML(tr('Theme integration'))}</h2><p>${escapeHTML(tr('Visual theme editor for VUI'))}: JSON / CSS</p><pre class="code"></pre><p><a href="#theme-studio">${escapeHTML(tr('Theme Studio'))}</a></p>`;
  integration.querySelector('pre')!.textContent =
    `import { applyTheme, importThemeJSON, initializeTheme } from 'vui/theme';\ninitializeTheme(document.documentElement, documentationStorage);\napplyTheme('tokyo-night');\nconst theme = importThemeJSON(jsonText);\napplyTheme(theme, document.querySelector('#preview'));\n// CSS export: import './theme.css'; then data-vui-theme="custom".\n// Token reference and integration guide: docs/theme-studio.md`;
  document.querySelector('main')?.append(integration);
  addCopy(integration.querySelector<HTMLPreElement>('pre')!);
  mountDocumentationSite();
}
