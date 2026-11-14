import { componentImport, description, extraProperties, libraryVersion, parents } from './component-data';
import {
  catalogGroup,
  catalogGroupLabels,
  catalogGroups,
  docsComponentCatalog,
  isCatalogChild,
} from './docs-catalog';
import {
  curatedSections,
  exampleCode,
  exampleFor,
  exampleJsx,
  exampleStandalone,
  interfaceExample,
  prettyMarkup,
  renderExample,
  text,
  wireExample,
} from './examples';
import type { Example } from './examples';
import type { ComponentContract, ContractCopy, EventContract } from '../contract';
import { eventName } from '../contract';
import { iconGroups, iconNames } from '../icons/registry';
import { setUIMode } from '../theme';
import type { VuiUIMode } from '../theme';
import { docsLocale, escapeHTML } from './theme-i18n';
import { documentationStorage } from './preferences';
import './site.css';
import './examples.css';

type NavItem = [id: string, label: string, icon: string];

const sections = (): NavItem[] => [
  ['getting-started', text('Начало работы', 'Getting Started'), 'house'],
  ['components', text('Компоненты', 'Components'), 'layers'],
  ['layouts', text('Раскладки', 'Layouts'), 'columns-2'],
  ['patterns', text('Паттерны', 'Patterns'), 'command'],
  ['templates', text('Шаблоны', 'Templates'), 'layout-template'],
  ['themes', text('Theme Studio', 'Theme Studio'), 'palette'],
  ['icons', text('Иконки', 'Icons'), 'images'],
];

const layouts = () => [
  ['dashboard', text('Панель', 'Dashboard'), text('Сводка, таблица, пустое состояние, ошибка и вложенная прокрутка.', 'Summary, table, empty state, error, and nested scrolling.')],
  ['settings', text('Настройки', 'Settings'), text('Форма, проверка и сохранение внутри каркаса.', 'Form, validation, and save inside the shell.')],
  ['workspace', text('Рабочая область', 'Workspace'), text('Дерево, разделяемая область, редактор и инспектор.', 'Tree, split pane, editor, and inspector.')],
];

const patterns = () => [
  ['table', text('Таблица с фильтрами', 'Table with filters'), text('Поиск, статус и выбор строки.', 'Search, status filters, and row selection.')],
  ['dialog', text('Диалог подтверждения', 'Confirmation dialog'), text('Открытие, Escape и возврат фокуса.', 'Opening, Escape, and focus restoration.')],
  ['shell', text('Каркас приложения', 'Application shell'), text('Навигация, панель действий, форма и строка состояния.', 'Navigation, toolbar, form, and status bar.')],
];

const templates = () => [
  ['template-dashboard', text('Dashboard', 'Dashboard'), text('Опубликованный шаблон панели: навигация, сводка и основная область.', 'Published dashboard template: navigation, summary, and main region.')],
  ['template-settings', text('Settings', 'Settings'), text('Опубликованный шаблон настроек со слотами формы.', 'Published settings template with form slots.')],
  ['template-workspace', text('Workspace', 'Workspace'), text('Опубликованный шаблон с editor и inspector.', 'Published workspace template with editor and inspector slots.')],
];

const layoutIds = new Set(layouts().map(([id]) => id));
const patternIds = new Set(patterns().map(([id]) => id));
const templateIds = new Set(templates().map(([id]) => id));

const groupName = (name: string) => catalogGroupLabels[name as keyof typeof catalogGroupLabels]?.[docsLocale === 'ru' ? 0 : 1] ?? name;
const title = (tag: string) =>
  tag
    .replace('vui-', '')
    .split('-')
    .map((s) => s[0]!.toUpperCase() + s.slice(1))
    .join(' ');
const link = (path: string, label: string, extra = '') => `<a href="#/${path}" ${extra}>${escapeHTML(label)}</a>`;
const labels = (values: readonly string[]) =>
  values.length ? values.map((value) => `<code>${escapeHTML(value || text('по умолчанию', 'default'))}</code>`).join(' · ') : text('Нет', 'None');
const heading = (name: string, body: string, id?: string) =>
  body.trim() ? `<section class="docs-section"${id ? ` id="${id}"` : ''}><h2>${name}</h2>${body}</section>` : '';
const copy = (value: ContractCopy | undefined, fallback = ''): string => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return docsLocale === 'ru' ? value[0] : value[1];
};
const defaultCell = (value: string | boolean | number | null | undefined) => {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  return `<code>${escapeHTML(String(value))}</code>`;
};

function normalizeEvent(event: string | EventContract): EventContract {
  return typeof event === 'string' ? { name: event } : event;
}

function purposeSection(contract: ComponentContract): string {
  const guidance = copy(contract.docs?.guidance);
  const summary = description(contract.element, docsLocale);
  const body = [summary && `<p class="docs-lead">${summary}</p>`, guidance && `<p>${guidance}</p>`].filter(Boolean).join('');
  return heading(text('Назначение и рекомендации', 'Purpose and guidance'), body);
}

