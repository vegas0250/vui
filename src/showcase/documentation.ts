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
  /* Two documentation themes only: a sun/moon switch. `value` stays programmatic
     (any preset id, 'system' or 'custom') for tests and Theme Studio state. */
  const select = document.createElement('button') as HTMLButtonElement & { value: string };
  select.type = 'button';
  select.id = 'docs-theme';
  select.className = 'docs-theme-toggle';
  select.setAttribute('role', 'switch');
  select.setAttribute('aria-label', tr('Dark theme'));
  select.innerHTML =
    '<span class="docs-theme-thumb" aria-hidden="true"></span>' +
    '<vui-icon name="sun" aria-hidden="true"></vui-icon>' +
    '<vui-icon name="moon" aria-hidden="true"></vui-icon>';
  let current = 'system';
  Object.defineProperty(select, 'value', {
    get: () => current,
    set: (next: string) => { current = String(next); },
  });
  const isDark = () => {
    const id = document.documentElement.getAttribute('data-vui-theme') ?? '';
    const mode = builtInThemes.find((t) => t.id === id)?.mode;
    if (mode) return mode === 'dark';
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--vui-color-background').trim();
    const hex = /^#([0-9a-f]{6})/i.exec(bg)?.[1];
    if (hex) {
      const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
      return 0.299 * r + 0.587 * g + 0.114 * b < 128;
    }
    return matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const uiMode = document.querySelector('#ui-mode-select');
  if (uiMode?.parentElement === controls) controls?.insertBefore(select, uiMode);
  else controls?.append(select);
  const sync = () => {
    let pref: ReturnType<typeof getThemePreference> = null;
    try {
      pref = getThemePreference(documentationStorage);
    } catch {
      /* private browsing */
    }
    current = pref && typeof pref === 'object' ? 'custom' : (pref ?? 'system');
    const dark = isDark();
    select.setAttribute('aria-checked', String(dark));
    select.title = tr(dark ? 'Switch to light theme' : 'Switch to dark theme');
  };
  sync();
  document.documentElement.addEventListener('vui-theme-change', sync);
  select.addEventListener('click', () => {
    current = defaultThemes[isDark() ? 'light' : 'dark'];
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
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
  const language = document.createElement('vui-select') as HTMLElement & { value: string };
  language.id = 'docs-lang';
  language.setAttribute('label', tr('Language'));
  language.setAttribute('icon', 'globe');
  for (const [value, label] of [['ru', 'RU'], ['en', 'EN']] as const) {
    const option = document.createElement('vui-option') as HTMLElement & { value: string };
    option.value = value;
    option.textContent = label;
    language.append(option);
  }
  language.value = docsLocale;
  language.addEventListener('change', () => {
    if (language.value === docsLocale) return;
    location.assign(`?lang=${language.value}${location.hash}`);
  });
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
  tools.innerHTML = `<vui-input id="docs-component-search" type="search" label="${escapeHTML(tr('Search components'))}"></vui-input><a href="#theme-studio">${escapeHTML(tr('Theme Studio'))} ↗</a>`;
  document.querySelector('#components')?.prepend(tools);
  const panels = [
    ...document.querySelectorAll<HTMLElement>('vui-panel'),
  ].filter((p) => !p.closest('#theme-studio'));
  for (const p of panels) p.classList.add('docs-catalog-panel');
  tools.querySelector('#docs-component-search')?.addEventListener('input', (event) => {
    const host = event.currentTarget as HTMLElement & { value: string };
    const search = host.value.toLowerCase().trim();
    for (const p of panels) {
      const content = `${p.textContent} ${p.getAttribute('heading')} ${[...p.querySelectorAll('*')].map((el) => el.localName).join(' ')}`;
      p.hidden = !content.toLowerCase().includes(search);
    }
  });
  const addCopy = (pre: HTMLPreElement) => {
    const button = document.createElement('vui-button');
    button.setAttribute('type', 'button');
    button.setAttribute('size', 'small');
    button.setAttribute('variant', 'ghost');
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
