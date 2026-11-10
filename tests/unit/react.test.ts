import { act, createElement, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Button, Input } from '../../src/react';
import type { VInput } from '../../src/components/forms/input';
import { createComponent } from '../../src/utils/react';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => {
  await act(async () => { roots.splice(0).forEach((root) => root.unmount()); });
  document.body.replaceChildren();
});
function mount() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  return { root, container };
}

describe('React adapters', () => {
  it('upgrades real components, forwards refs, and delivers native input events', async () => {
    const { root, container } = mount();
    const ref = createRef<VInput>();
    let value = '';
    await act(async () => {
      root.render(createElement(Input, { ref, label: 'Name', value: 'Ada',
        onInput: (event) => { value = event.currentTarget.value; },
      }));
    });
    await act(async () => { await import('../../src/components/forms/input'); });
    expect(ref.current).toBe(container.querySelector('vui-input'));
    expect(ref.current?.value).toBe('Ada');
    ref.current!.value = 'Grace';
    ref.current!.dispatchEvent(new Event('input'));
    expect(value).toBe('Grace');
    await act(async () => { root.render(createElement(Input, { ref, value: 'Updated', disabled: true })); });
    expect(ref.current?.value).toBe('Updated');
    expect(ref.current?.disabled).toBe(true);
    await act(async () => { root.render(createElement(Input, { ref, value: undefined })); });
    expect(ref.current?.hasAttribute('value')).toBe(false);
    expect(ref.current?.value).not.toBe('undefined');
  });

  it('replaces listeners without duplicates and removes boolean attributes', async () => {
    const { root, container } = mount();
    let clicks = 0;
    const render = (disabled: boolean) => createElement(Button, {
      disabled, onClick: () => { clicks++; }, children: 'Save',
    });
    await act(async () => { root.render(render(true)); });
    await act(async () => { await import('../../src/components/actions/button'); });
    await act(async () => { root.render(render(false)); });
    const element = container.querySelector('vui-button')!;
    expect(element.hasAttribute('disabled')).toBe(false);
    element.dispatchEvent(new MouseEvent('click'));
    expect(clicks).toBe(1);
    await act(async () => { root.unmount(); roots.splice(roots.indexOf(root), 1); });
    element.dispatchEvent(new MouseEvent('click'));
    expect(clicks).toBe(1);
  });

  it('applies only the latest object props after delayed registration', async () => {
    const { root, container } = mount();
    let resolve!: () => void;
    const ready = new Promise<void>((done) => { resolve = done; });
    class Delayed extends HTMLElement { rows: string[] = []; }
    const DelayedComponent = createComponent<Delayed>('vui-react-delayed', () => ready);
    await act(async () => { root.render(createElement(DelayedComponent, { rows: ['old'] })); });
    await act(async () => { root.render(createElement(DelayedComponent, { rows: ['new'] })); });
    expect(container.innerHTML).not.toContain('rows=');
    await act(async () => { customElements.define('vui-react-delayed', Delayed); resolve(); await ready; });
    expect((container.firstElementChild as Delayed).rows).toEqual(['new']);
  });
});
