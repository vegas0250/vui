import { defineElement } from '../../utils/define';
import { registerContract } from '../../contract/registry';
import { emitChange, emitInput } from '../../utils/events';
import { VuiElement } from '../../utils/element';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';
import '../foundation/icon';

function readNumber(element: HTMLElement, name: string, fallback: number): number {
  if (!element.hasAttribute(name)) return fallback;
  const raw = Number(element.getAttribute(name));
  return Number.isFinite(raw) ? raw : fallback;
}

/** Fluent UI Web Controls: Rating */
export class VRating extends VuiElement {
  declare label: string;
  declare max: string;
  declare disabled: boolean;
  declare readonly: boolean;

  static formAssociated = true;

  static get observedAttributes(): string[] {
    return ['label', 'max', 'value', 'disabled', 'readonly'];
  }

  private internals: ElementInternals | null = null;

  constructor() {
    super();
    try {
      this.internals = this.attachInternals();
    } catch {
      this.internals = null;
    }
  }

  get value(): string {
    return this.getAttribute('value') ?? '0';
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  protected template(): string {
    return `
      <div class="field" part="control">
        <span class="label" part="label"></span>
        <div class="stars" part="stars" role="radiogroup"></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host {
        display: inline-flex;
        max-width: 100%;
        min-width: 0;
        vertical-align: middle;
      }
      .field { display: flex; flex-direction: column; gap: var(--vui-space-xs); min-width: 0; }
      .label:empty { display: none; }
      .label { color: var(--vui-color-text); font-size: var(--vui-font-size-sm); }
      .stars { display: inline-flex; gap: var(--vui-space-2xs); }
      button {
        appearance: none;
        margin: 0;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--vui-color-border);
        width: var(--vui-size-control-sm);
        height: var(--vui-size-control-sm);
        cursor: pointer;
        border-radius: var(--vui-radius-selector);
      }
      button[aria-checked="true"], button[data-filled] { color: var(--vui-color-warning); }
      button:focus-visible { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
      :host([disabled]) button { opacity: var(--vui-opacity-disabled); cursor: default; }
      :host([readonly]) button { cursor: default; }
      vui-icon { width: 1em; height: 1em; }
    `;
  }

  protected afterRender(): void {
    this.bind('click', this.qs('.stars'), 'click', (event) => {
      if (this.disabled || this.readonly) return;
      const button = (event.target as HTMLElement | null)?.closest('button');
      if (!button || !this.qs('.stars').contains(button)) return;
      this.value = button.getAttribute('data-value') ?? '0';
      emitInput(this);
      emitChange(this);
    });
  }

  protected sync(): void {
    const max = Math.max(1, Math.round(readNumber(this, 'max', 5)));
    const value = Math.min(max, Math.max(0, Math.round(readNumber(this, 'value', 0))));
    if (this.hasAttribute('value') && String(value) !== this.getAttribute('value')) {
      this.setAttribute('value', String(value));
    }
    const label = this.qs('.label');
    const stars = this.qs('.stars');
    const name = this.getAttribute('label') ?? '';
    label.textContent = name;
    stars.setAttribute('aria-label', name || 'Rating');
    stars.replaceChildren();
    for (let i = 1; i <= max; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('role', 'radio');
      button.setAttribute('data-value', String(i));
      button.setAttribute('aria-checked', String(i === value));
      button.toggleAttribute('data-filled', i <= value);
      button.disabled = this.disabled || this.readonly;
      button.setAttribute('aria-label', `${i}`);
      button.innerHTML = '<vui-icon name="star"></vui-icon>';
      button.tabIndex = i === value || (value === 0 && i === 1) ? 0 : -1;
      stars.append(button);
    }
    this.internals?.setFormValue(String(value));
  }
}

reflectStrings(VRating, ['label', 'max']);
reflectBooleans(VRating, ['disabled', 'readonly']);
defineElement('vui-rating', VRating);

registerContract({
  element: 'vui-rating',
  className: 'VRating',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'max', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'readonly', kind: 'boolean', reflected: true },
  ],
  events: ['input', 'change'],
  slots: [],
  parts: ['label', 'control', 'stars'],
  methods: [],
  keyboard: [],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'native',
});
