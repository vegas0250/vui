import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { emitChange } from '../../core/events';
import { reflectBooleans, reflectStrings } from '../../core/reflect';

export interface PathCrumb {
  label: string;
  path: string;
}

export class VPathBar extends VuiElement {
  declare label: string;
  declare value: string;
  declare disabled: boolean;

  static get observedAttributes(): string[] {
    return ['label', 'value', 'disabled', 'editing'];
  }

  private trail: PathCrumb[] = [];

  get crumbs(): PathCrumb[] {
    return this.trail.map((item) => ({ ...item }));
  }

  set crumbs(items: readonly PathCrumb[]) {
    this.trail = items.map((item) => ({ label: item.label, path: item.path }));
    if (this.isConnected) this.paintCrumbs();
  }

  protected template(): string {
    return `
      <div class="bar" part="bar">
        <nav class="crumbs" part="crumbs"></nav>
        <div class="rest" part="rest"></div>
        <input part="input" spellcheck="false" />
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
        max-width: 100%;
        min-height: var(--vui-size-control-lg);
        color: var(--vui-color-text);
        font-size: var(--vui-font-size);
      }
      .bar {
        display: flex;
        align-items: center;
        gap: var(--vui-space-2xs);
        width: 100%;
        min-width: 0;
        min-height: inherit;
        padding-inline: var(--vui-space-xs);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
        background: var(--vui-color-field);
        cursor: text;
      }
      .crumbs {
        display: flex;
        flex: 0 1 auto;
        align-items: center;
        min-width: 0;
        overflow: hidden;
        gap: var(--vui-space-2xs);
      }
      .rest { flex: 1 1 auto; align-self: stretch; min-width: 1.75rem; }
      button {
        flex: 0 1 auto;
        min-width: 0;
        max-width: 12rem;
        overflow: hidden;
        border: 0;
        border-radius: var(--vui-radius-sm);
        padding: var(--vui-space-2xs) var(--vui-space-xs);
        background: transparent;
        color: inherit;
        font: inherit;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
      }
      button:hover { background: var(--vui-color-surface-hover); }
      button[aria-current="page"] { font-weight: var(--vui-font-weight-strong); }
      button:focus-visible { outline: var(--vui-focus-ring); outline-offset: calc(var(--vui-focus-offset) * -1); }
      .sep {
        flex: 0 0 auto;
        color: var(--vui-color-text-muted);
        user-select: none;
      }
      input {
        flex: 1 1 auto;
        width: 100%;
        min-width: 0;
        border: 0;
        outline: none;
        background: transparent;
        color: inherit;
        font: inherit;
        user-select: text;
      }
      input:focus-visible { outline: none; }
      .bar:focus-within {
        border-color: var(--vui-color-focus);
        box-shadow: var(--vui-focus-shadow);
      }
      :host([disabled]) { opacity: 0.55; }
      :host([disabled]) .bar { cursor: default; }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('.bar').addEventListener('click', (event) => {
      if (this.isDisabled()) return;
      const crumb = event.target instanceof Element ? event.target.closest('button') : null;
      if (crumb instanceof HTMLButtonElement && this.containsNode(crumb)) {
        const path = crumb.dataset.path ?? '';
        if (!path || path === this.value) return;
        this.value = path;
        emitChange(this);
        return;
      }
      this.beginEdit();
    });
    const input = this.field;
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.finish(true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        this.finish(false);
      }
    });
    input.addEventListener('blur', () => {
      if (this.hasAttribute('editing')) this.finish(true);
    });
  }

  protected sync(): void {
    const label = this.getAttribute('label') || 'Адрес';
    this.qs('nav').setAttribute('aria-label', label);
    this.field.setAttribute('aria-label', label);
    this.field.disabled = this.isDisabled();
    const editing = this.hasAttribute('editing');
    this.qs<HTMLElement>('.crumbs').hidden = editing;
    this.qs<HTMLElement>('.rest').hidden = editing;
    this.field.hidden = !editing;
    if (!editing) this.field.value = this.getAttribute('value') ?? '';
    this.paintCrumbs();
  }

  private get field(): HTMLInputElement {
    return this.qs('input');
  }

  private containsNode(node: Node): boolean {
    return this.shadow.contains(node);
  }

  private beginEdit(): void {
    if (this.isDisabled() || this.hasAttribute('editing')) return;
    this.field.value = this.value;
    this.setAttribute('editing', '');
    this.field.focus();
    this.field.select();
  }

  private finish(commit: boolean): void {
    if (!this.hasAttribute('editing')) return;
    const next = this.field.value.trim();
    this.removeAttribute('editing');
    if (commit && next && next !== this.value) {
      this.value = next;
      emitChange(this);
    }
  }

  private paintCrumbs(): void {
    const host = this.qs('nav');
    host.replaceChildren();
    const disabled = this.isDisabled();
    for (const [index, item] of this.trail.entries()) {
      if (index > 0) {
        const sep = document.createElement('span');
        sep.className = 'sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '›';
        host.append(sep);
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'crumb';
      button.dataset.path = item.path;
      button.textContent = item.label;
      button.disabled = disabled;
      button.title = item.path;
      if (index === this.trail.length - 1) button.setAttribute('aria-current', 'page');
      host.append(button);
    }
  }
}

reflectStrings(VPathBar, ['label', 'value']);
reflectBooleans(VPathBar, ['disabled']);
defineElement('vui-path-bar', VPathBar);

registerContract({
  element: 'vui-path-bar',
  className: 'VPathBar',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
  ],
  events: ['change'],
  slots: [],
  parts: ['bar', 'crumbs', 'rest', 'input'],
  methods: [],
  keyboard: ['Enter', 'Escape', 'Tab'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'native',
});
