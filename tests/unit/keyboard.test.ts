import { describe, expect, it } from 'vitest';
import { applyRovingTabIndex, moveInList, nextEnabled, stepIndex } from '../../src/interaction/keyboard';

describe('keyboard primitives', () => {
  it('reverses horizontal arrows when the inline direction is rtl', () => {
    expect(moveInList(0, 3, 'ArrowLeft', { orientation: 'horizontal', rtl: true })).toBe(1);
    expect(moveInList(1, 3, 'ArrowRight', { orientation: 'horizontal', rtl: true })).toBe(0);
    expect(moveInList(0, 3, 'ArrowDown', { orientation: 'both', rtl: true })).toBe(1);
  });

  it('moves a horizontal list and wraps arrows', () => {
    expect(moveInList(0, 3, 'ArrowLeft', { orientation: 'horizontal', loop: true })).toBe(2);
    expect(moveInList(1, 3, 'ArrowRight', { orientation: 'horizontal', loop: true })).toBe(2);
    expect(moveInList(2, 3, 'Home', { orientation: 'horizontal', loop: true })).toBe(0);
    expect(moveInList(0, 3, 'End', { orientation: 'horizontal' })).toBe(2);
    expect(moveInList(0, 3, 'ArrowUp', { orientation: 'horizontal' })).toBeNull();
  });

  it('pages through a vertical list without wrapping past the ends', () => {
    expect(moveInList(0, 10, 'PageDown', { orientation: 'vertical', pageSize: 4 })).toBe(4);
    expect(moveInList(2, 10, 'PageUp', { orientation: 'vertical', pageSize: 4 })).toBe(0);
    expect(moveInList(9, 10, 'ArrowDown', { orientation: 'vertical' })).toBe(9);
  });

  it('skips indexes the caller rejects', () => {
    expect(stepIndex(0, 1, 4, (index) => index !== 1)).toBe(2);
    expect(stepIndex(0, -1, 4, () => true)).toBe(0);
    expect(nextEnabled(3, -1, 1, (index) => index !== 0)).toBe(1);
  });

  it('keeps a single tabindex on the active item', () => {
    const items = [document.createElement('button'), document.createElement('button'), document.createElement('button')];
    applyRovingTabIndex(items, 1);
    expect(items.map((item) => item.tabIndex)).toEqual([-1, 0, -1]);
  });
});
