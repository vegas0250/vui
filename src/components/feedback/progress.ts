import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VProgress extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label', 'value', 'max'];
  }

  get value(): number {
    if (!this.hasAttribute('value')) return Number.NaN;
    return Number(this.getAttribute('value'));
  }

  set value(next: number) {
    if (!Number.isFinite(next)) this.removeAttribute('value');
    else this.setAttribute('value', String(next));
  }

  get max(): number {
    const value = Number(this.getAttribute('max'));
    return Number.isFinite(value) && value > 0 ? value : 100;
  }

  set max(next: number) {
    const value = Number.isFinite(next) && next > 0 ? next : 100;
    this.setAttribute('max', String(value));
  }

  protected template(): string {
    return `
      <div part="track" role="progressbar">
        <div part="bar"></div>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      :host([hidden]) { display: none !important; }
      [part="track"] {
        height: var(--vui-space-xs);
        border-radius: var(--vui-radius-sm);
        background: var(--vui-color-border);
        overflow: hidden;
      }
      [part="bar"] {
        height: 100%;
        width: var(--vui-progress, 0%);
        background: var(--vui-color-primary);
      }
      [part="bar"].indeterminate {
        width: 40%;
        animation: vui-progress calc(var(--vui-duration) * 10) linear infinite;
      }
      @keyframes vui-progress {
        from { transform: translateX(-120%); }
        to { transform: translateX(280%); }
      }
      :host(:focus-visible) { outline: var(--vui-focus-ring); }
    `;
  }

  protected sync(): void {
    const track = this.qs('[part="track"]');
    const bar = this.qs('[part="bar"]');
    track.setAttribute('aria-label', this.getAttribute('label') || 'Progress');
    const max = this.max;
    track.setAttribute('aria-valuemax', String(max));
    track.setAttribute('aria-valuemin', '0');
    if (!this.hasAttribute('value') || !Number.isFinite(this.value)) {
      track.removeAttribute('aria-valuenow');
      track.setAttribute('aria-busy', 'true');
      this.style.removeProperty('--vui-progress');
      bar.classList.add('indeterminate');
      return;
    }
    const value = Math.min(Math.max(this.value, 0), max);
    track.setAttribute('aria-valuenow', String(value));
    track.removeAttribute('aria-busy');
    this.style.setProperty('--vui-progress', `${max === 0 ? 0 : (value / max) * 100}%`);
    bar.classList.remove('indeterminate');
  }
}

reflectStrings(VProgress, ['label']);
defineElement('vui-progress', VProgress);

registerContract({
  element: 'vui-progress',
  className: 'VProgress',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'value', kind: 'number', reflected: true },
    { name: 'max', kind: 'number', reflected: true },
  ],
  events: [],
  slots: [],
  parts: ['track', 'bar'],
  methods: [],
  keyboard: [],
  states: [],
  responsive: 'flow',
  focus: 'native',
  role: 'progressbar',
});
