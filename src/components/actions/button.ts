import { toneStyles } from '../../theme/tone-styles';
import { tones, type VuiTone } from '../../theme/presets';
import { buttonStyles } from './button-styles';
import { registerContract } from '../../contract/registry';
import { defineElement } from '../../utils/define';
import { VuiElement } from '../../utils/element';
import { reflectBooleans, reflectStrings } from '../../utils/reflect';

export class VButton extends VuiElement {
  declare variant: string;
  declare tone: VuiTone;
  declare size: string;
  declare name: string;
  declare value: string;
  declare form: string;
  declare disabled: boolean;
  declare loading: boolean;

  static get observedAttributes(): string[] {
    return ['tone', 'variant', 'size', 'disabled', 'loading', 'type', 'name', 'value', 'form'];
  }

  protected template(): string {
    return `
      <button part="base" type="button">
        <span part="busy" hidden></span>
        <slot name="icon"></slot>
        <slot></slot>
      </button>
    `;
  }

  protected componentStyles(): string {
    return buttonStyles + toneStyles('button', 'primary', 'solid');
  }

  protected sync(): void {
    const button = this.qs<HTMLButtonElement>('button');
    const type = this.getAttribute('type');
    button.type = type === 'submit' || type === 'reset' ? type : 'button';
    const loading = this.hasAttribute('loading');
    button.disabled = this.isDisabled() || loading;
    button.setAttribute('aria-busy', loading ? 'true' : 'false');
    this.qs('[part="busy"]').toggleAttribute('hidden', !loading);
    const name = this.getAttribute('name');
    const value = this.getAttribute('value');
    if (name) button.name = name;
    else button.removeAttribute('name');
    if (value !== null) button.value = value;
    else button.removeAttribute('value');
    const form = this.getAttribute('form');
    if (form) button.setAttribute('form', form);
    else button.removeAttribute('form');
  }
}

reflectStrings(VButton, ['variant', 'size', 'type', 'name', 'value', 'form']);
reflectBooleans(VButton, ['disabled', 'loading']);
reflectStrings(VButton, ['tone']);
defineElement('vui-button', VButton);

registerContract({
  element: 'vui-button',
  className: 'VButton',
  attributes: [
    { name: 'tone', kind: 'enum', values: [...tones], reflected: true, description: ['Семантический цвет.', 'Semantic color.'] },
    { name: 'variant', kind: 'enum', values: ['primary', 'secondary', 'ghost', 'danger', 'solid', 'soft', 'outline'], reflected: true, default: 'primary', description: ['Внешний вид кнопки.', 'Visual style.'] },
    { name: 'size', kind: 'enum', values: ['small', 'medium', 'large'], reflected: true, default: 'medium', description: ['Размер контрола.', 'Control size.'] },
    { name: 'type', kind: 'enum', values: ['button', 'submit', 'reset'], reflected: true, default: 'button', description: ['Тип нативной кнопки.', 'Native button type.'] },
    { name: 'disabled', kind: 'boolean', reflected: true, default: false, description: ['Отключает активацию и Tab.', 'Disables activation and Tab.'] },
    { name: 'loading', kind: 'boolean', reflected: true, default: false, description: ['Показывает busy и блокирует клик.', 'Shows busy state and blocks click.'] },
    { name: 'name', kind: 'string', reflected: true, description: ['Имя для отправки формы.', 'Name when submitted with a form.'] },
    { name: 'value', kind: 'string', reflected: true, description: ['Значение для отправки формы.', 'Value when submitted with a form.'] },
    { name: 'form', kind: 'string', reflected: true, description: ['id связанной формы.', 'Associated form id.'] },
  ],
  events: [{ name: 'click', description: ['Активация кнопки.', 'Button activation.'], detail: 'void' }],
  slots: ['', 'icon'],
  parts: ['base', 'busy'],
  methods: [],
  keyboard: ['Tab', 'Enter', 'Space'],
  states: ['disabled', 'loading'],
  responsive: 'flow',
  focus: 'native',
  docs: {
    guidance: [
      'Используйте для явных действий. Для одной иконки без текста берите vui-icon-button.',
      'Use for explicit actions. Prefer vui-icon-button for an icon-only control.',
    ],
    slots: [
      { name: '', description: ['Подпись кнопки.', 'Button label.'] },
      { name: 'icon', description: ['Необязательная иконка перед текстом.', 'Optional leading icon.'] },
    ],
    parts: [
      { name: 'base', description: ['Поверхность кнопки.', 'Button surface.'] },
      { name: 'busy', description: ['Индикатор загрузки.', 'Loading indicator.'] },
    ],
    tokens: ['--vui-size-control', '--vui-radius-field', '--vui-color-primary', '--vui-focus-ring'],
  },
});

export interface VButton {
  type: string;
}
