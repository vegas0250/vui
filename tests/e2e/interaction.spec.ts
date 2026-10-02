import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.locator('#overlay').waitFor();
});

test('menu keyboard opens a nested item and Escape closes one layer', async ({ page }) => {
  await page.locator('#open-menu').click();
  const menu = page.locator('#demo-menu');
  await expect(menu).toHaveAttribute('open', '');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  await expect(menu.locator('vui-menu')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(menu.locator('vui-menu')).not.toHaveAttribute('open', '');
  await expect(menu).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
});

test('dialog restores focus to the opener', async ({ page }) => {
  await page.locator('#open-dialog').click();
  const dialog = page.locator('#demo-dialog');
  await expect(dialog).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(page.locator('#open-dialog')).toBeFocused();
});

test('shortcut runs the showcase save command', async ({ page }) => {
  await page.keyboard.press('Control+s');
  await expect(page.locator('#menu-result')).toContainText('file.save');
});

test('data grid selects the next row from the keyboard', async ({ page }) => {
  const grid = page.locator('#demo-grid');
  await grid.scrollIntoViewIfNeeded();
  await grid.locator('[role="gridcell"]').first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#grid-result')).toContainText('input');
});
