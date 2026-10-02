export type SelectionMode = 'none' | 'single' | 'multiple';

/** `replace` selects one id. `toggle` adds or removes it. `range` selects from the anchor through `id`. */
export type SelectionGesture = 'replace' | 'toggle' | 'range';

/**
 * UI selection only. The id is whatever the component uses (a row id, an element).
 * The application decides what that id means.
 */
export class SelectionModel<T> {
  private modeValue: SelectionMode;
  private order: T[] = [];
  private picked: T[] = [];
  private anchorId: T | null = null;
  private cursor: T | null = null;

  constructor(mode: SelectionMode = 'single') {
    this.modeValue = mode;
  }

  get mode(): SelectionMode {
    return this.modeValue;
  }

  setMode(mode: SelectionMode): void {
    this.modeValue = mode;
    if (mode === 'none') this.clear();
    else if (mode === 'single' && this.picked.length > 1) {
      const last = this.picked[this.picked.length - 1];
      this.picked = last === undefined ? [] : [last];
    }
  }

  /** Ids in navigation order. Range selection uses this order. */
  setOrder(order: readonly T[]): void {
    this.order = [...order];
    this.picked = this.picked.filter((id) => this.order.includes(id));
    if (this.anchorId !== null && !this.order.includes(this.anchorId)) this.anchorId = this.picked[0] ?? null;
  }

  get selected(): readonly T[] {
    return this.picked;
  }

  get anchor(): T | null {
    return this.anchorId;
  }

  /** Cursor. It follows `select`, and `setActive` moves it without changing the selection. */
  get active(): T | null {
    return this.cursor;
  }

  setActive(id: T | null): void {
    if (id !== null && this.order.length > 0 && !this.order.includes(id)) return;
    this.cursor = id;
  }

  isSelected(id: T): boolean {
    return this.picked.includes(id);
  }

  select(id: T, gesture: SelectionGesture = 'replace'): readonly T[] {
    if (this.modeValue === 'none') return this.picked;
    if (this.modeValue === 'single') {
      if (gesture === 'toggle' && this.picked.length === 1 && this.picked[0] === id) {
        this.picked = [];
        this.anchorId = null;
        this.cursor = null;
        return this.picked;
      }
      this.picked = [id];
      this.anchorId = id;
      this.cursor = id;
      return this.picked;
    }
    if (gesture === 'toggle') {
      this.picked = this.picked.includes(id) ? this.picked.filter((item) => item !== id) : [...this.picked, id];
      this.anchorId = id;
      this.cursor = id;
      return this.picked;
    }
    if (gesture === 'range') {
      const anchor = this.anchorId ?? id;
      const from = this.order.indexOf(anchor);
      const to = this.order.indexOf(id);
      if (from < 0 || to < 0) this.picked = [id];
      else {
        const start = Math.min(from, to);
        const end = Math.max(from, to);
        this.picked = this.order.slice(start, end + 1);
      }
      this.cursor = id;
      return this.picked;
    }
    this.picked = [id];
    this.anchorId = id;
    this.cursor = id;
    return this.picked;
  }

  clear(): void {
    this.picked = [];
    this.anchorId = null;
    this.cursor = null;
  }
}
