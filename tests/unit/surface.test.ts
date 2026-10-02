import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { VBreadcrumbs } from '../../src/components/navigation/breadcrumbs';
import { VPagination } from '../../src/components/navigation/pagination';
import { VPopover } from '../../src/components/overlay/popover';
import { VRadioGroup } from '../../src/components/forms/radio';
import { VShell } from '../../src/components/desktop/shell';
import { VTextarea } from '../../src/components/forms/textarea';
import { checkCompliance, contractFor } from '../../src/contract/index';
import type { ComponentContract } from '../../src/contract/index';
import { clearOverlays } from '../../src/core/overlay';
import '../../src/components/actions/button-group';
import '../../src/components/content/avatar';
import '../../src/components/content/badge';
import '../../src/components/content/separator';
import '../../src/components/feedback/progress';
import '../../src/components/feedback/skeleton';
import '../../src/components/feedback/spinner';
import '../../src/components/forms/radio';
import '../../src/components/layout/container';
import '../../src/components/layout/scroll-area';
import '../../src/components/navigation/breadcrumbs';
import '../../src/interaction/profiles';

const surface = [
  'vui-textarea',
  'vui-radio',
  'vui-radio-group',
  'vui-button-group',
  'vui-badge',
  'vui-avatar',
  'vui-separator',
  'vui-progress',
  'vui-spinner',
  'vui-skeleton',
  'vui-popover',
  'vui-breadcrumbs',
  'vui-pagination',
  'vui-scroll-area',
  'vui-container',
  'vui-shell',
];

describe('component surface', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
    document.documentElement.removeAttribute('dir');
  });

  it('passes compliance for the added vocabulary', () => {
    for (const name of surface) {
      const contract = contractFor(name);
      expect(contract, name).toBeTruthy();
      const element = document.createElement(name);
      document.body.append(element);
      expect(checkCompliance(element, contract as ComponentContract), name).toEqual([]);
    }
  });

  it('keeps a textarea value, hint, and invalid state on the native control', () => {
    const area = document.createElement('vui-textarea') as VTextarea;
    document.body.append(area);
    area.label = 'Notes';
    area.hint = 'Optional';
    area.invalid = true;
    area.value = 'Hello';
    const field = area.shadowRoot?.querySelector('textarea');
    expect(field?.value).toBe('Hello');
    expect(field?.getAttribute('aria-invalid')).toBe('true');
    expect(field?.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('moves radio selection with arrows inside the group', () => {
    const group = document.createElement('vui-radio-group') as VRadioGroup;
    group.label = 'Theme';
    group.name = 'theme';
    group.innerHTML = `
      <vui-radio value="light" checked>Light</vui-radio>
      <vui-radio value="dark">Dark</vui-radio>
    `;
    document.body.append(group);
    const [first, second] = [...group.querySelectorAll('vui-radio')];
    if (first instanceof HTMLElement) first.focus();
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(second?.hasAttribute('checked')).toBe(true);
    expect(first?.hasAttribute('checked')).toBe(false);
    expect(group.value).toBe('dark');
  });

  it('closes a popover from Escape and restores the open flag', () => {
    const popover = document.createElement('vui-popover') as VPopover;
    popover.label = 'Filters';
    popover.innerHTML = `<button type="button">Filters</button><div slot="panel">Body</div>`;
    document.body.append(popover);
    popover.show();
    expect(popover.open).toBe(true);
    expect(popover.shadowRoot?.querySelector('.panel')?.hasAttribute('hidden')).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(popover.open).toBe(false);
  });

  it('changes the pagination page from the next control', () => {
    const pager = document.createElement('vui-pagination') as VPagination;
    document.body.append(pager);
    pager.pages = 4;
    pager.page = 2;
    let page = 0;
    pager.addEventListener('change', () => {
      page = pager.page;
    });
    pager.shadowRoot?.querySelector<HTMLButtonElement>('[part="next"]')?.click();
    expect(page).toBe(3);
    expect(pager.shadowRoot?.querySelector('[aria-current="page"]')?.textContent).toBe('3');
  });

  it('names breadcrumbs and hides an empty shell region', () => {
    const crumbs = document.createElement('vui-breadcrumbs') as VBreadcrumbs;
    crumbs.label = 'Path';
    document.body.append(crumbs);
    expect(crumbs.shadowRoot?.querySelector('nav')?.getAttribute('aria-label')).toBe('Path');

    const shell = document.createElement('vui-shell') as VShell;
    shell.label = 'Studio';
    document.body.append(shell);
    expect(shell.shadowRoot?.querySelector('[part="header"]')?.classList.contains('hidden')).toBe(true);
    expect(shell.shadowRoot?.querySelector('main')).toBeTruthy();
    const shellSource = readFileSync(join(import.meta.dirname, '../../src/components/desktop/shell.ts'), 'utf8');
    const crumbSource = readFileSync(join(import.meta.dirname, '../../src/components/navigation/breadcrumbs.ts'), 'utf8');
    expect(shellSource).toContain('inset-inline-start');
    expect(shellSource).toContain('40rem');
    expect(crumbSource).toContain('border-inline-start');
  });
});
