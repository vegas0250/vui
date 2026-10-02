import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { emitChange } from '../../core/events';
import { pushOverlay } from '../../core/overlay';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { controlStyles, fieldStyles } from '../../core/styles';

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
  declare disabled: boolean;
  declare invalid: boolean;

  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['label', 'value', 'placeholder', 'disabled', 'name', 'size', 'invalid'];
  }

  private internals: ElementInternals | null = null;
  private listOpen = false;
  private activeIndex = 0;
  private typeBuffer = '';
  private typeTimer = 0;
  private observer: MutationObserver | null = null;
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
            <span class="value"></span>
            <span class="chevron" aria-hidden="true">${chevron}</span>
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
      .chevron { display: inline-flex; width: 1em; height: 1em; color: var(--vui-color-text-muted); }
      .listbox {
        position: fixed;
        z-index: var(--vui-overlay-z, var(--vui-z-dropdown));
        margin: 0;
        padding: var(--vui-space-2xs);
        list-style: none;
        max-height: 16rem;
        overflow: auto;
        background: var(--vui-color-surface-raised);
        color: var(--vui-color-text);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
        box-shadow: var(--vui-shadow-md);
      }
      .listbox [role="option"] {
        display: flex;
        align-items: center;
        min-height: var(--vui-size-control);
        padding-inline: var(--vui-space-sm);
        border-radius: var(--vui-radius-sm);
        cursor: pointer;
      }
      .listbox [role="option"][aria-selected="true"] {
        background: var(--vui-color-surface-hover);
        font-weight: var(--vui-font-weight-strong);
      }
      .listbox [role="option"].active {
        background: var(--vui-color-primary);
        color: var(--vui-color-on-primary);
      }
      .listbox [role="option"][aria-disabled="true"] {
        opacity: 0.45;
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
    this.observer = new MutationObserver(() => {
      if (this.listOpen) this.renderOptions();
      this.sync();
    });
    this.observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true });
  }

  disconnectedCallback(): void {
    this.close();
    this.observer?.disconnect();
  }

  protected sync(): void {
    const trigger = this.trigger;
    const label = this.qs<HTMLLabelElement>('label');
    const text = this.getAttribute('label') ?? '';
    label.textContent = text;
    if (!label.id) label.id = `${this.listId}-label`;
    if (text) {
      trigger.setAttribute('aria-labelledby', label.id);
      this.listbox.setAttribute('aria-labelledby', label.id);
    } else {
      trigger.removeAttribute('aria-labelledby');
      this.listbox.removeAttribute('aria-labelledby');
    }
    trigger.disabled = this.isDisabled();
    trigger.setAttribute('aria-invalid', this.hasAttribute('invalid') ? 'true' : 'false');
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
    return [...this.querySelectorAll(':scope > vui-option')].filter(
      (node): node is VOption => node instanceof VOption,
    );
  }

  private open(): void {
    if (this.isDisabled() || this.listOpen) return;
    this.listOpen = true;
    this.listbox.hidden = false;
    this.trigger.setAttribute('aria-expanded', 'true');
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
    const margin = 4;
    const gutter = 8;
    const width = Math.max(0, Math.min(rect.width, window.innerWidth - gutter * 2));
    const left = Math.min(Math.max(gutter, rect.left), Math.max(gutter, window.innerWidth - width - gutter));
    list.style.left = `${left}px`;
    list.style.width = `${width}px`;
    const below = window.innerHeight - rect.bottom;
    if (below < 180 && rect.top > below) {
      list.style.top = 'auto';
      list.style.bottom = `${window.innerHeight - rect.top + margin}px`;
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
    let index = this.activeIndex;
    for (let step = 0; step < options.length; step += 1) {
      index = (index + delta + options.length) % options.length;
      if (!options[index]?.optionDisabled) break;
    }
    this.activeIndex = index;
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
    if ((key === 'Enter' || key === ' ') && this.listOpen) {
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
reflectStrings(VSelect, ['label', 'placeholder', 'name', 'size']);
reflectBooleans(VSelect, ['disabled', 'invalid']);
defineElement('vui-option', VOption);
defineElement('vui-select', VSelect);
