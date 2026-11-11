import { expect, test } from '@playwright/test';

test('foundation, theme, and UI mode share one token contract', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/?legacy=1');
  await expect(page.getByRole('heading', { name: 'Foundation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tokens' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Пороги контейнера' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Contract', exact: true })).toBeVisible();
  await expect(page.locator('#foundation-snapshot')).toContainText('catppuccin-latte');
  await expect(page.locator('#compliance-table')).toContainText('vui-button');

  const lifecycle = page.locator('#lifecycle-readout');
  await expect(lifecycle).toContainText('1');
  await page.locator('#lifecycle-cycle').click();
  await expect(lifecycle).toContainText('2');
  await expect(lifecycle).toContainText('сохранён');

  const read = (name: string) =>
    page.evaluate((token) => getComputedStyle(document.documentElement).getPropertyValue(token).trim(), name);

  const lightBackground = await read('--vui-color-background');
  expect(await read('--vui-size-control')).toBe('32px');
  expect(await read('--vui-space-md')).toBe('12px');
  expect(await read('--vui-row-height')).toBe('40px');

  await page.locator('#docs-theme').evaluate((el) => {
    (el as HTMLElement & { value: string }).value = 'tokyo-night';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'tokyo-night');
  const darkBackground = await read('--vui-color-background');
  expect(darkBackground).not.toBe(lightBackground);
  expect(darkBackground === '#16161e').toBe(true);

  const uiMode = page.locator('#ui-mode-select');
  await uiMode.locator('button').click();
  await uiMode.locator('[role="option"]', { hasText: 'Desktop design' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vui-ui', 'desktop');
  expect(await read('--vui-size-control')).toBe('32px');
  expect(await read('--vui-space-md')).toBe('8px');
  expect(await read('--vui-row-height')).toBe('32px');
  await expect(page.locator('#contract-primary')).toBeVisible();
});

test('nested split keyboard respects min and max', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/?legacy=1');
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
  await page.goto('/?legacy=1');
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
  await expect(page.locator('#contract-input')).toBeFocused();
});
