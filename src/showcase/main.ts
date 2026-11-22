import '../index';
import './showcase.css';
import { getUIMode } from '../theme';
import { libraryVersion } from './component-data';
import { mountDocumentation } from './documentation';
import { text } from './examples';

export const brandMark = `<svg class="brand-mark" width="28" height="28" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><defs><linearGradient id="vui-brand-g" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6d74ff"/><stop offset=".55" stop-color="#4f56d9"/><stop offset="1" stop-color="#0e7f86"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#vui-brand-g)"/><path d="M44 23.5 32 45" stroke="#fff" stroke-opacity=".55" stroke-width="8.5" stroke-linecap="round"/><path d="M19 19 32 45" stroke="#fff" stroke-width="8.5" stroke-linecap="round"/><rect x="42.5" y="7.5" width="9.5" height="9.5" rx="2.5" fill="#5ccfc2"/></svg>`;

const githubMark = `<svg class="docs-github-mark" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.6 7.6 0 0 1 8 3.58c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>`;

const year = String(new Date().getFullYear());

if (new URLSearchParams(location.search).get('legacy') === '1') {
  // The original regression laboratory remains available without loading its
  // demonstrations and application state on every documentation page.
  void import('./legacy-main');
} else {
  const app = document.querySelector('#app');
  if (!app) throw new Error('Documentation root is missing');
  const uiMode = getUIMode();
  app.innerHTML = `<div class="page">
  <header class="docs-header topbar" role="banner">
    <div class="docs-header-inner">
      <div class="docs-header-start">
        <vui-icon-button class="docs-nav-toggle" name="menu" label="${text('Открыть навигацию', 'Open navigation')}" variant="ghost" size="small"></vui-icon-button>
        <a class="brand" href="#/getting-started" aria-label="VUI">${brandMark}<span class="brand-text">VUI</span></a>
        <nav class="docs-header-nav" aria-label="${text('Основные разделы', 'Primary sections')}">
          <a href="#/getting-started" data-nav="getting-started">${text('Начало', 'Start')}</a>
          <a href="#/components" data-nav="components">${text('Компоненты', 'Components')}</a>
          <a href="#/layouts" data-nav="layouts">${text('Раскладки', 'Layouts')}</a>
          <a href="#/tokens" data-nav="tokens">${text('Токены', 'Tokens')}</a>
          <a href="#/themes" data-nav="themes">${text('Темы', 'Themes')}</a>
        </nav>
      </div>
      <div class="docs-header-end header-controls">
        <vui-input class="docs-header-search" id="header-component-search" type="search" label="${text('Найти компонент', 'Find a component')}" placeholder="${text('Поиск…', 'Search…')}" autocomplete="off">
          <vui-icon slot="prefix" name="search"></vui-icon>
        </vui-input>
        <a class="docs-github" href="https://github.com/vegas0250/vui" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${githubMark}<span class="docs-github-label">GitHub</span></a>
        <vui-select id="ui-mode-select" icon="monitor" label="${text('Режим UI', 'UI mode')}" value="${uiMode}">
          <vui-option value="web">${text('Web', 'Web')}</vui-option>
          <vui-option value="desktop">${text('Desktop', 'Desktop')}</vui-option>
        </vui-select>
      </div>
    </div>
  </header>
  <main></main>
  <footer class="site-footer" aria-label="${text('Подвал сайта', 'Site footer')}">
    <div class="site-footer-inner">
      <div class="site-footer-brand">
        <a class="site-footer-mark" href="#/getting-started">${brandMark}<span>VUI</span></a>
        <p class="site-footer-lead">${text('Персональная библиотека визуальных компонентов для Web, SPA и Desktop.', 'Personal visual component library for Web, SPA, and Desktop.')}</p>
      </div>
      <nav class="site-footer-nav" aria-label="${text('Разделы', 'Sections')}">
        <a href="#/getting-started">${text('Начало', 'Getting started')}</a>
        <a href="#/components">${text('Компоненты', 'Components')}</a>
        <a href="#/layouts">${text('Раскладки', 'Layouts')}</a>
        <a href="#/patterns">${text('Паттерны', 'Patterns')}</a>
        <a href="#/templates">${text('Шаблоны', 'Templates')}</a>
        <a href="#/themes">${text('Theme Studio', 'Theme Studio')}</a>
        <a href="#/icons">${text('Иконки', 'Icons')}</a>
        ${import.meta.env.DEV ? `<a href="layout.html">${text('Галерея', 'Gallery')}</a>` : '' /* layout.html is dev-only (404 on the docs site) */}
      </nav>
      <div class="site-footer-meta">
        <span>v${libraryVersion}</span>
        <span aria-hidden="true">·</span>
        <a href="https://vui.vegas0250.ru/">vui.vegas0250.ru</a>
        <span aria-hidden="true">·</span>
        <a href="https://vegas0250.ru/" rel="noopener noreferrer">${text('vegas0250', 'vegas0250')}</a>
        <span aria-hidden="true">·</span>
        <span>© ${year} vegas0250</span>
      </div>
    </div>
  </footer>
</div>`;
  mountDocumentation();
}
