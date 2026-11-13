import { defineElement } from '../../utils/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../utils/element';
import { emitChange } from '../../utils/events';
import { ownedChildren } from '../../composition/dom';
import { reportUnexpectedChildren } from '../../utils/dev';
import { isActivation, nextEnabled } from '../../interaction/keyboard';
import { pushOverlay } from '../../interaction/overlay';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';
import { readLength } from '../../foundation/responsive';
import { renderIcon } from '../../icons/registry';
import { controlStyles, fieldStyles } from '../../utils/styles';

const chevron = `
<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="m6 9 6 6 6-6"></path>
</svg>`;

export class VOption extends HTMLElement {
  declare value: string;
  declare label: string;
  declare disabled: boolean;

  static get observedAttributes(): string[] {
    return ['value', 'disabled', 'label'];
  }

  connectedCallback(): void {
    this.hidden = true;
  }

  get optionValue(): string {
    return this.getAttribute('value') ?? this.optionLabel;
  }

  get optionLabel(): string {
    return this.getAttribute('label') ?? (this.textContent ?? '').trim();
  }

  get optionDisabled(): boolean {
    return this.hasAttribute('disabled');
  }
}

let selectSeq = 0;

export class VSelect extends VuiElement {
  declare label: string;
  declare placeholder: string;
  declare name: string;
  declare size: string;
  declare icon: string;
  declare disabled: boolean;
  declare invalid: boolean;

  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['label', 'value', 'placeholder', 'disabled', 'name', 'size', 'invalid', 'icon'];
  }

  private internals: ElementInternals | null = null;
  private listOpen = false;
  private activeIndex = 0;
  private typeBuffer = '';
  private typeTimer = 0;
  private releaseOverlay: (() => void) | null = null;
  private readonly listId = `vui-select-${++selectSeq}`;

  constructor() {
    super();
    try {
      this.internals = this.attachInternals();
    } catch {
      this.internals = null;
    }
  }

  get value(): string {
    return this.getAttribute('value') ?? '';
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  protected template(): string {
    return `
      <div class="shell">
        <div class="field">
          <label class="label" part="label"></label>
          <button part="trigger" class="control trigger" type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false">
            <span class="leading" part="icon" aria-hidden="true" hidden></span>
            <span class="value" part="value"></span>
            <span class="chevron" part="chevron" aria-hidden="true">${chevron}</span>
          </button>
        </div>
      </div>
      <ul part="listbox" class="listbox" role="listbox" hidden></ul>
    `;
  }

  protected componentStyles(): string {
    return `
      ${fieldStyles}
      ${controlStyles}
      :host {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 100%;
        min-width: 0;
        position: relative;
      }
      .shell {
        display: block;
        width: 100%;
        min-width: 0;
        container-type: inline-size;
        container-name: vui-field;
      }
      .trigger {
        width: 100%;
        cursor: pointer;
        text-align: start;
      }
      .value {
        flex: 1 1 auto;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .value.placeholder { color: var(--vui-color-text-muted); }
      .leading {
        display: none;
        inline-size: var(--vui-icon-size, 1em);
        block-size: var(--vui-icon-size, 1em);
        flex: 0 0 auto;
        color: var(--vui-color-text);
      }
      .leading:not([hidden]) { display: inline-flex; align-items: center; justify-content: center; }
      .leading svg { width: 100%; height: 100%; }
      .chevron {
        display: inline-flex;
        width: 1em;
        height: 1em;
        flex: 0 0 auto;
        color: var(--vui-color-text-muted);
        transition: transform var(--vui-duration) var(--vui-easing);
      }
      .trigger[aria-expanded="true"] .chevron { transform: rotate(180deg); }
      @media (prefers-reduced-motion: reduce) {
        .chevron { transition: none; }
      }
      :host([icon]) {
        display: inline-flex;
        width: auto;
        max-width: 100%;
        flex: 0 0 auto;
        vertical-align: middle;
      }
      :host([icon]) .shell,
      :host([icon]) .field {
        display: contents;
      }
      :host([icon]) .value { display: none; }
      :host([icon]) .trigger {
        width: auto;
        min-inline-size: var(--vui-size-control);
        justify-content: center;
        gap: var(--vui-space-xs);
        padding-inline: var(--vui-space-sm);
      }
      .listbox {
        position: fixed;
        z-index: var(--vui-overlay-z, var(--vui-z-dropdown));
        margin: 0;
        padding: var(--vui-space-2xs);
        list-style: none;
        max-height: var(--vui-list-block);
        overflow: auto;
        background: var(--vui-color-popover, var(--vui-color-surface-raised));
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-block-border, var(--vui-color-border));
        border-radius: var(--vui-radius-box, var(--vui-radius-lg));
        box-shadow: var(--vui-shadow-md);
      }
      .listbox [role="option"] {
        display: flex;
        align-items: center;
        min-height: var(--vui-size-control);
        padding-inline: var(--vui-space-sm);
        border-radius: var(--vui-radius-field, var(--vui-radius-sm));
        cursor: pointer;
      }
      .listbox [role="option"]:hover:not([aria-disabled="true"]) { background: var(--vui-color-hover, var(--vui-color-surface-hover)); }
      .listbox [role="option"][aria-selected="true"] {
        background: var(--vui-color-selected);
        color: var(--vui-color-interactive-text, var(--vui-color-primary));
        font-weight: var(--vui-font-weight-strong);
      }
      .listbox [role="option"].active {
        background: var(--vui-color-hover, var(--vui-color-surface-hover));
      }
      .listbox [role="option"][aria-selected="true"].active {
        background: color-mix(in srgb, var(--vui-color-primary) 22%, var(--vui-color-surface));
      }
      .listbox [role="option"][aria-disabled="true"] {
        opacity: 0.72;
        cursor: not-allowed;
      }
      .label:empty { display: none; }
    `;
  }

  protected afterRender(): void {
    const trigger = this.trigger;
    trigger.setAttribute('aria-controls', this.listId);
    this.listbox.id = this.listId;
    trigger.addEventListener('click', () => {
      if (this.listOpen) this.close();
      else this.open();
    });
    trigger.addEventListener('keydown', (event) => this.onKeydown(event));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.watchOptions();
  }

  private watchOptions(): void {
    const observer = new MutationObserver(() => {
      if (this.listOpen) this.renderOptions();
      this.sync();
    });
    observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true });
    this.hold('options', () => observer.disconnect());
  }

  disconnectedCallback(): void {
    this.close();
    super.disconnectedCallback();
  }

  protected sync(): void {
    const trigger = this.trigger;
    const label = this.qs<HTMLLabelElement>('label');
    const text = this.getAttribute('label') ?? '';
    const iconName = (this.getAttribute('icon') ?? '').trim();
    if (!label.id) label.id = `${this.listId}-label`;
    if (iconName) {
      label.textContent = '';
      if (text) {
        trigger.setAttribute('aria-label', text);
        this.listbox.setAttribute('aria-label', text);
      } else {
        trigger.removeAttribute('aria-label');
        this.listbox.removeAttribute('aria-label');
      }
      trigger.removeAttribute('aria-labelledby');
      this.listbox.removeAttribute('aria-labelledby');
    } else {
      label.textContent = text;
      trigger.removeAttribute('aria-label');
      this.listbox.removeAttribute('aria-label');
      if (text) {
        trigger.setAttribute('aria-labelledby', label.id);
        this.listbox.setAttribute('aria-labelledby', label.id);
      } else {
        trigger.removeAttribute('aria-labelledby');
        this.listbox.removeAttribute('aria-labelledby');
      }
    }
    trigger.disabled = this.isDisabled();
    trigger.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
    const leading = this.qs<HTMLElement>('.leading');
    if (iconName) {
      leading.hidden = false;
      renderIcon(leading, iconName);
    } else {
      leading.hidden = true;
      leading.replaceChildren();
    }
    const selected = this.optionElements().find((option) => option.optionValue === this.value);
    const valueEl = this.qs<HTMLElement>('.value');
    if (selected) {
      valueEl.textContent = selected.optionLabel;
      valueEl.classList.remove('placeholder');
    } else if (this.value) {
      valueEl.textContent = this.value;
      valueEl.classList.remove('placeholder');
    } else {
      valueEl.textContent = this.getAttribute('placeholder') ?? '';
      valueEl.classList.add('placeholder');
    }
    this.internals?.setFormValue(this.value);
    if (this.listOpen) this.renderOptions();
  }

  private get trigger(): HTMLButtonElement {
    return this.qs<HTMLButtonElement>('.trigger');
  }

  private get listbox(): HTMLElement {
    return this.qs<HTMLElement>('.listbox');
  }

  private optionElements(): VOption[] {
    reportUnexpectedChildren(this, ['vui-option']);
    return ownedChildren(this, 'vui-option', (node): node is VOption => node instanceof VOption);
  }

  private open(): void {
    if (this.isDisabled() || this.listOpen) return;
    this.listOpen = true;
    this.listbox.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
    this.toggleAttribute('data-open', true);
    this.releaseOverlay = pushOverlay({
      owner: this,
      kind: 'popup',
      layer: this.listbox,
      dismissable: true,
      dismissOnOutside: true,
      onDismiss: () => this.close(),
    });
    const current = this.optionElements().findIndex((option) => option.optionValue === this.value && !option.optionDisabled);
    this.activeIndex = current >= 0 ? current : this.optionElements().findIndex((option) => !option.optionDisabled);
    this.renderOptions();
    this.position();
    window.addEventListener('resize', this.onReposition);
    document.addEventListener('scroll', this.onReposition, true);
  }

  private close(): void {
    this.listOpen = false;
    this.releaseOverlay?.();
    this.releaseOverlay = null;
    this.removeAttribute('data-open');
    const list = this.shadow.querySelector<HTMLElement>('.listbox');
    const trigger = this.shadow.querySelector<HTMLButtonElement>('.trigger');
    if (list) list.hidden = true;
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'false');
      trigger.removeAttribute('aria-activedescendant');
    }
    window.removeEventListener('resize', this.onReposition);
    document.removeEventListener('scroll', this.onReposition, true);
  }

  private readonly onReposition = (): void => {
    if (this.listOpen) this.position();
  };

  private position(): void {
    const rect = this.trigger.getBoundingClientRect();
    const list = this.listbox;
    const margin = readLength(this, '--vui-space-xs', 4);
    const gutter = readLength(this, '--vui-space-sm', 8);
    const viewW = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewH = window.innerHeight || document.documentElement.clientHeight || 0;
    const minWidth = this.hasAttribute('icon')
      ? Math.max(rect.width, readLength(this, '--vui-size-control', 32) * 8)
      : rect.width;
    const width = Math.max(0, Math.min(minWidth, viewW - gutter * 2));
    // Prefer aligning to the trigger end when the field sits near the viewport edge
    // so a wide icon-mode listbox never spills past 100vw.
    const preferStart = rect.left + width <= viewW - gutter;
    const left = preferStart
      ? Math.min(Math.max(gutter, rect.left), Math.max(gutter, viewW - width - gutter))
      : Math.max(gutter, Math.min(rect.right - width, viewW - width - gutter));
    list.style.left = `${left}px`;
    list.style.right = 'auto';
    list.style.width = `${width}px`;
    list.style.maxWidth = `${Math.max(0, viewW - gutter * 2)}px`;
    const below = viewH - rect.bottom;
    const needed = Math.min(
      Math.max(list.offsetHeight, list.scrollHeight, readLength(this, '--vui-size-control', 32) * 4),
      viewH - gutter * 2,
    );
    if (below < needed && rect.top > below) {
      list.style.top = 'auto';
      list.style.bottom = `${viewH - rect.top + margin}px`;
    } else {
      list.style.bottom = 'auto';
      list.style.top = `${rect.bottom + margin}px`;
    }
  }

  private renderOptions(): void {
    const list = this.listbox;
    list.replaceChildren();
    this.optionElements().forEach((option, index) => {
      const item = document.createElement('li');
      item.setAttribute('role', 'option');
      item.id = `${this.listId}-opt-${index}`;
      item.textContent = option.optionLabel;
      item.setAttribute('aria-selected', option.optionValue === this.value ? 'true' : 'false');
      item.setAttribute('aria-disabled', option.optionDisabled ? 'true' : 'false');
      if (index === this.activeIndex) item.classList.add('active');
      item.addEventListener('pointerdown', (event) => event.preventDefault());
      item.addEventListener('click', () => {
        if (option.optionDisabled) return;
        this.commit(option.optionValue);
      });
      list.append(item);
    });
    this.updateActiveDescendant();
  }

  private updateActiveDescendant(): void {
    const active = this.listbox.querySelector<HTMLElement>('.active');
    if (active) {
      this.trigger.setAttribute('aria-activedescendant', active.id);
      active.scrollIntoView({ block: 'nearest' });
    }
  }

  private move(delta: number): void {
    const options = this.optionElements();
    if (!options.length) return;
    this.activeIndex = nextEnabled(options.length, this.activeIndex, delta, (index) => !options[index]?.optionDisabled);
    this.renderOptions();
  }

  private commit(value: string): void {
    const previous = this.value;
    if (previous !== value) this.setAttribute('value', value);
    this.close();
    this.trigger.focus();
    if (previous !== value) emitChange(this);
  }

  private onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End') {
      event.preventDefault();
      const wasOpen = this.listOpen;
      if (!this.listOpen) this.open();
      if (!wasOpen && (key === 'ArrowDown' || key === 'ArrowUp')) return;
      if (key === 'Home') this.activeIndex = -1;
      if (key === 'End') this.activeIndex = this.optionElements().length;
      this.move(key === 'ArrowUp' || key === 'End' ? -1 : 1);
      return;
    }
    if (key === 'Escape' && this.listOpen) {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      return;
    }
    if (isActivation(event) && this.listOpen) {
      event.preventDefault();
      const option = this.optionElements()[this.activeIndex];
      if (option && !option.optionDisabled) this.commit(option.optionValue);
      return;
    }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      this.typeBuffer += key.toLowerCase();
      window.clearTimeout(this.typeTimer);
      this.typeTimer = window.setTimeout(() => {
        this.typeBuffer = '';
      }, 500);
      const match = this.optionElements().findIndex(
        (option) => !option.optionDisabled && option.optionLabel.toLowerCase().startsWith(this.typeBuffer),
      );
      if (match < 0) return;
      const option = this.optionElements()[match];
      if (!option) return;
      if (this.listOpen) {
        this.activeIndex = match;
        this.renderOptions();
      } else {
        this.commit(option.optionValue);
      }
    }
  }
}

