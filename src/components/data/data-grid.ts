import '../foundation/icon';
import { reportDeveloper } from '../../core/dev';
import { defineElement } from '../../core/define';
import { registerContract } from '../../contract/registry';
import { VuiElement } from '../../core/element';
import { emitChange } from '../../core/events';
import { reflectBooleans, reflectStrings } from '../../core/reflect';
import { containerBand, observeInlineSize } from '../../foundation/responsive';
import { copyText } from '../../interaction/clipboard';
import { applyRovingTabIndex, isRtl, moveInList, stepIndex } from '../../interaction/keyboard';
import { SelectionModel, type SelectionGesture } from '../../interaction/selection';

export interface VDataGridColumn {
  key: string;
  title: string;
  width?: string;
  align?: 'start' | 'center' | 'end';
  /** Secondary columns stay in the grid and hide when the container is at or below `--vui-layout-medium`. */
  priority?: 'primary' | 'secondary';
  /** Row field whose value is a VUI icon name, drawn before the cell text. */
  iconKey?: string;
}

export interface VDataGridRow {
  id: string;
  [key: string]: string;
}

/** Rows at or above this count are windowed. Smaller grids stay fully in the DOM. */
const VIRTUAL_MIN_ROWS = 100;
const OVERSCAN = 8;
const FALLBACK_ROW_PX = 36;
const FALLBACK_VIEWPORT_ROWS = 32;

function safeWidth(width: string | undefined): string | null {
  if (!width) return null;
  if (/^(\d+(\.\d+)?)(px|rem|em|%)$/.test(width)) return width;
  reportDeveloper('attribute', `vui-data-grid ignores column width "${width}". Expected px, rem, em, or %.`);
  return null;
}

export class VDataGrid extends VuiElement {
  declare label: string;
  declare emptyLabel: string;
  declare multiple: boolean;
  declare fill: boolean;

  static get observedAttributes(): string[] {
    return ['label', 'empty-label', 'selected', 'multiple', 'fill'];
  }

  private gridColumns: VDataGridColumn[] = [];
  private gridRows: VDataGridRow[] = [];
  private activeRow = 0;
  private activeCol = 0;
  private readonly selection = new SelectionModel<string>('single');
  /** Mirrors `selected` so a repaint does not collapse a multi-selection back to one id. */
  private ownedSelected = '';
  private windowStart = -1;
  private scrollIndex = 0;
  private selectionKey = '';

  get columns(): VDataGridColumn[] {
    return this.gridColumns;
  }

  set columns(value: VDataGridColumn[]) {
    this.gridColumns = value.map((column) => ({ ...column }));
    this.renderGrid();
  }

  get rows(): VDataGridRow[] {
    return this.gridRows;
  }

  set rows(value: VDataGridRow[]) {
    this.gridRows = value.map((row) => ({ ...row }));
    this.windowStart = -1;
    this.renderGrid();
  }

  get selectedId(): string {
    return this.getAttribute('selected') ?? '';
  }

  set selectedId(value: string) {
    this.setAttribute('selected', value);
  }

  /** Selected row ids. Not an attribute: ids may contain commas. `change` is not fired by this setter. */
  get selectedIds(): string[] {
    return [...this.selection.selected];
  }

  set selectedIds(ids: readonly string[]) {
    this.selection.setMode(this.hasAttribute('multiple') ? 'multiple' : 'single');
    this.selection.setOrder(this.gridRows.map((row) => row.id));
    this.selection.clear();
    const gesture: SelectionGesture = this.hasAttribute('multiple') ? 'toggle' : 'replace';
    for (const id of ids) {
      if (this.gridRows.some((row) => row.id === id)) this.selection.select(id, gesture);
    }
    const active = this.selection.active ?? '';
    const index = this.gridRows.findIndex((row) => row.id === active);
    if (index >= 0) this.activeRow = index;
    this.writeSelected(active);
    this.reveal(this.activeRow);
    this.renderBody();
    this.applyCursor();
  }

  protected template(): string {
    return `
      <div class="frame" part="frame">
        <table class="grid" role="grid">
          <thead></thead>
          <tbody></tbody>
        </table>
      </div>
    `;
  }

