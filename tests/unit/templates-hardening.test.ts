import { beforeEach, describe, expect, it } from 'vitest';
import { checkCompliance, remount } from '../../src/contract';
import { contractFor } from '../../src/contract/registry';
import '../../src/templates';
import type { VTemplateDashboard } from '../../src/templates/dashboard';
import type { VuiElement } from '../../src/utils/element';

function regionHidden(shell: Element, part: string): boolean {
  return shell.shadowRoot?.querySelector(`[part="${part}"]`)?.classList.contains('hidden') ?? false;
}

describe('templates hardening', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('hides empty shell regions through forwarded slots', () => {
    const host = document.createElement('vui-template-dashboard') as VTemplateDashboard;
    host.innerHTML = `<p>Only main</p>`;
    document.body.append(host);
    const shell = host.shadowRoot!.querySelector('vui-shell')!;
    expect(regionHidden(shell, 'header')).toBe(true);
    expect(regionHidden(shell, 'toolbar')).toBe(true);
    expect(regionHidden(shell, 'nav')).toBe(true);
    expect(regionHidden(shell, 'aside')).toBe(true);
    expect(regionHidden(shell, 'footer')).toBe(true);

    const toolbar = document.createElement('vui-toolbar');
    toolbar.slot = 'toolbar';
    toolbar.textContent = 'Bar';
    host.append(toolbar);
    shell.dispatchEvent(new Event('slotchange'));
    // Shell listens on its own slots; mutating light DOM of template fires template slot → shell slot.
    host.querySelector('vui-toolbar')?.dispatchEvent(new Event('slotchange', { bubbles: true }));
    // Force shell sync via attribute touch after assignment settles.
    host.setAttribute('label', 'App');
    expect(regionHidden(shell, 'toolbar')).toBe(false);
  });

  it('forwards aside-collapsed and content-label; remount keeps shadow', () => {
    const host = document.createElement('vui-template-dashboard') as VTemplateDashboard & VuiElement;
    host.innerHTML = `<div slot="aside">Side</div><p>Main</p>`;
    document.body.append(host);
    host.asideCollapsed = true;
    host.contentLabel = 'Overview';
    const shell = host.shadowRoot!.querySelector('vui-shell')!;
    const scroll = host.shadowRoot!.querySelector('vui-scroll-area')!;
    expect(shell.hasAttribute('aside-collapsed')).toBe(true);
    expect(scroll.getAttribute('label')).toBe('Overview');

    const before = host.shadowRoot;
    remount(host);
    expect(host.shadowRoot).toBe(before);
    expect(host.connectionCount).toBeGreaterThanOrEqual(2);
    expect(shell.hasAttribute('aside-collapsed')).toBe(true);
  });

  it('passes compliance for all three templates', () => {
    for (const tag of ['vui-template-dashboard', 'vui-template-settings', 'vui-template-workspace'] as const) {
      const element = document.createElement(tag);
      if (tag === 'vui-template-workspace') {
        element.innerHTML = `<div slot="editor">e</div><div slot="inspector">i</div>`;
      } else {
        element.innerHTML = `<p>content</p>`;
      }
      document.body.append(element);
      const contract = contractFor(tag)!;
      expect(checkCompliance(element, contract), tag).toEqual([]);
    }
  });

  it('wires main content through scroll-area (overflow covered in layout e2e)', () => {
    const host = document.createElement('vui-template-dashboard');
    host.innerHTML = `<div data-main>tall</div>`;
    document.body.append(host);
    const scroll = host.shadowRoot!.querySelector('vui-scroll-area')!;
    const slot = scroll.querySelector('slot:not([name])') as HTMLSlotElement;
    expect(slot.assignedElements().some((node) => node.matches('[data-main]'))).toBe(true);
  });

  it('workspace has no default slot; editor and inspector are assigned', () => {
    const host = document.createElement('vui-template-workspace');
    host.innerHTML = `<div slot="editor" data-ed>e</div><div slot="inspector" data-ins>i</div><div data-orphan>x</div>`;
    document.body.append(host);
    expect(host.shadowRoot!.querySelector('slot:not([name])')).toBeNull();
    const editor = host.shadowRoot!.querySelector('slot[name="editor"]') as HTMLSlotElement;
    const inspector = host.shadowRoot!.querySelector('slot[name="inspector"]') as HTMLSlotElement;
    expect(editor.assignedElements()[0]?.matches('[data-ed]')).toBe(true);
    expect(inspector.assignedElements()[0]?.matches('[data-ins]')).toBe(true);
  });
});
