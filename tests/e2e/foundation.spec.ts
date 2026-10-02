import { expect, test } from '@playwright/test';

test('foundation, theme, and density share one token contract', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Foundation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tokens' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Пороги контейнера' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Contract', exact: true })).toBeVisible();
  await expect(page.locator('#foundation-snapshot')).toContainText('light');
  await expect(page.locator('#compliance-table')).toContainText('vui-button');

  const lifecycle = page.locator('#lifecycle-readout');
  await expect(lifecycle).toContainText('1');
  await page.locator('#lifecycle-cycle').click();
  await expect(lifecycle).toContainText('2');
  await expect(lifecycle).toContainText('сохранён');

  const read = (name: string) =>
    page.evaluate((token) => getComputedStyle(document.documentElement).getPropertyValue(token).trim(), name);

  const lightBackground = await read('--vui-color-background');
  const comfortableControl = await read('--vui-size-control');

  const theme = page.locator('#theme-select');
  await theme.locator('button').click();
  await theme.locator('[role="option"]', { hasText: 'Тёмная' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'dark');
  const darkBackground = await read('--vui-color-background');
  expect(darkBackground).not.toBe(lightBackground);
  expect(darkBackground === '#161a20' || darkBackground.includes('ink-900')).toBe(true);

  const density = page.locator('#density-select');
  await density.locator('button').click();
  await density.locator('[role="option"]', { hasText: 'Dense' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vui-density', 'dense');
  const denseControl = await read('--vui-size-control');
  expect(denseControl).not.toBe(comfortableControl);
  expect(denseControl).toBe('22px');
  await expect(page.locator('#contract-primary')).toBeVisible();
});

test('nested split keyboard respects min and max', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const outer = page.locator('#nested-split');
  const inner = page.locator('#nested-split-inner');
  await inner.locator('[part="separator"]').focus();
  await page.keyboard.press('End');
  await expect(inner).toHaveAttribute('position', '80');
  await expect(outer).toHaveAttribute('position', '55');
  await page.keyboard.press('Home');
  await expect(inner).toHaveAttribute('position', '20');
  await expect(outer).toHaveAttribute('position', '55');
  await expect(inner.locator('[part="separator"]')).toBeFocused();
});

test('contract controls expose focus and skip disabled', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const section = page.locator('#contract');
  const primary = section.locator('vui-button', { hasText: 'Основная' });
  const danger = section.locator('vui-button', { hasText: 'Опасная' });
  const disabled = section.locator('vui-button', { hasText: 'Недоступна' });
  await primary.focus();
  await expect(primary).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(danger).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(disabled).not.toBeFocused();
  await expect(section.locator('vui-input')).toBeFocused();
});