  protected componentStyles(): string {
    return `
      :host { display: block; min-width: 0; max-width: 100%; min-height: 0; }
      :host([fill]) {
        display: flex;
        flex-direction: column;
        height: 100%;
        max-height: 100%;
      }
      .frame {
        width: 100%;
        min-width: 0;
        overflow: auto;
        max-width: 100%;
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
        background: var(--vui-color-surface);
      }
      :host([fill]) .frame {
        flex: 1 1 auto;
        min-height: 0;
        height: auto;
      }
      table {
        width: 100%;
        min-width: max-content;
        border-collapse: collapse;
        font: inherit;
      }
      th, td {
        height: var(--vui-row-height);
        min-width: var(--vui-column-min);
        padding-inline: var(--vui-space-sm);
        border-bottom: var(--vui-border-width) solid var(--vui-color-border);
        text-align: start;
        white-space: nowrap;
      }
      th {
        position: sticky;
        top: 0;
        z-index: 1;
        background: var(--vui-color-surface-sunken);
        color: var(--vui-color-text-muted);
        font-size: var(--vui-font-size-sm);
        font-weight: var(--vui-font-weight-strong);
      }
      tbody tr:last-child td { border-bottom: 0; }
      tbody tr[aria-selected="true"] { background: var(--vui-color-surface-hover); }
      td:focus-visible {
        outline: var(--vui-focus-ring);
        outline-offset: calc(var(--vui-focus-offset) * -1);
      }
      .empty {
        text-align: center;
        color: var(--vui-color-text-muted);
        padding: var(--vui-space-lg);
      }
      .align-center { text-align: center; }
      .align-end { text-align: end; }
      .with-icon {
        display: inline-flex;
        align-items: center;
        gap: var(--vui-space-xs);
        min-width: 0;
        max-width: 100%;
      }
      .with-icon vui-icon { width: var(--vui-icon-size); height: var(--vui-icon-size); color: var(--vui-color-primary); }
      .pad td {
        height: 0;
        min-height: 0;
        padding: 0;
        border: 0;
        line-height: 0;
      }
    `;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.watchSize();
  }

  private watchSize(): void {
    this.hold(
      'size',
      observeInlineSize(this, (width) => {
        if (!(width > 0)) return;
        const compact = containerBand(width, this) !== 'wide';
        if (this.hasAttribute('data-compact') === compact) return;
        this.toggleAttribute('data-compact', compact);
        this.renderGrid();
      }),
    );
    const frame = this.qs<HTMLElement>('.frame');
    this.bind('scroll', frame, 'scroll', () => this.onFrameScroll());
    this.hold(
      'frame',
      observeInlineSize(frame, () => {
        if (!this.usesVirtual()) return;
        const next = this.slice().start;
        if (next === this.windowStart) return;
        this.renderBody();
      }),
    );
  }

  protected afterRender(): void {
    this.addEventListener('click', (event) => {
      const path = event.composedPath();
      const row = path.find((node): node is HTMLTableRowElement => node instanceof HTMLTableRowElement && Boolean(node.dataset.id));
      if (!row) return;
      const cell = path.find((node): node is HTMLElement => node instanceof HTMLElement && node.getAttribute('role') === 'gridcell');
      if (cell) {
        this.activeRow = Number(cell.dataset.row ?? 0);
        this.activeCol = Number(cell.dataset.col ?? 0);
      } else {
        this.activeRow = Number(row.dataset.row ?? 0);
      }
      const id = row.dataset.id ?? '';
      this.selection.setOrder(this.gridRows.map((item) => item.id));
      this.selection.select(id, this.pointerGesture(event));
      this.commitSelection();
    });
    this.addEventListener('keydown', (event) => this.onKeydown(event));
    this.renderGrid();
  }

  protected sync(): void {
    const grid = this.shadow.querySelector('[role="grid"]');
    grid?.setAttribute('aria-label', this.getAttribute('label') ?? 'Data grid');
    grid?.setAttribute('aria-rowcount', String(this.gridRows.length + 1));
    grid?.setAttribute('aria-colcount', String(this.gridColumns.filter((_, index) => this.columnVisible(index)).length));
    grid?.setAttribute('aria-multiselectable', this.hasAttribute('multiple') ? 'true' : 'false');
    this.paintSelection();
  }

  /** Selection and labels update in place. A full rebuild runs only when the rendered window changed. */
  private paintSelection(): void {
    const body = this.shadow.querySelector('tbody');
    if (!body) return;
    this.syncSelection();
    this.reveal(this.activeRow);
    const rows = [...body.querySelectorAll<HTMLTableRowElement>('tr[data-id]')];
    const { start, end } = this.slice();
    const expected = this.gridRows.length === 0 ? 0 : end - start;
    if (rows.length !== expected || start !== this.windowStart) {
      this.renderGrid();
      return;
    }
    this.paintRenderedSelection();
    const empty = body.querySelector('.empty');
    if (empty) empty.textContent = this.getAttribute('empty-label') ?? 'No data';
    if (rows.length) this.applyCursor();
  }

