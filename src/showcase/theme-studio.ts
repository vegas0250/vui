/** Documentation-only editor. It consumes the public theme API and actual vui-* elements. */
import {
  applyTheme,
  builtInThemes,
  colorFormats,
  contrast,
  exportThemeCSS,
  exportThemeJSON,
  getUIMode,
  importThemeJSON,
  readCustomThemes,
  resolveTheme,
  saveThemePreference,
  ThemeHistory,
  themeById,
  themeDocument,
  themeAppearance,
  tokenNames,
  tones,
  toneSolidTokens,
  updateToken,
  writeCustomThemes,
} from '../theme';
import type { ThemeDocument, ThemeToken, VuiUIMode } from '../theme';
import { documentationStorage } from './preferences';
import { escapeHTML, tr } from './theme-i18n';
import {
  previewMarkup,
  previewTemplates,
  templateLabels,
  wirePreview,
} from './theme-preview';
import './theme-studio.css';

const groups: Array<[string, ThemeToken[]]> = [
  [
    'Backgrounds and surfaces',
    ['background', 'surface', 'surfaceElevated', 'card', 'popover', 'modal'],
  ],
  [
    'Typography',
    [
      'foreground',
      'textMuted',
      'textDisabled',
      'primaryForeground',
      'secondaryForeground',
      'accentForeground',
    ],
  ],
  [
    'Interactive elements',
    [
      'primary',
      'primaryHover',
      'primaryActive',
      'secondary',
      'accent',
      'focusRing',
      'interactiveText',
    ],
  ],
  ['System states', ['success', 'warning', 'error', 'info']],
  [
    'Visual styling',
    ['border', 'borderHover', 'selection', 'overlay', 'shadow'],
  ],
];
groups.push([
  'Semantic tones',
  tokenNames.filter((key) => !groups.some(([, keys]) => keys.includes(key))),
]);

const t = (s: string) => escapeHTML(tr(s));
type ValueHost = HTMLElement & { value: string; checked?: boolean; disabled?: boolean };

const option = (value: string, label: string) =>
  `<vui-option value="${escapeHTML(value)}">${t(label)}</vui-option>`;

const action = (id: string, label: string, variant = 'secondary') =>
  `<vui-button type="button" size="small" variant="${variant}" data-ts-action="${id}">${t(label)}</vui-button>`;

