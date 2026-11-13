import { beforeEach, describe, expect, it } from 'vitest';
import { VTemplateDashboard } from '../../src/templates/dashboard';
import { VTemplateSettings } from '../../src/templates/settings';
import { VTemplateWorkspace } from '../../src/templates/workspace';
import { compositionForHost } from '../../src/composition';
import { listContracts } from '../../src/contract';

describe('templates', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('registers V* ↔ vui-template-* and contracts', () => {
    expect(customElements.get('vui-template-dashboard')).toBe(VTemplateDashboard);
    expect(customElements.get('vui-template-settings')).toBe(VTemplateSettings);
    expect(customElements.get('vui-template-workspace')).toBe(VTemplateWorkspace);
    const names = listContracts().map((contract) => contract.element);
    expect(names).toEqual(expect.arrayContaining([
      'vui-template-dashboard',
      'vui-template-settings',
      'vui-template-workspace',
    ]));
  });

  it('forwards shell regions and collapsed', () => {
    const host = document.createElement('vui-template-dashboard') as VTemplateDashboard;
    host.innerHTML = `
      <vui-toolbar slot="toolbar"><span>App</span></vui-toolbar>
      <vui-nav slot="nav"><vui-nav-item>Home</vui-nav-item></vui-nav>
      <p>Main</p>
      <vui-status-bar slot="footer">Ready</vui-status-bar>
    `;
    document.body.append(host);

    const shell = host.shadowRoot?.querySelector('vui-shell');
    expect(shell).toBeTruthy();
    expect(host.shadowRoot?.querySelector('vui-scroll-area')).toBeTruthy();

    host.setAttribute('label', 'Northwind');
    host.toggleAttribute('collapsed', true);
    expect(shell?.getAttribute('label')).toBe('Northwind');
    expect(shell?.hasAttribute('collapsed')).toBe(true);
  });

  it('settings wraps main in a small container', () => {
    const host = document.createElement('vui-template-settings');
    host.innerHTML = '<p>Profile</p>';
    document.body.append(host);
    expect(host.shadowRoot?.querySelector('vui-container[size="small"]')).toBeTruthy();
  });

  it('workspace maps editor and inspector into the split', () => {
    const host = document.createElement('vui-template-workspace');
    host.innerHTML = `
      <div slot="editor">code</div>
      <div slot="inspector">props</div>
    `;
    document.body.append(host);
    const split = host.shadowRoot?.querySelector('vui-split-panel');
    expect(split).toBeTruthy();
    expect(host.shadowRoot?.querySelector('slot[name="editor"]')?.getAttribute('slot')).toBe('start');
    expect(host.shadowRoot?.querySelector('slot[name="inspector"]')?.getAttribute('slot')).toBe('end');
  });

  it('registers composition contracts for each template', () => {
    expect(compositionForHost('vui-template-dashboard')?.id).toBe('template-dashboard');
    expect(compositionForHost('vui-template-settings')?.id).toBe('template-settings');
    expect(compositionForHost('vui-template-workspace')?.id).toBe('template-workspace');
  });
});
