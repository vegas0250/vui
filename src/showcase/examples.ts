import { componentImport } from './component-data';
import { docsLocale, escapeHTML } from './theme-i18n';
import { getTheme, getThemePreference, getUIMode } from '../theme';
import { documentationStorage } from './preferences';
import { tones } from '../theme/presets';
import exampleCSS from './examples.css?raw';
export const text = (ru: string, en: string): string => docsLocale === 'ru' ? ru : en;
export interface Example { id: string; html: string }
export interface DemoSection { title: string; example: Example }

/** This self-contained function is both executed live and included in copied code. */
export function wireExample(root: HTMLElement): void {
  const result = root.querySelector<HTMLElement>('[data-result]');
  const output = (value: string) => { if (result) result.textContent = value; };
  for (const button of root.querySelectorAll<HTMLElement>('[data-open]')) {
    button.addEventListener('click', () => {
      const overlay = root.querySelector<HTMLElement>('vui-dialog, vui-drawer, vui-popover, vui-menu');
      if (!overlay) return;
      if ('showAt' in overlay && typeof overlay.showAt === 'function') {
        const rect = button.getBoundingClientRect();
        overlay.showAt(rect.left, rect.bottom);
      } else if ('show' in overlay && typeof overlay.show === 'function') overlay.show();
    });
  }
  root.querySelector('[data-close]')?.addEventListener('click', () => {
    const overlay = root.querySelector('vui-dialog, vui-drawer, vui-popover');
    if (overlay && 'close' in overlay && typeof overlay.close === 'function') overlay.close();
    output(root.dataset.saved ?? 'OK');
  });
  root.querySelector('vui-menu')?.addEventListener('click', (event) => {
    const item = event.composedPath().find((node) => node instanceof HTMLElement && node.localName === 'vui-menu-item');
    if (item instanceof HTMLElement) output(item.getAttribute('label') ?? '');
  });
  root.querySelector('[data-save]')?.addEventListener('click', () => {
    const name = root.querySelector<HTMLElement & { value: string; invalid: boolean }>('vui-input');
    if (name) {
      name.invalid = !name.value.trim();
      if (name.invalid) { name.focus(); output(root.dataset.required ?? ''); return; }
    }
    output(`${root.dataset.saved ?? 'OK'}${name ? ': ' + name.value : ''}`);
  });
  const grid = root.querySelector<HTMLElement & { columns: object[]; rows: object[] }>('vui-data-grid');
  if (grid) {
    const rows = [{ id: '1', name: 'Atlas', state: 'active', status: root.dataset.active ?? 'active' }, { id: '2', name: 'Orion', state: 'draft', status: root.dataset.draft ?? 'draft' }, { id: '3', name: 'Nova', state: 'active', status: root.dataset.active ?? 'active' }];
    grid.columns = [{ key: 'name', title: root.dataset.name ?? 'Name' }, { key: 'status', title: root.dataset.status ?? 'Status' }];
    const update = () => {
      const query = root.querySelector<HTMLElement & { value: string }>('[data-filter]')?.value.toLowerCase() ?? '';
      const status = root.querySelector<HTMLElement & { value: string }>('[data-status]')?.value ?? 'all';
      grid.rows = rows.filter((row) => row.name.toLowerCase().includes(query) && (status === 'all' || row.state === status));
    };
    root.querySelector('[data-filter]')?.addEventListener('input', update);
    root.querySelector('[data-status]')?.addEventListener('change', update);
    grid.addEventListener('change', () => output(String(Reflect.get(grid, 'selectedId'))));
    update();
  }
  root.querySelector('[data-collapse]')?.addEventListener('click', () => {
    root.querySelector('vui-shell')?.toggleAttribute('collapsed');
  });
  for (const element of root.querySelectorAll('vui-list, vui-file-tree, vui-nav, vui-stepper, vui-pagination, vui-path-bar')) {
    element.addEventListener('change', () => {
      output(element.getAttribute('value') ?? element.getAttribute('selected') ?? root.dataset.saved ?? 'OK');
    });
  }
  root.querySelector('vui-chip')?.addEventListener('close', (event) => (event.currentTarget as HTMLElement).remove());
}

