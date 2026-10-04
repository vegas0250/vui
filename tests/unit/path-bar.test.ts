import { describe, expect, it } from 'vitest';
import '../../src/components/navigation/path-bar';
import type { VPathBar } from '../../src/components/navigation/path-bar';

describe('vui-path-bar', () => {
  it('shows crumbs until the field is clicked, then edits the address', () => {
    const bar = document.createElement('vui-path-bar') as VPathBar;
    bar.label = 'Адрес';
    bar.value = 'C:\\Users\\vegas';
    bar.crumbs = [
      { label: 'C:\\', path: 'C:\\' },
      { label: 'Users', path: 'C:\\Users' },
      { label: 'vegas', path: 'C:\\Users\\vegas' },
    ];
    document.body.append(bar);

    const buttons = [...bar.shadowRoot!.querySelectorAll('button')];
    expect(buttons.map((button) => button.textContent)).toEqual(['C:\\', 'Users', 'vegas']);
    expect(bar.shadowRoot?.querySelector('input')?.hidden).toBe(true);

    let opened = '';
    bar.addEventListener('change', () => {
      opened = bar.value;
    });
    buttons[1]?.click();
    expect(opened).toBe('C:\\Users');
    expect(bar.hasAttribute('editing')).toBe(false);

    bar.shadowRoot?.querySelector<HTMLElement>('.rest')?.click();
    const input = bar.shadowRoot?.querySelector('input');
    expect(bar.hasAttribute('editing')).toBe(true);
    expect(input?.hidden).toBe(false);
    expect(input?.value).toBe('C:\\Users');

    if (!input) throw new Error('Нет поля адреса');
    input.value = 'D:\\Work';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(bar.value).toBe('D:\\Work');
    expect(opened).toBe('D:\\Work');
    expect(bar.hasAttribute('editing')).toBe(false);
    bar.remove();
  });
});