  private syncSelection(): void {
    this.selection.setMode(this.hasAttribute('multiple') ? 'multiple' : 'single');
    this.selection.setOrder(this.gridRows.map((row) => row.id));
    const incoming = this.getAttribute('selected') ?? '';
    if (incoming === this.ownedSelected) {
      if (incoming && !this.gridRows.some((row) => row.id === incoming) && !this.selection.selected.length) {
        this.ownedSelected = '';
      }
      this.selectionKey = this.selection.selected.join('\0');
      return;
    }
    this.ownedSelected = incoming;
    if (incoming && this.gridRows.some((row) => row.id === incoming)) {
      this.selection.select(incoming, 'replace');
      const index = this.gridRows.findIndex((row) => row.id === incoming);
      if (index >= 0) this.activeRow = index;
    } else {
      this.selection.clear();
    }
    this.selectionKey = this.selection.selected.join('\0');
  }

  private renderGrid(): void {
    const table = this.shadow.querySelector('table');
    const head = table?.querySelector('thead');
    if (!table || !head) return;

    const headerRow = document.createElement('tr');
    headerRow.setAttribute('role', 'row');
    for (const [index, column] of this.gridColumns.entries()) {
      const cell = document.createElement('th');
      cell.setAttribute('role', 'columnheader');
      cell.setAttribute('scope', 'col');
      cell.textContent = column.title;
      cell.setAttribute('aria-colindex', String(index + 1));
      const width = safeWidth(column.width);
      if (width) cell.style.width = width;
      if (column.align) cell.classList.add(`align-${column.align}`);
      this.markPriority(cell, column);
      headerRow.append(cell);
    }
    table.setAttribute(
      'aria-colcount',
      String(this.gridColumns.filter((_, index) => this.columnVisible(index)).length),
    );
    table.setAttribute('aria-rowcount', String(this.gridRows.length + 1));
    table.setAttribute('aria-multiselectable', this.hasAttribute('multiple') ? 'true' : 'false');
    head.replaceChildren(headerRow);
    this.syncSelection();
    this.windowStart = -1;
    this.renderBody();
  }

  private renderBody(): void {
    const body = this.shadow.querySelector('tbody');
    if (!body) return;
    body.replaceChildren();
    if (!this.gridRows.length) {
      this.windowStart = 0;
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = Math.max(1, this.gridColumns.length);
      cell.className = 'empty';
      cell.textContent = this.getAttribute('empty-label') ?? 'No data';
      row.append(cell);
      body.append(row);
      return;
    }

    const { start, end } = this.slice();
    this.windowStart = start;
    const stride = this.rowStride();
    if (this.usesVirtual() && start > 0) body.append(this.padRow(start * stride));
    for (let rowIndex = start; rowIndex < end; rowIndex += 1) {
      const data = this.gridRows[rowIndex];
      if (!data) continue;
      body.append(this.renderRow(data, rowIndex));
    }
    if (this.usesVirtual() && end < this.gridRows.length) body.append(this.padRow((this.gridRows.length - end) * stride));
    this.applyCursor();
  }

  private renderRow(data: VDataGridRow, rowIndex: number): HTMLTableRowElement {
    const row = document.createElement('tr');
    row.setAttribute('role', 'row');
    row.dataset.id = data.id;
    row.dataset.row = String(rowIndex);
    row.setAttribute('aria-rowindex', String(rowIndex + 2));
    row.setAttribute('aria-selected', this.selection.isSelected(data.id) ? 'true' : 'false');
    this.gridColumns.forEach((column, colIndex) => {
      const cell = document.createElement('td');
      cell.setAttribute('role', 'gridcell');
      cell.tabIndex = -1;
      cell.dataset.row = String(rowIndex);
      cell.dataset.col = String(colIndex);
      const text = data[column.key] ?? '';
      if (column.iconKey) {
        const lead = document.createElement('span');
        lead.className = 'with-icon';
        const icon = document.createElement('vui-icon');
        icon.setAttribute('name', data[column.iconKey] || 'file');
        const label = document.createElement('span');
        label.textContent = text;
        lead.append(icon, label);
        cell.append(lead);
      } else {
        cell.textContent = text;
      }
      if (column.align) cell.classList.add(`align-${column.align}`);
      this.markPriority(cell, column);
      row.append(cell);
    });
    return row;
  }

  private padRow(height: number): HTMLTableRowElement {
    const row = document.createElement('tr');
    row.className = 'pad';
    row.setAttribute('aria-hidden', 'true');
    const cell = document.createElement('td');
    cell.colSpan = Math.max(1, this.gridColumns.length);
    const px = `${Math.max(0, Math.round(height))}px`;
    row.style.height = px;
    cell.style.height = px;
    row.append(cell);
    return row;
  }

