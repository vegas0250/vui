import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { emitChange } from '../../core/events';
import { inlineThreshold, observeInlineSize } from '../../core/responsive';

export interface VDataGridColumn {
  key: string;
  title: string;
  width?: string;
  align?: 'start' | 'center' | 'end';
  /** Secondary columns stay in the grid and hide when the container is at or below `--vui-layout-medium`. */
  priority?: 'primary' | 'secondary';
}

export interface VDataGridRow {
  id: string;
  [key: string]: string;
}

function safeWidth(width: string | undefined): string | null {
  if (!width) return null;
  return /^(\d+(\.\d+)?)(px|rem|em|%)$/.test(width) ? width : null;
}

export class VDataGrid extends VuiElement {
  static get observedAttributes(): string[] {
    return ['label', 'empty-label', 'selected'];
  }

  private gridColumns: VDataGridColumn[] = [];
  private gridRows: VDataGridRow[] = [];
  private activeRow = 0;
  private activeCol = 0;
  private stopWatch: (() => void) | null = null;

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
    this.renderGrid();
  }

  get selectedId(): string {
    return this.getAttribute('selected') ?? '';
  }

  set selectedId(value: string) {
    this.setAttribute('selected', value);
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
      :host { display: block; min-width: 0; max-width: 100%; }
      .frame {
        width: 100%;
        min-width: 0;
        overflow: auto;
        max-width: 100%;
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
        background: var(--vui-color-surface);
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
      td:focus {
        outline: var(--vui-focus-ring);
        outline-offset: -2px;
      }
      .empty {
        text-align: center;
        color: var(--vui-color-text-muted);
        padding: var(--vui-space-lg);
      }
      .align-center { text-align: center; }
      .align-end { text-align: end; }
    `;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.watchSize();
  }

  disconnectedCallback(): void {
    this.stopWatch?.();
    this.stopWatch = null;
  }

  private watchSize(): void {
    this.stopWatch?.();
    this.stopWatch = observeInlineSize(this, (width) => {
      if (width <= 0) return;
      const limit = inlineThreshold(this, '--vui-layout-medium', 640);
      const compact = width <= limit;
      if (this.hasAttribute('data-compact') === compact) return;
      this.toggleAttribute('data-compact', compact);
      this.renderGrid();
    });
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
      }
      const id = row.dataset.id ?? '';
      if (id === this.selectedId) {
        this.applyCursor();
        return;
      }
      this.selectedId = id;
      emitChange(this);
    });
    this.addEventListener('keydown', (event) => this.onKeydown(event));
    this.renderGrid();
  }

  protected sync(): void {
    const grid = this.shadow.querySelector('[role="grid"]');
    grid?.setAttribute('aria-label', this.getAttribute('label') ?? 'Data grid');
    grid?.setAttribute('aria-rowcount', String(this.gridRows.length + 1));
    grid?.setAttribute('aria-colcount', String(this.gridColumns.length));
    this.renderGrid();
  }

  private renderGrid(): void {
    const table = this.shadow.querySelector('table');
    const head = table?.querySelector('thead');
    const body = table?.querySelector('tbody');
    if (!table || !head || !body) return;

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
    head.replaceChildren(headerRow);
    body.replaceChildren();

    if (!this.gridRows.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = Math.max(1, this.gridColumns.length);
      cell.className = 'empty';
      cell.textContent = this.getAttribute('empty-label') ?? 'No data';
      row.append(cell);
      body.append(row);
      return;
    }

    this.gridRows.forEach((data, rowIndex) => {
      const row = document.createElement('tr');
      row.setAttribute('role', 'row');
      row.dataset.id = data.id;
      row.setAttribute('aria-rowindex', String(rowIndex + 2));
      row.setAttribute('aria-selected', data.id === this.selectedId ? 'true' : 'false');
      this.gridColumns.forEach((column, colIndex) => {
        const cell = document.createElement('td');
        cell.setAttribute('role', 'gridcell');
        cell.tabIndex = -1;
        cell.dataset.row = String(rowIndex);
        cell.dataset.col = String(colIndex);
        cell.textContent = data[column.key] ?? '';
        if (column.align) cell.classList.add(`align-${column.align}`);
        this.markPriority(cell, column);
        row.append(cell);
      });
      body.append(row);
    });
    this.applyCursor();
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
    if (delta === 0) return this.columnVisible(from) ? from : this.firstVisibleColumn();
    let index = from;
    for (let step = 0; step < this.gridColumns.length; step += 1) {
      index += delta;
      if (index < 0 || index >= this.gridColumns.length) return from;
      if (this.columnVisible(index)) return index;
    }
    return from;
  }

  private applyCursor(): void {
    const cells = [...this.shadow.querySelectorAll<HTMLElement>('[role="gridcell"]')];
    for (const cell of cells) cell.tabIndex = -1;
    this.activeRow = Math.min(this.activeRow, Math.max(0, this.gridRows.length - 1));
    this.activeCol = this.stepColumn(Math.min(this.activeCol, Math.max(0, this.gridColumns.length - 1)), 0);
    const active = cells.find(
      (cell) => Number(cell.dataset.row) === this.activeRow && Number(cell.dataset.col) === this.activeCol,
    );
    if (active) {
      active.tabIndex = 0;
      active.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
  }

  private move(rowDelta: number, colDelta: number, edge?: 'start' | 'end'): void {
    if (!this.gridRows.length || !this.gridColumns.length) return;
    this.activeRow = Math.min(this.gridRows.length - 1, Math.max(0, this.activeRow + rowDelta));
    if (edge === 'start') this.activeCol = this.firstVisibleColumn();
    else if (edge === 'end') this.activeCol = this.lastVisibleColumn();
    else this.activeCol = this.stepColumn(this.activeCol, colDelta);
    const row = this.gridRows[this.activeRow];
    const previous = this.selectedId;
    if (row && row.id !== previous) {
      this.selectedId = row.id;
      emitChange(this);
    } else {
      this.applyCursor();
    }
    this.shadow.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus();
  }

  private onKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    if (key === 'ArrowUp') this.move(-1, 0);
    if (key === 'ArrowDown') this.move(1, 0);
    if (key === 'ArrowLeft') this.move(0, -1);
    if (key === 'ArrowRight') this.move(0, 1);
    if (key === 'Home') this.move(0, 0, 'start');
    if (key === 'End') this.move(0, 0, 'end');
  }
}

defineElement('vui-data-grid', VDataGrid);