function attributesSection(contract: ComponentContract): string {
  const rows = contract.attributes
    .map((attribute) => {
      const property = attribute.property ?? attribute.name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      const desc = copy(attribute.description);
      return `<tr><th scope="row"><code>${attribute.name}</code></th><td>${property}</td><td>${attribute.kind}</td><td>${defaultCell(attribute.default)}</td><td>${labels(attribute.values ?? [])}</td><td>${escapeHTML(desc)}</td></tr>`;
    })
    .join('');
  const extras = [
    ...(extraProperties[contract.element] ?? []).map(([name, type]) => `<li><code>${name}</code> — <code>${escapeHTML(type)}</code></li>`),
    ...(contract.docs?.properties ?? []).map(
      (property) => `<li><code>${property.name}</code> — <code>${escapeHTML(property.type)}</code>${copy(property.description) ? ` — ${escapeHTML(copy(property.description))}` : ''}</li>`,
    ),
  ];
  if (!rows && !extras.length) return '';
  return heading(
    text('Атрибуты и свойства', 'Attributes and properties'),
    `<div class="docs-table"><table><thead><tr><th>${text('Атрибут', 'Attribute')}</th><th>${text('Свойство', 'Property')}</th><th>${text('Тип', 'Type')}</th><th>${text('По умолчанию', 'Default')}</th><th>${text('Значения', 'Values')}</th><th>${text('Назначение', 'Purpose')}</th></tr></thead><tbody>${rows || `<tr><td colspan="6">${text('Специальных атрибутов нет.', 'No component-specific attributes.')}</td></tr>`}</tbody></table></div>${extras.length ? `<ul>${extras.join('')}</ul>` : ''}`,
    'docs-api',
  );
}

function eventsMethodsSection(contract: ComponentContract): string {
  const events = contract.events.map(normalizeEvent);
  const eventList = events.length
    ? `<ul>${events
        .map((event) => {
          const desc = copy(event.description, text('слушайте через addEventListener на элементе', 'listen with addEventListener on the element'));
          const detail = event.detail ? ` · <code>${escapeHTML(event.detail)}</code>` : '';
          const bubbles = event.bubbles === false ? ` · ${text('не всплывает', 'does not bubble')}` : '';
          return `<li><code>${eventName(event)}</code> — ${escapeHTML(desc)}${detail}${bubbles}</li>`;
        })
        .join('')}</ul>`
    : '';
  const methods =
    contract.docs?.methods?.length
      ? `<ul>${contract.docs.methods.map((method) => `<li><code>${method.signature ?? method.name + '()'}</code>${copy(method.description) ? ` — ${escapeHTML(copy(method.description))}` : ''}</li>`).join('')}</ul>`
      : contract.methods.length
        ? `<p>${labels(contract.methods)}</p>`
        : '';
  if (!eventList && !methods) return '';
  return heading(
    text('События и методы', 'Events and methods'),
    `${eventList ? `<h3>${text('События', 'Events')}</h3>${eventList}` : ''}${methods ? `<h3>${text('Методы', 'Methods')}</h3>${methods}` : ''}`,
  );
}

function partsSlotsSection(contract: ComponentContract): string {
  const slots =
    contract.docs?.slots?.length
      ? `<ul>${contract.docs.slots.map((slot) => `<li><code>${slot.name || text('по умолчанию', 'default')}</code>${copy(slot.description) ? ` — ${escapeHTML(copy(slot.description))}` : ''}</li>`).join('')}</ul>`
      : contract.slots.length
        ? `<p>${labels(contract.slots)}</p>`
        : '';
  const parts =
    contract.docs?.parts?.length
      ? `<ul>${contract.docs.parts.map((part) => `<li><code>${part.name}</code>${copy(part.description) ? ` — ${escapeHTML(copy(part.description))}` : ''}</li>`).join('')}</ul>`
      : contract.parts.length
        ? `<p>${labels(contract.parts)}</p>`
        : '';
  if (!slots && !parts) return '';
  return heading(
    text('Составные части и слоты', 'Parts and slots'),
    `${slots ? `<h3>${text('Слоты', 'Slots')}</h3>${slots}` : ''}${parts ? `<h3>CSS parts</h3>${parts}` : ''}<p>${text('Дочерние элементы (Option, MenuItem, Tab…) документируются здесь и доступны через поиск, но не дублируются отдельными страницами каталога.', 'Child parts (Option, MenuItem, Tab…) are documented here and remain searchable, but are not separate catalog pages.')}</p>`,
  );
}

