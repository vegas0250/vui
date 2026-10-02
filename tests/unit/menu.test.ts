import { beforeEach, describe, expect, it } from 'vitest';
import '../../src/components/overlay/dialog';
import '../../src/components/overlay/menu';
import type { VDialog } from '../../src/components/overlay/dialog';
import type { VMenu } from '../../src/components/overlay/menu';
import { CommandRegistry } from '../../src/interaction/commands';
import { ShortcutRegistry } from '../../src/interaction/shortcuts';
import { clearOverlays } from '../../src/interaction/overlay';
import { pasteText } from '../../src/interaction/clipboard';
import type { VDataGrid } from '../../src/components/data/data-grid';
import '../../src/components/data/data-grid';

describe('vui-menu', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
  });

  it('moves with the keyboard, runs a command, and skips a disabled item', async () => {
    const commands = new CommandRegistry();
    const ran: string[] = [];
    commands.register({
      id: 'file.save',
      label: 'Save',
      shortcut: 'Ctrl+S',
      execute: () => ran.push('save'),
    });
    commands.register({
      id: 'file.delete',
      label: 'Delete',
      enabled: false,
      execute: () => ran.push('delete'),
    });
    const opener = document.createElement('button');
    opener.textContent = 'Actions';
    const menu = document.createElement('vui-menu') as VMenu;
    menu.label = 'Actions';
    menu.innerHTML = `
      <vui-menu-item label="Save" command="file.save"></vui-menu-item>
      <vui-menu-item label="Delete" command="file.delete"></vui-menu-item>
      <vui-menu-item label="Rename"></vui-menu-item>
    `;
    document.body.append(opener, menu);
    menu.commands = commands;
    opener.focus();
    menu.showAt(12, 16);
    const items = [...menu.querySelectorAll('vui-menu-item')];
    expect(menu.getAttribute('role')).toBe('menu');
    expect(items[0]?.getAttribute('role')).toBe('menuitem');
    expect(items[1]?.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(items[0]);

    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(items[2]);
    items[0]?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(ran).toEqual(['save']);
    expect(menu.hasAttribute('open')).toBe(false);
    await Promise.resolve();
    expect(document.activeElement).toBe(opener);
  });

  it('closes a nested menu before the parent menu and before a dialog', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'Open';
    const dialog = document.createElement('vui-dialog') as VDialog;
    dialog.label = 'Editor';
    const menu = document.createElement('vui-menu') as VMenu;
    menu.label = 'File';
    menu.innerHTML = `
      <vui-menu-item label="Share">
        <vui-menu label="Share" slot="submenu">
          <vui-menu-item label="Copy"></vui-menu-item>
        </vui-menu>
      </vui-menu-item>
    `;
    dialog.append(menu);
    document.body.append(opener, dialog);
    opener.focus();
    dialog.show();
    menu.showAt(20, 24);
    const parentItem = menu.querySelector('vui-menu-item');
    parentItem?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    const nested = menu.querySelector('vui-menu');
    expect(nested?.hasAttribute('open')).toBe(true);
    expect(parentItem?.getAttribute('aria-expanded')).toBe('true');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(nested?.hasAttribute('open')).toBe(false);
    expect(menu.hasAttribute('open')).toBe(true);
    expect(dialog.open).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(menu.hasAttribute('open')).toBe(false);
    expect(dialog.open).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    expect(dialog.open).toBe(false);
    await Promise.resolve();
    expect(document.activeElement).toBe(opener);
  });

  it('runs a command from its shortcut', () => {
    const commands = new CommandRegistry();
    let ran = false;
    commands.register({
      id: 'file.save',
      label: 'Save',
      execute: () => {
        ran = true;
      },
    });
    const shortcuts = new ShortcutRegistry(commands);
    const stop = shortcuts.attach(document);
    shortcuts.register({ keys: 'Ctrl+S', command: 'file.save' });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true }));
    expect(ran).toBe(true);
    stop();
  });
});

describe('selection copy', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('copies the focused data-grid cell', async () => {
    const grid = document.createElement('vui-data-grid') as VDataGrid;
    document.body.append(grid);
    grid.columns = [{ key: 'name', title: 'Name' }];
    grid.rows = [{ id: 'button', name: 'Button' }];
    grid.selectedId = 'button';
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true, cancelable: true }));
    expect(await pasteText()).toBe('Button');
  });
});
