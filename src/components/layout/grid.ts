import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { applyAlign, applyJustify, applyOverflow, applySpace, tokenGap } from '../../core/layout';
import { reflectStrings } from '../../core/reflect';

export class VGrid extends VuiElement {
  declare columns: string;
  declare min: string;
  declare gap: string;
  declare align: string;
  declare justify: string;
  declare padding: string;
  declare overflow: string;

  static get observedAttributes(): string[] {
    return ['columns', 'min', 'gap', 'align', 'justify', 'padding', 'overflow'];
  }

  protected template(): string {
    return `<slot></slot>`;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: grid;
        gap: var(--vui-layout-gap, var(--vui-space-md));
        padding: var(--vui-layout-padding, 0);
        align-items: var(--vui-layout-align, stretch);
        justify-content: var(--vui-layout-justify, start);
        overflow: var(--vui-layout-overflow, visible);
        grid-template-columns: var(--vui-grid-template, minmax(0, 1fr));
        min-width: 0;
        max-width: 100%;
      }
      ::slotted(*) { min-width: 0; max-width: 100%; }
    `;
  }

  protected sync(): void {
    this.style.setProperty('--vui-layout-gap', tokenGap(this.getAttribute('gap')));
    applyAlign(this, this.getAttribute('align'), 'stretch');
    applyJustify(this, this.getAttribute('justify'));
    applySpace(this, '--vui-layout-padding', this.getAttribute('padding'), '0');
    applyOverflow(this, this.getAttribute('overflow'), 'visible');
    const columns = Number(this.getAttribute('columns'));
    const min = this.getAttribute('min');
    const safeMin = min && /^(\d+(\.\d+)?)(px|rem|em|%)$/.test(min) ? min : '';
    const floor = safeMin || 'var(--vui-column-min)';
    let template = 'minmax(0, 1fr)';
    if (Number.isInteger(columns) && columns > 0 && columns <= 12) {
      const gaps = columns > 1 ? ` - var(--vui-layout-gap) * ${columns - 1}` : '';
      template = `repeat(auto-fit, minmax(min(100%, max(${floor}, calc((100%${gaps}) / ${columns}))), 1fr))`;
    } else if (safeMin) {
      template = `repeat(auto-fit, minmax(min(100%, ${safeMin}), 1fr))`;
    }
    this.style.setProperty('--vui-grid-template', template);
  }
}

reflectStrings(VGrid, ['columns', 'min', 'gap', 'align', 'justify', 'padding', 'overflow']);
defineElement('vui-grid', VGrid);
