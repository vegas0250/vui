export const buttonStyles = `
:host {
  display: inline-flex;
  vertical-align: middle;
  max-width: 100%;
}
button {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--vui-space-xs);
  width: 100%;
  max-width: 100%;
  min-width: 0;
  min-height: var(--vui-size-control);
  padding-inline: var(--vui-space-md);
  overflow-wrap: anywhere;
  border-radius: var(--vui-radius);
  border: var(--vui-border-width) solid transparent;
  background: var(--vui-color-primary);
  color: var(--vui-color-on-primary);
  font: inherit;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  transition:
    background var(--vui-duration) var(--vui-easing),
    border-color var(--vui-duration) var(--vui-easing),
    color var(--vui-duration) var(--vui-easing);
}
button:hover { background: var(--vui-color-primary-hover); }
button:active { background: var(--vui-color-primary-active); }
button:focus {
  outline: none;
}
button:focus-visible {
  outline: var(--vui-focus-ring);
  outline-offset: var(--vui-focus-offset);
}
button:disabled,
:host([disabled]) button,
:host([loading]) button {
  opacity: 0.5;
  cursor: not-allowed;
}
[part="busy"] {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  box-sizing: border-box;
  border: var(--vui-border-width) solid var(--vui-color-border);
  border-inline-start-color: currentColor;
  border-radius: 50%;
  animation: vui-spin calc(var(--vui-duration) * 8) linear infinite;
}
[part="busy"][hidden] { display: none; }
@keyframes vui-spin { to { transform: rotate(360deg); } }
:host([variant="secondary"]) button {
  background: var(--vui-color-surface);
  color: var(--vui-color-text);
  border-color: var(--vui-color-border);
}
:host([variant="secondary"]) button:hover { background: var(--vui-color-surface-hover); }
:host([variant="ghost"]) button {
  background: transparent;
  color: var(--vui-color-text);
}
:host([variant="ghost"]) button:hover { background: var(--vui-color-surface-hover); }
:host([variant="danger"]) button {
  background: var(--vui-color-danger);
  color: var(--vui-color-on-danger);
}
:host([variant="danger"]) button:hover { background: var(--vui-color-danger-hover); }
:host([size="small"]) button {
  min-height: var(--vui-size-control-sm);
  padding-inline: var(--vui-space-sm);
  font-size: var(--vui-font-size-sm);
}
:host([size="large"]) button {
  min-height: var(--vui-size-control-lg);
  padding-inline: var(--vui-space-lg);
}
@media (forced-colors: active) {
  button {
    border: var(--vui-border-width) solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }
  :host([variant="primary"]) button,
  :host([variant="danger"]) button {
    background: Highlight;
    color: HighlightText;
    border-color: Highlight;
  }
}
`;
