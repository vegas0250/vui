import { expect, test } from '@playwright/test';

test('responsive containers adapt without a horizontal page scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/?legacy=1');
  await expect(page.getByRole('heading', { name: 'Responsive Design' })).toBeVisible();
  await expect(page.locator('#responsive-readout')).toContainText('Catppuccin Latte + Comfortable');

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
  await page.goto('/?legacy=1');
  const themes = [
    ['catppuccin-latte', 'catppuccin-latte', 'Catppuccin Latte'],
    ['tokyo-night', 'tokyo-night', 'Tokyo Night'],
    ['nord', 'nord', 'Nord'],
  ] as const;
  const densities = [
    ['Comfortable', 'comfortable'],
    ['Compact', 'compact'],
    ['Dense', 'dense'],
  ] as const;

  for (const [themeLabel, theme, themeReadout] of themes) {
    await page.locator('#docs-theme').selectOption(themeLabel);
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
