import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VAvatar extends VuiElement {
  declare label: string;
  declare size: string;

  static get observedAttributes(): string[] {
    return ['label', 'size'];
  }

  protected template(): string {
    return `
      <span part="avatar" role="img">
        <slot></slot>
        <span part="initials" aria-hidden="true"></span>
      </span>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; }
      [part="avatar"] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--vui-size-control);
        height: var(--vui-size-control);
        border-radius: 50%;
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-border);
        overflow: hidden;
        font-size: var(--vui-font-size-sm);
        font-weight: var(--vui-font-weight-strong);
      }
      :host([size="small"]) [part="avatar"] {
        width: var(--vui-size-control-sm);
        height: var(--vui-size-control-sm);
      }
      :host([size="large"]) [part="avatar"] {
        width: var(--vui-size-control-lg);
        height: var(--vui-size-control-lg);
      }
      [part="initials"][hidden] { display: none; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot').addEventListener('slotchange', () => this.sync());
  }

  protected sync(): void {
    const avatar = this.qs('[part="avatar"]');
    const initials = this.qs('[part="initials"]');
    const label = (this.getAttribute('label') ?? '').trim();
    const filled = this.qs<HTMLSlotElement>('slot').assignedNodes({ flatten: true }).some((node) => {
      return node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim().length > 0;
    });
    initials.textContent = label
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0] ?? '')
      .join('')
      .toUpperCase();
    initials.toggleAttribute('hidden', filled || !initials.textContent);
    if (label && !filled) avatar.setAttribute('aria-label', label);
    else avatar.removeAttribute('aria-label');
  }
}

reflectStrings(VAvatar, ['label', 'size']);
defineElement('vui-avatar', VAvatar);

registerContract({
  element: 'vui-avatar',
  className: 'VAvatar',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'size', kind: 'enum', values: ['small', 'medium', 'large'], reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['avatar', 'initials'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
  role: 'img',
});
