export { applyAlign, applyJustify, applyOverflow, applySpace, flexAlign, flexJustify, layoutOverflow, tokenGap } from './layout';

const sheets = new Map<string, CSSStyleSheet>();

export const baseStyles = `
:host {
  box-sizing: border-box;
  font-family: var(--vui-font-sans);
  font-size: var(--vui-font-size);
  line-height: var(--vui-line-height);
  color: var(--vui-color-text);
}
:host *,
:host *::before,
:host *::after {
  box-sizing: border-box;
}
@media (prefers-reduced-motion: reduce) {
  :host,
  :host *,
  :host *::before,
  :host *::after {
    transition: none !important;
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
`;

function canAdopt(): boolean {
  return (
    typeof CSSStyleSheet !== 'undefined' &&
    'replaceSync' in CSSStyleSheet.prototype &&
    typeof ShadowRoot !== 'undefined' &&
    'adoptedStyleSheets' in ShadowRoot.prototype
  );
}

export function mountStyles(root: ShadowRoot, css: string, id: string): void {
  const source = `${baseStyles}\n${css}`;
  if (canAdopt()) {
    let sheet = sheets.get(id);
    if (!sheet) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(source);
      sheets.set(id, sheet);
    }
    root.adoptedStyleSheets = [sheet];
    return;
  }

  const style = document.createElement('style');
  style.textContent = source;
  root.prepend(style);
}

export const fieldStyles = `
.field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--vui-space-2xs);
  min-width: 0;
  width: 100%;
}
@container vui-field (min-width: 36rem) {
  .field {
    display: grid;
    grid-template-columns: minmax(var(--vui-field-label-min), var(--vui-field-label-size)) minmax(0, 1fr);
    column-gap: var(--vui-space-md);
    row-gap: var(--vui-space-2xs);
    align-items: center;
  }
  .hint { grid-column: 2; }
}
.label {
  color: var(--vui-color-text-muted);
  font-size: var(--vui-font-size-sm);
  line-height: var(--vui-line-height);
}
.hint {
  color: var(--vui-color-text-muted);
  font-size: var(--vui-font-size-sm);
}
:host([invalid]) .hint,
.error {
  color: var(--vui-color-danger);
}
`;

export const controlStyles = `
.control {
  display: flex;
  align-items: center;
  gap: var(--vui-space-xs);
  min-height: var(--vui-size-control);
  padding-inline: var(--vui-space-sm);
  border: var(--vui-border-width) solid var(--vui-color-border);
  border-radius: var(--vui-radius);
  background: var(--vui-color-field);
  color: var(--vui-color-text);
}
.control:has(:focus-visible) {
  border-color: var(--vui-color-focus);
  box-shadow: var(--vui-focus-shadow);
}
:host([invalid]) .control {
  border-color: var(--vui-color-danger);
}
:host([disabled]) .control {
  opacity: 0.55;
  cursor: not-allowed;
}
:host([size="small"]) .control {
  min-height: var(--vui-size-control-sm);
  font-size: var(--vui-font-size-sm);
}
:host([size="large"]) .control {
  min-height: var(--vui-size-control-lg);
}
input,
textarea,
button {
  font: inherit;
  color: inherit;
}
`;

