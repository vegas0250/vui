export function emitChange(element: HTMLElement): void {
  element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
}

export function emitInput(element: HTMLElement): void {
  element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

export function emitClose(element: HTMLElement): void {
  element.dispatchEvent(new Event('close', { bubbles: true, composed: true }));
}
