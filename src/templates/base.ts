import type { VShell } from '../components/desktop/shell';

/** Shell attributes forwarded from every template host. */
export const templateShellAttributes = [
  'label',
  'nav-label',
  'aside-label',
  'skip-label',
  'resize-label',
  'aside-expand-label',
  'aside-collapse-label',
  'aside-resize-label',
  'collapsed',
  'aside-collapsed',
] as const;

export const templateHostStyles = `
  :host {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    min-width: 0;
    max-width: 100%;
    min-height: 0;
    height: 100%;
  }
  :host(:focus-visible) {
    outline: var(--vui-focus-ring);
    outline-offset: calc(var(--vui-focus-offset, 2px) * -1);
  }
  vui-shell {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    max-width: 100%;
  }
  vui-scroll-area,
  vui-split-panel,
  vui-container {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    max-width: 100%;
  }
`;

export function syncTemplateShell(host: HTMLElement, shell: VShell | null): void {
  if (!shell) return;
  for (const name of templateShellAttributes) {
    if (host.hasAttribute(name)) shell.setAttribute(name, host.getAttribute(name) ?? '');
    else shell.removeAttribute(name);
  }
}

export const templateShellContractAttributes = [
  { name: 'label', kind: 'string' as const, reflected: true },
  { name: 'nav-label', kind: 'string' as const, property: 'navLabel', reflected: true },
  { name: 'aside-label', kind: 'string' as const, property: 'asideLabel', reflected: true },
  { name: 'skip-label', kind: 'string' as const, property: 'skipLabel', reflected: true },
  { name: 'resize-label', kind: 'string' as const, property: 'resizeLabel', reflected: true },
  { name: 'aside-expand-label', kind: 'string' as const, property: 'asideExpandLabel', reflected: true },
  { name: 'aside-collapse-label', kind: 'string' as const, property: 'asideCollapseLabel', reflected: true },
  { name: 'aside-resize-label', kind: 'string' as const, property: 'asideResizeLabel', reflected: true },
  { name: 'collapsed', kind: 'boolean' as const, reflected: true },
  { name: 'aside-collapsed', kind: 'boolean' as const, property: 'asideCollapsed', reflected: true },
  { name: 'content-label', kind: 'string' as const, property: 'contentLabel', reflected: true },
];
