import { defineElement } from '../../utils/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../utils/element';
import { reflectStrings } from '../../utils/reflect';
import './avatar';

/** Fluent UI Web Controls: Persona (avatar + text). */
export class VPersona extends VuiElement {
  declare label: string;
  declare secondary: string;
  declare size: string;

  static get observedAttributes(): string[] {
    return ['label', 'secondary', 'size'];
  }

  protected template(): string {
    return `
      <div class="persona" part="persona">
        <vui-avatar part="avatar"></vui-avatar>
        <div class="text" part="text">
          <div class="primary" part="primary"></div>
          <div class="secondary" part="secondary"></div>
        </div>
        <slot></slot>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: inline-flex;
        max-width: 100%;
        min-width: 0;
        vertical-align: middle;
      }
      .persona {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-sm);
        min-width: 0;
        max-width: 100%;
      }
      .text {
        display: flex;
        flex-direction: column;
        gap: 0;
        min-width: 0;
      }
      .primary {
        color: var(--vui-color-text);
        font-size: var(--vui-font-size);
        font-weight: var(--vui-font-weight-strong);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .secondary {
        color: var(--vui-color-text-muted);
        font-size: var(--vui-font-size-sm);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .secondary:empty { display: none; }
    `;
  }

  protected sync(): void {
    const label = (this.getAttribute('label') ?? '').trim();
    const secondary = (this.getAttribute('secondary') ?? '').trim();
    const size = this.getAttribute('size') ?? '';
    const avatar = this.qs('vui-avatar');
    avatar.setAttribute('label', label);
    if (size) avatar.setAttribute('size', size);
    else avatar.removeAttribute('size');
    this.qs('.primary').textContent = label;
    this.qs('.secondary').textContent = secondary;
  }
}

reflectStrings(VPersona, ['label', 'secondary', 'size']);
defineElement('vui-persona', VPersona);

registerContract({
  element: 'vui-persona',
  className: 'VPersona',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'secondary', kind: 'string', reflected: true },
    { name: 'size', kind: 'string', reflected: true, values: ['small', 'medium', 'large'] },
  ],
  events: [],
  slots: [''],
  parts: ['persona', 'avatar', 'text', 'primary', 'secondary'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
