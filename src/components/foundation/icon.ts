import { registerContract } from '../../contract/registry';
import { defineElement } from '../../utils/define';
import { VuiElement } from '../../utils/element';
import { reflectStrings } from '../../utils/reflect';
import { renderIcon } from '../../icons/registry';

export { iconGroups, iconNames, registerIcon } from '../../icons/registry';

export class VIcon extends VuiElement {
  declare name: string;
  declare label: string;
  declare size: string;

  static get observedAttributes(): string[] {
    return ['name', 'label', 'size'];
  }

  protected template(): string {
    return `<span part="base" class="icon"></span>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: inline-flex;
        width: var(--vui-icon-size);
        height: var(--vui-icon-size);
        max-width: 100%;
        flex: 0 0 auto;
        color: inherit;
        vertical-align: middle;
      }
      :host([hidden]) { display: none; }
      :host([size="small"]) { width: var(--vui-icon-size-sm); height: var(--vui-icon-size-sm); }
      :host([size="large"]) { width: var(--vui-icon-size-lg); height: var(--vui-icon-size-lg); }
      :host([size="xlarge"]) { width: var(--vui-icon-size-xl); height: var(--vui-icon-size-xl); }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
      .icon, .icon svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      /* Stroke weight is a UI-mode token; CSS beats the SVG presentation attribute. */
      .icon svg {
        stroke-width: var(--vui-icon-stroke, 2);
        overflow: visible;
      }
    `;
  }

  protected sync(): void {
    const name = this.getAttribute('name') ?? '';
    const label = this.getAttribute('label');
    const host = this.qs<HTMLElement>('.icon');
    renderIcon(host, name);
    if (label) {
      this.setAttribute('role', 'img');
      this.setAttribute('aria-label', label);
      this.removeAttribute('aria-hidden');
    } else {
      this.removeAttribute('role');
      this.removeAttribute('aria-label');
      this.setAttribute('aria-hidden', 'true');
    }
  }
}

reflectStrings(VIcon, ['name', 'label', 'size']);
defineElement('vui-icon', VIcon);

registerContract({
  element: 'vui-icon',
  className: 'VIcon',
  attributes: [
    { name: 'name', kind: 'string', reflected: true },
    { name: 'label', kind: 'string', reflected: true },
    { name: 'size', kind: 'enum', values: ['small', 'medium', 'large', 'xlarge'], reflected: true },
  ],
  events: [],
  slots: [],
  parts: ['base'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
