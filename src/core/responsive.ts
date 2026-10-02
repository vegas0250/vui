/** Reads a length token. Container queries cannot reference var(), so component CSS repeats these lengths. */

export function lengthToPx(value: string, fallback: number): number {
  const match = /^(-?\d+(\.\d+)?)(px|rem|em)$/.exec(value.trim());
  if (!match || match[1] === undefined || match[3] === undefined) return fallback;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return fallback;
  if (match[3] === 'px') return amount;
  const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const base = Number.isFinite(root) && root > 0 ? root : 16;
  return amount * base;
}

export function inlineThreshold(element: Element, token = '--vui-layout-narrow', fallback = 352): number {
  const raw = getComputedStyle(element).getPropertyValue(token).trim();
  if (!raw) return fallback;
  return lengthToPx(raw, fallback);
}

export function observeInlineSize(element: Element, onChange: (width: number) => void): () => void {
  const measure = (): void => onChange(element.getBoundingClientRect().width);
  if (typeof ResizeObserver === 'undefined') {
    measure();
    return () => {};
  }
  const observer = new ResizeObserver(() => measure());
  observer.observe(element);
  measure();
  return () => observer.disconnect();
}
