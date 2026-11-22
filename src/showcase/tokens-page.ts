/**
 * Docs section #/tokens: side-by-side settings grid of the two built-in themes
 * (Colors, Design Tokens, Typography, Components) and an interactive token playground.
 * Colors come from the generated theme stylesheets; structural tokens are read live
 * from probes per UI mode (they do not change between VUI Light and VUI Dark).
 */
import { builtInThemeStylesheets } from '../theme/stylesheet';
import { contrast } from '../theme';
import { text } from './examples';
import { escapeHTML } from './theme-i18n';
import './tokens-page.css';

type ThemeId = 'light' | 'dark';
type Mode = 'web' | 'desktop' | 'terminal';
const modes: Mode[] = ['web', 'desktop', 'terminal'];

const parseVars = (css: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const m of css.matchAll(/(--vui-[\w-]+):\s*([^;]+);/g)) out[m[1]!] = m[2]!.trim();
  return out;
};

let themeCache: Record<ThemeId, Record<string, string>> | undefined;
const themeVars = () => {
  if (!themeCache) {
    const sheets = builtInThemeStylesheets();
    themeCache = { light: parseVars(sheets.light), dark: parseVars(sheets.dark) };
  }
  return themeCache;
};

/* ---------- token catalogs ---------- */

const colorGroups = (): [string, (name: string) => boolean][] => [
  [text('Фон и поверхности', 'Background & surfaces'), (n) => /^(background|surface.*|card|popover|modal|field|hover|selected|backdrop)$/.test(n)],
  [text('Текст', 'Text'), (n) => /^(text.*|interactive-text)$/.test(n)],
  [text('Текст на заливке', 'Text on fills'), (n) => n.startsWith('on-')],
  [text('Границы и фокус', 'Borders & focus'), (n) => /^(border.*|block-border|control-border|focus)$/.test(n)],
  [text('Бренд: primary / secondary / accent', 'Brand: primary / secondary / accent'), (n) => /^(primary|secondary|accent)/.test(n)],
  [text('Нейтральный', 'Neutral'), (n) => n.startsWith('neutral')],
  [text('Статусы', 'Status'), (n) => /^(success|warning|danger|info)/.test(n)],
  [text('Подсказки и тени', 'Tooltip & shadow'), (n) => /^(tooltip|shadow)/.test(n)],
];

const designTokens = (): [string, string[]][] => [
  [text('Отступы', 'Spacing'), ['space-2xs', 'space-xs', 'space-sm', 'space-md', 'space-lg', 'space-xl', 'space-2xl', 'space-3xl', 'gap-related', 'gap-group', 'gap-section', 'layout-gap', 'container-gutter']],
  [text('Размеры', 'Sizes'), ['size-control-sm', 'size-control', 'size-control-lg', 'size-touch', 'icon-size-sm', 'icon-size', 'icon-size-lg', 'icon-size-xl', 'icon-stroke', 'icon-gap']],
  [text('Радиусы', 'Radii'), ['radius-sm', 'radius', 'radius-lg', 'radius-box', 'radius-field', 'radius-selector', 'radius-full']],
  [text('Рамки и фокус', 'Borders & focus'), ['border-width', 'border-width-strong', 'border-width-accent', 'stroke-width', 'focus-ring', 'focus-offset', 'focus-shadow']],
  [text('Тени', 'Elevation'), ['shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-strength-sm', 'shadow-strength-md', 'shadow-strength-lg']],
  [text('Движение и состояние', 'Motion & state'), ['duration', 'easing', 'opacity-disabled']],
  [text('Слои (z-index)', 'Layers (z-index)'), ['z-dropdown', 'z-sticky', 'z-overlay', 'z-dialog', 'z-toast', 'z-tooltip']],
  [text('Брейкпоинты и контейнеры', 'Breakpoints & containers'), ['breakpoint-xs', 'breakpoint-sm', 'breakpoint-md', 'breakpoint-lg', 'breakpoint-xl', 'breakpoint-2xl', 'container-sm', 'container-md', 'container-lg', 'container-xl']],
];

const typographyTokens = (): [string, string[]][] => [
  [text('Шрифты', 'Font families'), ['font-sans', 'font-mono']],
  [text('Размеры и заголовки', 'Sizes & headings'), ['font-size-xs', 'font-size-sm', 'font-size', 'font-size-lg', 'heading-3', 'heading-2', 'heading-1']],
  [text('Межстрочные интервалы', 'Line heights'), ['line-height-sm', 'line-height', 'line-height-heading']],
  [text('Начертание и трекинг', 'Weight & tracking'), ['font-weight', 'font-weight-medium', 'font-weight-strong', 'font-weight-control', 'tracking-heading', 'tracking-caps', 'measure']],
];

