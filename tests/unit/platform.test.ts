import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/index';
import { checkCompliance, listContracts } from '../../src/contract/index';
import { clearOverlays } from '../../src/core/overlay';
import { componentStates, listFamilies } from '../../src/families/index';
import type { VButton } from '../../src/components/actions/button';
import type { VToggleGroup } from '../../src/components/actions/toggle';
import type { VCheckboxGroup } from '../../src/components/forms/checkbox';
import type { VDrawer } from '../../src/components/overlay/drawer';
import type { VList } from '../../src/components/data/list';
import type { VNav } from '../../src/components/navigation/nav';
import type { VSlider } from '../../src/components/forms/slider';

const added = [
  'vui-text',
  'vui-link',
  'vui-kbd',
  'vui-chip',
  'vui-avatar-group',
  'vui-toggle',
  'vui-toggle-group',
  'vui-slider',
  'vui-field',
  'vui-field-group',
  'vui-checkbox-group',
  'vui-nav',
  'vui-nav-item',
  'vui-stepper',
  'vui-step',
  'vui-list',
  'vui-list-item',
  'vui-properties',
  'vui-property',
  'vui-empty',
  'vui-drawer',
  'vui-window',
  'vui-alert',
  'vui-icon-button',
];

describe('platform 1.0 vocabulary', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
  });

  it('registers the added elements and keeps one state vocabulary', () => {
    for (const name of added) expect(customElements.get(name), name).toBeTypeOf('function');
    expect(listFamilies().map((family) => family.name)).toEqual(
      expect.arrayContaining(['action', 'field', 'overlay', 'navigation', 'data', 'feedback', 'layout', 'content', 'desktop']),
    );
    expect(componentStates).toContain('loading');
    expect(componentStates).toContain('pressed');
    expect(componentStates).toContain('invalid');
  });

  it('checks compliance for every newly contracted element', () => {
    const contracts = listContracts().filter((contract) => added.includes(contract.element));
    expect(contracts.map((contract) => contract.element).sort()).toEqual([...added].sort());
    for (const contract of contracts) {
      const element = document.createElement(contract.element);
      document.body.append(element);
      expect(checkCompliance(element, contract), contract.element).toEqual([]);
    }
  });

  it('marks a loading button busy and blocks activation', () => {
    const button = document.createElement('vui-button') as VButton;
    button.textContent = 'Save';
    button.loading = true;
    document.body.append(button);
    const native = button.shadowRoot?.querySelector('button');
    expect(native?.getAttribute('aria-busy')).toBe('true');
    expect(native?.disabled).toBe(true);
    expect(button.shadowRoot?.querySelector('[part="busy"]')?.hasAttribute('hidden')).toBe(false);
  });

  it('selects one toggle and keeps a range on the slider', () => {
    const group = document.createElement('vui-toggle-group') as VToggleGroup;
    group.innerHTML = `
      <vui-toggle value="left">Left</vui-toggle>
      <vui-toggle value="right">Right</vui-toggle>
    `;
    document.body.append(group);
    const right = group.querySelector('[value="right"]');
    right?.shadowRoot?.querySelector('button')?.click();
    expect(group.getAttribute('value')).toBe('right');
    expect(group.querySelector('[value="left"]')?.hasAttribute('pressed')).toBe(false);

    const slider = document.createElement('vui-slider') as VSlider;
    slider.label = 'Span';
    slider.value = '20';
    slider.valueEnd = '80';
    document.body.append(slider);
    const end = slider.shadowRoot?.querySelector('[part="end"]');
    expect(end).toBeInstanceOf(HTMLInputElement);
    expect((end as HTMLInputElement).hidden).toBe(false);
    expect(slider.shadowRoot?.querySelector('[part="input"]')?.getAttribute('aria-invalid')).toBe('false');
    expect((slider.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement).value).toBe('20');
    expect((slider.shadowRoot?.querySelector('[part="end"]') as HTMLInputElement).value).toBe('80');
  });

  it('collects checkbox values and moves nav selection with the keyboard', () => {
    const boxes = document.createElement('vui-checkbox-group') as VCheckboxGroup;
    boxes.innerHTML = `
      <vui-checkbox value="a">A</vui-checkbox>
      <vui-checkbox value="b">B</vui-checkbox>
    `;
    document.body.append(boxes);
    boxes.querySelector('[value="a"]')?.shadowRoot?.querySelector('input')?.click();
    boxes.querySelector('[value="b"]')?.shadowRoot?.querySelector('input')?.click();
    expect(boxes.getAttribute('value')).toBe('a,b');

    const nav = document.createElement('vui-nav') as VNav;
    nav.label = 'Main';
    nav.innerHTML = `
      <vui-nav-item value="home" href="#home">Home</vui-nav-item>
      <vui-nav-item value="settings" href="#settings">Settings</vui-nav-item>
    `;
    document.body.append(nav);
    nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(nav.querySelectorAll('[selected]')).toHaveLength(1);
    expect(nav.querySelector('[href="#settings"]')?.hasAttribute('selected')).toBe(true);
  });

  it('selects a list range and closes a drawer', () => {
    const list = document.createElement('vui-list') as VList;
    list.multiple = true;
    list.innerHTML = `
      <vui-list-item value="a">A</vui-list-item>
      <vui-list-item value="b">B</vui-list-item>
      <vui-list-item value="c">C</vui-list-item>
    `;
    document.body.append(list);
    const items = [...list.querySelectorAll('vui-list-item')];
    items[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    items[2]?.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    expect(list.getAttribute('value')).toBe('a,b,c');

    const drawer = document.createElement('vui-drawer') as VDrawer;
    drawer.label = 'Filters';
    document.body.append(drawer);
    drawer.show();
    expect(drawer.open).toBe(true);
    drawer.close();
    expect(drawer.open).toBe(false);
  });

  it('mounts and removes a long list without leaving overlays', () => {
    const list = document.createElement('vui-list') as VList;
    list.label = 'Many';
    const items = Array.from({ length: 100 }, (_item, index) => `<vui-list-item value="${index}">Item ${index}</vui-list-item>`);
    list.innerHTML = items.join('');
    document.body.append(list);
    expect(list.querySelectorAll('vui-list-item')).toHaveLength(100);
    list.remove();
    expect(list.isConnected).toBe(false);
  });
});
