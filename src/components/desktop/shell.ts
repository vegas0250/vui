import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

export class VShell extends VuiElement {
  declare label: string;
  declare navLabel: string;
  declare asideLabel: string;
  declare skipLabel: string;
  declare collapsed: boolean;

  static get observedAttributes(): string[] {
    return ['label', 'nav-label', 'aside-label', 'skip-label', 'collapsed'];
  }

  private readonly mainId = `vui-shell-main-${Math.random().toString(36).slice(2, 8)}`;

  protected template(): string {
    return `
      <div class="shell" part="shell">
        <a class="skip" part="skip" href="#main"></a>
        <header part="header"><slot name="header"></slot></header>
        <div class="bar" part="toolbar"><slot name="toolbar"></slot></div>
        <div class="body" part="body">
          <nav part="nav"><slot name="nav"></slot></nav>
          <main part="main" tabindex="-1"><slot></slot></main>
          <aside part="aside"><slot name="aside"></slot></aside>
        </div>
        <footer part="footer"><slot name="footer"></slot></footer>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: flex;
        flex-direction: column;
        min-width: 0;
        max-width: 100%;
        min-height: 0;
        height: 100%;
        container-type: inline-size;
        container-name: vui-shell;
      }
      .shell {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        flex: 1 1 auto;
        background: var(--vui-color-background);
        color: var(--vui-color-text);
      }
      .skip {
        position: absolute;
        inset-inline-start: var(--vui-space-sm);
        inset-block-start: var(--vui-space-sm);
        z-index: var(--vui-z-sticky);
        transform: translateY(-150%);
        padding: var(--vui-space-2xs) var(--vui-space-xs);
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        border-radius: var(--vui-radius-sm);
      }
      .skip:focus {
        transform: none;
        outline: var(--vui-focus-ring);
      }
      header, .bar, footer, nav, aside, main { min-width: 0; }
      header, .bar, footer { flex: 0 0 auto; }
      .body {
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
      }
      nav, aside {
        flex: 0 0 16rem;
        max-width: 100%;
        overflow: auto;
        background: var(--vui-color-surface);
        border-inline-end: var(--vui-border-width) solid var(--vui-color-border);
      }
      aside { border-inline-end: 0; border-inline-start: var(--vui-border-width) solid var(--vui-color-border); }
      main {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
        overflow: auto;
      }
      main > slot {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
      }
      .hidden { display: none; }
      :host([collapsed]) nav { display: none; }
      @container vui-shell (max-width: 40rem) {
        .body { flex-direction: column; }
        nav, aside {
          flex-basis: auto;
          border-inline: 0;
          border-block-end: var(--vui-border-width) solid var(--vui-color-border);
        }
      }
      main:focus-visible { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    const main = this.qs<HTMLElement>('main');
    main.id = this.mainId;
    const skip = this.qs<HTMLAnchorElement>('a.skip');
    skip.addEventListener('click', (event) => {
      event.preventDefault();
      main.focus();
    });
    for (const slot of this.shadow.querySelectorAll('slot')) {
      slot.addEventListener('slotchange', () => this.sync());
    }
  }

  protected sync(): void {
    const label = this.getAttribute('label') ?? '';
    const shell = this.qs('.shell');
    if (label) shell.setAttribute('aria-label', label);
    else shell.removeAttribute('aria-label');
    this.qs('a.skip').textContent = this.getAttribute('skip-label') || 'Skip to content';
    this.qs('nav').setAttribute('aria-label', this.getAttribute('nav-label') || 'Navigation');
    this.qs('aside').setAttribute('aria-label', this.getAttribute('aside-label') || 'Details');
    this.toggleRegion('header', 'header');
    this.toggleRegion('toolbar', 'toolbar');
    this.toggleRegion('nav', 'nav');
    this.toggleRegion('aside', 'aside');
    this.toggleRegion('footer', 'footer');
  }

  private toggleRegion(slotName: string, part: string): void {
    const slot = this.qs<HTMLSlotElement>(`slot[name="${slotName}"]`);
    const region = this.qs(`[part="${part}"]`);
    const filled = slot.assignedNodes({ flatten: true }).some((node) => {
      return node.nodeType === Node.ELEMENT_NODE || (node.textContent ?? '').trim().length > 0;
    });
    region.classList.toggle('hidden', !filled);
  }
}

reflectStrings(VShell, { label: 'label', navLabel: 'nav-label', asideLabel: 'aside-label', skipLabel: 'skip-label' });
reflectBooleans(VShell, ['collapsed']);
defineElement('vui-shell', VShell);

registerContract({
  element: 'vui-shell',
  className: 'VShell',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'nav-label', kind: 'string', property: 'navLabel', reflected: true },
    { name: 'aside-label', kind: 'string', property: 'asideLabel', reflected: true },
    { name: 'skip-label', kind: 'string', property: 'skipLabel', reflected: true },
    { name: 'collapsed', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: ['header', 'toolbar', 'nav', '', 'aside', 'footer'],
  parts: ['shell', 'skip', 'header', 'toolbar', 'body', 'nav', 'main', 'aside', 'footer'],
  methods: [],
  keyboard: ['Tab'],
  states: [],
  responsive: 'container',
  focus: 'native',
});
