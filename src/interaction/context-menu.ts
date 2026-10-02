export interface ContextPoint {
  x: number;
  y: number;
  source: 'pointer' | 'keyboard';
}

/**
 * Right click, or Shift+F10 / ContextMenu from the keyboard.
 * `open` receives a viewport point. The menu component places itself.
 */
export function bindContextMenu(target: HTMLElement, open: (point: ContextPoint) => void): () => void {
  const onContext = (event: MouseEvent): void => {
    event.preventDefault();
    open({ x: event.clientX, y: event.clientY, source: 'pointer' });
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const node = event.composedPath()[0];
    if (
      node instanceof HTMLElement &&
      (node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node.isContentEditable)
    ) {
      return;
    }
    event.preventDefault();
    const rect = target.getBoundingClientRect();
    open({ x: rect.left, y: rect.bottom, source: 'keyboard' });
  };
  target.addEventListener('contextmenu', onContext);
  target.addEventListener('keydown', onKey);
  return () => {
    target.removeEventListener('contextmenu', onContext);
    target.removeEventListener('keydown', onKey);
  };
}
