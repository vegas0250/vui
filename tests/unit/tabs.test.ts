import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/navigation/tabs';

describe('vui-tabs', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('selects a tab and shows the matching panel', async () => {
    const tabs = document.createElement('vui-tabs');
    tabs.innerHTML = `
      <vui-tab panel="one" selected>One</vui-tab>
      <vui-tab panel="two">Two</vui-tab>
      <vui-tab-panel name="one">First</vui-tab-panel>
      <vui-tab-panel name="two">Second</vui-tab-panel>
    `;
    document.body.append(tabs);
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    const panels = [...tabs.querySelectorAll('vui-tab-panel')];
    const tabButtons = [...tabs.querySelectorAll('vui-tab')];
    expect(panels[0]?.hasAttribute('hidden')).toBe(false);
    expect(panels[1]?.hasAttribute('hidden')).toBe(true);
    expect(tabButtons[0]?.getAttribute('role')).toBe('tab');
    expect(panels[0]?.getAttribute('role')).toBe('tabpanel');

    tabButtons[1]?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(tabButtons[1]?.getAttribute('aria-selected')).toBe('true');
    expect(panels[0]?.hasAttribute('hidden')).toBe(true);
    expect(panels[1]?.hasAttribute('hidden')).toBe(false);

    tabButtons[1]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }));
    expect(tabButtons[0]?.hasAttribute('selected')).toBe(true);
    expect(panels[0]?.hasAttribute('hidden')).toBe(false);
  });

  it('projects a tab appended after the strip is connected', async () => {
    const tabs = document.createElement('vui-tabs');
    document.body.append(tabs);
    const tab = document.createElement('vui-tab');
    tab.textContent = 'Домой';
    tabs.append(tab);
    await new Promise((resolve) => queueMicrotask(() => resolve(undefined)));

    expect(tab.getAttribute('slot')).toBe('tab');
    expect(tab.hasAttribute('selected')).toBe(true);
    expect(tabs.shadowRoot?.querySelector('slot[name="tab"]')?.assignedElements()).toContain(tab);
  });
});
