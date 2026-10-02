import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VBreadcrumbs extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label'];
  }

  protected template(): string {
    return `
      <nav part="nav">
        <div part="list"><slot></slot></div>
      </nav>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      nav { min-width: 0; }
      [part="list"] {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--vui-space-xs);
        min-width: 0;
      }
      ::slotted(:not(:first-child)) {
        border-inline-start: var(--vui-border-width) solid var(--vui-color-border);
        padding-inline-start: var(--vui-space-xs);
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    this.qs('nav').setAttribute('aria-label', this.getAttribute('label') || 'Breadcrumb');
  }
}

reflectStrings(VBreadcrumbs, ['label']);
defineElement('vui-breadcrumbs', VBreadcrumbs);

registerContract({
  element: 'vui-breadcrumbs',
  className: 'VBreadcrumbs',
  attributes: [{ name: 'label', kind: 'string', reflected: true }],
  events: [],
  slots: [''],
  parts: ['nav', 'list'],
  methods: [],
  keyboard: ['Tab'],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