function a11ySection(contract: ComponentContract): string {
  if (!contract.keyboard.length && !contract.role && contract.focus !== 'roving') {
    return heading(
      text('Клавиатура и доступность', 'Keyboard and accessibility'),
      `<p>${text('Неинтерактивный элемент: не добавляйте лишние Tab-остановки. Держите видимый фокус на интерактивных контролах рядом.', 'Non-interactive element: avoid extra Tab stops. Keep focus visible on nearby interactive controls.')}</p>`,
      'docs-a11y',
    );
  }
  return heading(
    text('Клавиатура и доступность', 'Keyboard and accessibility'),
    `<dl><dt>${text('Клавиатура', 'Keyboard')}</dt><dd>${labels(contract.keyboard)}</dd><dt>${text('Фокус', 'Focus')}</dt><dd>${
      contract.focus === 'roving'
        ? text('Один Tab-вход; перемещение внутри стрелками.', 'One Tab stop; use arrow keys within the component.')
        : text('Нативный фокус и видимый индикатор.', 'Native focus and a visible indicator.')
    }</dd>${contract.role ? `<dt>ARIA</dt><dd><code>${contract.role}</code></dd>` : ''}</dl>${
      ['vui-dialog', 'vui-drawer'].includes(contract.element)
        ? `<p>${text('Диалог удерживает фокус и возвращает его к кнопке открытия. Escape закрывает верхний допустимый слой.', 'The dialog contains focus and restores it to its trigger. Escape dismisses the top eligible layer.')}</p>`
        : ''
    }`,
    'docs-a11y',
  );
}

function stylingSection(contract: ComponentContract): string {
  const tokens = contract.docs?.tokens ?? [];
  const parts = contract.parts;
  if (!tokens.length && !parts.length) return '';
  return heading(
    text('Стилизация', 'Styling'),
    `${parts.length ? `<p>CSS parts: ${labels(parts)}</p>` : ''}${tokens.length ? `<p>${text('Токены', 'Tokens')}: ${labels(tokens)}</p>` : ''}<p>${text('Тема и режим UI меняют внешний вид через токены; компонент не ветвится по их именам.', 'Theme and UI mode change appearance through tokens; the component does not branch on those names.')}</p>`,
  );
}

function demoSections(contract: ComponentContract, show: (example: Example) => string): string {
  const curated = curatedSections(contract.element);
  const minimal = curated[0];
  const variants = curated.slice(1).filter((section) => !/состоян|state/i.test(section.title));
  const states = curated.slice(1).filter((section) => /состоян|state/i.test(section.title));
  return (
    (minimal ? heading(text('Минимальный пример', 'Minimal example'), show(minimal.example), 'docs-preview') : '') +
    heading(
      text('Основные варианты', 'Main variants'),
      variants.map((section) => `<h3>${section.title}</h3>${show(section.example)}`).join('') ||
        `<p>${text('Использует общие токены темы и режима UI. Отдельных визуальных вариантов нет.', 'Uses shared theme and UI mode tokens; no extra visual variants.')}</p>`,
    ) +
    (states.length
      ? heading(
          text('Состояния и взаимодействие', 'States and interaction'),
          states.map((section) => `<h3>${section.title}</h3>${show(section.example)}`).join(''),
        )
      : contract.states.length
        ? heading(
            text('Состояния и взаимодействие', 'States and interaction'),
            `<p>${text('Поддерживаемые состояния', 'Supported states')}: ${labels(contract.states)}.</p>`,
          )
        : '')
  );
}

function componentPage(contract: ComponentContract, show: (example: Example) => string): string {
  const group = catalogGroup(contract.element);
  const pageNav = `<nav class="docs-page-nav" aria-label="${text('Разделы страницы', 'Page sections')}">
    <a href="#docs-preview">${text('Просмотр', 'Preview')}</a>
    <a href="#docs-api">${text('API', 'API')}</a>
    <a href="#docs-a11y">${text('Доступность', 'Accessibility')}</a>
  </nav>`;
  return `<p class="docs-eyebrow">${link('components', text('Компоненты', 'Components'))}${group ? ` / ${groupName(group)}` : ''}</p><h1 tabindex="-1">${title(contract.element)}</h1>${pageNav}<pre class="docs-import"><code>import '${componentImport(contract.element)}';</code></pre>${purposeSection(contract)}${demoSections(contract, show)}${attributesSection(contract)}${eventsMethodsSection(contract)}${partsSlotsSection(contract)}${a11ySection(contract)}${stylingSection(contract)}`;
}

function cards(items: ReturnType<typeof layouts>, base: string): string {
  return `<div class="docs-cards">${items
    .map(([id, label, description]) => `<a class="docs-card" href="#/${base}/${id}"><strong>${label}</strong><p>${description}</p></a>`)
    .join('')}</div>`;
}