  private usesVirtual(): boolean {
    return this.gridRows.length >= VIRTUAL_MIN_ROWS;
  }

  private rowStride(): number {
    const sample = this.shadow.querySelector<HTMLElement>('tr[data-id]');
    const measured = sample?.getBoundingClientRect().height ?? 0;
    if (measured > 0) return measured;
    const token = Number.parseFloat(getComputedStyle(this).getPropertyValue('--vui-row-height'));
    return Number.isFinite(token) && token > 0 ? token : FALLBACK_ROW_PX;
  }

  private scrollportBounded(): boolean {
    const frame = this.qs<HTMLElement>('.frame');
    const height = frame.clientHeight;
    return height > 0 && height + 1 < this.gridRows.length * this.rowStride();
  }

  private viewportRows(): number {
    if (!this.scrollportBounded()) return Math.min(this.gridRows.length, FALLBACK_VIEWPORT_ROWS);
    const frame = this.qs<HTMLElement>('.frame');
    return Math.max(1, Math.ceil(frame.clientHeight / this.rowStride()));
  }

  private currentStart(): number {
    if (!this.usesVirtual()) return 0;
    if (!this.scrollportBounded()) return this.scrollIndex;
    const frame = this.qs<HTMLElement>('.frame');
    return Math.min(Math.max(0, this.gridRows.length - 1), Math.floor(frame.scrollTop / this.rowStride()));
  }

  private slice(): { start: number; end: number } {
    if (!this.usesVirtual()) return { start: 0, end: this.gridRows.length };
    const view = this.viewportRows();
    const origin = this.currentStart();
    const start = Math.max(0, origin - OVERSCAN);
    const end = Math.min(this.gridRows.length, origin + view + OVERSCAN);
    return { start, end };
  }

  private reveal(index: number): void {
    if (!this.usesVirtual() || index < 0 || index >= this.gridRows.length) return;
    const view = this.viewportRows();
    const origin = this.currentStart();
    if (index >= origin && index < origin + view) return;
    const next = Math.max(0, Math.min(index - Math.floor(view / 2), Math.max(0, this.gridRows.length - view)));
    this.scrollIndex = next;
    const frame = this.qs<HTMLElement>('.frame');
    frame.scrollTop = next * this.rowStride();
  }

  private onFrameScroll(): void {
    if (!this.usesVirtual()) return;
    if (this.scrollportBounded()) {
      this.scrollIndex = Math.floor(this.qs<HTMLElement>('.frame').scrollTop / this.rowStride());
    }
    const start = this.slice().start;
    if (start === this.windowStart) return;
    this.renderBody();
  }

  private paintRenderedSelection(): void {
    const selected = new Set(this.selection.selected);
    for (const row of this.shadow.querySelectorAll<HTMLTableRowElement>('tr[data-id]')) {
      row.setAttribute('aria-selected', selected.has(row.dataset.id ?? '') ? 'true' : 'false');
    }
  }

  private get compact(): boolean {
    return this.hasAttribute('data-compact');
  }

  private columnVisible(index: number): boolean {
    const column = this.gridColumns[index];
    if (!column) return false;
    return !(this.compact && column.priority === 'secondary');
  }

  private markPriority(cell: HTMLElement, column: VDataGridColumn): void {
    const hidden = this.compact && column.priority === 'secondary';
    cell.classList.toggle('priority-secondary', column.priority === 'secondary');
    cell.hidden = hidden;
    cell.toggleAttribute('aria-hidden', hidden);
  }

  private firstVisibleColumn(): number {
    const index = this.gridColumns.findIndex((_, column) => this.columnVisible(column));
    return index < 0 ? 0 : index;
  }

  private lastVisibleColumn(): number {
    for (let index = this.gridColumns.length - 1; index >= 0; index -= 1) {
      if (this.columnVisible(index)) return index;
    }
    return 0;
  }

  private stepColumn(from: number, delta: number): number {
    return stepIndex(from, delta, this.gridColumns.length, (index) => this.columnVisible(index));
  }

  private applyCursor(): void {
    const cells = [...this.shadow.querySelectorAll<HTMLElement>('[role="gridcell"]')];
    this.activeRow = Math.min(this.activeRow, Math.max(0, this.gridRows.length - 1));
    this.activeCol = this.stepColumn(Math.min(this.activeCol, Math.max(0, this.gridColumns.length - 1)), 0);
    const active = cells.find(
      (cell) => Number(cell.dataset.row) === this.activeRow && Number(cell.dataset.col) === this.activeCol,
    );
    applyRovingTabIndex(cells, active ? cells.indexOf(active) : -1);
    if (this.scrollportBounded()) active?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }

