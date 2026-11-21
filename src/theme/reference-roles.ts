/** Deliberate UI surface assignments for the VUI themes; see docs/theme-semantics.md. */
export const referenceRoles: Record<string, Partial<Record<'background' | 'surface' | 'card' | 'field' | 'surfaceElevated' | 'popover' | 'modal' | 'surfaceHover' | 'selection', string>>> = {
  light: { background: '#f5f6f8', surface: '#ffffff', card: '#ffffff', field: '#ffffff', surfaceElevated: '#ffffff', popover: '#ffffff', modal: '#ffffff', surfaceHover: '#eef0f4', selection: '#e3e6fb' },
  dark: { background: '#0e1016', surface: '#151821', card: '#151821', field: '#10131a', surfaceElevated: '#1c202b', popover: '#1c202b', modal: '#181b25', surfaceHover: '#232835', selection: '#2b3158' },
};

/** Hand-selected tint ramps for soft (badge, alert, callout) surfaces. */
export const referenceSoft: Record<string, Record<string, string>> = {
  light: { neutral: '#eef0f4', primary: '#ecedfd', accent: '#e3f4f4', success: '#e5f4ec', warning: '#fbf0dc', danger: '#fce8eb', info: '#e6f0fb' },
  dark: { neutral: '#232835', primary: '#262a4d', accent: '#173434', success: '#183326', warning: '#352b17', danger: '#3a1d25', info: '#172b42' },
};
