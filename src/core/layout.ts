/** Shared layout vocabulary: gap, padding, align, justify, overflow. */

export const spaceSteps = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

const spaces: Record<string, string> = Object.fromEntries(spaceSteps.map((step) => [step, `var(--vui-space-${step})`]));

/** A layout step (`2xs` … `2xl`) as a space token. Unknown values use `fallback`. */
export function tokenGap(value: string | null, fallback = 'var(--vui-space-md)'): string {
  if (!value) return fallback;
  return spaces[value] ?? fallback;
}

export function flexAlign(value: string | null, fallback: string): string {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  if (value === 'center' || value === 'stretch' || value === 'baseline') return value;
  return fallback;
}

export function flexJustify(value: string | null): string {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  if (value === 'center' || value === 'space-between' || value === 'space-around') return value;
  return 'flex-start';
}

export function layoutOverflow(value: string | null, fallback: string): string {
  if (value === 'visible' || value === 'auto' || value === 'hidden' || value === 'scroll') return value;
  return fallback;
}

export function applySpace(host: HTMLElement, property: string, value: string | null, fallback: string): void {
  host.style.setProperty(property, tokenGap(value, fallback));
}

export function applyAlign(host: HTMLElement, value: string | null, fallback: string): void {
  host.style.setProperty('--vui-layout-align', flexAlign(value, fallback));
}

export function applyJustify(host: HTMLElement, value: string | null): void {
  host.style.setProperty('--vui-layout-justify', flexJustify(value));
}

export function applyOverflow(host: HTMLElement, value: string | null, fallback: string): void {
  host.style.setProperty('--vui-layout-overflow', layoutOverflow(value, fallback));
}