  private pointerGesture(event: MouseEvent): SelectionGesture {
    if (!this.hasAttribute('multiple')) return 'replace';
    if (event.shiftKey) return 'range';
    if (event.metaKey || event.ctrlKey) return 'toggle';
    return 'replace';
  }

  private writeSelected(id: string): void {
    this.ownedSelected = id;
    if ((this.getAttribute('selected') ?? '') !== id) this.setAttribute('selected', id);
  }

  private commitSelection(): void {
    const active = this.gridRows[this.activeRow]?.id ?? this.selection.active ?? '';
    const nextIds = this.selection.selected.join('\0');
    const changed = nextIds !== this.selectionKey;
    this.selectionKey = nextIds;
    this.writeSelected(active);
    this.reveal(this.activeRow);
    const { start, end } = this.slice();
    const rendered = this.shadow.querySelectorAll('tr[data-id]').length;
    if (this.windowStart !== start || rendered !== end - start) this.renderBody();
    else this.paintRenderedSelection();
    this.applyCursor();
    this.shadow.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus();
    if (changed) emitChange(this);
  }

  private moveCursor(next: number, gesture: SelectionGesture | 'cursor'): void {
    this.activeRow = next;
    const row = this.gridRows[this.activeRow];
    if (!row) return;
    this.selection.setOrder(this.gridRows.map((item) => item.id));
    if (gesture === 'cursor') {
      this.selection.setActive(row.id);
      this.reveal(this.activeRow);
      this.renderBody();
      this.applyCursor();
      this.shadow.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus();
      return;
    }
    this.selection.select(row.id, gesture);
    this.commitSelection();
  }

  private onKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c' && !event.altKey && !event.shiftKey) {
      const row = this.gridRows[this.activeRow];
      const column = this.gridColumns[this.activeCol];
      if (!row || !column || !this.columnVisible(this.activeCol)) return;
      event.preventDefault();
      void copyText(row[column.key] ?? '');
      return;
    }
    if (event.key === ' ' && this.hasAttribute('multiple') && (event.ctrlKey || event.metaKey) && !event.altKey) {
      const row = this.gridRows[this.activeRow];
      if (!row) return;
      event.preventDefault();
      this.selection.setOrder(this.gridRows.map((item) => item.id));
      this.selection.select(row.id, 'toggle');
      this.commitSelection();
      return;
    }
    const key = event.key;
    if (!this.gridRows.length || !this.gridColumns.length) return;
    if (key === 'ArrowUp' || key === 'ArrowDown' || key === 'PageUp' || key === 'PageDown') {
      const next = moveInList(this.activeRow, this.gridRows.length, key, { orientation: 'vertical', pageSize: this.viewportRows() });
      if (next === null) return;
      event.preventDefault();
      const gesture: SelectionGesture | 'cursor' =
        this.hasAttribute('multiple') && event.shiftKey
          ? 'range'
          : this.hasAttribute('multiple') && (event.metaKey || event.ctrlKey)
            ? 'cursor'
            : 'replace';
      this.moveCursor(next, gesture);
      return;
    }
    if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'Home' || key === 'End') {
      event.preventDefault();
      if (key === 'Home') this.activeCol = this.firstVisibleColumn();
      else if (key === 'End') this.activeCol = this.lastVisibleColumn();
      else {
        const forward = key === 'ArrowRight';
        this.activeCol = this.stepColumn(this.activeCol, forward !== isRtl(this) ? 1 : -1);
      }
      if (this.hasAttribute('multiple')) {
        this.applyCursor();
        this.shadow.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus();
        return;
      }
      this.moveCursor(this.activeRow, 'replace');
    }
  }
}

reflectStrings(VDataGrid, { label: 'label', emptyLabel: 'empty-label' });
reflectBooleans(VDataGrid, ['multiple', 'fill']);
defineElement('vui-data-grid', VDataGrid);

registerContract({
  element: 'vui-data-grid',
  className: 'VDataGrid',
  attributes: [
    { name: 'label', kind: 'string', reflected: true },
    { name: 'empty-label', kind: 'string', reflected: true },
    { name: 'selected', property: 'selectedId', kind: 'string', reflected: true },
    { name: 'multiple', kind: 'boolean', reflected: true },
    { name: 'fill', kind: 'boolean', reflected: true },
  ],
  events: ['change'],
  slots: [],
  parts: ['frame'],
  methods: [],
  keyboard: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'],
  states: [],
  responsive: 'container',
  focus: 'native',
  role: 'grid',
});
