import { expect, test } from '@playwright/test';

test('showcase switches theme and UI mode', async ({ page }) => {
  await page.goto('/?legacy=1');
  await expect(page.getByRole('heading', { name: 'VUI Studio' })).toBeVisible();
  await expect(page.locator('vui-button', { hasText: 'Сохранить' }).first()).toBeVisible();
  await expect(page.locator('vui-stack').first()).toBeVisible();
  await expect(page.locator('vui-container').first()).toBeVisible();
  await expect(page.locator('#demo-tree')).toBeVisible();
  await expect(page.locator('#demo-grid')).toContainText('Button');
  await expect(page.locator('vui-window')).toBeVisible();
  await expect(page.locator('vui-field-group')).toBeVisible();
  await expect(page.locator('#platform-list')).toContainText('Button');
  await expect(page.locator('#platform-loading')).toHaveAttribute('loading', '');

  await page.locator('#docs-theme').selectOption('tokyo-night');
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'tokyo-night');

  const uiMode = page.locator('#ui-mode-select');
  await uiMode.locator('button').click();
  await uiMode.locator('[role="option"]', { hasText: 'Desktop design' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vui-ui', 'desktop');

  await expect(page.locator('#platform-shell')).toBeVisible();
  await expect(page.locator('#platform-grid')).toContainText('Button');
  await page.locator('#platform-collapse').click();
  await expect(page.locator('#platform-shell')).toHaveAttribute('collapsed', '');

  await page.locator('#open-dialog').click();
  const dialog = page.locator('#demo-dialog');
  await expect(dialog).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');

  await page.locator('#open-drawer').click();
  const drawer = page.locator('#demo-drawer');
  await expect(drawer).toHaveAttribute('open', '');
  await page.locator('#drawer-close').click();
  await expect(drawer).not.toHaveAttribute('open', '');

  const dir = page.locator('#dir-select');
  await dir.locator('button').click();
  await dir.locator('[role="option"]', { hasText: 'RTL' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});
