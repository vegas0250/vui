import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

export class VLink extends VuiElement {
  declare href: string;
  declare variant: string;
  declare target: string;
  declare rel: string;
  declare disabled: boolean;

  static get observedAttributes(): string[] {
    return ['href', 'variant', 'target', 'rel', 'disabled'];
  }

  protected template(): string {
    return `<a part="link"><slot></slot></a>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; max-width: 100%; min-width: 0; vertical-align: middle; }
      a {
        min-width: 0;
        max-width: 100%;
        color: var(--vui-color-primary);
        overflow-wrap: anywhere;
        text-decoration: underline;
        text-underline-offset: 0.15em;
      }
      a:hover { color: var(--vui-color-primary-hover); }
      a:focus { outline: none; }
      a:focus-visible {
        outline: var(--vui-focus-ring);
        outline-offset: var(--vui-focus-offset);
      }
      :host([variant="button"]) a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: var(--vui-size-control);
        padding-inline: var(--vui-space-md);
        border-radius: var(--vui-radius);
        background: var(--vui-color-primary);
        color: var(--vui-color-on-primary);
        text-decoration: none;
      }
      :host([variant="button"]) a:hover { background: var(--vui-color-primary-hover); color: var(--vui-color-on-primary); }
      :host([disabled]) a { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
      @media (forced-colors: active) {
        a { color: LinkText; }
        :host([variant="button"]) a { background: ButtonFace; color: ButtonText; border: var(--vui-border-width) solid ButtonText; }
      }
    `;
  }

  protected afterRender(): void {
    this.qs('a').addEventListener('click', (event) => {
      if (this.isDisabled()) event.preventDefault();
    });
  }

  protected sync(): void {
    const link = this.qs<HTMLAnchorElement>('a');
    const disabled = this.isDisabled();
    const href = this.getAttribute('href');
    if (href && !disabled) link.href = href;
    else link.removeAttribute('href');
    const target = this.getAttribute('target');
    if (target) link.target = target;
    else link.removeAttribute('target');
    const rel = this.getAttribute('rel');
    if (rel) link.rel = rel;
    else if (target === '_blank') link.rel = 'noopener noreferrer';
    else link.removeAttribute('rel');
    link.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    link.tabIndex = disabled ? -1 : 0;
  }
}

reflectStrings(VLink, ['href', 'variant', 'target', 'rel']);
reflectBooleans(VLink, ['disabled']);
defineElement('vui-link', VLink);

registerContract({
  element: 'vui-link',
  className: 'VLink',
  attributes: [
    { name: 'href', kind: 'string', reflected: true },
    { name: 'variant', kind: 'enum', values: ['inline', 'button'], reflected: true },
    { name: 'target', kind: 'string', reflected: true },
    { name: 'rel', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
  ],
  events: ['click'],
  slots: [''],
  parts: ['link'],
  methods: [],
  keyboard: ['Tab', 'Enter'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'native',
});
