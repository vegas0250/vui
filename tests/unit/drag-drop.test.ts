import { beforeEach, describe, expect, it } from 'vitest';
import { beginDrag, cancelDrag, completeDrop, dragPayload, draggable, dropTarget } from '../../src/interaction/drag-drop';
import { pointerClickKind, trackPointer } from '../../src/interaction/pointer';

describe('drag and drop', () => {
  beforeEach(() => {
    cancelDrag();
    document.body.replaceChildren();
  });

  it('drops a payload only when the target accepts it', () => {
    const source = document.createElement('div');
    const good = document.createElement('div');
    const bad = document.createElement('div');
    document.body.append(source, good, bad);
    const stopDrag = draggable(source, () => ({ type: 'row', data: 'a' }));
    let dropped = '';
    const stopGood = dropTarget(good, {
      accept: (payload) => payload.type === 'row',
      onDrop: (payload) => {
        dropped = String(payload.data);
      },
    });
    const stopBad = dropTarget(bad, {
      accept: () => false,
      onDrop: () => {
        dropped = 'bad';
      },
    });
    beginDrag({ type: 'row', data: 'a' });
    expect(dragPayload()?.type).toBe('row');
    expect(completeDrop(bad)).toBe(false);
    expect(completeDrop(good)).toBe(true);
    expect(dropped).toBe('a');
    expect(dragPayload()).toBeNull();
    stopDrag();
    stopGood();
    stopBad();
  });
});

describe('pointer', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('tracks a primary pointer drag and names the click', () => {
    const handle = document.createElement('div');
    document.body.append(handle);
    const moves: number[] = [];
    const stop = trackPointer(handle, {
      onMove: (drag) => moves.push(drag.dx),
    });
    handle.dispatchEvent(new PointerEvent('pointerdown', { button: 0, clientX: 10, clientY: 4, bubbles: true }));
    handle.dispatchEvent(new PointerEvent('pointermove', { clientX: 16, clientY: 4, bubbles: true }));
    handle.dispatchEvent(new PointerEvent('pointerup', { clientX: 16, clientY: 4, bubbles: true }));
    expect(moves).toEqual([6]);
    expect(pointerClickKind(new MouseEvent('click', { detail: 2 }))).toBe('double');
    expect(pointerClickKind(new MouseEvent('contextmenu'))).toBe('context');
    stop();
  });
});
