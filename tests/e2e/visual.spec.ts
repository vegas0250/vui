import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

const cases = [
  { name: 'light-web-desktop', theme: 'light', ui: 'web', width: 1280, height: 900 },
  { name: 'dark-web-desktop', theme: 'dark', ui: 'web', width: 1280, height: 900 },
  { name: 'light-desktop-desktop', theme: 'light', ui: 'desktop', width: 1280, height: 900 },
  { name: 'dark-desktop-mobile', theme: 'dark', ui: 'desktop', width: 390, height: 844 },
];

for (const item of cases) {
  test(`board ${item.name}`, async ({ page }) => {
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.goto(`/visual.html?theme=${item.theme}&ui=${item.ui}`);
    await page.evaluate(() => document.fonts.ready);
    const board = page.locator('#board');
    await expect(board).toBeVisible();
    await expect(board).toHaveScreenshot(`${item.name}.png`);
  });
}

test('button hover and focus', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/visual.html?theme=light&ui=web');
  await page.evaluate(() => document.fonts.ready);
  const wrap = page.locator('#btn-wrap');
  await page.locator('#btn-primary').hover();
  await expect(wrap).toHaveScreenshot('button-hover.png');
  await page.locator('#btn-primary').focus();
  await expect(wrap).toHaveScreenshot('button-focus.png');
  await page.locator('#input-invalid').locator('input').focus();
  await expect(page.locator('#input-invalid')).toHaveScreenshot('input-focus-invalid.png');
});

test('menu open focus disabled and checked', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/visual.html?theme=light&ui=web&states=menu');
  await page.evaluate(() => document.fonts.ready);
  const menu = page.locator('#state-menu');
  await expect(menu).toHaveAttribute('open', '');
  await page.locator('#menu-save').focus();
  await expect(page.locator('#menu-states')).toHaveScreenshot('menu-open-focus.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/visual.html?theme=dark&ui=desktop&states=menu');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#menu-states')).toHaveScreenshot('menu-open-dark-desktop.png');
});

test('family strip in light and rtl dark desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/visual.html?theme=light&ui=web&strip=1');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#families')).toHaveScreenshot('families-light-web.png');

  await page.goto('/visual.html?theme=dark&ui=desktop&dir=rtl&strip=1');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#families')).toHaveScreenshot('families-dark-desktop-rtl.png');
});

test('dialog light web and dark desktop mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/visual.html?theme=light&ui=web');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#open-dialog').click();
  await expect(page.locator('#focus-dialog')).toHaveAttribute('open', '');
  await expect(page).toHaveScreenshot('dialog-light-web-desktop.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/visual.html?theme=dark&ui=desktop');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#open-dialog').click();
  await expect(page.locator('#focus-dialog')).toHaveAttribute('open', '');
  await expect(page).toHaveScreenshot('dialog-dark-desktop-mobile.png');
});
