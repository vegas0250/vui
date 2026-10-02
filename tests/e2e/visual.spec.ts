import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

const cases = [
  { name: 'light-comfortable-desktop', theme: 'light', density: 'comfortable', width: 1280, height: 900 },
  { name: 'dark-comfortable-desktop', theme: 'dark', density: 'comfortable', width: 1280, height: 900 },
  { name: 'light-compact-desktop', theme: 'light', density: 'compact', width: 1280, height: 900 },
  { name: 'dark-compact-mobile', theme: 'dark', density: 'compact', width: 390, height: 844 },
];

for (const item of cases) {
  test(`board ${item.name}`, async ({ page }) => {
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.goto(`/visual.html?theme=${item.theme}&density=${item.density}`);
    await page.evaluate(() => document.fonts.ready);
    const board = page.locator('#board');
    await expect(board).toBeVisible();
    await expect(board).toHaveScreenshot(`${item.name}.png`);
  });
}

test('button hover and focus', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/visual.html?theme=light&density=comfortable');
  await page.evaluate(() => document.fonts.ready);
  const wrap = page.locator('#btn-wrap');
  await page.locator('#btn-primary').hover();
  await expect(wrap).toHaveScreenshot('button-hover.png');
  await page.locator('#btn-primary').focus();
  await expect(wrap).toHaveScreenshot('button-focus.png');
  await page.locator('#input-invalid').locator('input').focus();
  await expect(page.locator('#input-invalid')).toHaveScreenshot('input-focus-invalid.png');
});

test('dialog light desktop and dark compact mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/visual.html?theme=light&density=comfortable');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#open-dialog').click();
  await expect(page.locator('#focus-dialog')).toHaveAttribute('open', '');
  await expect(page).toHaveScreenshot('dialog-light-comfortable-desktop.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/visual.html?theme=dark&density=compact');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#open-dialog').click();
  await expect(page.locator('#focus-dialog')).toHaveAttribute('open', '');
  await expect(page).toHaveScreenshot('dialog-dark-compact-mobile.png');
});
