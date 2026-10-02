import { expect, test } from '@playwright/test';

test('composition scenarios keep theme, keyboard, and overlay behavior', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Composition', exact: true })).toBeVisible();
  await expect(page.locator('#family-table')).toContainText('field');
  await expect(page.locator('#composition-table')).toContainText('vui-dialog');
  await expect(page.locator('#composition-field').locator('input')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#composition-grid')).toContainText('Field');

  const tabs = page.locator('#composition-tabs');
  await tabs.getByRole('tab', { name: 'Обзор' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: 'Детали' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: 'Обзор' })).toHaveAttribute('aria-selected', 'true');

  const row = page.locator('#composition-grid').getByRole('row', { name: /Tabs/ });
  await row.click();
  await expect(page.locator('#composition-grid-result')).toContainText('tabs');

  const open = page.locator('#composition-open');
  await open.click();
  const dialog = page.locator('#composition-dialog');
  await expect(dialog).toHaveAttribute('open', '');
  const status = page.locator('#composition-status');
  await status.locator('button').click();
  await expect(status.locator('button')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(status.locator('button')).toHaveAttribute('aria-expanded', 'false');
  await expect(dialog).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(open).toBeFocused();
});