const componentTokens = (): [string, string[]][] => [
  [text('Кнопки и поля', 'Buttons & fields'), ['size-control', 'radius-field', 'font-weight-control', 'field-gap', 'form-gap', 'field-label-size', 'field-label-min']],
  [text('Меню и навигация', 'Menus & navigation'), ['menu-padding', 'menu-item-height', 'menu-inline', 'menu-block', 'layout-nav', 'nav-item-height', 'nav-item-padding-inline', 'nav-gap', 'nav-category-gap', 'nav-indent']],
  [text('Таблицы и списки', 'Tables & lists'), ['row-height', 'list-block', 'column-min']],
  [text('Окна и оверлеи', 'Windows & overlays'), ['dialog-padding', 'dialog-inline-sm', 'dialog-inline', 'dialog-inline-lg', 'dialog-block', 'popover-padding', 'overlay-gutter', 'overlay-max-block', 'drawer-inline', 'toast-inline', 'tooltip-inline']],
  [text('Каркас приложения', 'App chrome'), ['header-height', 'toolbar-height', 'statusbar-height', 'panel-padding', 'scrollbar-size', 'scrollbar-gutter', 'resizer-hit-size', 'resizer-stroke', 'size-separator', 'split-min-block']],
];

/* ---------- settings grid ---------- */

const isColor = (v: string) => /^#|^rgb|^hsl|^color-mix/.test(v);
const swatch = (v: string) => `<span class="tk-swatch" style="background:${escapeHTML(v)}"></span>`;

function colorTable(): string {
  const { light, dark } = themeVars();
  const names = Object.keys(light).filter((k) => k.startsWith('--vui-color-') || k.startsWith('--vui-shadow-ink'));
  const short = (k: string) => k.replace('--vui-color-', '').replace('--vui-', '');
  const used = new Set<string>();
  const ratio = (name: string, vars: Record<string, string>) => {
    const fg = vars[name]!;
    const n = short(name);
    const bg = n.startsWith('on-') ? vars[`--vui-color-${n.slice(3).replace('-solid', '')}`] : /^(text|interactive-text)/.test(n) ? vars['--vui-color-background'] : undefined;
    if (!bg || !isColor(fg) || !isColor(bg)) return '';
    try {
      const r = contrast(fg, bg);
      return Number.isFinite(r) ? `<span class="tk-ratio ${r >= 4.5 ? 'ok' : 'low'}" title="${text('Контраст к фону', 'Contrast to background')}">${r.toFixed(1)}:1</span>` : '';
    } catch {
      return '';
    }
  };
  const cell = (name: string, vars: Record<string, string>) => {
    const v = vars[name] ?? '—';
    return `<td>${isColor(v) ? swatch(v) : ''}<code>${escapeHTML(v)}</code>${ratio(name, vars)}</td>`;
  };
  const groups = colorGroups().map(([label, test]) => {
    const rows = names.filter((n) => !used.has(n) && test(short(n)));
    rows.forEach((n) => used.add(n));
    return [label, rows] as const;
  });
  const rest = names.filter((n) => !used.has(n));
  if (rest.length) groups.push([text('Прочее', 'Other'), rest]);
  return `<div class="tk-table-wrap"><table class="tk-table"><thead><tr><th>${text('Токен', 'Token')}</th><th>VUI Light</th><th>VUI Dark</th></tr></thead><tbody>${groups
    .filter(([, rows]) => rows.length)
    .map(([label, rows]) => `<tr class="tk-group"><th colspan="3">${label} <span>${rows.length}</span></th></tr>${rows.map((n) => `<tr><td><code class="tk-name">${n}</code></td>${cell(n, light)}${cell(n, dark)}</tr>`).join('')}`)
    .join('')}</tbody></table></div>`;
}

