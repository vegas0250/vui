import { describe, expect, it } from 'vitest';
import { SelectionModel } from '../../src/interaction/selection';

describe('selection model', () => {
  it('replaces a single selection and clears it on toggle', () => {
    const model = new SelectionModel<string>('single');
    model.setOrder(['a', 'b', 'c']);
    model.select('b');
    expect(model.selected).toEqual(['b']);
    model.select('b', 'toggle');
    expect(model.selected).toEqual([]);
    model.select('a');
    expect(model.isSelected('a')).toBe(true);
  });

  it('toggles and extends a range in order', () => {
    const model = new SelectionModel<string>('multiple');
    model.setOrder(['a', 'b', 'c', 'd']);
    model.select('b');
    model.select('d', 'range');
    expect(model.selected).toEqual(['b', 'c', 'd']);
    model.select('c', 'toggle');
    expect(model.selected).toEqual(['b', 'd']);
    expect(model.anchor).toBe('c');
  });

  it('ignores selection when the mode is none', () => {
    const model = new SelectionModel<string>('none');
    model.select('a');
    expect(model.selected).toEqual([]);
  });
});
