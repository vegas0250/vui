/** Deliberate UI surface assignments; see docs/theme-semantics.md for sources. */
export const referenceRoles: Record<string, Partial<Record<'background' | 'surface' | 'card' | 'field' | 'surfaceElevated' | 'popover' | 'modal' | 'surfaceHover' | 'selection', string>>> = {
  'catppuccin-mocha': { background: '#181825', surface: '#1e1e2e', card: '#1e1e2e', field: '#181825', surfaceElevated: '#313244', popover: '#313244', modal: '#1e1e2e', surfaceHover: '#313244', selection: '#45475a' },
  'catppuccin-latte': { background: '#e6e9ef', surface: '#eff1f5', card: '#eff1f5', field: '#e6e9ef', surfaceElevated: '#ffffff', popover: '#eff1f5', modal: '#eff1f5', surfaceHover: '#dce0e8', selection: '#ccd0da' },
  'tokyo-night': { background: '#16161e', surface: '#1a1b26', card: '#1a1b26', field: '#16161e', surfaceElevated: '#24283b', popover: '#1f2335', modal: '#24283b', surfaceHover: '#292e42', selection: '#283457' },
  'tokyo-night-day': { background: '#d5d6db', surface: '#e1e2e7', card: '#e1e2e7', field: '#e9e9ed', surfaceElevated: '#e9e9ed', popover: '#e9e9ed', modal: '#e1e2e7', surfaceHover: '#c4c8da', selection: '#b7c1e3' },
  dracula: { background: '#21222c', surface: '#282a36', card: '#282a36', field: '#21222c', surfaceElevated: '#44475a', popover: '#343746', modal: '#343746', surfaceHover: '#44475a', selection: '#44475a' },
  nord: { background: '#2e3440', surface: '#3b4252', card: '#3b4252', field: '#2e3440', surfaceElevated: '#434c5e', popover: '#3b4252', modal: '#3b4252', surfaceHover: '#434c5e', selection: '#434c5e' },
};

/** Hand-selected tint ramps, retaining each family's warm/cool character. */
export const referenceSoft: Record<string, Record<string, string>> = {
  'catppuccin-mocha': { neutral: '#313244', primary: '#363047', accent: '#29364c', success: '#293b35', warning: '#403b35', danger: '#402e3e', info: '#283c46' },
  'catppuccin-latte': { neutral: '#dce0e8', primary: '#e8ddf7', accent: '#dde6fa', success: '#e0ebdc', warning: '#f3e8d5', danger: '#f5dde4', info: '#dcebf0' },
  'tokyo-night': { neutral: '#24283b', primary: '#283457', accent: '#352e4c', success: '#2b3832', warning: '#3e3530', danger: '#402b3b', info: '#263d50' },
  'tokyo-night-day': { neutral: '#d5d6db', primary: '#d0dcf0', accent: '#e2d8f1', success: '#dbe3d4', warning: '#e9e1d4', danger: '#f0d8e1', info: '#d1e3ea' },
  dracula: { neutral: '#44475a', primary: '#3d334e', accent: '#493347', success: '#294435', warning: '#424332', danger: '#492f3a', info: '#2d414c' },
  nord: { neutral: '#434c5e', primary: '#344b59', accent: '#494355', success: '#3d4b46', warning: '#504c43', danger: '#4c3c4a', info: '#374959' },
};