function modeTable(groups: [string, string[]][], probes: Record<Mode, HTMLElement>, specimen?: (name: string, value: string) => string): string {
  const { light, dark } = themeVars();
  const read = (mode: Mode, name: string) => getComputedStyle(probes[mode]).getPropertyValue(`--vui-${name}`).trim() || '—';
  const themed = (name: string) => `--vui-${name}` in light;
  const row = (name: string) => {
    if (themed(name)) {
      const l = light[`--vui-${name}`]!;
      const d = dark[`--vui-${name}`]!;
      return `<tr><td><code class="tk-name">--vui-${name}</code><span class="tk-tag">${text('тема', 'theme')}</span></td><td colspan="3"><span class="tk-split"><span>Light: <code>${escapeHTML(l)}</code></span><span>Dark: <code>${escapeHTML(d)}</code></span></span></td></tr>`;
    }
    const values = modes.map((m) => read(m, name));
    const same = values.every((v) => v === values[0]);
    return `<tr${same ? ' class="tk-same"' : ''}><td><code class="tk-name">--vui-${name}</code></td>${values
      .map((v, i) => `<td title="${escapeHTML(v)}"><code>${escapeHTML(v)}</code>${specimen ? specimen(name, `var(--vui-${name})`).replace('data-mode', `data-vui-ui="${modes[i]}"`) : ''}</td>`)
      .join('')}</tr>`;
  };
  return `<div class="tk-table-wrap"><table class="tk-table tk-modes"><thead><tr><th>${text('Токен', 'Token')}</th><th>Web</th><th>Desktop</th><th>Terminal</th></tr></thead><tbody>${groups
    .map(([label, names]) => `<tr class="tk-group"><th colspan="4">${label} <span>${names.length}</span></th></tr>${names.map(row).join('')}`)
    .join('')}</tbody></table></div>`;
}

const designSpecimen = (name: string, v: string) =>
  name.startsWith('space-') || name.startsWith('size-control') || name.startsWith('icon-size')
    ? `<span class="tk-bar" data-mode style="inline-size:${v}"></span>`
    : name.startsWith('radius')
      ? `<span class="tk-radius" data-mode style="border-radius:${v}"></span>`
      : name.startsWith('shadow-') && !name.includes('strength')
        ? `<span class="tk-shadow" data-mode style="box-shadow:${v}"></span>`
        : '';

const typeSpecimen = (name: string, v: string) =>
  name.startsWith('font-size') || name.startsWith('heading')
    ? `<span class="tk-type" data-mode style="font-size:${v}">Аа Bb</span>`
    : name.startsWith('font-weight')
      ? `<span class="tk-type" data-mode style="font-weight:${v}">Аа Bb</span>`
      : name.startsWith('font-')
        ? `<span class="tk-type" data-mode style="font-family:${v}">Аа Bb 123</span>`
        : '';

/* ---------- playground ---------- */

interface Control {
  id: string;
  label: string;
  kind: 'color' | 'range' | 'select';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: [string, string][];
}

const colorControls = (): Control[] => [
  ['primary', 'Primary'], ['accent', 'Accent'], ['background', text('Фон', 'Background')], ['surface', text('Поверхность', 'Surface')],
  ['text', text('Текст', 'Text')], ['text-muted', text('Вторичный текст', 'Muted text')], ['border', text('Граница', 'Border')],
  ['success', 'Success'], ['warning', 'Warning'], ['danger', 'Danger'], ['info', 'Info'],
].map(([id, label]) => ({ id: `color-${id}`, label: label!, kind: 'color' as const }));

const sizeControls = (): Control[] => [
  { id: 'font-family', label: text('Шрифт', 'Font family'), kind: 'select', options: [['', text('По умолчанию', 'Default')], ['system-ui, sans-serif', 'System UI'], ['Georgia, "Times New Roman", serif', 'Serif'], ['var(--vui-font-mono)', 'Mono'], ['"Trebuchet MS", Verdana, sans-serif', 'Humanist']] },
  { id: 'font-size', label: text('Базовый размер шрифта', 'Base font size'), kind: 'range', min: 11, max: 18, step: 1, unit: 'px' },
  { id: 'heading-scale', label: text('Масштаб заголовков', 'Heading scale'), kind: 'range', min: 0.75, max: 1.6, step: 0.05, unit: '×' },
  { id: 'line-height', label: text('Межстрочный интервал', 'Line height'), kind: 'range', min: 1.1, max: 1.8, step: 0.01 },
  { id: 'font-weight-control', label: text('Начертание кнопок', 'Control weight'), kind: 'range', min: 300, max: 800, step: 100 },
  { id: 'radius', label: text('Радиус', 'Radius'), kind: 'range', min: 0, max: 20, step: 1, unit: 'px' },
  { id: 'size-control', label: text('Высота контролов', 'Control height'), kind: 'range', min: 20, max: 52, step: 2, unit: 'px' },
  { id: 'space-scale', label: text('Масштаб отступов', 'Spacing scale'), kind: 'range', min: 0.5, max: 2, step: 0.05, unit: '×' },
  { id: 'border-width', label: text('Толщина рамки', 'Border width'), kind: 'range', min: 0, max: 3, step: 0.5, unit: 'px' },
  { id: 'shadow-strength', label: text('Сила тени', 'Shadow strength'), kind: 'range', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'duration', label: text('Длительность анимации', 'Motion duration'), kind: 'range', min: 0, max: 600, step: 10, unit: 'ms' },
];

