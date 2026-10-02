export interface DragPayload {
  /** Application-defined kind, for example `file` or `row`. VUI does not interpret it. */
  type: string;
  data: unknown;
}

export interface DropTargetOptions {
  accept?: (payload: DragPayload) => boolean;
  onDrop: (payload: DragPayload) => void;
}

interface Target {
  element: HTMLElement;
  accept?: (payload: DragPayload) => boolean;
  onDrop: (payload: DragPayload) => void;
}

let active: DragPayload | null = null;
const targets = new Set<Target>();

export function dragPayload(): DragPayload | null {
  return active;
}

export function beginDrag(payload: DragPayload): void {
  active = payload;
}

export function cancelDrag(): void {
  active = null;
  for (const element of document.querySelectorAll('[data-vui-dragging], [data-vui-drag-over]')) {
    element.removeAttribute('data-vui-dragging');
    element.removeAttribute('data-vui-drag-over');
  }
}

/** Drop `active` onto a registered target. Returns false when nothing is dragged or the target rejects it. */
export function completeDrop(element: HTMLElement): boolean {
  if (!active) return false;
  const target = [...targets].find((item) => item.element === element);
  if (!target || (target.accept && !target.accept(active))) return false;
  const payload = active;
  cancelDrag();
  target.onDrop(payload);
  return true;
}

function readPayload(event: DragEvent, fallback: DragPayload | null): DragPayload | null {
  if (fallback) return fallback;
  const raw = event.dataTransfer?.getData('text/plain');
  if (!raw) return null;
  return { type: 'text', data: raw };
}

/** Pointer drag via the platform Drag and Drop API. Keyboard callers use `beginDrag` and `completeDrop`. */
export function draggable(element: HTMLElement, payload: () => DragPayload): () => void {
  element.draggable = true;
  const start = (event: DragEvent): void => {
    const next = payload();
    beginDrag(next);
    element.setAttribute('data-vui-dragging', '');
    event.dataTransfer?.setData('text/plain', typeof next.data === 'string' ? next.data : JSON.stringify(next.data));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copyMove';
  };
  const end = (): void => {
    element.removeAttribute('data-vui-dragging');
    active = null;
  };
  element.addEventListener('dragstart', start);
  element.addEventListener('dragend', end);
  return () => {
    element.removeEventListener('dragstart', start);
    element.removeEventListener('dragend', end);
    element.draggable = false;
    element.removeAttribute('data-vui-dragging');
  };
}

export function dropTarget(element: HTMLElement, options: DropTargetOptions): () => void {
  const target: Target = { element, accept: options.accept, onDrop: options.onDrop };
  targets.add(target);
  const over = (event: DragEvent): void => {
    const payload = readPayload(event, active);
    if (!payload || (options.accept && !options.accept(payload))) return;
    event.preventDefault();
    element.setAttribute('data-vui-drag-over', '');
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  };
  const leave = (): void => {
    element.removeAttribute('data-vui-drag-over');
  };
  const drop = (event: DragEvent): void => {
    const payload = readPayload(event, active);
    element.removeAttribute('data-vui-drag-over');
    if (!payload || (options.accept && !options.accept(payload))) return;
    event.preventDefault();
    active = payload;
    completeDrop(element);
  };
  element.addEventListener('dragover', over);
  element.addEventListener('dragleave', leave);
  element.addEventListener('drop', drop);
  return () => {
    targets.delete(target);
    element.removeEventListener('dragover', over);
    element.removeEventListener('dragleave', leave);
    element.removeEventListener('drop', drop);
    element.removeAttribute('data-vui-drag-over');
  };
}