reflectStrings(VOption, ['value', 'label']);
reflectBooleans(VOption, ['disabled']);
reflectStrings(VSelect, ['label', 'placeholder', 'name', 'size', 'icon']);
reflectBooleans(VSelect, ['disabled', 'invalid']);
defineElement('vui-option', VOption);
defineElement('vui-select', VSelect);

registerContract({
  element: 'vui-select',
  className: 'VSelect',
  attributes: [
    { name: 'label', kind: 'string', reflected: true, description: ['Подпись поля.', 'Field label.'] },
    { name: 'value', kind: 'string', reflected: true, default: '', description: ['Выбранное значение option.', 'Selected option value.'] },
    { name: 'placeholder', kind: 'string', reflected: true },
    { name: 'name', kind: 'string', reflected: true },
    { name: 'size', kind: 'string', reflected: true },
    { name: 'icon', kind: 'string', reflected: true, description: ['Необязательная иконка на триггере.', 'Optional trigger icon.'] },
    { name: 'disabled', kind: 'boolean', reflected: true, default: false },
    { name: 'invalid', kind: 'boolean', reflected: true, default: false },
  ],
  events: [{ name: 'change', description: ['Выбрано новое значение.', 'A new value was selected.'], detail: '{ value: string }' }],
  slots: [],
  parts: ['label', 'trigger', 'icon', 'value', 'chevron', 'listbox'],
  methods: [],
  keyboard: ['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', 'Space', 'Escape'],
  states: ['disabled', 'invalid'],
  responsive: 'container',
  focus: 'native',
  role: 'combobox',
  docs: {
    guidance: [
      'Варианты задайте через дочерние vui-option. Не дублируйте список вручную вне select.',
      'Provide choices with child vui-option elements. Do not rebuild the option list outside select.',
    ],
    parts: [
      { name: 'label', description: ['Подпись.', 'Label.'] },
      { name: 'trigger', description: ['Кнопка открытия списка.', 'Listbox trigger.'] },
      { name: 'listbox', description: ['Всплывающий список.', 'Popup listbox.'] },
    ],
    tokens: ['--vui-size-control', '--vui-radius-field', '--vui-z-overlay'],
  },
});