/** Survives docs re-render (theme / UI-mode switches). */
const state: { theme: ThemeId; mode: Mode; values: Record<string, string> } = { theme: 'light', mode: 'web', values: {} };

const spaceNames = ['space-2xs', 'space-xs', 'space-sm', 'space-md', 'space-lg', 'space-xl', 'space-2xl', 'space-3xl'];

function controlHTML(c: Control): string {
  const input =
    c.kind === 'color'
      ? `<input type="color" data-ctl="${c.id}">`
      : c.kind === 'select'
        ? `<select data-ctl="${c.id}">${c.options!.map(([v, l]) => `<option value="${escapeHTML(v)}">${escapeHTML(l)}</option>`).join('')}</select>`
        : `<input type="range" data-ctl="${c.id}" min="${c.min}" max="${c.max}" step="${c.step}">`;
  return `<label class="tk-ctl"><span class="tk-ctl-label">${c.label}<output data-out="${c.id}"></output></span>${input}</label>`;
}

function previewHTML(): string {
  const t = text;
  return `<div class="tk-preview-grid">
  <section class="tk-card"><h3>${t('Типографика', 'Typography')}</h3>
    <h1 class="tk-h1">${t('Заголовок H1', 'Heading H1')}</h1><h2 class="tk-h2">${t('Заголовок H2', 'Heading H2')}</h2><h3 class="tk-h3">${t('Заголовок H3', 'Heading H3')}</h3>
    <p>${t('Основной текст абзаца: интерфейсы из понятных компонентов, единые токены для Web, Desktop и Terminal.', 'Body paragraph: interfaces from clear components, shared tokens for Web, Desktop, and Terminal.')}</p>
    <p class="tk-muted">${t('Вторичный текст и', 'Muted text and')} <a href="#/tokens">${t('ссылка', 'a link')}</a> · <code>inline code</code> · <vui-kbd>Ctrl</vui-kbd>+<vui-kbd>K</vui-kbd></p>
  </section>
  <section class="tk-card"><h3>${t('Кнопки', 'Buttons')}</h3>
    <div class="tk-row"><vui-button variant="primary">Primary</vui-button><vui-button variant="secondary">Secondary</vui-button><vui-button variant="outline">Outline</vui-button><vui-button variant="ghost">Ghost</vui-button><vui-button variant="danger">Danger</vui-button></div>
    <div class="tk-row"><vui-button size="small">Small</vui-button><vui-button>Medium</vui-button><vui-button size="large">Large</vui-button><vui-button disabled>${t('Отключена', 'Disabled')}</vui-button><vui-button loading>${t('Загрузка', 'Loading')}</vui-button></div>
    <div class="tk-row"><vui-icon-button name="search" label="Search"></vui-icon-button><vui-icon-button name="settings" label="Settings" variant="ghost"></vui-icon-button><vui-toggle>${t('Переключатель', 'Toggle')}</vui-toggle>
    <vui-badge>Neutral</vui-badge><vui-badge tone="primary">Primary</vui-badge><vui-badge tone="success">Success</vui-badge><vui-badge tone="warning">Warning</vui-badge><vui-badge tone="danger">Danger</vui-badge><vui-chip>Chip</vui-chip></div>
  </section>
  <section class="tk-card"><h3>${t('Поля', 'Fields')}</h3>
    <vui-input label="${t('Имя', 'Name')}" placeholder="${t('Введите имя', 'Enter a name')}"></vui-input>
    <vui-input label="Email" value="bad@" invalid hint="${t('Неверный адрес', 'Invalid address')}"></vui-input>
    <vui-select label="${t('Тариф', 'Plan')}" value="team"><vui-option value="free">${t('Личный', 'Personal')}</vui-option><vui-option value="team">${t('Команда', 'Team')}</vui-option></vui-select>
    <vui-textarea label="${t('Заметки', 'Notes')}" value="${t('Многострочный текст', 'Multiline text')}"></vui-textarea>
    <div class="tk-row"><vui-checkbox checked>${t('Флажок', 'Checkbox')}</vui-checkbox><vui-radio name="tk-r" checked>A</vui-radio><vui-radio name="tk-r">B</vui-radio><vui-switch checked>${t('Свитч', 'Switch')}</vui-switch></div>
    <vui-slider label="${t('Слайдер', 'Slider')}" min="0" max="100" value="60"></vui-slider>
  </section>
  <section class="tk-card"><h3>${t('Меню и вкладки', 'Menus & tabs')}</h3>
    <vui-tabs label="${t('Разделы', 'Sections')}"><vui-tab slot="tab" panel="a">${t('Обзор', 'Overview')}</vui-tab><vui-tab slot="tab" panel="b">${t('Детали', 'Details')}</vui-tab><vui-tab slot="tab" panel="c">${t('История', 'History')}</vui-tab><vui-tab-panel slot="panel" name="a">${t('Содержимое первой вкладки', 'First tab content')}</vui-tab-panel><vui-tab-panel slot="panel" name="b">${t('Вторая вкладка', 'Second tab')}</vui-tab-panel><vui-tab-panel slot="panel" name="c">${t('Третья вкладка', 'Third tab')}</vui-tab-panel></vui-tabs>
    <vui-menu inline label="${t('Меню', 'Menu')}"><vui-menu-item label="${t('Обзор', 'Overview')}" icon="house" selected></vui-menu-item><vui-menu-item label="${t('Проекты', 'Projects')}" icon="layers"></vui-menu-item><vui-menu-item label="${t('Настройки', 'Settings')}" icon="settings"></vui-menu-item></vui-menu>
  </section>
  <section class="tk-card tk-wide"><h3>${t('Таблица', 'Table')}</h3><vui-data-grid label="${t('Проекты', 'Projects')}"></vui-data-grid></section>
  <section class="tk-card"><h3>${t('Обратная связь', 'Feedback')}</h3>
    <vui-alert variant="info">${t('Информация', 'Information')}</vui-alert><vui-alert variant="success">${t('Изменения сохранены', 'Changes saved')}</vui-alert><vui-alert variant="warning">${t('Проверьте данные', 'Check the data')}</vui-alert><vui-alert variant="danger">${t('Ошибка сохранения', 'Save failed')}</vui-alert>
    <vui-progress label="${t('Загрузка', 'Upload')}" value="60" max="100"></vui-progress>
  </section>
  <section class="tk-card"><h3>${t('Окна', 'Windows')}</h3>
    <div class="tk-row"><vui-button data-tk-open>${t('Открыть диалог', 'Open dialog')}</vui-button><vui-tooltip text="${t('Подсказка', 'Tooltip')}"><vui-button variant="secondary">${t('Наведите', 'Hover me')}</vui-button></vui-tooltip></div>
    <div class="tk-elev"><div style="box-shadow:var(--vui-shadow-sm)">sm</div><div style="box-shadow:var(--vui-shadow-md)">md</div><div style="box-shadow:var(--vui-shadow-lg)">lg</div></div>
    <vui-dialog label="${t('Подтверждение', 'Confirmation')}"><p>${t('Диалог использует токены dialog-padding, radius-box, shadow-lg и modal.', 'The dialog uses dialog-padding, radius-box, shadow-lg and modal tokens.')}</p><vui-button slot="footer" variant="secondary" data-tk-close>${t('Отмена', 'Cancel')}</vui-button><vui-button slot="footer" data-tk-close>OK</vui-button></vui-dialog>
  </section>
</div>`;
}

