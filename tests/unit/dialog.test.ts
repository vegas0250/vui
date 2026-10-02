import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/forms/select';
import { VDialog } from '../../src/components/overlay/dialog';
import { clearOverlays } from '../../src/core/overlay';

describe('vui-dialog', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
  });

  it('moves focus inside and returns it to the opener', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'Open';
    const dialog = document.createElement('vui-dialog') as VDialog;
    dialog.label = 'Confirm';
    document.body.append(opener, dialog);
    opener.focus();
    dialog.show();
    expect(dialog.open).toBe(true);
    expect(dialog.shadowRoot?.querySelector('dialog')?.getAttribute('aria-modal')).toBe('true');
    expect(document.documentElement.hasAttribute('data-vui-scroll-lock')).toBe(true);
    const active = dialog.shadowRoot?.activeElement ?? document.activeElement;
    expect(active === dialog || dialog.shadowRoot?.contains(active ?? null) || active === dialog.shadowRoot?.querySelector('dialog')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dialog.open).toBe(false);
    expect(document.documentElement.hasAttribute('data-vui-scroll-lock')).toBe(false);
    await Promise.resolve();
    expect(document.activeElement).toBe(opener);
  });

  it('keeps a non-dismissable dialog open on Escape', () => {
    const dialog = document.createElement('vui-dialog') as VDialog;
    dialog.label = 'Required';
    dialog.dismissable = false;
    document.body.append(dialog);
    dialog.show();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dialog.open).toBe(true);
    dialog.close();
    expect(dialog.open).toBe(false);
  });

  it('closes a nested select before the dialog', () => {
    const dialog = document.createElement('vui-dialog') as VDialog;
    dialog.label = 'Edit';
    const select = document.createElement('vui-select');
    select.innerHTML = '<vui-option value="a">A</vui-option><vui-option value="b">B</vui-option>';
    dialog.append(select);
    document.body.append(dialog);
    dialog.show();
    const trigger = select.shadowRoot?.querySelector('button');
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(dialog.open).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dialog.open).toBe(false);
  });
});
