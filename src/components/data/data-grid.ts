import { defineElement } from '../../core/define';
import { VuiElement } from '../../core/element';
import { emitChange } from '../../core/events';

export interface VuiDataGridColumn {
  key: string;
  title: string;
  width?: string;
  align?: 'start' | 'center' | 'end';
}

export interface VuiDataGridRow {
  id: string;
  [key: string]: string;
}

function safeWidth(width: string | undefined): string | null {
  if (!width) return null;
  return /^(\d+(\.\d+)?)(px|rem|em|%)$/.test(width) ? width : null;
}

export class VuiDataGrid extends VuiElement {
  static get observedAttributes(): string[] {
    return ['label', 'empty-label', 'selected'];
  }

  private gridColumns: VuiDataGridColumn[] = [];
  private gridRows: VuiDataGridRow[] = [];
  private activeRow = 0;
  private activeCol = 0;

  get columns(): VuiDataGridColumn[] {
    return this.gridColumns;
  }

  set columns(value: VuiDataGridColumn[]) {
    this.gridColumns = value.map((column) => ({ ...column }));
    this.renderGrid();
  }

  get rows(): VuiDataGridRow[] {
    return this.gridRows;
  }

  set rows(value: VuiDataGridRow[]) {
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
      :host { display: block; min-width: 0; }
      .frame {
        overflow: auto;
        border: var(--vui-border-width) solid var(--vui-color-border);
        border-radius: var(--vui-radius);
        background: var(--vui-color-surface);
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font: inherit;
      }
      th, td {
        height: var(--vui-row-height);
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
      headerRow.append(cell);
    }
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
        row.append(cell);
      });
      body.append(row);
    });
    this.applyCursor();
  }

  private applyCursor(): void {
    const cells = [...this.shadow.querySelectorAll<HTMLElement>('[role="gridcell"]')];
    for (const cell of cells) cell.tabIndex = -1;
    const columns = Math.max(1, this.gridColumns.length);
    this.activeRow = Math.min(this.activeRow, Math.max(0, this.gridRows.length - 1));
    this.activeCol = Math.min(this.activeCol, columns - 1);
    const active = cells.find(
      (cell) => Number(cell.dataset.row) === this.activeRow && Number(cell.dataset.col) === this.activeCol,
    );
    if (active) active.tabIndex = 0;
  }

  private move(rowDelta: number, colDelta: number): void {
    if (!this.gridRows.length || !this.gridColumns.length) return;
    this.activeRow = Math.min(this.gridRows.length - 1, Math.max(0, this.activeRow + rowDelta));
    this.activeCol = Math.min(this.gridColumns.length - 1, Math.max(0, this.activeCol + colDelta));
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
    if (key === 'Home') this.move(0, -this.activeCol);
    if (key === 'End') this.move(0, this.gridColumns.length - 1 - this.activeCol);
  }
}

defineElement('vui-data-grid', VuiDataGrid);
