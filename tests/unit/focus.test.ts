import { beforeEach, describe, expect, it } from 'vitest';
import { deepestActiveElement, focusableElements, openFocusScope } from '../../src/interaction/focus';

describe('focus scope', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('restores the element that was focused before the scope opened', async () => {
    const opener = document.createElement('button');
    const host = document.createElement('div');
    const inside = document.createElement('button');
    opener.textContent = 'Open';
    inside.textContent = 'Inside';
    host.append(inside);
    document.body.append(opener, host);
    opener.focus();
    const close = openFocusScope(host, { restore: true });
    inside.focus();
    expect(deepestActiveElement()).toBe(inside);
    close();
    await Promise.resolve();
    expect(document.activeElement).toBe(opener);
  });

  it('moves focus inside the scope when the focused element is removed', async () => {
    const host = document.createElement('div');
    const first = document.createElement('button');
    const second = document.createElement('button');
    first.textContent = 'First';
    second.textContent = 'Second';
    host.append(first, second);
    document.body.append(host);
    const close = openFocusScope(host, { reclaim: true, restore: false });
    first.focus();
    expect(focusableElements(host)).toEqual([first, second]);
    first.remove();
    await Promise.resolve();
    await Promise.resolve();
    expect(document.activeElement).toBe(second);
    close({ restore: false });
  });

  it('keeps an inner scope from restoring over an outer one until the inner scope closes', async () => {
    const opener = document.createElement('button');
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    const outerButton = document.createElement('button');
    const innerButton = document.createElement('button');
    opener.textContent = 'Open';
    outerButton.textContent = 'Outer';
    innerButton.textContent = 'Inner';
    inner.append(innerButton);
    outer.append(outerButton, inner);
    document.body.append(opener, outer);
    opener.focus();
    const closeOuter = openFocusScope(outer, { restore: true });
    outerButton.focus();
    const closeInner = openFocusScope(inner, { restore: true });
    innerButton.focus();
    closeInner();
    await Promise.resolve();
    expect(document.activeElement).toBe(outerButton);
    closeOuter();
    await Promise.resolve();
    expect(document.activeElement).toBe(opener);
  });
});
