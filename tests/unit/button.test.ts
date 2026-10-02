import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/actions/button';

describe('vui-button', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('dispatches a native click and ignores disabled clicks', () => {
    const button = document.createElement('vui-button');
    button.textContent = 'Save';
    document.body.append(button);

    let clicks = 0;
    button.addEventListener('click', () => {
      clicks += 1;
    });

    button.shadowRoot?.querySelector('button')?.click();
    expect(clicks).toBe(1);

    button.setAttribute('disabled', '');
    button.shadowRoot?.querySelector('button')?.click();
    expect(clicks).toBe(1);
    expect(button.shadowRoot?.querySelector('button')?.disabled).toBe(true);
  });

  it('does not register unrelated components', () => {
    expect(customElements.get('vui-button')).toBeTypeOf('function');
    expect(customElements.get('vui-dialog')).toBeUndefined();
    expect(customElements.get('vui-data-grid')).toBeUndefined();
  });
});
