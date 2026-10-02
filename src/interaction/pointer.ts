export interface PointerDrag {
  start: PointerEvent;
  current: PointerEvent;
  dx: number;
  dy: number;
}

export interface PointerTrackHandlers {
  onStart?: (event: PointerEvent) => void;
  onMove?: (drag: PointerDrag) => void;
  onEnd?: (drag: PointerDrag) => void;
}

/** Primary-button pointer tracking with capture. One helper for drag handles, not a gesture framework. */
export function trackPointer(element: HTMLElement, handlers: PointerTrackHandlers): () => void {
  let start: PointerEvent | null = null;

  const move = (event: PointerEvent): void => {
    if (!start) return;
    handlers.onMove?.({
      start,
      current: event,
      dx: event.clientX - start.clientX,
      dy: event.clientY - start.clientY,
    });
  };

  const end = (event: PointerEvent): void => {
    if (!start) return;
    const drag: PointerDrag = {
      start,
      current: event,
      dx: event.clientX - start.clientX,
      dy: event.clientY - start.clientY,
    };
    start = null;
    handlers.onEnd?.(drag);
  };

  const down = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    start = event;
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      // Capture is optional when the platform or test DOM cannot take it.
    }
    handlers.onStart?.(event);
  };

  element.addEventListener('pointerdown', down);
  element.addEventListener('pointermove', move);
  element.addEventListener('pointerup', end);
  element.addEventListener('pointercancel', end);
  return () => {
    element.removeEventListener('pointerdown', down);
    element.removeEventListener('pointermove', move);
    element.removeEventListener('pointerup', end);
    element.removeEventListener('pointercancel', end);
    start = null;
  };
}

export function pointerClickKind(event: MouseEvent): 'click' | 'double' | 'context' {
  if (event.type === 'contextmenu' || event.button === 2) return 'context';
  if (event.detail >= 2) return 'double';
  return 'click';
}
