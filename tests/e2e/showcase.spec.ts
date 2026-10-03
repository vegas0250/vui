import { expect, test } from '@playwright/test';

test('showcase switches theme and density', async ({ page }) => {
  await page.goto('/');
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

  const theme = page.locator('#theme-select');
  await theme.locator('button').click();
  await theme.locator('[role="option"]', { hasText: 'Тёмная' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'dark');

  const density = page.locator('#density-select');
  await density.locator('button').click();
  await density.locator('[role="option"]', { hasText: 'Dense' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vui-density', 'dense');

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
