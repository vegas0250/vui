import { beforeEach, describe, expect, it } from 'vitest';
import { checkCompliance, contractFor } from '../../src/contract/index';
import { VNav, VNavGroup, VNavItem } from '../../src/components/navigation/nav';
import '../../src/components/navigation/nav';

describe('vui-nav hierarchy', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('registers nav-group and keeps flat selection', () => {
    expect(customElements.get('vui-nav-group')).toBe(VNavGroup);
    const nav = document.createElement('vui-nav') as VNav;
    nav.innerHTML = `
      <vui-nav-item href="#a" selected>A</vui-nav-item>
      <vui-nav-item href="#b">B</vui-nav-item>
    `;
    document.body.append(nav);
    nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(nav.querySelector('[href="#b"]')?.hasAttribute('selected')).toBe(true);
    expect(nav.querySelector('[href="#a"]')?.hasAttribute('selected')).toBe(false);
  });

  it('collapses groups and nested branches with keyboard', () => {
    const nav = document.createElement('vui-nav') as VNav;
    nav.label = 'Tools';
    nav.innerHTML = `
      <vui-nav-group label="Generators" expanded>
        <vui-nav-item href="#password" selected>Password Generator</vui-nav-item>
        <vui-nav-item href="#link">Link Generator</vui-nav-item>
      </vui-nav-group>
      <vui-nav-group label="Libraries" expanded>
        <vui-nav-item label="JSON Tools" expanded>
          <vui-nav-item href="#format">Format</vui-nav-item>
        </vui-nav-item>
        <vui-nav-item href="#vui">VUI</vui-nav-item>
      </vui-nav-group>
    `;
    document.body.append(nav);

    const password = nav.querySelector('[href="#password"]') as VNavItem;
    const branch = nav.querySelector('[label="JSON Tools"]') as VNavItem;
    const group = nav.querySelector('vui-nav-group') as VNavGroup;

    expect(password.getAttribute('data-depth')).toBe('1');
    expect(branch.getAttribute('data-depth')).toBe('1');
    expect(nav.querySelector('[href="#format"]')?.getAttribute('data-depth')).toBe('2');

    branch.focus();
    nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(branch.hasAttribute('expanded')).toBe(false);
    expect(nav.querySelector('[href="#format"]')?.hasAttribute('data-current')).toBe(false);

    group.removeAttribute('expanded');
    nav.dispatchEvent(new Event('vui-nav-refresh', { bubbles: true }));
    password.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // collapsed first group hides its items from the tab order walk
    expect(group.hasAttribute('expanded')).toBe(false);
  });

  it('copies leaf text into the accessible label and supports icons', () => {
    const item = document.createElement('vui-nav-item') as VNavItem;
    item.setAttribute('icon', 'shield');
    item.textContent = 'Password Generator';
    document.body.append(item);
    const label = item.shadowRoot?.querySelector('[part="label"]');
    expect(label?.textContent).toBe('Password Generator');
    expect(item.shadowRoot?.querySelector('vui-icon')?.hasAttribute('hidden')).toBe(false);
  });

  it('passes compliance for nav hosts', () => {
    for (const tag of ['vui-nav', 'vui-nav-item', 'vui-nav-group'] as const) {
      const contract = contractFor(tag);
      expect(contract, tag).toBeTruthy();
      const element = document.createElement(tag);
      if (tag === 'vui-nav') {
        element.innerHTML = '<vui-nav-item selected>Home</vui-nav-item>';
      } else if (tag === 'vui-nav-group') {
        element.setAttribute('label', 'Tools');
        element.setAttribute('expanded', '');
        element.innerHTML = '<vui-nav-item href="#x">Item</vui-nav-item>';
      } else {
        element.textContent = 'Home';
      }
      document.body.append(element);
      expect(checkCompliance(element, contract!), tag).toEqual([]);
    }
  });
});
