import { componentCatalog, componentGroup, componentImport, description, extraProperties, libraryVersion } from './component-data';
import { buttonSections, exampleFor, interfaceExample, renderExample, exampleJsx, prettyMarkup, text, wireExample } from './examples';
import type { Example } from './examples';
import type { ComponentContract } from '../contract';
import { setUIMode } from '../theme';
import type { VuiUIMode } from '../theme';
import { docsLocale, escapeHTML } from './theme-i18n';
import { documentationStorage } from './preferences';
import './site.css';
import './examples.css';

const sections = () => [
  ['getting-started', text('Начало работы', 'Getting Started')],
  ['components', text('Компоненты', 'Components')],
  ['examples', text('Примеры интерфейсов', 'Interface Examples')],
  ['themes', text('Темы', 'Themes')],
];
const interfaces = () => [
  ['settings', text('Форма настроек', 'Settings form'), text('Валидация, поля, выбор и сохранение.', 'Validation, fields, selection, and saving.')],
  ['table', text('Таблица с фильтрами', 'Table with filters'), text('Поиск, статус и выбор строки.', 'Search, status filters, and row selection.')],
  ['dialog', text('Диалог подтверждения', 'Confirmation dialog'), text('Открытие, Escape и возврат фокуса.', 'Opening, Escape, and focus restoration.')],
  ['shell', text('Каркас приложения', 'Application shell'), text('Навигация, панель действий, форма и строка состояния.', 'Navigation, toolbar, form, and status bar.')],
];
const groups: Record<string, [string, string]> = {
  actions: ['Действия', 'Actions'], forms: ['Формы', 'Forms'], overlay: ['Всплывающие элементы', 'Overlays'],
  navigation: ['Навигация', 'Navigation'], feedback: ['Обратная связь', 'Feedback'], content: ['Содержимое', 'Content'],
  foundation: ['Иконки', 'Icons'], layout: ['Раскладка', 'Layout'], desktop: ['Приложение', 'Application'], data: ['Данные', 'Data'],
};
const groupName = (name: string) => groups[name]?.[docsLocale === 'ru' ? 0 : 1] ?? name;
const title = (tag: string) => tag.replace('vui-', '').split('-').map((s) => s[0]!.toUpperCase() + s.slice(1)).join(' ');
const link = (path: string, label: string, extra = '') => `<a href="#/${path}" ${extra}>${escapeHTML(label)}</a>`;
const labels = (values: readonly string[]) => values.length ? values.map((value) => `<code>${escapeHTML(value || text('по умолчанию', 'default'))}</code>`).join(' · ') : text('Нет', 'None');
const heading = (name: string, body: string) => `<section class="docs-section"><h2>${name}</h2>${body}</section>`;

