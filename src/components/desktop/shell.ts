import '../foundation/icon';
import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { isRtl } from '../../interaction/keyboard';
import { trackPointer } from '../../interaction/pointer';
import type { VIcon } from '../foundation/icon';

export class VShell extends VuiElement {
  declare label: string;
  declare navLabel: string;
  declare asideLabel: string;
  declare skipLabel: string;
  declare resizeLabel: string;
  declare asideExpandLabel: string;
  declare asideCollapseLabel: string;
  declare asideResizeLabel: string;
  declare collapsed: boolean;
  declare asideCollapsed: boolean;

  static get observedAttributes(): string[] {
    return [
      'label',
      'nav-label',
      'aside-label',
      'skip-label',
      'resize-label',
      'aside-expand-label',
      'aside-collapse-label',
      'aside-resize-label',
      'collapsed',
      'aside-collapsed',
    ];
  }

  private readonly mainId = `vui-shell-main-${Math.random().toString(36).slice(2, 8)}`;

  protected template(): string {
    return `
      <div class="shell" part="shell">
        <a class="skip" part="skip" href="#main"></a>
        <header part="header"><slot name="header"></slot></header>
        <div class="bar" part="toolbar"><slot name="toolbar"></slot></div>
        <div class="body" part="body">
          <div class="rail" part="nav">
            <nav class="pane"><slot name="nav"></slot></nav>
            <div class="sep" part="nav-resize" role="separator" tabindex="0"></div>
          </div>
          <main part="main" tabindex="-1"><slot></slot></main>
          <div class="aside-sep" part="aside-resize" role="separator" tabindex="0"></div>
          <div class="aside-rail" part="aside">
            <button part="aside-toggle" type="button"><vui-icon name="chevron-left"></vui-icon></button>
            <aside class="pane"><slot name="aside"></slot></aside>
          </div>
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
      header, .bar, footer, .rail, .aside-rail, main { min-width: 0; }
      header, .bar, footer { flex: 0 0 auto; }
      .body {
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
        min-height: 0;
      }
      .rail {
        display: flex;
        flex: 0 0 auto;
        width: var(--vui-shell-nav, 16rem);
        max-width: min(32rem, 50%);
        background: var(--vui-color-surface);
        border-inline-end: var(--vui-border-width) solid var(--vui-color-border);
      }
      .rail .pane,
      .aside-rail .pane {
        min-width: 0;
        overflow: auto;
        padding: var(--vui-space-sm);
      }
      .rail .pane { flex: 1 1 auto; }
      .sep {
        flex: 0 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: col-resize;
        touch-action: none;
      }
      .sep::before {
        content: "";
        width: 2px;
        height: 2.75rem;
        border-radius: 999px;
        background: var(--vui-color-border-strong);
      }
      .sep:hover::before,
      .sep:focus-visible::before { background: var(--vui-color-primary); }
      .aside-sep {
        flex: 0 0 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: col-resize;
        touch-action: none;
        background: var(--vui-color-background);
      }
      .aside-sep::before {
        content: "";
        width: 2px;
        height: 2.75rem;
        border-radius: 999px;
        background: var(--vui-color-border-strong);
      }
      .aside-sep:hover::before,
      .aside-sep:focus-visible::before { background: var(--vui-color-primary); }
      .aside-sep:focus-visible { outline: var(--vui-focus-ring); outline-offset: calc(var(--vui-focus-offset) * -1); }
      .aside-rail {
        display: flex;
        flex: var(--vui-shell-aside-grow, 1) 1 var(--vui-shell-aside, 0px);
        align-items: stretch;
        width: auto;
        min-width: min(12rem, 36%);
        max-width: 75%;
        background: var(--vui-color-surface);
        border-inline-start: 0;
      }
      .aside-rail .pane {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        width: auto;
        max-width: none;
        height: 100%;
        padding: 0;
        overflow: hidden;
      }
      .aside-rail .pane > slot {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
      }
      .aside-rail button {
        flex: 0 0 auto;
        align-self: center;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.25rem;
        height: 2.75rem;
        margin-inline: 2px;
        padding: 0;
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
        background: var(--vui-color-surface-raised);
        color: var(--vui-color-text);
        cursor: pointer;
      }
      .aside-rail button:hover { background: var(--vui-color-surface-hover); color: var(--vui-color-primary); }
      .aside-rail button:focus-visible { outline: var(--vui-focus-ring); outline-offset: calc(var(--vui-focus-offset) * -1); }
      .aside-rail vui-icon { width: var(--vui-icon-size); height: var(--vui-icon-size); }
      :host([aside-collapsed]) .aside-sep { display: none; }
      :host([aside-collapsed]) .aside-rail .pane { display: none; }
      :host([aside-collapsed]) .aside-rail {
        flex: 0 0 auto;
        width: auto;
        min-width: 0;
        max-width: none;
        background: transparent;
        border-inline-start: 0;
      }
      main {
        display: flex;
        flex-direction: column;
        flex: 1 1 0;
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
      :host([collapsed]) .rail { display: none; }
      @container vui-shell (max-width: 40rem) {
        .body { flex-direction: column; }
        .rail, .aside-rail {
          width: auto;
          max-width: 100%;
          flex-basis: auto;
          border-inline: 0;
          border-block-end: var(--vui-border-width) solid var(--vui-color-border);
        }
        .aside-sep { display: none; }
        .sep { cursor: default; }
        .sep::before { width: 2.75rem; height: 2px; }
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
    this.qs('[part="aside-toggle"]').addEventListener('click', () => {
      const opening = this.hasAttribute('aside-collapsed');
      const intent = new CustomEvent('aside-toggle', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: { opening },
      });
      if (!this.dispatchEvent(intent)) return;
      this.toggleAttribute('aside-collapsed');
    });
    const sep = this.qs<HTMLElement>('[part="nav-resize"]');
    sep.addEventListener('keydown', (event) => {
      const rtl = isRtl(this);
      const grow = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
      const shrink = event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
      if (!grow && !shrink) return;
      event.preventDefault();
      this.resizeNavBy(grow ? 16 : -16);
    });
    const asideSep = this.qs<HTMLElement>('[part="aside-resize"]');
    asideSep.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const wider = event.key === (isRtl(this) ? 'ArrowRight' : 'ArrowLeft');
      const rail = this.qs('.aside-rail').getBoundingClientRect();
      const edge = isRtl(this) ? rail.right : rail.left;
      const delta = wider ? -16 : 16;
      this.resizeAside(edge + (isRtl(this) ? -delta : delta));
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const sep = this.qs<HTMLElement>('[part="nav-resize"]');
    this.hold('nav-resize', trackPointer(sep, {
      onMove: (drag) => this.resizeNav(drag.current.clientX),
      onStart: (event) => this.resizeNav(event.clientX),
    }));
    const asideSep = this.qs<HTMLElement>('[part="aside-resize"]');
    this.hold('aside-resize', trackPointer(asideSep, {
      onMove: (drag) => this.resizeAside(drag.current.clientX),
      onStart: (event) => this.resizeAside(event.clientX),
    }));
  }

  private resizeNavBy(delta: number): void {
    const rail = this.qs('.rail').getBoundingClientRect();
    const edge = isRtl(this) ? rail.left : rail.right;
    this.resizeNav(edge + (isRtl(this) ? -delta : delta));
  }

  private resizeNav(clientX: number): void {
    const body = this.qs('.body');
    if (getComputedStyle(body).flexDirection === 'column') return;
    const rail = this.qs('.rail').getBoundingClientRect();
    const width = isRtl(this) ? rail.right - clientX : clientX - rail.left;
    const max = Math.max(180, body.getBoundingClientRect().width * 0.5);
    const next = Math.round(Math.min(max, Math.max(160, width)));
    this.style.setProperty('--vui-shell-nav', `${next}px`);
  }

  private resizeAside(clientX: number): void {
    const body = this.qs('.body');
    if (getComputedStyle(body).flexDirection === 'column') return;
    if (this.hasAttribute('aside-collapsed')) return;
    const rect = body.getBoundingClientRect();
    const width = isRtl(this) ? clientX - rect.left : rect.right - clientX;
    const max = Math.max(220, rect.width * 0.75);
    const next = Math.round(Math.min(max, Math.max(220, width)));
    this.style.setProperty('--vui-shell-aside', `${next}px`);
    this.style.setProperty('--vui-shell-aside-grow', '0');
  }

  override attributeChangedCallback(name?: string, previous?: string | null, value?: string | null): void {
    if (name === 'aside-collapsed' && previous != null && value == null) this.shareFilePanes();
    super.attributeChangedCallback(name, previous, value);
  }

  private shareFilePanes(): void {
    this.style.removeProperty('--vui-shell-aside');
    this.style.removeProperty('--vui-shell-aside-grow');
  }

  protected sync(): void {
    const label = this.getAttribute('label') ?? '';
    const shell = this.qs('.shell');
    if (label) shell.setAttribute('aria-label', label);
    else shell.removeAttribute('aria-label');
    this.qs('a.skip').textContent = this.getAttribute('skip-label') || 'Skip to content';
    this.qs('nav').setAttribute('aria-label', this.getAttribute('nav-label') || 'Navigation');
    this.qs('aside').setAttribute('aria-label', this.getAttribute('aside-label') || 'Details');
    const sep = this.qs('[part="nav-resize"]');
    sep.setAttribute('aria-orientation', 'vertical');
    sep.setAttribute('aria-label', this.getAttribute('resize-label') || 'Resize');
    const asideSep = this.qs('[part="aside-resize"]');
    asideSep.setAttribute('aria-orientation', 'vertical');
    asideSep.setAttribute('aria-label', this.getAttribute('aside-resize-label') || 'Resize panels');
    const asideWidth = Number.parseFloat(this.style.getPropertyValue('--vui-shell-aside'));
    if (Number.isFinite(asideWidth)) {
      asideSep.setAttribute('aria-valuemin', '220');
      asideSep.setAttribute('aria-valuemax', String(Math.round(this.qs('.body').getBoundingClientRect().width * 0.75)));
      asideSep.setAttribute('aria-valuenow', String(Math.round(asideWidth)));
    }
    const asideOpen = !this.hasAttribute('aside-collapsed');
    const toggle = this.qs('[part="aside-toggle"]');
    toggle.setAttribute('aria-expanded', asideOpen ? 'true' : 'false');
    toggle.setAttribute('aria-label', asideOpen
      ? this.getAttribute('aside-collapse-label') || 'Hide panel'
      : this.getAttribute('aside-expand-label') || 'Show panel');
    this.qs<VIcon>('[part="aside-toggle"] vui-icon').setAttribute('name', asideOpen ? 'chevron-right' : 'chevron-left');
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

reflectStrings(VShell, {
  label: 'label',
  navLabel: 'nav-label',
  asideLabel: 'aside-label',
  skipLabel: 'skip-label',
  resizeLabel: 'resize-label',
  asideExpandLabel: 'aside-expand-label',
  asideCollapseLabel: 'aside-collapse-label',
  asideResizeLabel: 'aside-resize-label',
});
reflectBooleans(VShell, { collapsed: 'collapsed', asideCollapsed: 'aside-collapsed' });
defineElement('vui-shell', VShell);

registerContract({
  element: 'vui-shell',
  className: 'VShell',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'nav-label', kind: 'string', property: 'navLabel', reflected: true },
    { name: 'aside-label', kind: 'string', property: 'asideLabel', reflected: true },
    { name: 'skip-label', kind: 'string', property: 'skipLabel', reflected: true },
    { name: 'resize-label', kind: 'string', property: 'resizeLabel', reflected: true },
    { name: 'aside-expand-label', kind: 'string', property: 'asideExpandLabel', reflected: true },
    { name: 'aside-collapse-label', kind: 'string', property: 'asideCollapseLabel', reflected: true },
    { name: 'aside-resize-label', kind: 'string', property: 'asideResizeLabel', reflected: true },
    { name: 'collapsed', kind: 'boolean', reflected: true },
    { name: 'aside-collapsed', kind: 'boolean', property: 'asideCollapsed', reflected: true },
  ],
  events: [],
  slots: ['header', 'toolbar', 'nav', '', 'aside', 'footer'],
  parts: ['shell', 'skip', 'header', 'toolbar', 'body', 'nav', 'nav-resize', 'main', 'aside-resize', 'aside', 'aside-toggle', 'footer'],
  methods: [],
  keyboard: ['Tab'],
  states: [],
  responsive: 'container',
  focus: 'native',
});
