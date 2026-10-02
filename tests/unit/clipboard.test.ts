import { describe, expect, it } from 'vitest';
import { copyText, cutText, pasteText, readClipboard, writeClipboard } from '../../src/interaction/clipboard';

describe('clipboard', () => {
  it('copies, cuts, and pastes text and keeps structured items', async () => {
    await copyText('alpha');
    expect(await pasteText()).toBe('alpha');
    await cutText('beta');
    expect(await pasteText()).toBe('beta');
    await writeClipboard({ text: 'row', items: { rows: ['a', 'b'] } });
    const payload = await readClipboard();
    expect(payload.text).toBe('row');
    expect(payload.items?.rows).toEqual(['a', 'b']);
  });
});
