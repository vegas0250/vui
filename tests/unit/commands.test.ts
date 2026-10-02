import { describe, expect, it } from 'vitest';
import { CommandRegistry } from '../../src/interaction/commands';
import { ShortcutConflictError, ShortcutRegistry, formatShortcut, normalizeShortcut } from '../../src/interaction/shortcuts';

describe('commands and shortcuts', () => {
  it('runs an enabled command and skips a disabled one', () => {
    const commands = new CommandRegistry();
    let saves = 0;
    commands.register({
      id: 'file.save',
      label: 'Save',
      shortcut: 'Ctrl+S',
      execute: () => {
        saves += 1;
      },
    });
    commands.register({
      id: 'file.delete',
      label: 'Delete',
      enabled: false,
      execute: () => {
        saves += 10;
      },
    });
    expect(commands.execute('file.save')).toBe(true);
    expect(commands.execute('file.delete')).toBe(false);
    expect(saves).toBe(1);
    expect(commands.get('file.save')?.shortcut).toBe('Ctrl+S');
  });

  it('binds a shortcut, prefers the active context, and rejects a conflict', () => {
    const commands = new CommandRegistry();
    const ran: string[] = [];
    commands.register({
      id: 'file.save',
      label: 'Save',
      execute: () => ran.push('global'),
    });
    commands.register({
      id: 'editor.save',
      label: 'Save buffer',
      execute: () => ran.push('editor'),
    });
    const shortcuts = new ShortcutRegistry(commands);
    shortcuts.register({ keys: 'Ctrl+S', command: 'file.save' });
    shortcuts.register({ keys: 'Mod+S', command: 'editor.save', context: 'editor' });
    expect(normalizeShortcut('control+s')).toBe('Ctrl+S');
    expect(formatShortcut('Mod+S')).toMatch(/Ctrl\+S|Meta\+S/);

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true });
    expect(shortcuts.handle(event)).toBe(true);
    expect(ran).toEqual(['global']);

    const leave = shortcuts.pushContext('editor');
    const again = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true });
    expect(shortcuts.handle(again)).toBe(true);
    expect(ran).toEqual(['global', 'editor']);
    expect(shortcuts.activeContext()).toBe('editor');
    leave();
    expect(shortcuts.activeContext()).toBeNull();

    expect(() => shortcuts.register({ keys: 'Ctrl+S', command: 'file.save' })).toThrow(ShortcutConflictError);
  });

  it('does not steal unmodified keys from a text field', () => {
    const commands = new CommandRegistry();
    let ran = false;
    commands.register({
      id: 'edit.find',
      label: 'Find',
      execute: () => {
        ran = true;
      },
    });
    const shortcuts = new ShortcutRegistry(commands);
    shortcuts.register({ keys: 'F', command: 'edit.find' });
    const input = document.createElement('input');
    document.body.append(input);
    input.addEventListener('keydown', (event) => {
      expect(shortcuts.handle(event)).toBe(false);
    });
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true }));
    expect(ran).toBe(false);
    input.remove();
  });
});
