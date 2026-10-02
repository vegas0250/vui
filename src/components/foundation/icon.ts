import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';
import { renderIcon } from '../../icons/registry';

export { iconNames, registerIcon } from '../../icons/registry';

export class VIcon extends VuiElement {
  declare name: string;
  declare label: string;

  static get observedAttributes(): string[] {
    return ['name', 'label'];
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
        flex: 0 0 auto;
        color: inherit;
        vertical-align: middle;
      }
      .icon, .icon svg {
        width: 100%;
        height: 100%;
        display: block;
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

reflectStrings(VIcon, ['name', 'label']);
defineElement('vui-icon', VIcon);
