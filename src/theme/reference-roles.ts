/** Deliberate UI surface assignments; see docs/theme-semantics.md for sources. */
export const referenceRoles: Record<string, Partial<Record<'background' | 'surface' | 'card' | 'field' | 'surfaceElevated' | 'popover' | 'modal' | 'surfaceHover' | 'selection', string>>> = {
  'catppuccin-mocha': { background: '#181825', surface: '#1e1e2e', card: '#1e1e2e', field: '#181825', surfaceElevated: '#313244', popover: '#313244', modal: '#1e1e2e', surfaceHover: '#313244', selection: '#45475a' },
  'catppuccin-latte': { background: '#e6e9ef', surface: '#eff1f5', card: '#eff1f5', field: '#e6e9ef', surfaceElevated: '#ffffff', popover: '#eff1f5', modal: '#eff1f5', surfaceHover: '#dce0e8', selection: '#ccd0da' },
  'tokyo-night': { background: '#16161e', surface: '#1a1b26', card: '#1a1b26', field: '#16161e', surfaceElevated: '#24283b', popover: '#1f2335', modal: '#24283b', surfaceHover: '#292e42', selection: '#283457' },
  'tokyo-night-day': { background: '#d5d6db', surface: '#e1e2e7', card: '#e1e2e7', field: '#e9e9ed', surfaceElevated: '#e9e9ed', popover: '#e9e9ed', modal: '#e1e2e7', surfaceHover: '#c4c8da', selection: '#b7c1e3' },
  dracula: { background: '#21222c', surface: '#282a36', card: '#282a36', field: '#21222c', surfaceElevated: '#44475a', popover: '#343746', modal: '#343746', surfaceHover: '#44475a', selection: '#44475a' },
  nord: { background: '#2e3440', surface: '#3b4252', card: '#3b4252', field: '#2e3440', surfaceElevated: '#434c5e', popover: '#3b4252', modal: '#3b4252', surfaceHover: '#434c5e', selection: '#434c5e' },
  'fluent-light': { background: '#f5f5f5', surface: '#ffffff', card: '#ffffff', field: '#ffffff', surfaceElevated: '#fafafa', popover: '#ffffff', modal: '#ffffff', surfaceHover: '#f0f0f0', selection: '#ebebeb' },
  'fluent-dark': { background: '#1f1f1f', surface: '#292929', card: '#292929', field: '#1f1f1f', surfaceElevated: '#3d3d3d', popover: '#313131', modal: '#292929', surfaceHover: '#3d3d3d', selection: '#383838' },
  'radix-light': { background: '#fcfcfd', surface: '#f9f9fb', card: '#ffffff', field: '#ffffff', surfaceElevated: '#f0f0f3', popover: '#ffffff', modal: '#ffffff', surfaceHover: '#e8e8ec', selection: '#e0e1e6' },
  'radix-dark': { background: '#111113', surface: '#18191b', card: '#18191b', field: '#111113', surfaceElevated: '#212225', popover: '#212225', modal: '#18191b', surfaceHover: '#272a2d', selection: '#2e3135' },
};

/** Hand-selected tint ramps, retaining each family's warm/cool character. */
export const referenceSoft: Record<string, Record<string, string>> = {
  'catppuccin-mocha': { neutral: '#313244', primary: '#363047', accent: '#29364c', success: '#293b35', warning: '#403b35', danger: '#402e3e', info: '#283c46' },
  'catppuccin-latte': { neutral: '#dce0e8', primary: '#e8ddf7', accent: '#dde6fa', success: '#e0ebdc', warning: '#f3e8d5', danger: '#f5dde4', info: '#dcebf0' },
  'tokyo-night': { neutral: '#24283b', primary: '#283457', accent: '#352e4c', success: '#2b3832', warning: '#3e3530', danger: '#402b3b', info: '#263d50' },
  'tokyo-night-day': { neutral: '#d5d6db', primary: '#d0dcf0', accent: '#e2d8f1', success: '#dbe3d4', warning: '#e9e1d4', danger: '#f0d8e1', info: '#d1e3ea' },
  dracula: { neutral: '#44475a', primary: '#3d334e', accent: '#493347', success: '#294435', warning: '#424332', danger: '#492f3a', info: '#2d414c' },
  nord: { neutral: '#434c5e', primary: '#344b59', accent: '#494355', success: '#3d4b46', warning: '#504c43', danger: '#4c3c4a', info: '#374959' },
  'fluent-light': { neutral: '#f0f0f0', primary: '#ebf3fc', accent: '#f0f0ff', success: '#e7f5e7', warning: '#fff4ce', danger: '#fde7e9', info: '#ebf3fc' },
  'fluent-dark': { neutral: '#3d3d3d', primary: '#203247', accent: '#2b2c4a', success: '#243524', warning: '#3a3208', danger: '#442026', info: '#1e3347' },
  'radix-light': { neutral: '#e8e8ec', primary: '#edf2fe', accent: '#f7edfe', success: '#e6f6eb', warning: '#fff7c2', danger: '#feebec', info: '#e1f6fd' },
  'radix-dark': { neutral: '#272a2d', primary: '#182449', accent: '#2b1240', success: '#132d21', warning: '#341c00', danger: '#3c181a', info: '#0d2e38' },
};
