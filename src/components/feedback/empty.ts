import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VEmpty extends VuiElement {
  declare heading: string;
  declare label: string;

  static get observedAttributes(): string[] {
    return ['heading', 'label'];
  }

  protected template(): string {
    return `
      <div part="empty" role="status">
        <p part="heading"></p>
        <div part="body"><slot></slot></div>
        <div part="action"><slot name="action"></slot></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      :host([hidden]) { display: none; }
      [part="empty"] {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--vui-space-sm);
        min-width: 0;
        padding: var(--vui-panel-padding);
        border: var(--vui-border-width) dashed var(--vui-color-border);
        border-radius: var(--vui-radius);
        color: var(--vui-color-text-muted);
      }
      [part="heading"] {
        margin: 0;
        color: var(--vui-color-text);
        font-size: var(--vui-heading-3);
        font-weight: var(--vui-font-weight-strong);
      }
      [part="heading"]:empty, [part="action"]:empty { display: none; }
      [part="body"] { min-width: 0; overflow-wrap: anywhere; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot[name="action"]').addEventListener('slotchange', () => this.sync());
  }

  protected sync(): void {
    const status = this.qs('[part="empty"]');
    const heading = this.qs('[part="heading"]');
    heading.textContent = this.getAttribute('heading') ?? '';
    const label = this.getAttribute('label') || this.getAttribute('heading') || 'Empty';
    status.setAttribute('aria-label', label);
    const action = this.qs('[part="action"]');
    const filled = this.qs<HTMLSlotElement>('slot[name="action"]').assignedNodes({ flatten: true }).length > 0;
    action.toggleAttribute('hidden', !filled);
  }
}

reflectStrings(VEmpty, ['heading', 'label']);
defineElement('vui-empty', VEmpty);

registerContract({
  element: 'vui-empty',
  className: 'VEmpty',
  attributes: [
    { name: 'heading', kind: 'string', reflected: true },
    { name: 'label', kind: 'string', reflected: true },
  ],
  events: [],
  slots: ['', 'action'],
  parts: ['empty', 'heading', 'body', 'action'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