/* ---------- page ---------- */

export function tokensPageHTML(): string {
  return `<h1 tabindex="-1">${text('Токены и темы', 'Tokens & themes')}</h1>
<p class="docs-lead">${text(
    'Все настройки двух встроенных тем VUI Light и VUI Dark. Цвета задаёт тема; размеры, типографику и метрики компонентов — режим UI (Web / Desktop / Terminal), они общие для обеих тем.',
    'Every setting of the two built-in themes, VUI Light and VUI Dark. The theme owns colors; sizes, typography and component metrics follow UI mode (Web / Desktop / Terminal) and are shared by both themes.',
  )}</p>
<p class="tk-jump"><a href="#tk-grid">${text('Сетка настроек', 'Settings grid')}</a> · <a href="#tk-playground">${text('Интерактивный dashboard', 'Interactive dashboard')}</a></p>
<div class="tk-probes" aria-hidden="true">${modes.map((m) => `<div data-vui-ui="${m}" data-tk-probe="${m}"></div>`).join('')}</div>
<section id="tk-grid" class="tk-section"><h2>${text('Сетка настроек', 'Settings grid')}</h2>
<vui-tabs label="${text('Категории токенов', 'Token categories')}" class="tk-tabs">
  <vui-tab slot="tab" panel="colors">${text('Цвета', 'Colors')}</vui-tab>
  <vui-tab slot="tab" panel="design">Design Tokens</vui-tab>
  <vui-tab slot="tab" panel="type">Typography</vui-tab>
  <vui-tab slot="tab" panel="components">Components</vui-tab>
  <vui-tab-panel slot="panel" name="colors"><p class="tk-note">${text('Семантические цвета из themes/light.css и themes/dark.css. Бейдж — контраст текста к фону (AA ≥ 4.5).', 'Semantic colors from themes/light.css and themes/dark.css. Badge = text contrast against background (AA ≥ 4.5).')}</p><div data-tk-table="colors"></div></vui-tab-panel>
  <vui-tab-panel slot="panel" name="design"><p class="tk-note">${text('Отступы, размеры, радиусы, рамки, тени, движение, слои, брейкпоинты. Строки с меткой «тема» различаются между Light и Dark; серые строки одинаковы во всех режимах.', 'Spacing, sizes, radii, borders, elevation, motion, layers, breakpoints. Rows tagged “theme” differ between Light and Dark; dimmed rows are identical in all modes.')}</p><div data-tk-table="design"></div></vui-tab-panel>
  <vui-tab-panel slot="panel" name="type"><p class="tk-note">${text('Шрифты, размеры, заголовки, межстрочные интервалы, начертания.', 'Families, sizes, headings, line heights, weights.')}</p><div data-tk-table="type"></div></vui-tab-panel>
  <vui-tab-panel slot="panel" name="components"><p class="tk-note">${text('Метрики кнопок, полей, меню, таблиц, окон и каркаса.', 'Metrics for buttons, fields, menus, tables, windows and chrome.')}</p><div data-tk-table="components"></div></vui-tab-panel>
</vui-tabs>
</section>
<section id="tk-playground" class="tk-section"><h2>${text('Интерактивный dashboard', 'Interactive dashboard')}</h2>
<p class="tk-note">${text('Меняйте параметры — превью обновляется сразу. Изменения действуют только внутри превью; CSS можно скопировать.', 'Change parameters and the preview updates live. Changes apply only inside the preview; copy the CSS when ready.')}</p>
<div class="tk-playground">
  <aside class="tk-controls">
    <div class="tk-ctl-row">
      <label class="tk-ctl"><span class="tk-ctl-label">${text('Тема', 'Theme')}</span><select data-ctl="theme"><option value="light">VUI Light</option><option value="dark">VUI Dark</option></select></label>
      <label class="tk-ctl"><span class="tk-ctl-label">${text('Режим UI', 'UI mode')}</span><select data-ctl="mode">${modes.map((m) => `<option value="${m}">${m[0]!.toUpperCase()}${m.slice(1)}</option>`).join('')}</select></label>
    </div>
    <h3>${text('Цвета', 'Colors')}</h3><div class="tk-colors">${colorControls().map(controlHTML).join('')}</div>
    <h3>${text('Типографика и размеры', 'Typography & sizes')}</h3>${sizeControls().map(controlHTML).join('')}
    <div class="tk-row tk-actions"><vui-button variant="secondary" data-tk-reset>${text('Сбросить', 'Reset')}</vui-button><vui-button data-tk-copy>${text('Копировать CSS', 'Copy CSS')}</vui-button></div>
    <pre class="tk-css"><code data-tk-css></code></pre>
  </aside>
  <div class="tk-preview" data-tk-preview>${previewHTML()}</div>
</div>
</section>`;
}

