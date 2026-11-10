import { expect, test } from '@playwright/test';

test('optimized website registers every component and runs the real examples', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?lang=en#/components');
  await expect(page.locator('.docs-cards > a')).toHaveCount(69);
  const tags = await page.locator('.docs-cards code').allTextContents();
  expect(await page.evaluate((tags) => tags.filter((tag) => !customElements.get(tag)), tags)).toEqual([]);
  await page.evaluate(() => { location.hash = '#/examples/settings'; });
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Production');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('#docs-page [data-result]')).toHaveText('Saved: Production');
  await page.locator('#docs-theme').selectOption('tokyo-night');
  await page.screenshot({ path: test.info().outputPath('website-desktop.png') });
  await page.setViewportSize({ width: 356, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('website-mobile.png') });
  expect(errors).toEqual([]);
  const html = await (await request.get('/')).text();
  expect(html).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/);
  expect((await request.get('/theme-boot.js')).ok()).toBe(true);
});
