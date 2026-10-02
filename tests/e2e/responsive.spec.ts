import { expect, test } from '@playwright/test';

test('responsive containers adapt without a horizontal page scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Responsive Design' })).toBeVisible();
  await expect(page.locator('#responsive-readout')).toContainText('Light + Comfortable');

  await page.locator('#size-narrow').click();
  await expect(page.locator('#responsive-split')).toHaveAttribute('data-stacked', '');
  await expect.poll(async () =>
    page.locator('#responsive-toolbar').evaluate((element) => {
      const bar = element.shadowRoot?.querySelector('.bar');
      return bar ? getComputedStyle(bar).flexWrap : '';
    }),
  ).toBe('wrap');
  await expect.poll(async () =>
    page.locator('#responsive-input').evaluate((element) => {
      const field = element.shadowRoot?.querySelector('.field');
      return field ? getComputedStyle(field).display : '';
    }),
  ).toBe('flex');
  await expect.poll(async () =>
    page.locator('#responsive-grid').evaluate((element) => {
      const frame = element.shadowRoot?.querySelector('.frame');
      const secondary = element.shadowRoot?.querySelector('.priority-secondary');
      const overflow = frame ? getComputedStyle(frame).overflowX : '';
      const scrolls = overflow === 'auto' || overflow === 'scroll';
      const hidden = secondary instanceof HTMLElement && secondary.hidden;
      return scrolls && hidden;
    }),
  ).toBe(true);

  await page.locator('#size-wide').click();
  await expect(page.locator('#responsive-split')).not.toHaveAttribute('data-stacked');
  await expect.poll(async () =>
    page.locator('#responsive-input').evaluate((element) => {
      const field = element.shadowRoot?.querySelector('.field');
      return field ? getComputedStyle(field).display : '';
    }),
  ).toBe('grid');

  await page.setViewportSize({ width: 390, height: 800 });
  const pageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
  );
  expect(pageOverflow).toBe(true);
});

test('theme and density stay valid for every combination', async ({ page }) => {
  await page.goto('/');
  const themes = [
    ['Светлая', 'light', 'Light'],
    ['Тёмная', 'dark', 'Dark'],
    ['Контрастная', 'high-contrast', 'High Contrast'],
  ] as const;
  const densities = [
    ['Comfortable', 'comfortable'],
    ['Compact', 'compact'],
    ['Dense', 'dense'],
  ] as const;

  for (const [themeLabel, theme, themeReadout] of themes) {
    const themeSelect = page.locator('#theme-select');
    await themeSelect.locator('button').click();
    await themeSelect.locator('[role="option"]', { hasText: themeLabel }).click();
    await expect(page.locator('html')).toHaveAttribute('data-vui-theme', theme);

    for (const [densityLabel, density] of densities) {
      const densitySelect = page.locator('#density-select');
      await densitySelect.locator('button').click();
      await densitySelect.locator('[role="option"]', { hasText: densityLabel }).click();
      await expect(page.locator('html')).toHaveAttribute('data-vui-density', density);
      await expect(page.locator('#responsive-readout')).toContainText(`${themeReadout} + ${densityLabel}`);
      await expect(page.locator('#responsive-toolbar')).toBeVisible();
      await expect(page.locator('vui-button', { hasText: 'Сохранить' }).first()).toBeVisible();
    }
  }
});
