/** Documentation-only editor. It consumes the public theme API and actual vui-* elements. */
import {
  applyTheme,
  builtInThemes,
  colorFormats,
  contrast,
  exportThemeCSS,
  exportThemeJSON,
  importThemeJSON,
  readCustomThemes,
  resolveTheme,
  saveThemePreference,
  ThemeHistory,
  themeById,
  themeDocument,
  tokenNames,
  updateToken,
  writeCustomThemes,
} from '../theme';
import type { ThemeDocument, ThemeToken } from '../theme';
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
const t = (s: string) => escapeHTML(tr(s));
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
 <div class="ts-toolbar"><label>${t('Preview')}<select id="ts-template">${previewTemplates.map((v) => `<option value="${v}">${t(templateLabels[v])}</option>`).join('')}</select></label><div class="ts-actions">${[
   ['undo', 'Undo'],
   ['redo', 'Redo'],
   ['reset', 'Restore preset'],
   ['copy-css', 'Copy CSS'],
   ['css', 'Download CSS'],
   ['json', 'Download JSON'],
 ]
   .map(
     ([a, l]) => `<button type="button" data-ts-action="${a}">${t(l)}</button>`,
   )
   .join(
     '',
   )}<label class="ts-file">${t('Import JSON')}<input id="ts-import" type="file" accept="application/json,.json"/></label></div></div>
 <div class="ts-mobile-tabs" role="tablist" aria-label="${t('Theme Studio')}"><button type="button" role="tab" id="ts-customize-tab" aria-controls="ts-editor" aria-selected="true" data-view="customize">${t('Customize')}</button><button type="button" role="tab" id="ts-preview-tab" aria-controls="ts-preview-section" aria-selected="false" tabindex="-1" data-view="preview">${t('Preview')}</button></div>
 <p id="ts-status" role="status" aria-live="polite"></p>
 <div class="ts-workspace" data-mobile-view="customize"><div class="ts-editor" id="ts-editor" role="tabpanel" aria-labelledby="ts-customize-tab">
 <h3>${t('Theme presets')}</h3><div class="ts-presets">${builtInThemes.map((p) => `<button type="button" class="ts-preset" data-preset="${p.id}" aria-pressed="false"><span>${escapeHTML(p.name)}</span><span class="ts-mini-palette" aria-hidden="true">${['background', 'foreground', 'primary', 'accent', 'success'].map((key) => `<i style="background:${p.tokens[key as ThemeToken]}"></i>`).join('')}</span></button>`).join('')}</div>
 <label>${t('Custom themes')}<select id="ts-saved"><option value="">${t('Choose a saved theme')}</option></select></label><label>${t('Theme name')}<input id="ts-name" maxlength="80" value="Tokyo Night custom"/></label><div class="ts-actions">${[
   ['save', 'Save new'],
   ['rename', 'Rename'],
   ['delete', 'Delete'],
   ['apply', 'Apply to documentation'],
 ]
   .map(
     ([a, l]) => `<button type="button" data-ts-action="${a}">${t(l)}</button>`,
   )
   .join('')}</div>
 <div class="ts-token-tools"><label>${t('Search tokens')}<input id="ts-search" type="search"/></label><label>${t('Color format')}<select id="ts-format"><option value="hex">HEX</option><option value="rgb">RGB</option><option value="hsl">HSL</option></select></label></div>
 <div class="ts-tokens">${groups.map(([name, keys]) => `<fieldset class="ts-token-group"><legend>${t(name)}</legend>${keys.map((key) => `<div class="ts-token" data-token="${key}"><div class="ts-token-title"><label for="ts-value-${key}">${t(key)}</label><code>${key}</code><span class="ts-modified" hidden>${t('Modified')}</span></div><div class="ts-token-controls"><input type="color" data-color="${key}" aria-label="${t(key)}"/><input id="ts-value-${key}" type="text" data-value="${key}" spellcheck="false" aria-describedby="ts-error-${key}"/><button type="button" data-copy="${key}" aria-label="${t('Copy color')}: ${t(key)}">⧉</button><button type="button" data-reset="${key}" aria-label="${t('Reset color')}: ${t(key)}">↺</button></div><span class="ts-color-error" id="ts-error-${key}" role="status"></span></div>`).join('')}</fieldset>`).join('')}<p id="ts-no-tokens" hidden>${t('No matching tokens.')}</p></div>
 <fieldset class="ts-appearance"><legend>${t('Visual styling')}</legend>${[
   ['radius', 'Radius', 32, 8],
   ['borderWidth', 'Border width', 4, 1],
   ['shadowIntensity', 'Shadow intensity', 100, 100],
 ]
   .map(
     ([key, label, max, value]) =>
       `<label>${t(String(label))}<output data-appearance-output="${key}">${value}</output><input type="range" data-appearance="${key}" min="0" max="${max}" value="${value}"/></label>`,
   )
   .join(
     '',
   )}<label>${t('Density')}<select id="ts-density">${['comfortable', 'compact', 'dense'].map((v) => `<option value="${v}">${t(v[0].toUpperCase() + v.slice(1))}</option>`).join('')}</select></label></fieldset>
 </div><section class="ts-preview-section" id="ts-preview-section" role="tabpanel" aria-labelledby="ts-preview-tab"><div class="ts-preview-heading"><h3>${t('Preview')}</h3><label><input id="ts-compare" type="checkbox"/>${t('Compare original')}</label></div><p id="ts-contrast" role="status"></p><div class="ts-preview-panels"><div class="ts-modified-preview"><h4>${t('Edited')}</h4><div class="ts-preview" id="ts-live-preview"></div></div><div class="ts-original-preview" hidden><h4>${t('Original')}</h4><div class="ts-preview" id="ts-original-preview"></div></div></div></section></div>`;
  const query = <T extends Element>(selector: string) =>
    host.querySelector<T>(selector)!;
  const live = query<HTMLElement>('#ts-live-preview'),
    original = query<HTMLElement>('#ts-original-preview');
  const status = (message: string) => {
    query('#ts-status').textContent = tr(message);
  };
  const name = () => query<HTMLInputElement>('#ts-name').value.trim();
  const saved = () => {
    const select = query<HTMLSelectElement>('#ts-saved');
    select.replaceChildren(new Option(tr('Choose a saved theme'), ''));
    custom.forEach((d, i) => select.add(new Option(d.name, String(i))));
    select.value = selected === null ? '' : String(selected);
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
  function renderTemplates(): void {
    const template = query<HTMLSelectElement>('#ts-template')
      .value as (typeof previewTemplates)[number];
    for (const root of [live, original]) {
      root.replaceChildren();
      root.innerHTML = previewMarkup(template);
      wirePreview(root);
    }
    paint();
  }
  function paint(): void {
    applyTheme(working, live);
    applyTheme(themeDocument(working.baseTheme), original);
    live.setAttribute(
      'data-vui-density',
      working.appearance?.density ?? 'comfortable',
    );
    original.setAttribute('data-vui-density', 'comfortable');
    const values = resolveTheme(working),
      base = themeById(working.baseTheme).tokens;
    for (const key of tokenNames) {
      const row = query<HTMLElement>(`[data-token="${key}"]`),
        value = query<HTMLInputElement>(`[data-value="${key}"]`);
      query<HTMLInputElement>(`[data-color="${key}"]`).value = values[
        key
      ].slice(0, 7);
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
      if (ratio < 4.5)
        failures.push(`${tr(fg)} / ${tr(bg)}: ${ratio.toFixed(2)}:1`);
    }
    query('#ts-contrast').textContent = failures.length
      ? `${tr('Low contrast')}: ${failures.join('; ')}`
      : tr('All checked text pairs meet WCAG AA.');
    query('#ts-contrast').classList.toggle(
      'ts-low-contrast',
      failures.length > 0,
    );
    query<HTMLButtonElement>('[data-ts-action=undo]').disabled =
      !history.canUndo;
    query<HTMLButtonElement>('[data-ts-action=redo]').disabled =
      !history.canRedo;
    for (const action of ['rename', 'delete'])
      query<HTMLButtonElement>(`[data-ts-action=${action}]`).disabled =
        selected === null;
    for (const button of host.querySelectorAll('[data-preset]'))
      button.setAttribute(
        'aria-pressed',
        String(button.getAttribute('data-preset') === working.baseTheme),
      );
  }
  function refresh(): void {
    query<HTMLInputElement>('#ts-name').value = working.name;
    for (const [key, fallback] of [
      ['radius', 8],
      ['borderWidth', 1],
      ['shadowIntensity', 100],
    ] as const) {
      const v = working.appearance?.[key] ?? fallback;
      query<HTMLInputElement>(`[data-appearance=${key}]`).value = String(v);
      query(`[data-appearance-output=${key}]`).textContent = String(v);
    }
    query<HTMLSelectElement>('#ts-density').value =
      working.appearance?.density ?? 'comfortable';
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
  function editColor(
    key: ThemeToken,
    value: string,
    input?: HTMLInputElement,
  ): void {
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
  host.addEventListener('input', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.dataset.color)
      editColor(input.dataset.color as ThemeToken, input.value);
    if (input.dataset.value)
      editColor(input.dataset.value as ThemeToken, input.value, input);
    if (input.dataset.appearance) {
      const key = input.dataset.appearance as
        | 'radius'
        | 'borderWidth'
        | 'shadowIntensity';
      working = {
        ...working,
        appearance: { ...working.appearance, [key]: Number(input.value) },
      };
      query(`[data-appearance-output=${key}]`).textContent = input.value;
      schedule();
    }
    if (input.id === 'ts-search') {
      const text = input.value.toLowerCase().trim();
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
        ].some((r) => !r.hidden);
      query<HTMLElement>('#ts-no-tokens').hidden = count > 0;
    }
  });
  host.addEventListener('change', async (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      if (
        input.dataset.color ||
        input.dataset.value ||
        input.dataset.appearance
      ) {
        if (input.getAttribute('aria-invalid') !== 'true') commit();
      }
      if (input.id === 'ts-compare')
        query<HTMLElement>('.ts-original-preview').hidden = !input.checked;
      if (input.id === 'ts-import') {
        const file = input.files?.[0];
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
        input.value = '';
      }
    }
    if (input instanceof HTMLSelectElement) {
      if (input.id === 'ts-template') renderTemplates();
      if (input.id === 'ts-format') {
        format = input.value as typeof format;
        paint();
      }
      if (input.id === 'ts-density') {
        working = {
          ...working,
          appearance: {
            ...working.appearance,
            density: input.value as 'comfortable',
          },
        };
        commit();
      }
      if (input.id === 'ts-saved' && input.value !== '') {
        selected = Number(input.value);
        working = structuredClone(custom[selected]);
        history.commit(working);
        refresh();
      }
    }
  });
  host.addEventListener('click', async (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('button')
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
      query<HTMLElement>('.ts-workspace').dataset.mobileView =
        target.dataset.view;
      for (const button of host.querySelectorAll<HTMLElement>('[data-view]')) {
        const chosen = button === target;
        button.setAttribute('aria-selected', String(chosen));
        button.tabIndex = chosen ? 0 : -1;
      }
    }
    const action = target.dataset.tsAction;
    if (action === 'undo') {
      working = history.undo();
      refresh();
    }
    if (action === 'redo') {
      working = history.redo();
      refresh();
    }
    if (action === 'reset') {
      working = themeDocument(working.baseTheme);
      history.commit(working);
      refresh();
    }
    if (action === 'save' || action === 'rename') {
      const nextName = name();
      if (
        !nextName ||
        nextName.length > 80 ||
        custom.some(
          (d, i) =>
            d.name === nextName && (action === 'save' || i !== selected),
        )
      ) {
        status('Enter a unique theme name (1–80 characters).');
        return;
      }
      working = { ...working, name: nextName };
      history.commit(working);
      if (action === 'save') {
        custom.push(structuredClone(working));
        selected = custom.length - 1;
      } else if (selected !== null)
        custom[selected] = { ...custom[selected], name: nextName };
      const ok = persist();
      saved();
      paint();
      if (ok) status(action === 'save' ? 'Theme saved.' : 'Theme renamed.');
    }
    if (action === 'delete' && selected !== null) {
      custom.splice(selected, 1);
      selected = null;
      const ok = persist();
      saved();
      paint();
      if (ok) status('Theme deleted.');
    }
    if (action === 'apply') {
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
    if (action === 'copy-css') await copy(exportThemeCSS(working));
    if (action === 'css' || action === 'json') {
      const d = { ...working, name: name() || working.name };
      const blob = new Blob(
        [action === 'css' ? exportThemeCSS(d) : exportThemeJSON(d)],
        { type: action === 'css' ? 'text/css' : 'application/json' },
      );
      const url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.href = url;
      a.download = `vui-theme.${action}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
  host
    .querySelector('.ts-mobile-tabs')
    ?.addEventListener('keydown', (event) => {
      const e = event as KeyboardEvent;
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        const selected = query<HTMLElement>('[data-view][aria-selected=true]');
        const next =
          e.key === 'Home'
            ? 'customize'
            : e.key === 'End'
              ? 'preview'
              : selected.dataset.view === 'customize'
                ? 'preview'
                : 'customize';
        const button = query<HTMLButtonElement>(`[data-view=${next}]`);
        button.click();
        button.focus();
      }
    });
  saved();
  renderTemplates();
  refresh();
}
