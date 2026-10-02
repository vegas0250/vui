import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { tokenGap } from '../../core/styles';

export class VGrid extends VuiElement {
  static get observedAttributes(): string[] {
    return ['columns', 'min', 'gap'];
  }

  protected template(): string {
    return `<slot></slot>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: grid;
        gap: var(--vui-stack-gap, var(--vui-space-md));
        grid-template-columns: var(--vui-grid-template, minmax(0, 1fr));
        min-width: 0;
        max-width: 100%;
      }
      ::slotted(*) { min-width: 0; max-width: 100%; }
    `;
  }

  protected sync(): void {
    this.style.setProperty('--vui-stack-gap', tokenGap(this.getAttribute('gap')));
    const columns = Number(this.getAttribute('columns'));
    const min = this.getAttribute('min');
    const safeMin = min && /^(\d+(\.\d+)?)(px|rem|em|%)$/.test(min) ? min : '';
    const floor = safeMin || 'var(--vui-column-min)';
    let template = 'minmax(0, 1fr)';
    if (Number.isInteger(columns) && columns > 0 && columns <= 12) {
      const gaps = columns > 1 ? ` - var(--vui-stack-gap) * ${columns - 1}` : '';
      template = `repeat(auto-fit, minmax(min(100%, max(${floor}, calc((100%${gaps}) / ${columns}))), 1fr))`;
    } else if (safeMin) {
      template = `repeat(auto-fit, minmax(min(100%, ${safeMin}), 1fr))`;
    }
    this.style.setProperty('--vui-grid-template', template);
  }
}

defineElement('vui-grid', VGrid);