function api(contract: ComponentContract): string {
  const rows = contract.attributes.map((attribute) => `<tr><th scope="row"><code>${attribute.name}</code></th><td>${attribute.property ?? attribute.name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())}</td><td>${attribute.kind}</td><td>${labels(attribute.values ?? [])}</td></tr>`).join('');
  const extras = extraProperties[contract.element] ?? [];
  return heading(text('Атрибуты и свойства', 'Attributes and properties'), `<div class="docs-table"><table><thead><tr><th>${text('Атрибут', 'Attribute')}</th><th>${text('Свойство', 'Property')}</th><th>${text('Тип', 'Type')}</th><th>${text('Значения', 'Values')}</th></tr></thead><tbody>${rows || `<tr><td colspan="4">${text('Специальных атрибутов нет. Стандартные HTML-атрибуты поддерживаются.', 'No component-specific attributes. Standard HTML attributes are supported.')}</td></tr>`}</tbody></table></div>${extras.length ? `<ul>${extras.map(([name, type]) => `<li><code>${name}</code> — <code>${escapeHTML(type)}</code></li>`).join('')}</ul>` : ''}<p>${text('Строковые свойства отражаются в атрибуты. Булевы состояния обычно задаются наличием атрибута; для выключения удалите атрибут. dismissable="false" — явное исключение для закрытия диалога.', 'String properties reflect to attributes. Boolean states usually use attribute presence; remove an attribute to turn it off. dismissable="false" is the explicit exception for dialog dismissal.')}</p>`) +
    heading(text('События', 'Events'), contract.events.length ? `<ul>${contract.events.map((event) => `<li><code>${event}</code> — ${text('слушайте через addEventListener на элементе', 'listen with addEventListener on the element')}</li>`).join('')}</ul><p>${text('События VUI проходят через Shadow DOM. close у Menu не всплывает: слушайте его непосредственно на меню.', 'VUI events cross the shadow boundary. Menu close does not bubble: listen directly on the menu.')}</p>` : `<p>${text('Собственных событий нет.', 'No component-specific events.')}</p>`) +
    heading(text('Методы, слоты и CSS parts', 'Methods, slots, and CSS parts'), `<dl><dt>${text('Методы', 'Methods')}</dt><dd>${labels(contract.methods)}</dd><dt>${text('Слоты', 'Slots')}</dt><dd>${labels(contract.slots)}</dd><dt>CSS parts</dt><dd>${labels(contract.parts)}</dd></dl>`) +
    heading(text('Доступность', 'Accessibility'), `<p>${text('Задайте понятную подпись для интерактивного элемента. Не убирайте видимый фокус; проверяйте интерфейс без мыши и с увеличенным масштабом.', 'Give interactive elements meaningful labels. Keep focus visible; test without a mouse and with browser zoom.')}</p><dl><dt>${text('Клавиатура', 'Keyboard')}</dt><dd>${labels(contract.keyboard)}</dd><dt>${text('Фокус', 'Focus')}</dt><dd>${contract.focus === 'roving' ? text('Один Tab-вход; перемещение внутри стрелками.', 'One Tab stop; use arrow keys within the component.') : contract.keyboard.length ? text('Нативный фокус и видимый индикатор.', 'Native focus and a visible indicator.') : text('Неинтерактивный элемент: не добавляйте лишние Tab-остановки.', 'Non-interactive element: avoid unnecessary Tab stops.')}</dd>${contract.role ? `<dt>ARIA</dt><dd><code>${contract.role}</code></dd>` : ''}</dl><p>${['vui-dialog', 'vui-drawer'].includes(contract.element) ? text('Диалог удерживает фокус и возвращает его к кнопке открытия. Escape закрывает верхний допустимый слой.', 'The dialog contains focus and restores it to its trigger. Escape dismisses the top eligible layer.') : text('Дочерние элементы используйте с родителем, показанным в примере. Декоративные иконки не заменяют текстовую подпись.', 'Use child elements with the parent shown in the example. Decorative icons do not replace a text label.')}</p>`);
}
function variants(contract: ComponentContract): Example[] {
  if (contract.element === 'vui-button') return buttonSections().map((section) => section.example);
  const examples: Example[] = [];
  for (const attribute of contract.attributes.filter((a) => a.kind === 'enum')) {
    for (const value of attribute.values?.slice(0, 4) ?? []) {
      const example = exampleFor(contract.element);
      const template = document.createElement('template');
      template.innerHTML = example.html;
      template.content.querySelector(contract.element)?.setAttribute(attribute.name, value);
      examples.push({ id: `${example.id}-${attribute.name}-${value}`, html: template.innerHTML });
    }
  }
  for (const state of contract.states) {
    const example = exampleFor(contract.element);
    const template = document.createElement('template');
    template.innerHTML = example.html;
    template.content.querySelector(contract.element)?.setAttribute(state, '');
    examples.push({ id: `${example.id}-${state}`, html: template.innerHTML });
  }
  return examples;
}

function demoSections(contract: ComponentContract, show: (example: Example) => string): string {
  if (contract.element === 'vui-button') {
    return buttonSections().map((section) => heading(section.title, show(section.example))).join('');
  }
  const items = variants(contract);
  return heading(text('Живой пример', 'Live example'), show(exampleFor(contract.element)))
    + heading(text('Варианты и состояния', 'Variants and states'), items.map((example) => show(example)).join('')
      || `<p>${text('Использует общие токены темы и режима UI. Собственных вариантов нет.', 'Uses shared theme and UI mode tokens; no component-specific variants.')}</p>`);
}