const content = () => text('Содержимое', 'Content');
export function exampleFor(tag: string): Example {
  const name = text('Имя', 'Name'), save = text('Сохранить', 'Save'), ready = text('Готово', 'Ready');
  const button = `<vui-button data-save>${save}</vui-button>`;
  const field = `<vui-input label="${name}" value="Ada"></vui-input>`;
  const tabs = `<vui-tabs label="${text('Разделы', 'Sections')}"><vui-tab slot="tab" panel="one">${text('Обзор', 'Overview')}</vui-tab><vui-tab slot="tab" panel="two">${text('Детали', 'Details')}</vui-tab><vui-tab-panel slot="panel" name="one">${content()}</vui-tab-panel><vui-tab-panel slot="panel" name="two">${text('Вторая панель', 'Second panel')}</vui-tab-panel></vui-tabs>`;
  const checkboxes = `<vui-checkbox value="email">Email</vui-checkbox><vui-checkbox value="browser">${text('Браузер', 'Browser')}</vui-checkbox>`;
  const radios = `<vui-radio name="plan" value="free" checked>${text('Личный', 'Personal')}</vui-radio><vui-radio name="plan" value="team">${text('Команда', 'Team')}</vui-radio>`;
  const select = `<vui-select label="${text('Тариф', 'Plan')}" value="free"><vui-option value="free">${text('Личный', 'Personal')}</vui-option><vui-option value="team">${text('Команда', 'Team')}</vui-option></vui-select>`;
  const nav = `<vui-nav label="${text('Навигация', 'Navigation')}"><vui-nav-item selected>${text('Обзор', 'Overview')}</vui-nav-item><vui-nav-item>${text('Настройки', 'Settings')}</vui-nav-item></vui-nav>`;
  const tree = `<vui-file-tree label="${text('Файлы', 'Files')}"><vui-tree-item label="src" expanded><vui-tree-item label="index.ts" kind="file"></vui-tree-item></vui-tree-item><vui-tree-item label="README.md" kind="file"></vui-tree-item></vui-file-tree>`;
  const list = `<vui-list label="${text('Проекты', 'Projects')}"><vui-list-item value="atlas">Atlas</vui-list-item><vui-list-item value="nova">Nova</vui-list-item></vui-list>`;
  const properties = `<vui-properties label="${text('Свойства', 'Properties')}"><vui-property label="${name}">Atlas</vui-property><vui-property label="${text('Статус', 'Status')}">${ready}</vui-property></vui-properties>`;
  const steps = `<vui-stepper label="${text('Этапы', 'Steps')}"><vui-step value="details" selected>${text('Данные', 'Details')}</vui-step><vui-step value="review">${text('Проверка', 'Review')}</vui-step></vui-stepper>`;
  const html: Record<string, string> = {
    button, 'icon-button': `<vui-icon-button name="search" label="${text('Поиск', 'Search')}"></vui-icon-button>`,
    'button-group': `<vui-button-group>${button}<vui-button variant="secondary">${text('Отмена', 'Cancel')}</vui-button></vui-button-group>`,
    toggle: `<vui-toggle>${text('Жирный', 'Bold')}</vui-toggle>`,
    'toggle-group': `<vui-toggle-group label="${text('Формат', 'Format')}"><vui-toggle value="bold">B</vui-toggle><vui-toggle value="italic">I</vui-toggle></vui-toggle-group>`,
    input: field, textarea: `<vui-textarea label="${text('Заметки', 'Notes')}" value="${content()}"></vui-textarea>`,
    checkbox: `<vui-checkbox>${text('Уведомления', 'Notifications')}</vui-checkbox>`,
    'checkbox-group': `<vui-checkbox-group label="${text('Уведомления', 'Notifications')}">${checkboxes}</vui-checkbox-group>`,
    radio: radios, 'radio-group': `<vui-radio-group label="${text('Тариф', 'Plan')}" value="free">${radios}</vui-radio-group>`,
    switch: `<vui-switch>${text('Уведомления', 'Notifications')}</vui-switch>`, select, option: select,
    slider: `<vui-slider label="${text('Громкость', 'Volume')}" min="0" max="100" value="60"></vui-slider>`,
    field: `<vui-field label="${name}" hint="${text('Введите имя', 'Enter a name')}"><input aria-label="${name}" value="Ada" /></vui-field>`,
    'field-group': `<vui-field-group label="${text('Профиль', 'Profile')}"><vui-vstack gap="md">${field}${select}</vui-vstack></vui-field-group>`,
    tabs, tab: tabs, 'tab-panel': tabs, nav, 'nav-item': nav, stepper: steps, step: steps,
    breadcrumbs: `<vui-breadcrumbs label="${text('Путь', 'Path')}"><a href="#/getting-started">VUI</a><span>${text('Компоненты', 'Components')}</span></vui-breadcrumbs>`,
    'path-bar': '<vui-path-bar value="/home/projects/atlas"></vui-path-bar>',
    pagination: `<vui-pagination pages="10" page="1" label="${text('Страницы', 'Pages')}"></vui-pagination>`,
    toolbar: `<vui-toolbar label="${text('Действия', 'Actions')}"><span slot="start">Atlas</span>${button}<vui-badge slot="end">${ready}</vui-badge></vui-toolbar>`,
    tooltip: `<vui-tooltip text="${text('Сохранить изменения', 'Save changes')}">${button}</vui-tooltip>`,
    alert: `<vui-alert variant="success">${text('Изменения сохранены', 'Changes saved')}</vui-alert>`,
    toast: `<vui-toast heading="${ready}" duration="0">${text('Изменения сохранены', 'Changes saved')}</vui-toast>`,
    toaster: `<vui-toaster><vui-toast heading="${ready}" duration="0">${content()}</vui-toast></vui-toaster>`,
    progress: `<vui-progress label="${text('Загрузка', 'Upload')}" value="60" max="100"></vui-progress>`,
    spinner: `<vui-spinner label="${text('Загрузка', 'Loading')}"></vui-spinner>`,
    skeleton: '<vui-skeleton style="width:16rem;height:2rem"></vui-skeleton>',
    empty: `<vui-empty heading="${text('Пока нет проектов', 'No projects yet')}">${text('Создайте первый проект', 'Create your first project')}${button}</vui-empty>`,
    text: `<vui-text>${content()}</vui-text>`, link: `<vui-link href="#/getting-started">${text('Начало работы', 'Getting started')}</vui-link>`,
    badge: `<vui-badge variant="success">${ready}</vui-badge>`, chip: '<vui-chip removable>TypeScript</vui-chip>', kbd: '<vui-kbd>Ctrl + S</vui-kbd>',
    icon: `<vui-icon name="folder" label="${text('Папка', 'Folder')}"></vui-icon>`,
    avatar: '<vui-avatar label="Ada Lovelace"></vui-avatar>',
    'avatar-group': '<vui-avatar-group><vui-avatar label="Ada Lovelace"></vui-avatar><vui-avatar label="Grace Hopper"></vui-avatar></vui-avatar-group>',
    separator: `<vui-text>${content()}</vui-text><vui-separator></vui-separator><vui-text>${content()}</vui-text>`,
    panel: `<vui-panel heading="Atlas">${field}${button}</vui-panel>`,
    container: `<vui-container><vui-panel>${content()}</vui-panel></vui-container>`,
    'scroll-area': `<vui-scroll-area style="height:8rem"><vui-vstack>${Array.from({ length: 12 }, (_, i) => `<vui-text>${text('Строка', 'Row')} ${i + 1}</vui-text>`).join('')}</vui-vstack></vui-scroll-area>`,
    stack: `<vui-stack gap="md">${button}<vui-badge>${ready}</vui-badge></vui-stack>`,
    hstack: `<vui-hstack gap="md">${button}<vui-badge>${ready}</vui-badge></vui-hstack>`,
    vstack: `<vui-vstack gap="md">${field}${button}</vui-vstack>`,
    grid: `<vui-grid columns="2" gap="md"><vui-panel>Atlas</vui-panel><vui-panel>Nova</vui-panel></vui-grid>`,
    'split-panel': `<vui-split-panel label="${text('Размер панелей', 'Pane size')}" position="40" style="height:12rem"><vui-panel slot="start">Atlas</vui-panel><vui-panel slot="end">Nova</vui-panel></vui-split-panel>`,
    window: `<vui-window label="Atlas"><vui-panel>${content()}</vui-panel></vui-window>`,
    titlebar: '<vui-titlebar label="Atlas"></vui-titlebar>', 'status-bar': `<vui-status-bar>${ready}</vui-status-bar>`,
    'file-tree': tree, 'tree-item': tree, 'data-grid': `<vui-data-grid label="${text('Проекты', 'Projects')}"></vui-data-grid>`,
    list, 'list-item': list, properties, property: properties,
  };
  const slug = tag.replace('vui-', '');
  if (['dialog', 'drawer', 'popover'].includes(slug)) {
    html[slug] = `<vui-button data-open>${text('Открыть', 'Open')}</vui-button><${tag} label="${text('Подтверждение', 'Confirmation')}"><p>${text('Сохранить изменения?', 'Save changes?')}</p><vui-button data-close slot="footer">${save}</vui-button></${tag}>`;
  }
  if (slug === 'popover') html[slug] = `<vui-popover label="${text('Подсказка', 'Details')}"><vui-button data-open>${text('Открыть', 'Open')}</vui-button><vui-panel slot="panel">${content()}<vui-button data-close>${text('Закрыть', 'Close')}</vui-button></vui-panel></vui-popover>`;
  if (['menu', 'menu-item'].includes(slug)) {
    html[slug] = `<vui-vstack gap="lg"><vui-menu inline orientation="vertical" label="${text('Разделы', 'Sections')}"><vui-menu-item label="${text('Обзор', 'Overview')}" icon="house" selected></vui-menu-item><vui-menu-item label="${text('Компоненты', 'Components')}" icon="layout-template" expanded><vui-menu inline label="${text('Компоненты', 'Components')}" slot="submenu"><vui-menu-item label="${text('Кнопка', 'Button')}" href="#/components/button"></vui-menu-item><vui-menu-item label="${text('Меню', 'Menu')}" href="#/components/menu" selected></vui-menu-item></vui-menu></vui-menu-item><vui-menu-item label="${text('Виджеты', 'Widgets')}" icon="images"><vui-menu inline label="${text('Виджеты', 'Widgets')}" slot="submenu"><vui-menu-item label="Carousel" href="#/components/carousel"></vui-menu-item><vui-menu-item label="Lightbox" href="#/components/lightbox"></vui-menu-item></vui-menu></vui-menu-item></vui-menu><div><vui-button data-open>${text('Действия', 'Actions')}</vui-button><vui-menu label="${text('Действия', 'Actions')}"><vui-menu-item label="${save}" icon="save"></vui-menu-item><vui-menu-item label="${text('Ещё', 'More')}" icon="more-horizontal"><vui-menu label="${text('Ещё', 'More')}" slot="submenu"><vui-menu-item label="${text('Копировать', 'Copy')}" icon="copy"></vui-menu-item></vui-menu></vui-menu-item><vui-menu-item label="${text('Удалить', 'Delete')}" icon="trash-2" variant="danger" disabled></vui-menu-item></vui-menu></div></vui-vstack>`;
  }
  if (slug === 'carousel') {
    html[slug] = `<vui-carousel label="${text('Слайды', 'Slides')}" loop style="max-width:28rem"><div><strong>Atlas</strong><p>${text('Первый слайд', 'First slide')}</p></div><div><strong>Nova</strong><p>${text('Второй слайд', 'Second slide')}</p></div><div><strong>Orbit</strong><p>${text('Третий слайд', 'Third slide')}</p></div></vui-carousel>`;
  }
  if (slug === 'lightbox') {
    const svg = (label: string, fill: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="${fill}"/><text x="50%" y="50%" fill="#fff" font-size="32" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`)}`;
    html[slug] = `<vui-lightbox label="${text('Галерея', 'Gallery')}"><a href="${svg('A', '#4c6ef5')}"><img src="${svg('A', '#4c6ef5')}" alt="Atlas"></a><a href="${svg('B', '#0ca678')}"><img src="${svg('B', '#0ca678')}" alt="Nova"></a><a href="${svg('C', '#f08c00')}"><img src="${svg('C', '#f08c00')}" alt="Orbit"></a></vui-lightbox>`;
  }
  if (slug === 'shell') return interfaceExample('shell');
  if (!html[slug]) throw new Error(`Missing documentation example: ${tag}`);
  return { id: slug, html: html[slug] };
}

export function interfaceExample(id: string): Example {
  const name = text('Имя', 'Name'), save = text('Сохранить', 'Save');
  const settings = `<vui-field-group label="${text('Профиль', 'Profile')}"><vui-vstack gap="md"><vui-input label="${name}" value="Ada" required></vui-input><vui-select label="${text('Язык', 'Language')}" value="ru"><vui-option value="ru">Русский</vui-option><vui-option value="en">English</vui-option></vui-select><vui-switch>${text('Уведомления', 'Notifications')}</vui-switch><vui-button data-save>${save}</vui-button></vui-vstack></vui-field-group>`;
  if (id === 'settings') return { id, html: settings };
  if (id === 'table') return { id, html: `<vui-hstack gap="md" wrap><vui-input data-filter label="${text('Поиск проектов', 'Find projects')}"></vui-input><vui-select data-status label="${text('Статус', 'Status')}" value="all"><vui-option value="all">${text('Все', 'All')}</vui-option><vui-option value="active">${text('Активный', 'Active')}</vui-option><vui-option value="draft">${text('Черновик', 'Draft')}</vui-option></vui-select></vui-hstack><vui-data-grid label="${text('Проекты', 'Projects')}"></vui-data-grid>` };
  if (id === 'dialog') return { ...exampleFor('vui-dialog'), id };
  if (id === 'shell') return { id, html: `<vui-shell style="min-height:24rem"><vui-titlebar slot="header" label="Atlas"></vui-titlebar><vui-toolbar slot="toolbar"><vui-button data-collapse>${text('Навигация', 'Navigation')}</vui-button></vui-toolbar><vui-nav slot="nav" label="${text('Разделы', 'Sections')}"><vui-nav-item selected>${text('Настройки', 'Settings')}</vui-nav-item><vui-nav-item>${text('Команда', 'Team')}</vui-nav-item></vui-nav><vui-panel slot="main" heading="${text('Настройки', 'Settings')}">${settings}</vui-panel><vui-status-bar slot="footer">${text('Готово', 'Ready')}</vui-status-bar></vui-shell>` };
  throw new Error(`Unknown interface example: ${id}`);
}
export function exampleMarkup(example: Example): string {
  return `<div class="vui-example" data-example="${example.id}" data-active="${text('Активный', 'Active')}" data-draft="${text('Черновик', 'Draft')}" data-saved="${text('Сохранено', 'Saved')}" data-required="${text('Введите имя', 'Enter a name')}" data-name="${text('Название', 'Name')}" data-status="${text('Статус', 'Status')}">\n${example.html}\n<output data-result aria-live="polite"></output>\n</div>`;
}
export function exampleCode(example: Example): string {
  const markup = exampleMarkup(example);
  const modules = [...new Set([...markup.matchAll(/<(vui-[a-z-]+)/g)].map((match) => componentImport(match[1]!)))];
  const theme = JSON.stringify(getThemePreference(documentationStorage) ?? getTheme()).replace(/</g, '\\u003c');
  return `<style>\n${exampleCSS}\n</style>\n${markup}\n<script type="module">\n${modules.map((name) => `import '${name}';`).join('\n')}\nimport { applyTheme, setUIMode } from 'vui/theme';\napplyTheme(${theme});\nsetUIMode('${getUIMode()}');\nconst root = document.querySelector('[data-example="${example.id}"]');\n(${wireExample.toString()})(root);\n</script>`;
}

function reactName(tag: string): string {
  return tag.replace(/^vui-/, '').split('-').map((part) => part[0]!.toUpperCase() + part.slice(1)).join('');
}

/** Convert light-DOM VUI markup into React JSX using `vui/react` exports. */
export function exampleJsx(example: Example): string {
  const names = [...new Set([...example.html.matchAll(/<(vui-[a-z-]+)/g)].map((match) => reactName(match[1]!)))].sort();
  const imports = names.length ? `import { ${names.join(', ')} } from 'vui/react';\n\n` : '';
  const jsx = example.html
    .replace(/<\/?([a-z][a-z0-9-]*)/gi, (full, tag: string) => {
      if (!tag.startsWith('vui-')) return full;
      return full[1] === '/' ? `</${reactName(tag)}` : `<${reactName(tag)}`;
    })
    .replace(/\s([a-z][a-z0-9-]*)=""/gi, ' $1')
    .replace(/\sclass="/g, ' className="');
  return `${imports}export function Example() {\n  return (\n    <>\n${jsx.split('\n').map((line) => (line ? `      ${line}` : '')).join('\n')}\n    </>\n  );\n}\n`;
}

export function prettyMarkup(html: string): string {
  return html
    .replace(/></g, '>\n<')
    .replace(/\n<(vui-(?:option|tab|tab-panel|menu-item|tree-item|list-item|nav-item|step|property|radio|checkbox|avatar)\b)/g, '\n  <$1');
}

export function buttonSections(): DemoSection[] {
  const label = text('Кнопка', 'Button');
  const row = (...buttons: string[]) => `<vui-hstack gap="sm" wrap>${buttons.join('')}</vui-hstack>`;
  const btn = (attrs: string, textLabel = label) => `<vui-button${attrs ? ` ${attrs}` : ''}>${textLabel}</vui-button>`;
  const toneLabel = (tone: string) => tone[0]!.toUpperCase() + tone.slice(1);
  return [
    { title: text('Кнопка', 'Button'), example: { id: 'button', html: btn('') } },
    {
      title: text('Цвета', 'Colors'),
      example: {
        id: 'button-colors',
        html: row(...tones.map((tone) => btn(`tone="${tone}" variant="solid"`, toneLabel(tone)))),
      },
    },
    {
      title: text('Мягкие кнопки', 'Soft buttons'),
      example: {
        id: 'button-soft',
        html: row(btn('variant="soft"', text('По умолчанию', 'Default')), ...tones.map((tone) => btn(`tone="${tone}" variant="soft"`, toneLabel(tone)))),
      },
    },
    {
      title: text('Контурные кнопки', 'Outline buttons'),
      example: {
        id: 'button-outline',
        html: row(btn('variant="outline"', text('По умолчанию', 'Default')), ...tones.map((tone) => btn(`tone="${tone}" variant="outline"`, toneLabel(tone)))),
      },
    },
    {
      title: text('Прозрачные кнопки', 'Ghost buttons'),
      example: {
        id: 'button-ghost',
        html: row(btn('variant="ghost"', text('По умолчанию', 'Default')), ...tones.map((tone) => btn(`tone="${tone}" variant="ghost"`, toneLabel(tone)))),
      },
    },
    {
      title: text('Классические варианты', 'Classic variants'),
      example: {
        id: 'button-classic',
        html: row(
          btn('variant="primary"', 'Primary'),
          btn('variant="secondary"', 'Secondary'),
          btn('variant="ghost"', 'Ghost'),
          btn('variant="danger"', 'Danger'),
        ),
      },
    },
    {
      title: text('Размеры', 'Sizes'),
      example: {
        id: 'button-sizes',
        html: row(
          btn('size="small"', text('Маленькая', 'Small')),
          btn('size="medium"', text('Средняя', 'Medium')),
          btn('size="large"', text('Большая', 'Large')),
        ),
      },
    },
    {
      title: text('Состояния', 'States'),
      example: {
        id: 'button-states',
        html: row(
          btn('disabled', text('Недоступна', 'Disabled')),
          btn('loading', text('Загрузка', 'Loading')),
          btn('tone="danger" variant="solid" disabled', text('Опасная · недоступна', 'Danger · disabled')),
          btn('tone="primary" variant="soft" loading', text('Мягкая · загрузка', 'Soft · loading')),
        ),
      },
    },
  ];
}

export function renderExample(example: Example): string {
  const html = prettyMarkup(example.html);
  const runnable = exampleCode(example);
  const jsx = exampleJsx({ ...example, html });
  const preview = text('Просмотр', 'Preview');
  return `<div class="docs-demo" data-demo="${example.id}">
  <div class="docs-demo-toolbar">
    <div class="docs-demo-tabs" role="tablist" aria-label="${preview} / HTML / JSX">
      <button type="button" role="tab" aria-selected="true" data-demo-tab="preview">${preview}</button>
      <button type="button" role="tab" aria-selected="false" data-demo-tab="html">HTML</button>
      <button type="button" role="tab" aria-selected="false" data-demo-tab="jsx">JSX</button>
    </div>
    <vui-button data-copy variant="ghost" size="small">${text('Копировать пример', 'Copy example')}</vui-button>
  </div>
  <div class="docs-demo-panel docs-live" data-demo-panel="preview">${exampleMarkup(example)}</div>
  <div class="docs-demo-panel" data-demo-panel="html" hidden><pre tabindex="0" data-example-code="${example.id}" data-code-kind="html"><code>${escapeHTML(runnable)}</code></pre></div>
  <div class="docs-demo-panel" data-demo-panel="jsx" hidden><pre tabindex="0" data-code-kind="jsx"><code>${escapeHTML(jsx)}</code></pre></div>
</div>`;
}