function resolveLegacyPath(path: string[]): string[] | null {
  let [section, slug] = path;
  if (section === 'examples') section = 'compositions';
  if (section !== 'compositions') return null;
  if (!slug) return ['layouts'];
  if (layoutIds.has(slug)) return ['layouts', slug];
  if (patternIds.has(slug)) return ['patterns', slug];
  if (templateIds.has(slug) || slug.startsWith('template-')) return ['templates', slug.startsWith('template-') ? slug : `template-${slug}`];
  return ['layouts'];
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
  const catalog = docsComponentCatalog();
  const sectionMenu = (extraClass = '') =>
    `<vui-menu class="docs-section-menu ${extraClass}" inline orientation="vertical" label="${text('Разделы документации', 'Documentation sections')}">${sections()
      .map(([id, label, icon]) => `<vui-menu-item label="${escapeHTML(label)}" icon="${icon}" href="#/${id}"></vui-menu-item>`)
      .join('')}</vui-menu>`;
  layout.innerHTML = `<aside class="docs-sidebar" id="docs-sidebar">
  <div class="docs-sidebar-inner">
    <a class="docs-wordmark" href="#/getting-started">VUI <span>${text('Документация', 'Documentation')} · ${libraryVersion}</span></a>
    ${sectionMenu()}
    <vui-input class="docs-search" id="component-search" type="search" label="${text('Найти компонент', 'Find a component')}" placeholder="${text('Найти компонент…', 'Find a component…')}" autocomplete="off"><vui-icon slot="prefix" name="search"></vui-icon></vui-input>
    <details class="docs-menu-disclosure" open>
      <summary><vui-icon class="docs-disclosure-caret" name="chevron-right"></vui-icon><span>${text('Каталог компонентов', 'Component catalog')}</span></summary>
      <div id="docs-component-menu"></div>
    </details>
    <p class="docs-sidebar-note">${text('Паттерны — примеры в документации, не exports. Шаблоны — opt-in пакет.', 'Patterns are docs examples, not package exports. Templates are opt-in.')}</p>
  </div>
</aside>
<article id="docs-page" class="docs-page"></article>`;
  const content = document.createElement('div');
  content.className = 'docs-content';
  content.append(layout.querySelector('#docs-page')!, studio);
  layout.append(content);
  main.prepend(layout);

  const drawer = document.createElement('vui-drawer') as HTMLElement & { show: () => void; close: () => void };
  drawer.id = 'docs-nav-drawer';
  drawer.setAttribute('placement', 'start');
  drawer.setAttribute('label', text('Навигация', 'Navigation'));
  drawer.setAttribute('close-label', text('Закрыть', 'Close'));
  drawer.innerHTML = `<div class="docs-drawer-body">
  ${sectionMenu('docs-drawer-sections')}
  <vui-input class="docs-search" id="drawer-component-search" type="search" label="${text('Найти компонент', 'Find a component')}" placeholder="${text('Найти компонент…', 'Find a component…')}" autocomplete="off"><vui-icon slot="prefix" name="search"></vui-icon></vui-input>
  <div id="docs-drawer-component-menu"></div>
</div>`;
  document.body.append(drawer);

  document.body.classList.add('documentation-site');
  document.body.style.setProperty('--docs-header-height', '3.75rem');
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
        ? text('Desktop', 'Desktop')
        : value === 'terminal'
          ? text('Terminal', 'Terminal')
          : text('Web', 'Web');
  }
  try {
    const saved = documentationStorage.getItem('vui.docs.ui');
    const legacyDensity = documentationStorage.getItem('vui.docs.density');
    const next =
      saved === 'web' || saved === 'desktop' || saved === 'terminal'
        ? saved
        : legacyDensity === 'compact' || legacyDensity === 'dense' || legacyDensity === 'desktop'
          ? 'desktop'
          : legacyDensity === 'comfortable' || legacyDensity === 'web'
            ? 'web'
            : null;
    if (next && uiMode) {
      uiMode.value = next;
      setUIMode(next as VuiUIMode);
    }
  } catch {
    /* Storage is optional. */
  }
  uiMode?.addEventListener('change', () => {
    setUIMode(uiMode.value as VuiUIMode);
    try {
      documentationStorage.setItem('vui.docs.ui', uiMode.value);
      documentationStorage.removeItem('vui.docs.density');
    } catch {
      /* Storage is optional. */
    }
  });

  const page = layout.querySelector<HTMLElement>('#docs-page')!;
  const menu = layout.querySelector<HTMLElement>('#docs-component-menu')!;
  const drawerMenu = drawer.querySelector<HTMLElement>('#docs-drawer-component-menu')!;
  const search = layout.querySelector<HTMLElement & { value: string }>('#component-search')!;
  const headerSearch = document.querySelector<HTMLElement & { value: string }>('#header-component-search');
  const drawerSearch = drawer.querySelector<HTMLElement & { value: string }>('#drawer-component-search')!;
  const navToggle = document.querySelector<HTMLElement>('.docs-nav-toggle');

  const syncSearchValue = (value: string, source?: HTMLElement) => {
    for (const field of [search, headerSearch, drawerSearch]) {
      if (!field || field === source) continue;
      field.value = value;
    }
  };

  const folderIconObservers = new WeakMap<HTMLElement, MutationObserver>();

  const syncCatalogFolderIcons = (root: ParentNode) => {
    for (const item of root.querySelectorAll<HTMLElement>('.docs-catalog-menu > vui-menu-item')) {
      item.setAttribute('icon', item.hasAttribute('expanded') ? 'folder-open' : 'folder');
    }
  };

  const wireCatalogFolderIcons = (target: HTMLElement) => {
    folderIconObservers.get(target)?.disconnect();
    const menu = target.querySelector('.docs-catalog-menu');
    if (!menu) return;
    syncCatalogFolderIcons(menu);
    const observer = new MutationObserver(() => syncCatalogFolderIcons(menu));
    for (const item of menu.querySelectorAll(':scope > vui-menu-item')) {
      observer.observe(item, { attributes: true, attributeFilter: ['expanded'] });
    }
    folderIconObservers.set(target, observer);
  };

  const paintMenuInto = (target: HTMLElement, query: string) => {
    const found = catalog.filter((c) =>
      `${c.element} ${title(c.element)} ${description(c.element, 'ru')} ${description(c.element, 'en')}`.toLowerCase().includes(query),
    );
    const hash = location.hash || '#/getting-started';
    const groupsMarkup = catalogGroups
      .map((group) => {
        const items = found.filter((c) => catalogGroup(c.element) === group);
        if (!items.length) return '';
        const open = !query && items.some((c) => hash === `#/components/${c.element.slice(4)}`);
        const folderIcon = open || query ? 'folder-open' : 'folder';
        return `<vui-menu-item class="docs-catalog-folder" label="${escapeHTML(groupName(group))}" icon="${folderIcon}" ${open || query ? 'expanded' : ''}><vui-menu inline label="${escapeHTML(groupName(group))}" slot="submenu">${items
          .map((c) => {
            const href = `#/components/${c.element.slice(4)}`;
            return `<vui-menu-item class="docs-catalog-leaf" label="${escapeHTML(title(c.element))}" icon="file-text" href="${href}" ${hash === href ? 'selected' : ''}></vui-menu-item>`;
          })
          .join('')}</vui-menu></vui-menu-item>`;
      })
      .join('');
    target.innerHTML = groupsMarkup
      ? `<vui-menu class="docs-catalog-menu" inline orientation="vertical" label="${text('Каталог компонентов', 'Component catalog')}">${groupsMarkup}</vui-menu>`
      : `<p role="status">${text('Компоненты не найдены', 'No components found')}</p>`;
    wireCatalogFolderIcons(target);
  };

  const paintMenu = () => {
    const query = (search.value || headerSearch?.value || drawerSearch.value || '').trim().toLowerCase();
    paintMenuInto(menu, query);
    paintMenuInto(drawerMenu, query);
    for (const root of [layout, drawer]) {
      for (const item of root.querySelectorAll('vui-menu-item[href]')) {
        const href = item.getAttribute('href');
        item.toggleAttribute('selected', href === location.hash || (location.hash.startsWith('#/components/') && href === location.hash));
      }
    }
  };

  const disclosure = layout.querySelector<HTMLDetailsElement>('.docs-menu-disclosure')!;
  const desktop = matchMedia('(min-width: 901px)');
  const updateMenu = () => {
    disclosure.open = desktop.matches || search.value.trim().length > 0 || (headerSearch?.value.trim().length ?? 0) > 0;
  };
  updateMenu();
  desktop.addEventListener('change', () => {
    updateMenu();
    if (desktop.matches) drawer.close();
  });

  const onSearch = (event: Event) => {
    const field = event.currentTarget as HTMLElement & { value: string };
    syncSearchValue(field.value, field);
    updateMenu();
    paintMenu();
    if (field.value.trim() && location.hash !== '#/components' && !location.hash.startsWith('#/components/')) {
      history.replaceState(null, '', `${location.pathname}${location.search}#/components`);
      render();
    }
  };
  search.addEventListener('input', onSearch);
  headerSearch?.addEventListener('input', onSearch);
  drawerSearch.addEventListener('input', onSearch);

  document.querySelector('.docs-header')?.addEventListener('click', (event) => {
    const path = event.composedPath();
    if (path.some((node) => node instanceof HTMLElement && node.classList?.contains('docs-nav-toggle'))) {
      drawer.show();
    }
  });
  drawer.addEventListener('close', () => navToggle?.focus());
  drawer.addEventListener('click', (event) => {
    const item = (event.target as HTMLElement | null)?.closest?.('vui-menu-item[href], a[href^="#/"]');
    if (item) drawer.close();
  });

  const wireDemos = () => {
    for (const root of page.querySelectorAll<HTMLElement>('[data-example]')) wireExample(root);
    for (const demo of page.querySelectorAll<HTMLElement>('.docs-demo')) {
      const tabs = [...demo.querySelectorAll<HTMLElement>('[data-demo-tab]')];
      const panels = [...demo.querySelectorAll<HTMLElement>('[data-demo-panel]')];
      const activate = (tabName: string) => {
        for (const tab of tabs) tab.setAttribute('aria-selected', String(tab.dataset.demoTab === tabName));
        for (const panel of panels) panel.hidden = panel.dataset.demoPanel !== tabName;
      };
      for (const tab of tabs) tab.addEventListener('click', () => activate(tab.dataset.demoTab!));
    }
    for (const copyBtn of page.querySelectorAll<HTMLElement>('[data-copy]')) {
      copyBtn.addEventListener('click', async () => {
        const demo = copyBtn.closest('.docs-demo')!;
        const active = demo.querySelector<HTMLElement>('[data-demo-panel]:not([hidden])')!;
        const example = renderedExamples.get(demo.getAttribute('data-demo')!);
        let code = active.querySelector('pre')?.textContent ?? '';
        if (active.dataset.demoPanel === 'preview' && example) code = exampleCode(example);
        if (active.dataset.demoPanel === 'jsx' && example) code = exampleJsx({ ...example, html: prettyMarkup(example.html) });
        try {
          await navigator.clipboard.writeText(code);
          copyBtn.textContent = text('Скопировано', 'Copied');
        } catch {
          copyBtn.textContent = text('Выделите код для копирования', 'Select the code to copy');
        }
      });
    }
    for (const full of page.querySelectorAll<HTMLElement>('[data-copy-standalone]')) {
      full.addEventListener('click', async () => {
        const demo = full.closest('.docs-demo')!;
        const example = renderedExamples.get(demo.getAttribute('data-demo')!);
        const code = example ? exampleStandalone(example) : demo.querySelector('[data-standalone]')?.textContent ?? '';
        try {
          await navigator.clipboard.writeText(code);
          full.textContent = text('Скопировано', 'Copied');
        } catch {
          full.textContent = text('Выделите код для копирования', 'Select the code to copy');
        }
      });
    }
  };

  const render = () => {
    for (const el of page.querySelectorAll('vui-dialog[open], vui-drawer[open], vui-menu[open], vui-popover[open]')) {
      if ('close' in el && typeof el.close === 'function') el.close();
    }
    renderedExamples.clear();
    let path = location.hash.slice(2).split('/').filter(Boolean);
    const legacy = resolveLegacyPath(path);
    if (legacy) {
      history.replaceState(null, '', `${location.pathname}${location.search}#/${legacy.join('/')}`);
      path = legacy;
    }
    let section = path[0] || 'getting-started';
    studio.hidden = section !== 'themes';
    studio.toggleAttribute('inert', studio.hidden);
    let name = sections().find(([id]) => id === section)?.[1] ?? text('Страница не найдена', 'Page not found');

    if (section === 'components' && path[1]) {
      if (isCatalogChild(`vui-${path[1]}`)) {
        const parent = parents[path[1]] ?? path[1];
        history.replaceState(null, '', `${location.pathname}${location.search}#/components/${parent}`);
        return render();
      }
      const contract = catalog.find((c) => c.element === `vui-${path[1]}`);
      if (contract) {
        name = title(contract.element);
        page.innerHTML = componentPage(contract, showExample);
      } else page.innerHTML = `<h1>${name}</h1>${link('components', text('Открыть каталог', 'Open catalog'))}`;
    } else if (section === 'components') {
      page.innerHTML = `<h1 tabindex="-1">${name}</h1><p class="docs-lead">${text(
        'Единый каталог для Web, Desktop и Terminal. Режим UI и тема меняют токены, но не состав компонентов. Дочерние части остаются в API родителя.',
        'One catalog for Web, Desktop, and Terminal. UI mode and theme change tokens, not the component set. Child parts stay on the parent API.',
      )}</p><p class="docs-lead">${catalog.length} ${text('хостов в каталоге.', 'hosts in the catalog.')}</p><div class="docs-cards">${catalog
        .map(
          (c) =>
            `<a class="docs-card" href="#/components/${c.element.slice(4)}"><strong>${title(c.element)}</strong><code>${c.element}</code><p>${description(c.element, docsLocale)}</p></a>`,
        )
        .join('')}</div>`;
    } else if (section === 'layouts') {
      const example = layouts().find(([id]) => id === path[1]);
      if (example) {
        name = example[1]!;
        page.innerHTML = `<p class="docs-eyebrow">${link('layouts', text('Раскладки', 'Layouts'))}</p><h1 tabindex="-1">${name}</h1><p class="docs-lead">${example[2]}</p><p><a href="layout.html">${text('Галерея раскладок', 'Layout gallery')}</a> — ${text('web / desktop / terminal и ширины viewport.', 'web / desktop / terminal and viewport widths.')}</p>${showExample(interfaceExample(example[0]!))}`;
      } else {
        page.innerHTML = `<h1 tabindex="-1">${name}</h1><p class="docs-lead">${text(
          'Готовые раскладки приложений на опубликованных templates. Тема меняет цвета; режим UI — структурную шкалу.',
          'Application layouts built on published templates. Theme changes colors; UI mode changes the structural scale.',
        )}</p><p><a href="layout.html">${text('Открыть галерею раскладок', 'Open layout gallery')}</a></p>${cards(layouts(), 'layouts')}`;
      }
    } else if (section === 'patterns') {
      const example = patterns().find(([id]) => id === path[1]);
      if (example) {
        name = example[1]!;
        page.innerHTML = `<p class="docs-eyebrow">${link('patterns', text('Паттерны', 'Patterns'))}</p><h1 tabindex="-1">${name}</h1><p class="docs-lead">${example[2]}</p><p class="docs-note">${text('Паттерн — пример сборки в документации, не отдельный export пакета.', 'A pattern is a documentation assembly, not a separate package export.')}</p>${showExample(interfaceExample(example[0]!))}`;
      } else {
        page.innerHTML = `<h1 tabindex="-1">${name}</h1><p class="docs-lead">${text(
          'Прикладные сборки из компонентов каталога: формы, таблицы, диалоги и каркасы. Не входят в exports пакета.',
          'Application assemblies from catalog components: forms, tables, dialogs, and shells. Not part of package exports.',
        )}</p>${cards(patterns(), 'patterns')}`;
      }
    } else if (section === 'templates') {
      const example = templates().find(([id]) => id === path[1]);
      if (example) {
        name = example[1]!;
        const tag = `vui-${example[0]}`;
        page.innerHTML = `<p class="docs-eyebrow">${link('templates', text('Шаблоны', 'Templates'))}</p><h1 tabindex="-1">${name}</h1><p class="docs-lead">${example[2]}</p><pre class="docs-import"><code>import '${componentImport(tag)}';</code></pre>${showExample(exampleFor(tag))}`;
      } else {
        page.innerHTML = `<h1 tabindex="-1">${name}</h1><p class="docs-lead">${text(
          'Opt-in Templates: vui/templates, vui/template-dashboard, vui/template-settings, vui/template-workspace. Не входят в import \'vui\'.',
          "Opt-in Templates: vui/templates, vui/template-dashboard, vui/template-settings, vui/template-workspace. Not included in import 'vui'.",
        )}</p>${cards(templates(), 'templates')}`;
      }
    } else if (section === 'icons') {
      name = text('Иконки', 'Icons');
      page.innerHTML = `<h1 tabindex="-1">${name}</h1><p class="docs-lead">${text(
        'Встроенный набор для vui-icon. Группы ниже — рабочий каталог; новые иконки будем добавлять сюда постепенно.',
        'Built-in set for vui-icon. Groups below are the working catalog; new icons will be added here over time.',
      )}</p><pre class="docs-import"><code>import { iconNames, iconGroups, registerIcon } from 'vui/icon';</code></pre><p>${text('Всего', 'Total')}: <strong>${iconNames.length}</strong></p>${iconGroups
        .map(
          (group) =>
            heading(
              group.label[docsLocale === 'ru' ? 0 : 1],
              `<div class="docs-icon-grid">${group.icons.map((icon) => `<div class="docs-icon-card"><vui-icon name="${icon}" label="${icon}"></vui-icon><code>${icon}</code></div>`).join('')}</div>`,
            ),
        )
        .join('')}${heading(
        text('Все имена', 'All names'),
        `<div class="docs-icon-grid">${iconNames.map((icon) => `<div class="docs-icon-card"><vui-icon name="${icon}" label="${icon}"></vui-icon><code>${icon}</code></div>`).join('')}</div>`,
      )}`;
    } else if (section === 'themes') {
      page.innerHTML = `<h1 tabindex="-1">${name}</h1><p class="docs-lead">${text(
        'Тема документации меняется на верхней панели. Черновик редактора применяется только к просмотру, пока вы явно не примените его к документации.',
        'Change the documentation theme in the top bar. Editor drafts affect only the preview until explicitly applied to documentation.',
      )}</p>${heading(
        text('Подключение темы', 'Theme integration'),
        `<pre><code>import { initializeTheme, setUIMode } from 'vui/theme';\ninitializeTheme();\nsetUIMode('web');</code></pre><p>${text(
          'Тема задаёт семантические цвета. Режим UI задаёт плотность, типографику, радиусы, тени и движение. Они независимы.',
          'Theme sets semantic colors. UI mode sets density, typography, radii, shadows, and motion. They are independent.',
        )}</p>`,
      )}`;
    } else {
      page.innerHTML = `<p class="docs-eyebrow">WEB COMPONENTS · REACT · NEXT.JS · ELECTRON</p><h1 tabindex="-1">${text(
        'Интерфейсы из понятных компонентов',
        'Build interfaces from clear components',
      )}</h1><p class="docs-lead">${text(
        'Один каталог компонентов. Режим UI (Web / Desktop / Terminal) и цветовая тема независимы и не меняют состав API.',
        'One component catalog. UI mode (Web / Desktop / Terminal) and color theme are independent and do not change the API set.',
      )}</p><div class="docs-actions">${link('components', text('Открыть каталог', 'Browse components'), 'class="docs-action-primary"')}${link(
        'layouts',
        text('Собрать интерфейс', 'Build an interface'),
        'class="docs-action-secondary"',
      )}</div>${heading(text('Установка', 'Installation'), '<pre><code>pnpm add vui</code></pre>')}${heading(
        text('Подключение', 'Setup'),
        `<pre><code>import 'vui/button';\nimport { initializeTheme, setUIMode } from 'vui/theme';\n\ninitializeTheme();\nsetUIMode('web');</code></pre><p>${text(
          'HTML-примеры в каталоге показывают только компонент и необходимую логику. Импорты и тема подключаются отдельно, как здесь.',
          'Catalog HTML examples show only the component and required logic. Imports and theme setup live separately, as shown here.',
        )}</p>`,
      )}${heading(text('Первый компонент', 'Your first component'), showExample(exampleFor('vui-button')), 'docs-preview')}${heading(
        text('Три режима UI', 'Three UI modes'),
        `<p class="docs-lead">${text(
          'Цветовая тема и структурный режим независимы. Переключатель сверху меняет Web, Desktop или Terminal для всей документации.',
          'Color theme and structural mode are independent. The top switch applies Web, Desktop, or Terminal to the whole documentation site.',
        )}</p><div class="docs-cards docs-ui-modes"><div class="docs-card"><strong>Web</strong><p>${text(
          'Браузерная шкала: свободные отступы, мягкие радиусы, плавные заголовки, многослойная тень.',
          'Browser scale: roomy spacing, soft radii, fluid headings, multi-layer elevation.',
        )}</p><code>data-vui-ui="web"</code></div><div class="docs-card"><strong>Desktop</strong><p>${text(
          'Сетка Fluent 2: плотный chrome, фиксированная типографика, key+ambient elevation.',
          'Fluent 2 grid: denser chrome, fixed type ramp, key+ambient elevation.',
        )}</p><code>data-vui-ui="desktop"</code></div><div class="docs-card"><strong>Terminal</strong><p>${text(
          'Моноширинный TUI: плотная сетка, нулевой радиус, без теней.',
          'Monospace TUI: dense grid, square corners, no elevation.',
        )}</p><code>data-vui-ui="terminal"</code></div></div><p><a href="layout.html">${text('Галерея раскладок', 'Layout gallery')}</a> — ${text('панель, настройки и рабочая область в трёх режимах.', 'dashboard, settings, and workspace in all three modes.')}</p>`,
      )}${heading(
        'React / Next.js',
        `<pre><code>'use client';\n\nimport { Button } from 'vui/react';\n\nexport default function Page() {\n  return &lt;Button variant="primary"&gt;${text('Сохранить', 'Save')}&lt;/Button&gt;;\n}</code></pre><p>${text(
          'Обработчики и состояние — в Client Component. SSR выводит теги; Shadow DOM появляется после загрузки JavaScript.',
          'Put handlers and state in a Client Component. SSR emits tags; shadow DOM initializes after JavaScript loads.',
        )}</p>`,
      )}`;
    }

    document.title = `${name} · VUI`;
    wireDemos();
    for (const root of [layout, drawer]) {
      for (const item of root.querySelectorAll('.docs-section-menu > vui-menu-item')) {
        item.toggleAttribute('selected', item.getAttribute('href') === `#/${section}`);
      }
    }
    for (const anchor of document.querySelectorAll<HTMLAnchorElement>('.docs-header-nav a[data-nav]')) {
      const nav = anchor.dataset.nav;
      const active =
        nav === section ||
        (nav === 'components' && (section === 'components' || section === 'icons')) ||
        (nav === 'layouts' && (section === 'layouts' || section === 'patterns' || section === 'templates')) ||
        (nav === 'themes' && section === 'themes');
      anchor.toggleAttribute('aria-current', active);
      anchor.classList.toggle('is-active', active);
    }
    const language = document.querySelector<HTMLElement & { value: string }>('#docs-lang');
    if (language) language.value = docsLocale;
    paintMenu();
    page.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  };
  window.addEventListener('hashchange', render);
  document.documentElement.addEventListener('vui-theme-change', () => {
    if (!studio.hidden) return;
    render();
  });
  document.documentElement.addEventListener('vui-ui-change', () => {
    if (!studio.hidden) return;
    render();
  });
  if (!location.hash.startsWith('#/')) history.replaceState(null, '', `${location.pathname}${location.search}#/getting-started`);
  render();
}
