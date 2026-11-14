import { expect, test } from '@playwright/test';

test('optimized website registers every component and runs the real examples', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const foreign: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).hostname === 'vegas0250.ru') foreign.push(request.url()); });
  await page.goto('/?lang=en#/components');
  await expect(page.locator('.portal-menu, iframe')).toHaveCount(0);
  expect(foreign).toEqual([]);
  await expect(page.locator('.docs-cards > a')).toHaveCount(63);
  const tags = await page.locator('.docs-cards code').allTextContents();
  expect(await page.evaluate((tags) => tags.filter((tag) => !customElements.get(tag)), tags)).toEqual([]);
  await page.evaluate(() => { location.hash = '#/examples/settings'; });
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Production');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('#docs-page [data-result]')).toHaveText('Saved: Production');
  await page.locator('#docs-theme').evaluate((el) => {
    (el as HTMLElement & { value: string }).value = 'tokyo-night';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.screenshot({ path: test.info().outputPath('website-desktop.png') });
  for (const width of [1044, 734, 670, 356]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), String(width)).toBe(true);
  }
  await page.screenshot({ path: test.info().outputPath('website-mobile.png') });
  expect(errors).toEqual([]);
  const html = await (await request.get('/')).text();
  expect(html).not.toMatch(/<script(?![^>]*\bsrc=)[^>]*>/);
  expect((await request.get('/theme-boot.js')).ok()).toBe(true);
});

test('documentation uses VUI metrics and keeps content within responsive columns', async ({ page }) => {
  await page.goto('/?lang=en#/getting-started');
  for (const mode of ['web', 'desktop']) {
    await page.locator('#ui-mode-select').evaluate((element, value) => {
      (element as HTMLElement & { value: string }).value = value;
      element.dispatchEvent(new Event('change'));
    }, mode);
    // --vui-heading-1 may be a fluid clamp(); compare resolved pixel sizes.
    await expect.poll(() => page.locator('h1').evaluate((heading) => {
      const probe = document.createElement('span');
      probe.style.fontSize = 'var(--vui-heading-1)';
      heading.parentElement?.append(probe);
      const expected = getComputedStyle(probe).fontSize;
      probe.remove();
      return getComputedStyle(heading).fontSize === expected;
    })).toBe(true);
  }
  for (const width of [1440, 900, 734, 640, 356]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['getting-started', 'components/button', 'components/input', 'patterns/shell', 'themes']) {
      await page.evaluate((route) => { location.hash = `#/${route}`; }, route);
      await expect(page.locator('#docs-page h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} at ${width}`).toBe(true);
      if (route === 'themes') {
        const article = await page.locator('#docs-page').boundingBox();
        const studio = await page.locator('#theme-studio').boundingBox();
        expect(Math.abs(article!.x - studio!.x)).toBeLessThan(1);
        expect(studio!.y).toBeGreaterThanOrEqual(article!.y + article!.height);
      }
    }
  }
});
