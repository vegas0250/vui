import { tones } from './presets';

/** Shared vocabulary; variables are scoped to each component host. Legacy variants stay valid. */
export function toneStyles(
  target: string,
  defaultTone: 'primary' | 'neutral' | 'info',
  defaultVariant: 'solid' | 'soft',
): string {
  const assignments = (tone: string) => {
    const color = tone;
    const fallback = tone === 'neutral' ? 'var(--vui-color-text)' : 'var(--vui-color-secondary)';
    return `--vui-tone-color:var(--vui-color-${color}, ${fallback});
      --vui-tone-hover:var(--vui-color-${tone}-hover, var(--vui-tone-color));
      --vui-tone-soft-hover:var(--vui-color-${tone}-surface-hover, var(--vui-tone-soft));
      --vui-tone-soft:var(--vui-color-${tone}-surface, var(--vui-color-surface));
      --vui-tone-text:var(--vui-color-${tone}-text, var(--vui-color-text));
      --vui-tone-border:var(--vui-color-${tone}-border, var(--vui-color-border));
      --vui-tone-on:var(--vui-color-on-${tone}-solid, var(--vui-color-on-${color}, var(--vui-color-surface)));`;
  };
  const variants = {
    solid: 'background:var(--vui-tone-color);color:var(--vui-tone-on);border-color:var(--vui-tone-border);',
    soft: 'background:var(--vui-tone-soft);color:var(--vui-tone-text);border-color:transparent;',
    outline: 'background:transparent;color:var(--vui-tone-text);border-color:var(--vui-tone-border);',
    ghost: 'background:transparent;color:var(--vui-tone-text);border-color:transparent;',
  };
  const selectors = (variant: string) => `:host(${variant === 'ghost' && target === 'button' ? '[tone]' : ''}[variant="${variant}"]) ${target}`;
  return `:host { ${assignments(defaultTone)} }
    ${tones.map(tone => `:host([tone="${tone}"]) { ${assignments(tone)} }`).join('')}
    ${tones.map(tone => `:host([variant="${tone}"]:not([tone])) { ${assignments(tone)} }`).join('')}
    :host([tone]) ${target} { ${variants[defaultVariant]} }
    ${Object.entries(variants).map(([variant, css]) => `${selectors(variant)} { ${css} }`).join('')}
    ${target === 'button' ? `
      :host([tone]) button:not(:disabled):hover, :host([variant="solid"]) button:not(:disabled):hover,
      :host([tone]) button:not(:disabled):active {
        ${variants[defaultVariant]}
        background:var(${defaultVariant === 'solid' ? '--vui-tone-hover' : '--vui-tone-soft-hover'});
      }
      ${Object.entries(variants).map(([variant, css]) => `${selectors(variant)}:not(:disabled):hover, ${selectors(variant)}:not(:disabled):active {
        ${css} background:var(${variant === 'solid' ? '--vui-tone-hover' : '--vui-tone-soft-hover'});
      }`).join('')}
      :host([disabled][tone]) [part="base"], :host([loading][tone]) [part="base"], :host([disabled]) [part="base"], :host([loading]) [part="base"] { background:var(--vui-color-secondary);color:var(--vui-color-text-disabled);border-color:var(--vui-color-block-border, var(--vui-color-border));box-shadow:none; }
    ` : ''}
  `;
}
