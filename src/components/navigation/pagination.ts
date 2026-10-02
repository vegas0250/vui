import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { emitChange } from '../../core/events';
import { VuiElement } from '../../core/element';
import { reflectStrings } from '../../core/reflect';

export class VPagination extends VuiElement {
  declare label: string;

  static get observedAttributes(): string[] {
    return ['label', 'page', 'pages'];
  }

  get page(): number {
    const value = Number(this.getAttribute('page'));
    return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1;
  }

  set page(next: number) {
    const value = Number.isFinite(next) && next >= 1 ? Math.floor(next) : 1;
    this.setAttribute('page', String(value));
  }

  get pages(): number {
    const value = Number(this.getAttribute('pages'));
    return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1;
  }

  set pages(next: number) {
    const value = Number.isFinite(next) && next >= 1 ? Math.floor(next) : 1;
    this.setAttribute('pages', String(value));
  }

  protected template(): string {
    return `
      <nav part="nav">
        <button type="button" part="prev"></button>
        <div part="pages"></div>
        <button type="button" part="next"></button>
      </nav>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; }
      nav {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--vui-space-2xs);
        min-width: 0;
      }
      [part="pages"] { display: flex; flex-wrap: wrap; gap: var(--vui-space-2xs); min-width: 0; }
      button {
        appearance: none;
        min-height: var(--vui-size-control-sm);
        min-width: var(--vui-size-control-sm);
        padding-inline: var(--vui-space-xs);
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius-sm);
        background: var(--vui-color-surface);
        color: var(--vui-color-text);
        font: inherit;
        cursor: pointer;
      }
      button[aria-current="page"] {
        background: var(--vui-color-primary);
        color: var(--vui-color-on-primary);
        border-color: var(--vui-color-primary);
      }
      button:focus-visible { outline: var(--vui-focus-ring); outline-offset: var(--vui-focus-offset); }
      button:disabled { opacity: 0.55; cursor: not-allowed; }
    `;
  }

  protected afterRender(): void {
    this.qs('nav').addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement) || target.disabled) return;
      if (target.getAttribute('part') === 'prev') this.page -= 1;
      else if (target.getAttribute('part') === 'next') this.page += 1;
      else if (target.hasAttribute('data-page')) this.page = Number(target.dataset.page);
      else return;
      emitChange(this);
    });
  }

  protected sync(): void {
    const pages = this.pages;
    let page = this.page;
    if (page > pages) {
      page = pages;
      this.setAttribute('page', String(pages));
    }
    this.qs('nav').setAttribute('aria-label', this.getAttribute('label') || 'Pagination');
    const prev = this.qs<HTMLButtonElement>('[part="prev"]');
    const next = this.qs<HTMLButtonElement>('[part="next"]');
    prev.textContent = 'Previous';
    next.textContent = 'Next';
    prev.disabled = page <= 1;
    next.disabled = page >= pages;
    const list = this.qs('[part="pages"]');
    list.replaceChildren();
    for (const number of pageWindow(page, pages)) {
      if (number === null) {
        const gap = document.createElement('span');
        gap.textContent = '…';
        gap.setAttribute('aria-hidden', 'true');
        list.append(gap);
        continue;
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(number);
      button.setAttribute('data-page', String(number));
      button.setAttribute('aria-label', `Page ${number}`);
      if (number === page) button.setAttribute('aria-current', 'page');
      list.append(button);
    }
  }
}

function pageWindow(page: number, pages: number): Array<number | null> {
  if (pages <= 7) return Array.from({ length: pages }, (_item, index) => index + 1);
  const items: Array<number | null> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) items.push(null);
  for (let number = start; number <= end; number += 1) items.push(number);
  if (end < pages - 1) items.push(null);
  items.push(pages);
  return items;
}

reflectStrings(VPagination, ['label']);
defineElement('vui-pagination', VPagination);

registerContract({
  element: 'vui-pagination',
  className: 'VPagination',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'page', kind: 'number', reflected: true },
    { name: 'pages', kind: 'number', reflected: true },
  ],
  events: ['change'],
  slots: [],
  parts: ['nav', 'prev', 'next', 'pages'],
  methods: [],
  keyboard: ['Tab', 'Enter', 'Space'],
  states: [],
  responsive: 'flow',
  focus: 'native',
});
