import { beforeEach, describe, expect, it } from 'vitest';
import { clearOverlays, overlayDepth, pushOverlay } from '../../src/core/overlay';

describe('overlay stack', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
    document.documentElement.removeAttribute('data-vui-scroll-lock');
  });

  it('assigns stacking order and locks scroll for a modal', () => {
    const popup = document.createElement('div');
    const modal = document.createElement('div');
    document.body.append(popup, modal);
    const closePopup = pushOverlay({ owner: popup, kind: 'popup', layer: popup });
    pushOverlay({ owner: modal, kind: 'modal', layer: modal, lockScroll: true });
    expect(popup.style.getPropertyValue('--vui-overlay-z')).toBe('1000');
    expect(modal.style.getPropertyValue('--vui-overlay-z')).toBe('1301');
    expect(document.documentElement.hasAttribute('data-vui-scroll-lock')).toBe(true);
    closePopup();
    expect(overlayDepth()).toBe(1);
    expect(document.documentElement.hasAttribute('data-vui-scroll-lock')).toBe(true);
  });

  it('lets Escape dismiss the top overlay and then the one under it', () => {
    const dialog = document.createElement('div');
    const menu = document.createElement('div');
    document.body.append(dialog, menu);
    const dismissed: string[] = [];
    const closeDialog = pushOverlay({
      owner: dialog,
      kind: 'modal',
      onDismiss: () => {
        dismissed.push('dialog');
        closeDialog();
      },
    });
    const closeMenu = pushOverlay({
      owner: menu,
      kind: 'popup',
      onDismiss: () => {
        dismissed.push('menu');
        closeMenu();
      },
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dismissed).toEqual(['menu', 'dialog']);
    expect(overlayDepth()).toBe(0);
  });

  it('skips a toast and dismisses the modal underneath', () => {
    const dialog = document.createElement('div');
    const toast = document.createElement('div');
    document.body.append(dialog, toast);
    let dismissed = '';
    pushOverlay({
      owner: dialog,
      kind: 'modal',
      onDismiss: () => {
        dismissed = 'dialog';
      },
    });
    pushOverlay({ owner: toast, kind: 'toast', dismissable: false });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dismissed).toBe('dialog');
  });

  it('closes a popup on an outside pointer and keeps an inside pointer', () => {
    const outside = document.createElement('button');
    const host = document.createElement('div');
    document.body.append(outside, host);
    let reason = '';
    pushOverlay({
      owner: host,
      kind: 'popup',
      dismissOnOutside: true,
      onDismiss: (next) => {
        reason = next;
      },
    });
    host.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    expect(reason).toBe('');
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    expect(reason).toBe('outside');
  });

  it('cycles Tab inside a trapped overlay and restores focus when released', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'Open';
    const host = document.createElement('div');
    const first = document.createElement('button');
    const last = document.createElement('button');
    first.textContent = 'First';
    last.textContent = 'Last';
    host.append(first, last);
    document.body.append(opener, host);
    opener.focus();
    const release = pushOverlay({
      owner: host,
      kind: 'modal',
      trapFocus: true,
      dismissable: false,
      restoreFocus: true,
    });
    last.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(first);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true, shiftKey: true }));
    expect(document.activeElement).toBe(last);
    release();
    await Promise.resolve();
    expect(document.activeElement).toBe(opener);
  });

  it('closes every layer in a group on an outside pointer and keeps Escape to one layer', () => {
    const parent = document.createElement('div');
    const nested = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(outside, parent, nested);
    const dismissed: string[] = [];
    const closeParent = pushOverlay({
      owner: parent,
      kind: 'popup',
      group: 'menu',
      dismissOnOutside: true,
      onDismiss: (reason) => {
        dismissed.push(`parent:${reason}`);
        closeParent();
      },
    });
    const closeNested = pushOverlay({
      owner: nested,
      kind: 'popup',
      group: 'menu',
      dismissOnOutside: true,
      onDismiss: (reason) => {
        dismissed.push(`nested:${reason}`);
        closeNested();
      },
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dismissed).toEqual(['nested:escape']);
    expect(overlayDepth()).toBe(1);
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    expect(dismissed).toEqual(['nested:escape', 'parent:outside']);
    expect(overlayDepth()).toBe(0);
  });
});
