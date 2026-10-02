import { expect, test } from '@playwright/test';

test('showcase switches theme and density', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'VUI Showcase' })).toBeVisible();
  await expect(page.locator('vui-button', { hasText: 'Сохранить' }).first()).toBeVisible();
  await expect(page.locator('vui-file-tree')).toBeVisible();
  await expect(page.locator('#demo-grid')).toContainText('Button');

  const theme = page.locator('#theme-select');
  await theme.locator('button').click();
  await theme.locator('[role="option"]', { hasText: 'Тёмная' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'dark');

  const density = page.locator('#density-select');
  await density.locator('button').click();
  await density.locator('[role="option"]', { hasText: 'Dense' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vui-density', 'dense');

  await page.locator('#open-dialog').click();
  const dialog = page.locator('#demo-dialog');
  await expect(dialog).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
});
