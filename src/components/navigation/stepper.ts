import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { emitChange } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { moveInList } from '../../interaction/keyboard';

export class VStep extends VuiElement {
  declare value: string;
  declare disabled: boolean;
  declare selected: boolean;

  static shadowDelegatesFocus = false;

  static get observedAttributes(): string[] {
    return ['value', 'disabled', 'selected', 'data-current'];
  }

  protected template(): string {
    return `<button part="step" type="button"><slot></slot></button>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: inline-flex; min-width: 0; max-width: 100%; }
      button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-xs);
        min-height: var(--vui-size-control);
        min-width: 0;
        max-width: 100%;
        padding-inline: var(--vui-space-sm);
        border: 0;
        border-bottom: var(--vui-border-width-strong) solid transparent;
        background: transparent;
        color: var(--vui-color-text-muted);
        font: inherit;
        cursor: pointer;
        overflow-wrap: anywhere;
      }
      :host([selected]) button { color: var(--vui-color-text); border-bottom-color: var(--vui-color-primary); }
      button:focus { outline: none; }
      button:focus-visible { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
      button:disabled { opacity: 0.5; cursor: not-allowed; }
    `;
  }

  protected sync(): void {
    const button = this.qs<HTMLButtonElement>('button');
    button.disabled = this.isDisabled();
    if (this.hasAttribute('selected')) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
    button.tabIndex = !this.isDisabled() && this.hasAttribute('data-current') ? 0 : -1;
  }

  override focus(options?: FocusOptions): void {
    this.qs<HTMLElement>('button').focus(options);
  }
}

reflectStrings(VStep, ['value']);
reflectBooleans(VStep, ['disabled', 'selected']);
defineElement('vui-step', VStep);

registerContract({
  element: 'vui-step',
  className: 'VStep',
  attributes: [
    { name: 'value', kind: 'string', reflected: true },
    { name: 'disabled', kind: 'boolean', reflected: true },
    { name: 'selected', kind: 'boolean', reflected: true },
  ],
  events: [],
  slots: [''],
  parts: ['step'],
  methods: [],
  keyboard: ['Enter', 'Space'],
  states: ['disabled'],
  responsive: 'flow',
  focus: 'roving',
});

export class VStepper extends VuiElement {
  declare label: string;

  private applied = '';

  static get observedAttributes(): string[] {
    return ['label', 'value'];
  }

  get value(): string {
    return this.steps().find((step) => step.hasAttribute('selected'))?.getAttribute('value') ?? '';
  }

  set value(next: string) {
    this.setAttribute('value', next);
  }

  protected template(): string {
    return `<div part="stepper" role="list"><slot></slot></div>`;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; container-type: inline-size; container-name: vui-stepper; }
      [part="stepper"] { display: flex; flex-wrap: wrap; gap: var(--vui-space-xs); min-width: 0; }
      @container vui-stepper (max-width: 22rem) {
        [part="stepper"] { flex-direction: column; align-items: stretch; }
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected afterRender(): void {
    this.qs('slot').addEventListener('slotchange', () => this.sync());
    this.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.localName !== 'vui-step' || target.parentElement !== this) return;
      if (target.hasAttribute('disabled')) return;
      this.select(target);
    });
    this.addEventListener('keydown', (event) => {
      const steps = this.enabled();
      if (steps.length === 0) return;
      const current = Math.max(0, steps.findIndex((step) => step === document.activeElement || step.hasAttribute('data-current')));
      const nextIndex = moveInList(current, steps.length, event.key, { orientation: 'horizontal', loop: true });
      if (nextIndex === null) return;
      const next = steps[nextIndex];
      if (!next) return;
      event.preventDefault();
      this.select(next);
      next.focus();
    });
  }

  protected sync(): void {
    const list = this.qs('[part="stepper"]');
    const label = this.getAttribute('label') ?? '';
    if (label) list.setAttribute('aria-label', label);
    else list.removeAttribute('aria-label');
    const selected = this.getAttribute('value');
    if (selected !== null && selected !== this.applied) {
      this.applied = selected;
      for (const step of this.steps()) step.toggleAttribute('selected', step.getAttribute('value') === selected);
    }
    const current = this.enabled().find((step) => step.hasAttribute('selected')) ?? this.enabled()[0];
    for (const step of this.steps()) step.toggleAttribute('data-current', step === current);
  }

  private select(target: HTMLElement): void {
    for (const step of this.steps()) step.toggleAttribute('selected', step === target);
    const next = target.getAttribute('value') ?? '';
    if (this.getAttribute('value') !== next) {
      this.applied = next;
      this.setAttribute('value', next);
    }
    emitChange(this);
  }

  private steps(): HTMLElement[] {
    return [...this.children].filter((node): node is HTMLElement => node.localName === 'vui-step');
  }

  private enabled(): HTMLElement[] {
    return this.steps().filter((step) => !step.hasAttribute('disabled'));
  }
}

reflectStrings(VStepper, ['label']);
defineElement('vui-stepper', VStepper);

registerContract({
  element: 'vui-stepper',
  className: 'VStepper',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'value', kind: 'string', reflected: true },
  ],
  events: ['change'],
  slots: [''],
  parts: ['stepper'],
  methods: [],
  keyboard: ['ArrowLeft', 'ArrowRight', 'Home', 'End'],
  states: [],
  responsive: 'container',
  focus: 'roving',
});