export function mountDocumentationSite(): void {
  if (new URLSearchParams(location.search).get('legacy') === '1') return;
  const main = document.querySelector('main')!;
  const studio = document.querySelector<HTMLElement>('#theme-studio')!;
  const legacy = document.createElement('div');
  legacy.id = 'docs-legacy';
  legacy.hidden = true;
  for (const child of [...main.children]) if (child !== studio) legacy.append(child);
  main.append(legacy);
  const layout = document.createElement('div');
  layout.className = 'documentation-layout';
  const catalog = componentCatalog();
  layout.innerHTML = `<aside class="docs-sidebar"><a class="docs-wordmark" href="#/getting-started">VUI <span>${text('Документация', 'Documentation')} · ${libraryVersion}</span></a><nav aria-label="${text('Разделы документации', 'Documentation sections')}">${sections().map(([id, label]) => link(id!, label!)).join('')}</nav><label class="docs-search">${text('Найти компонент', 'Find a component')}<input type="search" id="component-search" autocomplete="off" /></label><details class="docs-menu-disclosure" open><summary>${text('Каталог компонентов', 'Component catalog')}</summary><nav id="docs-component-menu" aria-label="${text('Каталог компонентов', 'Component catalog')}"></nav></details></aside><article id="docs-page" class="docs-page"></article>`;
  const content = document.createElement('div');
  content.className = 'docs-content';
  content.append(layout.querySelector('#docs-page')!, studio);
  layout.append(content);
  main.prepend(layout);
  document.body.classList.add('documentation-site');
  const header = document.querySelector<HTMLElement>('.topbar');
  if (header) new ResizeObserver(() => {
    document.body.style.setProperty('--docs-header-height', `${header.getBoundingClientRect().height}px`);
  }).observe(header);
  document.querySelector('#dir-select')?.setAttribute('hidden', '');
  const renderedExamples = new Map<string, Example>();
  const showExample = (example: Example) => {
    renderedExamples.set(example.id, example);
    return renderExample(example);
  };
  const uiMode = document.querySelector<HTMLElement & { value: string }>('#ui-mode-select');
  uiMode?.setAttribute('label', text('Режим UI', 'UI mode'));
  for (const option of uiMode?.querySelectorAll('vui-option') ?? []) {
    const value = option.getAttribute('value');
    option.textContent =
      value === 'desktop'
        ? text('Desktop design', 'Desktop design')
        : value === 'terminal'
          ? text('Terminal design', 'Terminal design')
          : text('Web design', 'Web design');
  }
  try {
    const saved = documentationStorage.getItem('vui.docs.ui');
    const legacy = documentationStorage.getItem('vui.docs.density');
    const next =
      saved === 'web' || saved === 'desktop' || saved === 'terminal'
        ? saved
        : legacy === 'compact' || legacy === 'dense' || legacy === 'desktop'
          ? 'desktop'
          : legacy === 'comfortable' || legacy === 'web'
            ? 'web'
            : null;
    if (next && uiMode) {
      uiMode.value = next;
      setUIMode(next as VuiUIMode);
    }
  } catch { /* Storage is optional. */ }
  uiMode?.addEventListener('change', () => {
    setUIMode(uiMode.value as VuiUIMode);
    try {
      documentationStorage.setItem('vui.docs.ui', uiMode.value);
      documentationStorage.removeItem('vui.docs.density');
    } catch { /* Storage is optional. */ }
  });
  const page = layout.querySelector<HTMLElement>('#docs-page')!;
  const menu = layout.querySelector<HTMLElement>('#docs-component-menu')!;
  const search = layout.querySelector<HTMLInputElement>('#component-search')!;
  const paintMenu = () => {
    const query = search.value.trim().toLowerCase();
    const found = catalog.filter((c) => `${c.element} ${description(c.element, 'ru')} ${description(c.element, 'en')}`.toLowerCase().includes(query));
    menu.innerHTML = Object.keys(groups).map((group) => {
      const items = found.filter((c) => componentGroup(c.element) === group);
      return items.length ? `<details open><summary>${groupName(group)}</summary>${items.map((c) => link(`components/${c.element.slice(4)}`, title(c.element), `data-component-link="${c.element}"`)).join('')}</details>` : '';
    }).join('') || `<p role="status">${text('Компоненты не найдены', 'No components found')}</p>`;
    for (const a of menu.querySelectorAll('a')) if (a.getAttribute('href') === location.hash) a.setAttribute('aria-current', 'page');
  };
  const disclosure = layout.querySelector<HTMLDetailsElement>('.docs-menu-disclosure')!;
  const desktop = matchMedia('(min-width: 641px)');
  const updateMenu = () => { disclosure.open = desktop.matches || search.value.trim().length > 0; };
  updateMenu();
  desktop.addEventListener('change', updateMenu);
  search.addEventListener('input', () => { updateMenu(); paintMenu(); });
  const render = () => {
    // Close active overlays before replacing their DOM so focus is restored.
    for (const el of page.querySelectorAll('vui-dialog[open], vui-drawer[open], vui-menu[open], vui-popover[open]')) {
      if ('close' in el && typeof el.close === 'function') el.close();
    }
    renderedExamples.clear();
    const path = location.hash.slice(2).split('/');
    const section = path[0] || 'getting-started';
    studio.hidden = section !== 'themes';
    let name = sections().find(([id]) => id === section)?.[1] ?? text('Страница не найдена', 'Page not found');
    if (section === 'components' && path[1]) {
      const contract = catalog.find((c) => c.element === `vui-${path[1]}`);
      if (contract) {
        name = title(contract.element);
        page.innerHTML = `<p class="docs-eyebrow">${link('components', text('Компоненты', 'Components'))} / ${groupName(componentGroup(contract.element))}</p><h1 tabindex="-1">${name}</h1><p class="docs-lead">${description(contract.element, docsLocale)}</p><pre class="docs-import"><code>import '${componentImport(contract.element)}';</code></pre>${demoSections(contract, showExample)}${api(contract)}`;
      } else page.innerHTML = `<h1>${name}</h1>${link('components', text('Открыть каталог', 'Open catalog'))}`;
    } else if (section === 'components') {
      page.innerHTML = `<h1 tabindex="-1">${name}</h1><p class="docs-lead">${catalog.length} ${text('компонентов. Выберите элемент, изучите состояния и скопируйте рабочий пример.', 'components. Choose an element, explore its states, and copy a working example.')}</p><div class="docs-cards">${catalog.map((c) => `<a class="docs-card" href="#/components/${c.element.slice(4)}"><strong>${title(c.element)}</strong><code>${c.element}</code><p>${description(c.element, docsLocale)}</p></a>`).join('')}</div>`;
    } else if (section === 'examples') {
      const example = interfaces().find(([id]) => id === path[1]);
      if (example) {
        name = example[1]!;
        page.innerHTML = `<p>${link('examples', text('Примеры интерфейсов', 'Interface Examples'))}</p><h1 tabindex="-1">${name}</h1><p class="docs-lead">${example[2]}</p>${showExample(interfaceExample(example[0]!))}`;
      } else page.innerHTML = `<h1 tabindex="-1">${name}</h1><p class="docs-lead">${text('Рабочие сценарии из настоящих компонентов VUI, без копирования их реализации.', 'Working scenarios composed from real VUI components.')}</p><div class="docs-cards">${interfaces().map(([id, label, description]) => `<a class="docs-card" href="#/examples/${id}"><strong>${label}</strong><p>${description}</p></a>`).join('')}</div>`;
    } else if (section === 'themes') {
      page.innerHTML = `<h1 tabindex="-1">${name}</h1><p class="docs-lead">${text('Тема документации меняется на верхней панели. Черновик редактора применяется только к просмотру, пока вы явно не примените его к документации.', 'Change the documentation theme in the top bar. Editor drafts affect only the preview until explicitly applied to documentation.')}</p>${heading(text('Подключение темы', 'Theme integration'), `<pre><code>import { initializeTheme, setUIMode } from 'vui/theme';\ninitializeTheme();\nsetUIMode('desktop');</code></pre><p>${text('Используйте JSON для импорта, CSS — для подключения экспортированных токенов. Импорт исполняемого CSS не поддерживается.', 'Import JSON or use exported CSS tokens in your application. Importing executable CSS is not supported.')}</p>`)}`;
    } else {
      page.innerHTML = `<p class="docs-eyebrow">WEB COMPONENTS · REACT · NEXT.JS · ELECTRON</p><h1 tabindex="-1">${text('Интерфейсы из понятных компонентов', 'Build interfaces from clear components')}</h1><p class="docs-lead">${text('Найдите компонент, проверьте его поведение и перенесите готовый пример в свой проект. Одна библиотека и общие токены для всех тем.', 'Find a component, explore its behavior, and take a working example into your project. One library and shared tokens for every theme.')}</p><div class="docs-actions">${link('components', text('Открыть каталог', 'Browse components'))}${link('examples', text('Собрать интерфейс', 'Build an interface'))}</div>${heading(text('Установка', 'Installation'), '<pre><code>pnpm add vui</code></pre>')}${heading(text('Первый компонент', 'Your first component'), showExample(exampleFor('vui-button')))}${heading('React / Next.js', `<pre><code>import { Button } from 'vui/react';\n\nexport default function Page() {\n  return &lt;Button variant="primary"&gt;${text('Сохранить', 'Save')}&lt;/Button&gt;;\n}</code></pre><p>${text('Обработчики событий размещайте в Client Component. SSR выводит теги и содержимое; Shadow DOM и интерактивность появляются после загрузки JavaScript.', 'Place event handlers in a Client Component. SSR emits tags and light DOM; shadow controls and interaction initialize after JavaScript loads.')}</p>`)}<p>${text('HTML-примеры рассчитаны на Vite или другой сборщик ESM, разрешающий импорты npm. В Electron используйте их в renderer.', 'HTML examples assume Vite or another ESM bundler that resolves npm imports. In Electron, use them in the renderer.')}</p>`;
    }
    document.title = `${name} · VUI`;
    for (const root of page.querySelectorAll<HTMLElement>('[data-example]')) wireExample(root);
    for (const demo of page.querySelectorAll<HTMLElement>('.docs-demo')) {
      const tabs = [...demo.querySelectorAll<HTMLElement>('[data-demo-tab]')];
      const panels = [...demo.querySelectorAll<HTMLElement>('[data-demo-panel]')];
      const activate = (name: string) => {
        for (const tab of tabs) tab.setAttribute('aria-selected', String(tab.dataset.demoTab === name));
        for (const panel of panels) panel.hidden = panel.dataset.demoPanel !== name;
      };
      for (const tab of tabs) tab.addEventListener('click', () => activate(tab.dataset.demoTab!));
    }
    for (const copy of page.querySelectorAll<HTMLElement>('[data-copy]')) copy.addEventListener('click', async () => {
      const demo = copy.closest('.docs-demo')!;
      const active = demo.querySelector<HTMLElement>('[data-demo-panel]:not([hidden])')!;
      const example = renderedExamples.get(demo.getAttribute('data-demo')!);
      let code = active.querySelector('pre')?.textContent ?? '';
      if (active.dataset.demoPanel === 'preview' && example) code = prettyMarkup(example.html);
      if (active.dataset.demoPanel === 'jsx' && example) code = exampleJsx({ ...example, html: prettyMarkup(example.html) });
      try {
        await navigator.clipboard.writeText(code);
        copy.textContent = text('Скопировано', 'Copied');
      } catch {
        copy.textContent = text('Выделите код для копирования', 'Select the code to copy');
      }
    });
    for (const a of layout.querySelectorAll('nav > a')) {
      const active = a.getAttribute('href') === `#/${section}`;
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    }
    const language = document.querySelector<HTMLAnchorElement>('.header-controls > a[lang]');
    if (language) language.href = `?lang=${docsLocale === 'ru' ? 'en' : 'ru'}${location.hash}`;
    paintMenu();
    page.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  };
  window.addEventListener('hashchange', render);
  if (!location.hash.startsWith('#/')) history.replaceState(null, '', `${location.pathname}${location.search}#/getting-started`);
  render();
}
