import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { emitClose } from '../../core/events';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

const closeIcon = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <path d="M18 6 6 18"></path>
  <path d="m6 6 12 12"></path>
</svg>`;

export class VChip extends VuiElement {
  declare variant: string;
  declare closeLabel: string;
  declare removable: boolean;

  static get observedAttributes(): string[] {
    return ['variant', 'removable', 'close-label'];
  }

  protected template(): string {
    return `
      <span part="chip">
        <slot></slot>
        <button type="button" part="remove" hidden>${closeIcon}</button>
      </span>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; }
      :host([hidden]) { display: none; }
      [part="chip"] {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-2xs);
        min-width: 0;
        max-width: 100%;
        min-height: var(--vui-size-control-sm);
        padding: var(--vui-space-2xs) var(--vui-space-xs);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius-full);
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        font-size: var(--vui-font-size-sm);
        overflow-wrap: anywhere;
      }
      :host([variant="info"]) [part="chip"] { border-color: var(--vui-color-info); background: var(--vui-color-info-surface); }
      :host([variant="success"]) [part="chip"] { border-color: var(--vui-color-success); background: var(--vui-color-success-surface); }
      :host([variant="warning"]) [part="chip"] { border-color: var(--vui-color-warning); background: var(--vui-color-warning-surface); }
      :host([variant="danger"]) [part="chip"] { border-color: var(--vui-color-danger); background: var(--vui-color-danger-surface); }
      button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.25em;
        height: 1.25em;
        padding: 0;
        border: 0;
        border-radius: var(--vui-radius-full);
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      button:focus-visible { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
      button[hidden] { display: none; }
      button svg { width: 0.85em; height: 0.85em; }
    `;
  }

  protected afterRender(): void {
    this.qs('button').addEventListener('click', () => {
      this.hidden = true;
      emitClose(this);
    });
  }

  protected sync(): void {
    const button = this.qs<HTMLButtonElement>('button');
    button.hidden = !this.hasAttribute('removable');
    button.setAttribute('aria-label', this.getAttribute('close-label') || 'Remove');
  }
}

reflectStrings(VChip, { variant: 'variant', closeLabel: 'close-label' });
reflectBooleans(VChip, ['removable']);
defineElement('vui-chip', VChip);

registerContract({
  element: 'vui-chip',
  className: 'VChip',
  attributes: [
    { name: 'variant', kind: 'enum', values: ['neutral', 'info', 'success', 'warning', 'danger'], reflected: true },
    { name: 'removable', kind: 'boolean', reflected: true },
    { name: 'close-label', kind: 'string', property: 'closeLabel', reflected: true },
  ],
  events: ['close'],
  slots: [''],
  parts: ['chip', 'remove'],
  methods: [],
  keyboard: ['Tab', 'Enter', 'Space'],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
