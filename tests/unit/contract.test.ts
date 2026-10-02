import { beforeEach, describe, expect, it } from 'vitest';
import { VButton } from '../../src/components/actions/button';
import { VCheckbox } from '../../src/components/forms/checkbox';
import { VInput } from '../../src/components/forms/input';
import { clearOverlays } from '../../src/core/overlay';

describe('reflected public properties', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
  });

  it('mirrors button variant and disabled into attributes and the native button', () => {
    const button = document.createElement('vui-button') as VButton;
    button.textContent = 'Save';
    document.body.append(button);
    button.variant = 'danger';
    button.disabled = true;
    expect(button.getAttribute('variant')).toBe('danger');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.shadowRoot?.querySelector('button')?.disabled).toBe(true);
    button.disabled = false;
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.shadowRoot?.querySelector('button')?.disabled).toBe(false);
  });

  it('associates an input hint and invalid state with the native field', () => {
    const input = document.createElement('vui-input') as VInput;
    document.body.append(input);
    input.label = 'Email';
    input.hint = 'Use a work address';
    input.invalid = true;
    input.readonly = true;
    const field = input.shadowRoot?.querySelector('input');
    expect(field?.getAttribute('aria-invalid')).toBe('true');
    expect(field?.readOnly).toBe(true);
    expect(field?.getAttribute('aria-describedby')).toBe(input.shadowRoot?.querySelector('.hint')?.id);
    expect(input.shadowRoot?.querySelector('.hint')?.textContent).toBe('Use a work address');
  });

  it('keeps checkbox.checked as the source of truth', () => {
    const checkbox = document.createElement('vui-checkbox') as VCheckbox;
    checkbox.textContent = 'Agree';
    document.body.append(checkbox);
    checkbox.checked = true;
    checkbox.disabled = true;
    expect(checkbox.hasAttribute('checked')).toBe(true);
    expect(checkbox.shadowRoot?.querySelector('input')?.disabled).toBe(true);
  });
});