export function mountThemeStudio(host: HTMLElement): void {
  const history = new ThemeHistory(themeDocument('tokyo-night'));
  let working = history.current,
    custom: ThemeDocument[] = [],
    selected: number | null = null,
    format: 'hex' | 'rgb' | 'hsl' = 'hex',
    frame = 0;
  try {
    custom = readCustomThemes(documentationStorage);
  } catch {
    /* Editing and exports remain available without storage. */
  }

  host.id = 'theme-studio';
  host.className = 'category theme-studio';
  host.innerHTML = `<header><h2>${t('Theme Studio')}</h2><p class="section-lead">${t('Visual theme editor for VUI')}</p><p>${t('Your draft only changes the previews. Apply it explicitly to change the documentation.')}</p></header>
 <vui-toolbar class="ts-toolbar" label="${t('Theme Studio tools')}" wrap>
   <vui-select id="ts-template" slot="start" label="${t('Preview')}" size="small" value="components">${previewTemplates.map((v) => option(v, templateLabels[v])).join('')}</vui-select>
   <div class="ts-actions">${[
     ['undo', 'Undo'],
     ['redo', 'Redo'],
     ['reset', 'Restore preset'],
     ['copy-css', 'Copy CSS'],
     ['css', 'Download CSS'],
     ['json', 'Download JSON'],
   ]
     .map(([a, l]) => action(a!, l!))
     .join('')}
     <label class="ts-file">${t('Import JSON')}<input id="ts-import" type="file" accept="application/json,.json"/></label>
   </div>
 </vui-toolbar>
 <div class="ts-mobile-tabs" role="tablist" aria-label="${t('Theme Studio')}">
   <vui-button type="button" role="tab" id="ts-customize-tab" aria-controls="ts-editor" aria-selected="true" data-view="customize">${t('Customize')}</vui-button>
   <vui-button type="button" role="tab" id="ts-preview-tab" aria-controls="ts-preview-section" aria-selected="false" tabindex="-1" data-view="preview">${t('Preview')}</vui-button>
 </div>
 <p id="ts-status" role="status" aria-live="polite"></p>
 <div class="ts-workspace" data-mobile-view="customize">
   <div class="ts-editor" id="ts-editor" role="tabpanel" aria-labelledby="ts-customize-tab">
     <h3>${t('Theme presets')}</h3>
     <div class="ts-presets">${builtInThemes
       .map(
         (p) =>
           `<vui-button type="button" class="ts-preset" variant="secondary" size="small" data-preset="${p.id}" aria-pressed="false"><span>${escapeHTML(p.name)} · ${t('VUI adaptation')}</span><span class="ts-mini-palette" aria-hidden="true">${['background', 'foreground', 'primary', 'accent', 'success']
             .map((key) => `<i style="background:${p.tokens[key as ThemeToken]}"></i>`)
             .join('')}</span></vui-button>`,
       )
       .join('')}</div>
     <vui-select id="ts-saved" label="${t('Custom themes')}" size="small" value=""><vui-option value="">${t('Choose a saved theme')}</vui-option></vui-select>
     <vui-input id="ts-name" label="${t('Theme name')}" value="Tokyo Night custom"></vui-input>
     <div class="ts-actions">${[
       ['save', 'Save new'],
       ['rename', 'Rename'],
       ['delete', 'Delete'],
       ['apply', 'Apply to documentation'],
     ]
       .map(([a, l]) => action(a!, l!, a === 'apply' ? 'primary' : 'secondary'))
       .join('')}</div>
     <div class="ts-token-tools">
       <vui-input id="ts-search" type="search" label="${t('Search tokens')}" size="small"></vui-input>
       <vui-select id="ts-format" label="${t('Color format')}" size="small" value="hex">${[
         ['hex', 'HEX'],
         ['rgb', 'RGB'],
         ['hsl', 'HSL'],
       ]
         .map(([v, l]) => option(v!, l!))
         .join('')}</vui-select>
     </div>
     <div class="ts-tokens">${groups
       .map(
         ([name, keys]) =>
           `<vui-panel class="ts-token-group" heading="${t(name)}">${keys
             .map(
               (key) =>
                 `<div class="ts-token" data-token="${key}"><div class="ts-token-title"><label for="ts-value-${key}">${t(key)}</label><code>${key}</code><span class="ts-modified" hidden>${t('Modified')}</span></div><div class="ts-token-controls"><input type="color" data-color="${key}" aria-label="${t(key)}"/><input id="ts-value-${key}" type="text" data-value="${key}" spellcheck="false" aria-describedby="ts-error-${key}"/><vui-icon-button name="copy" size="small" data-copy="${key}" label="${t('Copy color')}: ${t(key)}"></vui-icon-button><vui-button type="button" size="small" variant="ghost" data-reset="${key}" aria-label="${t('Reset color')}: ${t(key)}">↺</vui-button></div><span class="ts-color-error" id="ts-error-${key}" role="status"></span></div>`,
             )
             .join('')}</vui-panel>`,
       )
       .join('')}<p id="ts-no-tokens" hidden>${t('No matching tokens.')}</p></div>
     <vui-panel class="ts-appearance" heading="${t('Visual styling')}">${[
       ['radius', 'Radius', 32, 8],
       ['radiusBox', 'Boxes radius', 32, 8],
       ['radiusField', 'Fields radius', 32, 8],
       ['radiusSelector', 'Selectors radius', 32, 4],
       ['borderWidth', 'Border width', 4, 1],
       ['shadowIntensity', 'Shadow intensity', 100, 100],
     ]
       .map(
         ([key, label, max, value]) =>
           `<div class="ts-appearance-row"><vui-slider data-appearance="${key}" label="${t(String(label))}" min="0" max="${max}" step="1" value="${value}"></vui-slider><output data-appearance-output="${key}">${value}</output></div>`,
       )
       .join('')}
       <vui-select id="ts-ui-mode" label="${t('UI mode')}" size="small" value="">${[
         ['', 'Inherit'],
         ['web', 'Web design'],
         ['desktop', 'Desktop design'],
         ['terminal', 'Terminal design'],
       ]
         .map(([v, l]) => option(v!, l!))
         .join('')}</vui-select>
     </vui-panel>
   </div>
   <section class="ts-preview-section" id="ts-preview-section" role="tabpanel" aria-labelledby="ts-preview-tab">
     <div class="ts-preview-heading">
       <h3>${t('Preview')}</h3>
       <vui-checkbox id="ts-compare">${t('Compare original')}</vui-checkbox>
     </div>
     <p id="ts-contrast" role="status"></p>
     <div class="ts-preview-panels">
       <div class="ts-modified-preview"><h4>${t('Edited')}</h4><div class="ts-preview" id="ts-live-preview"></div></div>
       <div class="ts-original-preview" hidden><h4>${t('Original')}</h4><div class="ts-preview" id="ts-original-preview"></div></div>
     </div>
   </section>
 </div>`;

  const query = <T extends Element>(selector: string) => host.querySelector<T>(selector)!;
  const live = query<HTMLElement>('#ts-live-preview');
  const original = query<HTMLElement>('#ts-original-preview');
  const asValue = (selector: string) => query<ValueHost>(selector);

  const status = (message: string) => {
    query('#ts-status').textContent = tr(message);
  };
  const name = () => asValue('#ts-name').value.trim();

  const saved = () => {
    const select = query('#ts-saved');
    const blank = document.createElement('vui-option') as HTMLElement & { value: string };
    blank.value = '';
    blank.textContent = tr('Choose a saved theme');
    select.replaceChildren(
      blank,
      ...custom.map((documentTheme, index) => {
        const opt = document.createElement('vui-option') as HTMLElement & {
          value: string;
        };
        opt.value = String(index);
        opt.textContent = documentTheme.name;
        return opt;
      }),
    );
    asValue('#ts-saved').value = selected === null ? '' : String(selected);
  };

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      status('Copied.');
    } catch {
      status('Clipboard unavailable. Use the download action.');
    }
  };

  const persist = () => {
    try {
      writeCustomThemes(custom, documentationStorage);
      return true;
    } catch {
      status('Storage unavailable. Export your work before closing this page.');
      return false;
    }
  };

  const setDisabled = (selector: string, on: boolean) => {
    query<HTMLElement>(selector).toggleAttribute('disabled', on);
  };

  function renderTemplates(): void {
    const template = asValue('#ts-template').value as (typeof previewTemplates)[number];
    for (const root of [live, original]) {
      root.replaceChildren();
      root.innerHTML = previewMarkup(template);
      wirePreview(root);
    }
    paint();
  }

  function paint(): void {
    const mode = themeAppearance(working, getUIMode()).uiMode as VuiUIMode;
    live.setAttribute('data-vui-ui', mode);
    original.setAttribute('data-vui-ui', mode);
    applyTheme(working, live);
    applyTheme(themeDocument(working.baseTheme), original);
    const values = resolveTheme(working);
    const base = themeById(working.baseTheme).tokens;
    for (const key of tokenNames) {
      const row = query<HTMLElement>(`[data-token="${key}"]`);
      const value = query<HTMLInputElement>(`[data-value="${key}"]`);
      query<HTMLInputElement>(`[data-color="${key}"]`).value = values[key].slice(0, 7);
      if (document.activeElement !== value) {
        value.value = colorFormats(values[key])[format];
        value.removeAttribute('aria-invalid');
        query(`#ts-error-${key}`).textContent = '';
      }
      const changed = values[key] !== base[key];
      row.classList.toggle('is-modified', changed);
      row.querySelector<HTMLElement>('.ts-modified')!.hidden = !changed;
    }
    const failures: Array<string> = [];
    for (const [fg, bg] of [
      ['foreground', 'field'],
      ['foreground', 'surfaceHover'],
      ...tones.map((tone) => [`${tone}Text`, `${tone}Soft`]),
      ...tones.map((tone) => [
        toneSolidTokens[tone],
        tone === 'danger' ? 'error' : tone,
      ]),
      ['foreground', 'background'],
      ['foreground', 'surface'],
      ['textMuted', 'surface'],
      ['textMuted', 'background'],
      ['foreground', 'surfaceElevated'],
      ['foreground', 'selection'],
      ['interactiveText', 'surface'],
      ['interactiveText', 'selection'],
      ['foreground', 'card'],
      ['foreground', 'popover'],
      ['foreground', 'modal'],
      ['primaryForeground', 'primary'],
      ['primaryForeground', 'primaryHover'],
      ['primaryForeground', 'primaryActive'],
      ['secondaryForeground', 'secondary'],
      ['accentForeground', 'accent'],
    ] as Array<[ThemeToken, ThemeToken]>) {
      const ratio = contrast(values[fg], values[bg]);
      if (ratio < 4.5) failures.push(`${tr(fg)} / ${tr(bg)}: ${ratio.toFixed(2)}:1`);
    }
    for (const [fg, bg] of [
      ['controlBorder', 'field'],
      ['focusRing', 'field'],
      ['focusRing', 'selection'],
    ] as const) {
      const ratio = contrast(values[fg], values[bg]);
      if (ratio < 3) failures.push(`${tr(fg)} / ${tr(bg)}: ${ratio.toFixed(2)}:1 (<3)`);
    }
    query('#ts-contrast').textContent = failures.length
      ? `${tr('Low contrast')}: ${failures.join('; ')}`
      : tr('All checked pairs meet WCAG AA.');
    query('#ts-contrast').classList.toggle('ts-low-contrast', failures.length > 0);
    setDisabled('[data-ts-action=undo]', !history.canUndo);
    setDisabled('[data-ts-action=redo]', !history.canRedo);
    for (const actionName of ['rename', 'delete'])
      setDisabled(`[data-ts-action=${actionName}]`, selected === null);
    for (const button of host.querySelectorAll('[data-preset]'))
      button.setAttribute(
        'aria-pressed',
        String(button.getAttribute('data-preset') === working.baseTheme),
      );
  }

  function refresh(): void {
    asValue('#ts-name').value = working.name;
    for (const [key, fallback] of [
      ['radius', 8],
      ['radiusBox', 8],
      ['radiusField', 8],
      ['radiusSelector', 4],
      ['borderWidth', 1],
      ['shadowIntensity', 100],
    ] as const) {
      const v = themeAppearance(working)[key] ?? fallback;
      asValue(`[data-appearance=${key}]`).value = String(v);
      query(`[data-appearance-output=${key}]`).textContent = String(v);
    }
    asValue('#ts-ui-mode').value =
      working.appearance?.uiMode ??
      (working.appearance?.density === 'compact' ||
      working.appearance?.density === 'dense' ||
      working.appearance?.density === 'desktop'
        ? 'desktop'
        : working.appearance?.density === 'terminal'
          ? 'terminal'
          : working.appearance?.density === 'web' ||
              working.appearance?.density === 'comfortable'
            ? 'web'
            : '');
    paint();
  }

  function commit(): void {
    history.commit(working);
    working = history.current;
    paint();
  }

  function schedule(): void {
    if (!frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        paint();
      });
  }

  function editColor(key: ThemeToken, value: string, input?: HTMLInputElement): void {
    try {
      working = updateToken(working, key, value);
      input?.removeAttribute('aria-invalid');
      query(`#ts-error-${key}`).textContent = '';
      schedule();
    } catch {
      input?.setAttribute('aria-invalid', 'true');
      query(`#ts-error-${key}`).textContent = tr(
        'Invalid color. Use HEX, RGB or HSL.',
      );
    }
  }

  function syncAppearanceOutputs(): void {
    for (const role of [
      'radius',
      'radiusBox',
      'radiusField',
      'radiusSelector',
      'borderWidth',
      'shadowIntensity',
    ] as const) {
      const value = String(themeAppearance(working)[role]);
      asValue(`[data-appearance=${role}]`).value = value;
      query(`[data-appearance-output=${role}]`).textContent = value;
    }
  }

  host.addEventListener('input', (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      if (input.dataset.color) editColor(input.dataset.color as ThemeToken, input.value);
      if (input.dataset.value)
        editColor(input.dataset.value as ThemeToken, input.value, input);
      if (input.id === 'ts-search' || input.closest?.('#ts-search')) {
        const text = (
          input.id === 'ts-search' ? input.value : asValue('#ts-search').value
        )
          .toLowerCase()
          .trim();
        let count = 0;
        for (const row of host.querySelectorAll<HTMLElement>('[data-token]')) {
          row.hidden = !`${row.dataset.token} ${tr(row.dataset.token!)}`
            .toLowerCase()
            .includes(text);
          if (!row.hidden) count++;
        }
        for (const group of host.querySelectorAll<HTMLElement>('.ts-token-group'))
          group.hidden = ![
            ...group.querySelectorAll<HTMLElement>('[data-token]'),
          ].some((row) => !row.hidden);
        query<HTMLElement>('#ts-no-tokens').hidden = count > 0;
      }
    }
    const hostInput = event.target;
    if (hostInput instanceof HTMLElement && hostInput.dataset.appearance) {
      const key = hostInput.dataset.appearance as
        | 'radius'
        | 'radiusBox'
        | 'radiusField'
        | 'radiusSelector'
        | 'borderWidth'
        | 'shadowIntensity';
      working = {
        ...working,
        appearance: {
          ...working.appearance,
          [key]: Number((hostInput as ValueHost).value),
        },
      };
      syncAppearanceOutputs();
      schedule();
    }
    if (hostInput instanceof HTMLElement && hostInput.id === 'ts-search') {
      const text = (hostInput as ValueHost).value.toLowerCase().trim();
      let count = 0;
      for (const row of host.querySelectorAll<HTMLElement>('[data-token]')) {
        row.hidden = !`${row.dataset.token} ${tr(row.dataset.token!)}`
          .toLowerCase()
          .includes(text);
        if (!row.hidden) count++;
      }
      for (const group of host.querySelectorAll<HTMLElement>('.ts-token-group'))
        group.hidden = ![
          ...group.querySelectorAll<HTMLElement>('[data-token]'),
        ].some((row) => !row.hidden);
      query<HTMLElement>('#ts-no-tokens').hidden = count > 0;
    }
    if (hostInput instanceof HTMLElement && hostInput.id === 'ts-name') {
      /* live name field; committed on save/rename */
    }
  });

  host.addEventListener('change', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target instanceof HTMLInputElement) {
      if (target.dataset.color || target.dataset.value || target.dataset.appearance) {
        if (target.getAttribute('aria-invalid') !== 'true') commit();
      }
      if (target.id === 'ts-import') {
        const file = target.files?.[0];
        if (!file) return;
        try {
          if (file.size > 65536) throw Error();
          working = importThemeJSON(await file.text());
          history.commit(working);
          selected = null;
          refresh();
          saved();
          status('Theme imported.');
        } catch {
          status('Invalid theme file. Check its schema and color values.');
        }
        target.value = '';
      }
    }

    if (target.dataset.appearance) {
      if (target.getAttribute('aria-invalid') !== 'true') commit();
    }

    if (target.id === 'ts-compare') {
      query<HTMLElement>('.ts-original-preview').hidden = !(
        target as ValueHost
      ).checked;
    }
    if (target.id === 'ts-template') renderTemplates();
    if (target.id === 'ts-format') {
      format = (target as ValueHost).value as typeof format;
      paint();
    }
    if (target.id === 'ts-ui-mode') {
      const appearance = { ...working.appearance };
      const next = (target as ValueHost).value;
      if (!next) {
        delete appearance.uiMode;
        delete appearance.density;
      } else {
        appearance.uiMode = next as VuiUIMode;
        delete appearance.density;
      }
      working = {
        ...working,
        appearance: Object.keys(appearance).length ? appearance : undefined,
      };
      commit();
    }
    if (target.id === 'ts-saved' && (target as ValueHost).value !== '') {
      selected = Number((target as ValueHost).value);
      working = structuredClone(custom[selected]);
      history.commit(working);
      refresh();
    }
    if (target.id === 'ts-name') {
      /* value already mirrored via property */
    }
  });

  host.addEventListener('click', async (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>(
            '[data-ts-action],[data-preset],[data-reset],[data-copy],[data-view]',
          )
        : null;
    if (!target) return;

    const preset = target.dataset.preset;
    if (preset) {
      working = themeDocument(preset);
      history.commit(working);
      selected = null;
      refresh();
      saved();
    }
    if (target.dataset.reset) {
      const tokens = { ...working.tokens };
      delete tokens[target.dataset.reset as ThemeToken];
      working = { ...working, tokens };
      commit();
    }
    if (target.dataset.copy)
      await copy(
        colorFormats(resolveTheme(working)[target.dataset.copy as ThemeToken])[
          format
        ],
      );
    if (target.dataset.view) {
      query<HTMLElement>('.ts-workspace').dataset.mobileView = target.dataset.view;
      for (const tab of host.querySelectorAll<HTMLElement>('[data-view]')) {
        const chosen = tab === target;
        tab.setAttribute('aria-selected', String(chosen));
        tab.tabIndex = chosen ? 0 : -1;
      }
    }

    const actionId = target.dataset.tsAction;
    if (actionId === 'undo') {
      working = history.undo();
      refresh();
    }
    if (actionId === 'redo') {
      working = history.redo();
      refresh();
    }
    if (actionId === 'reset') {
      working = themeDocument(working.baseTheme);
      history.commit(working);
      refresh();
    }
    if (actionId === 'save' || actionId === 'rename') {
      const nextName = name();
      if (
        !nextName ||
        nextName.length > 80 ||
        custom.some(
          (documentTheme, index) =>
            documentTheme.name === nextName &&
            (actionId === 'save' || index !== selected),
        )
      ) {
        status('Enter a unique theme name (1–80 characters).');
        return;
      }
      working = { ...working, name: nextName };
      history.commit(working);
      if (actionId === 'save') {
        custom.push(structuredClone(working));
        selected = custom.length - 1;
      } else if (selected !== null)
        custom[selected] = { ...custom[selected], name: nextName };
      const ok = persist();
      saved();
      paint();
      if (ok) status(actionId === 'save' ? 'Theme saved.' : 'Theme renamed.');
    }
    if (actionId === 'delete' && selected !== null) {
      custom.splice(selected, 1);
      selected = null;
      const ok = persist();
      saved();
      paint();
      if (ok) status('Theme deleted.');
    }
    if (actionId === 'apply') {
      try {
        saveThemePreference(working, documentationStorage);
        applyTheme(working);
        status('Documentation theme updated.');
      } catch {
        applyTheme(working);
        status(
          'Storage unavailable. Export your work before closing this page.',
        );
      }
    }
    if (actionId === 'copy-css') await copy(exportThemeCSS(working));
    if (actionId === 'css' || actionId === 'json') {
      const documentTheme = { ...working, name: name() || working.name };
      const blob = new Blob(
        [
          actionId === 'css'
            ? exportThemeCSS(documentTheme)
            : exportThemeJSON(documentTheme),
        ],
        { type: actionId === 'css' ? 'text/css' : 'application/json' },
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `vui-theme.${actionId}`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });

  host
    .querySelector('.ts-mobile-tabs')
    ?.addEventListener('keydown', (event) => {
      const keyboard = event as KeyboardEvent;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(keyboard.key))
        return;
      keyboard.preventDefault();
      const current = query<HTMLElement>('[data-view][aria-selected=true]');
      const next =
        keyboard.key === 'Home'
          ? 'customize'
          : keyboard.key === 'End'
            ? 'preview'
            : current.dataset.view === 'customize'
              ? 'preview'
              : 'customize';
      const tab = query<HTMLElement>(`[data-view=${next}]`);
      tab.click();
      tab.focus();
    });

  saved();
  renderTemplates();
  refresh();
}
