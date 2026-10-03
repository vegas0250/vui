import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

export class VText extends VuiElement {
  declare variant: string;
  declare level: string;
  declare muted: boolean;
  declare truncate: boolean;

  static get observedAttributes(): string[] {
    return ['variant', 'level', 'muted', 'truncate'];
  }

  protected template(): string {
    return `<span part="text"><slot></slot></span>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;
        font-size: var(--vui-font-size);
        line-height: var(--vui-line-height);
        overflow-wrap: anywhere;
      }
      :host([variant="heading"]) { font-weight: var(--vui-font-weight-strong); }
      :host([variant="heading"][level="1"]) { font-size: var(--vui-heading-1); }
      :host([variant="heading"][level="2"]) { font-size: var(--vui-heading-2); }
      :host([variant="heading"][level="3"]) { font-size: var(--vui-heading-3); }
      :host([variant="caption"]),
      :host([variant="label"]) {
        font-size: var(--vui-font-size-sm);
        color: var(--vui-color-text-muted);
      }
      :host([variant="label"]) { font-weight: var(--vui-font-weight-strong); }
      :host([variant="code"]) {
        display: inline;
        font-family: var(--vui-font-mono);
        font-size: 0.95em;
      }
      :host([muted]) { color: var(--vui-color-text-muted); }
      :host([truncate]) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow-wrap: normal;
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    const text = this.qs('[part="text"]');
    const heading = this.getAttribute('variant') === 'heading';
    if (heading) {
      const level = Number(this.getAttribute('level') ?? '2');
      const safe = level >= 1 && level <= 6 ? level : 2;
      text.setAttribute('role', 'heading');
      text.setAttribute('aria-level', String(safe));
    } else {
      text.removeAttribute('role');
      text.removeAttribute('aria-level');
    }
  }
}

reflectStrings(VText, ['variant', 'level']);
reflectBooleans(VText, ['muted', 'truncate']);
defineElement('vui-text', VText);

registerContract({
  element: 'vui-text',
  className: 'VText',
  attributes: [
    { name: 'variant', kind: 'enum', values: ['body', 'heading', 'caption', 'code', 'label'], reflected: true },
    { name: 'level', kind: 'enum', values: ['1', '2', '3', '4', '5', '6'], reflected: true },
    { name: 'muted', kind: 'boolean', reflected: true },
    { name: 'truncate', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['text'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