const toHex = (v: string): string => {
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  if (/^#[0-9a-f]{8}$/i.test(v)) return v.slice(0, 7);
  if (/^#[0-9a-f]{3}$/i.test(v)) return `#${[...v.slice(1)].map((c) => c + c).join('')}`;
  return '#000000';
};

export function wireTokensPage(page: HTMLElement): void {
  const probes = Object.fromEntries(modes.map((m) => [m, page.querySelector<HTMLElement>(`[data-tk-probe="${m}"]`)!])) as Record<Mode, HTMLElement>;
  const fill = (key: string, html: string) => {
    const host = page.querySelector(`[data-tk-table="${key}"]`);
    if (host) host.innerHTML = html;
  };
  fill('colors', colorTable());
  fill('design', modeTable(designTokens(), probes, designSpecimen));
  fill('type', modeTable(typographyTokens(), probes, typeSpecimen));
  fill('components', modeTable(componentTokens(), probes));

  const preview = page.querySelector<HTMLElement>('[data-tk-preview]')!;
  const cssOut = page.querySelector<HTMLElement>('[data-tk-css]')!;
  const grid = preview.querySelector<HTMLElement & { columns: object[]; rows: object[] }>('vui-data-grid');
  if (grid) {
    grid.columns = [
      { key: 'name', title: text('Проект', 'Project') },
      { key: 'owner', title: text('Владелец', 'Owner') },
      { key: 'status', title: text('Статус', 'Status') },
      { key: 'updated', title: text('Обновлён', 'Updated') },
    ];
    grid.rows = [
      { id: '1', name: 'Atlas', owner: 'Anna', status: text('Активный', 'Active'), updated: '2026-11-21' },
      { id: '2', name: 'Orion', owner: 'Ivan', status: text('Черновик', 'Draft'), updated: '2026-11-18' },
      { id: '3', name: 'Nova', owner: 'Maria', status: text('Активный', 'Active'), updated: '2026-11-12' },
      { id: '4', name: 'Vega', owner: 'Oleg', status: text('Архив', 'Archived'), updated: '2026-10-30' },
    ];
  }
  const dialog = preview.querySelector<HTMLElement & { show: () => void; close: () => void }>('vui-dialog');
  preview.querySelector('[data-tk-open]')?.addEventListener('click', () => dialog?.show());
  for (const b of preview.querySelectorAll('[data-tk-close]')) b.addEventListener('click', () => dialog?.close());

  const ctl = (id: string) => page.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-ctl="${id}"]`)!;
  const out = (id: string) => page.querySelector<HTMLOutputElement>(`[data-out="${id}"]`);
  const all = [...colorControls(), ...sizeControls()];

  /** Defaults of the current theme + mode, read from the theme map and the mode probe. */
  const defaults = (): Record<string, string> => {
    const vars = themeVars()[state.theme];
    const probe = getComputedStyle(probes[state.mode]);
    const num = (name: string) => parseFloat(probe.getPropertyValue(`--vui-${name}`)) || 0;
    const d: Record<string, string> = {};
    for (const c of colorControls()) d[c.id] = toHex(vars[`--vui-color-${c.id.slice(6)}`] ?? '#000000');
    Object.assign(d, {
      'font-family': '',
      'font-size': String(num('font-size')),
      'heading-scale': '1',
      'line-height': String(num('line-height')),
      'font-weight-control': String(num('font-weight-control')),
      radius: String(num('radius')),
      'size-control': String(num('size-control')),
      'space-scale': '1',
      'border-width': String(parseFloat(vars['--vui-border-width'] ?? '1')),
      'shadow-strength': String(parseFloat(vars['--vui-shadow-strength-md'] ?? '10')),
      duration: String(num('duration')),
    });
    return d;
  };

  const overrides = (): Record<string, string> => {
    const d = defaults();
    const v = { ...d, ...state.values };
    const changed = (id: string) => state.values[id] !== undefined && state.values[id] !== d[id];
    const o: Record<string, string> = {};
    const probe = getComputedStyle(probes[state.mode]);
    for (const c of colorControls()) {
      if (!changed(c.id)) continue;
      const name = c.id.slice(6);
      const x = v[c.id]!;
      o[`--vui-color-${name}`] = x;
      if (['primary', 'accent', 'success', 'warning', 'danger', 'info'].includes(name)) {
        o[`--vui-color-${name}-hover`] = `color-mix(in srgb, ${x} 90%, var(--vui-color-text))`;
        o[`--vui-color-${name}-text`] = x;
        o[`--vui-color-${name}-border`] = x;
        o[`--vui-color-${name}-surface`] = `color-mix(in srgb, ${x} 12%, var(--vui-color-surface))`;
        o[`--vui-color-${name}-surface-hover`] = `color-mix(in srgb, ${x} 18%, var(--vui-color-surface))`;
      }
      if (name === 'primary') {
        o['--vui-color-primary-active'] = `color-mix(in srgb, ${x} 80%, var(--vui-color-text))`;
        o['--vui-color-focus'] = x;
        o['--vui-color-interactive-text'] = x;
        o['--vui-color-selected'] = `color-mix(in srgb, ${x} 16%, var(--vui-color-surface))`;
      }
      if (name === 'surface') for (const s of ['card', 'popover', 'modal', 'field', 'surface-raised']) o[`--vui-color-${s}`] = x;
      if (name === 'background') o['--vui-color-surface-sunken'] = x;
      if (name === 'text') o['--vui-color-neutral-text'] = x;
      if (name === 'border') o['--vui-color-block-border'] = x;
    }
    if (changed('font-family')) o['--vui-font-sans'] = v['font-family']!;
    if (changed('font-size')) {
      const f = Number(v['font-size']);
      Object.assign(o, { '--vui-font-size': `${f}px`, '--vui-font-size-xs': `${Math.round(f * 0.79)}px`, '--vui-font-size-sm': `${Math.round(f * 0.86)}px`, '--vui-font-size-lg': `${Math.round(f * 1.14)}px` });
    }
    if (changed('heading-scale') || changed('font-size')) {
      const k = Number(v['heading-scale']) * (Number(v['font-size']) / Number(d['font-size']));
      for (const h of ['heading-1', 'heading-2', 'heading-3']) {
        const base = probe.getPropertyValue(`--vui-${h}`).trim();
        o[`--vui-${h}`] = `calc(${base} * ${k.toFixed(3)})`;
      }
    }
    if (changed('line-height')) o['--vui-line-height'] = v['line-height']!;
    if (changed('font-weight-control')) o['--vui-font-weight-control'] = v['font-weight-control']!;
    if (changed('radius')) {
      const r = Number(v.radius);
      Object.assign(o, { '--vui-radius': `${r}px`, '--vui-radius-sm': `${Math.round(r * 0.66)}px`, '--vui-radius-lg': `${Math.round(r * 1.33)}px`, '--vui-radius-box': `${Math.round(r * 1.33)}px`, '--vui-radius-field': `${r}px`, '--vui-radius-selector': `${Math.round(r * 0.66)}px` });
    }
    if (changed('size-control')) {
      const s = Number(v['size-control']);
      Object.assign(o, { '--vui-size-control': `${s}px`, '--vui-size-control-sm': `${s - 8}px`, '--vui-size-control-lg': `${s + 8}px`, '--vui-menu-item-height': `${s}px`, '--vui-row-height': `${s + 8}px` });
    }
    if (changed('space-scale')) {
      const k = Number(v['space-scale']);
      for (const n of spaceNames) o[`--vui-${n}`] = `${Math.round((parseFloat(probe.getPropertyValue(`--vui-${n}`)) || 0) * k)}px`;
    }
    if (changed('border-width')) o['--vui-border-width'] = `${v['border-width']}px`;
    if (changed('shadow-strength')) {
      const s = Number(v['shadow-strength']);
      Object.assign(o, { '--vui-shadow-strength-sm': `${Math.round(s * 0.6)}%`, '--vui-shadow-strength-md': `${s}%`, '--vui-shadow-strength-lg': `${Math.round(s * 1.6)}%` });
    }
    if (changed('duration')) o['--vui-duration'] = `${v.duration}ms`;
    return o;
  };

  const apply = () => {
    const d = defaults();
    preview.removeAttribute('style');
    preview.setAttribute('data-vui-ui', state.mode);
    preview.style.colorScheme = state.theme;
    for (const [k, val] of Object.entries(themeVars()[state.theme])) preview.style.setProperty(k, val);
    const o = overrides();
    for (const [k, val] of Object.entries(o)) preview.style.setProperty(k, val);
    for (const c of all) {
      const value = state.values[c.id] ?? d[c.id]!;
      const el = ctl(c.id);
      if (el.value !== value) el.value = value;
      const o2 = out(c.id);
      if (o2) o2.textContent = c.kind === 'select' ? '' : c.kind === 'color' ? value : `${value}${c.unit ?? ''}`;
      el.closest('.tk-ctl')?.classList.toggle('is-changed', state.values[c.id] !== undefined && state.values[c.id] !== d[c.id]);
    }
    ctl('theme').value = state.theme;
    ctl('mode').value = state.mode;
    const lines = Object.entries(o).map(([k, val]) => `  ${k}: ${val};`);
    cssOut.textContent = lines.length
      ? `[data-vui-theme="${state.theme}"][data-vui-ui="${state.mode}"] {\n${lines.join('\n')}\n}`
      : text('/* Нет изменений — используются значения темы */', '/* No changes — theme defaults in use */');
  };

  page.querySelector('.tk-controls')!.addEventListener('input', (event) => {
    const el = event.target as HTMLInputElement | HTMLSelectElement;
    const id = el.dataset?.ctl;
    if (!id) return;
    if (id === 'theme') state.theme = el.value as ThemeId;
    else if (id === 'mode') state.mode = el.value as Mode;
    else state.values[id] = el.value;
    apply();
  });
  page.querySelector('[data-tk-reset]')?.addEventListener('click', () => {
    state.values = {};
    apply();
  });
  page.querySelector('[data-tk-copy]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget as HTMLElement;
    try {
      await navigator.clipboard.writeText(cssOut.textContent ?? '');
      button.textContent = text('Скопировано', 'Copied');
    } catch {
      button.textContent = text('Не удалось', 'Failed');
    }
    setTimeout(() => (button.textContent = text('Копировать CSS', 'Copy CSS')), 1500);
  });
  apply();
}
