import { expect, test } from '@playwright/test';
test.setTimeout(90_000);
const studio = '#theme-studio';
const token = (name: string) => `[data-value="${name}"]`;
test.beforeEach(async ({ page }) => {
  await page.goto('/?lang=en&legacy=1');
  await expect(page.locator(studio)).toBeVisible();
});
test('fourteen palettes switch instantly; documentation preference is independent and persistent', async ({
  page,
}) => {
  await expect(page.locator('.ts-preset')).toHaveCount(14);
  await page.locator('#docs-theme').selectOption('nord');
  for (const id of [
    'tokyo-night',
    'catppuccin-mocha',
    'dracula',
    'nord',
    'rose-pine',
    'kanagawa-wave',
    'synthwave',
    'catppuccin-latte',
    'tokyo-night-day',
    'rose-pine-dawn',
    'modern-light',
  ]) {
    await page.locator(`[data-preset="${id}"]`).click();
    await expect(page.locator('#ts-live-preview')).toHaveAttribute(
      'data-vui-theme',
      id,
    );
    await expect(page.locator('html')).toHaveAttribute(
      'data-vui-theme',
      'nord',
    );
    await expect(
      page.locator('#ts-live-preview vui-button').first(),
    ).toBeVisible();
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'nord');
});
test('color input updates real components, validates, undoes, redoes and resets', async ({
  page,
}) => {
  const primary = page.locator(token('primary'));
  await primary.fill('#123456');
  await primary.blur();
  await expect
    .poll(() =>
      page
        .locator('#ts-live-preview vui-button')
        .first()
        .evaluate(
          (el) =>
            getComputedStyle(el.shadowRoot!.querySelector('button')!)
              .backgroundColor,
        ),
    )
    .toBe('rgb(18, 52, 86)');
  await expect(page.locator('#ts-live-preview')).toHaveAttribute(
    'data-vui-theme',
    'tokyo-night',
  );
  await expect(page.locator('html')).not.toHaveAttribute(
    'data-vui-theme',
    'tokyo-night',
  );
  await page.locator('[data-ts-action=undo]').click();
  await expect(primary).toHaveValue('#7aa2f7');
  await page.locator('[data-ts-action=redo]').click();
  await expect(primary).toHaveValue('#123456');
  await primary.fill('url(https://evil.example)');
  await expect(primary).toHaveAttribute('aria-invalid', 'true');
  await page.locator('[data-reset=primary]').click();
  await expect(primary).toHaveValue('#7aa2f7');
  await page.locator(token('foreground')).fill('#1a1b26');
  await page.locator(token('foreground')).blur();
  await expect(page.locator('#ts-contrast')).toContainText('Low contrast');
  await page.locator('[data-ts-action=reset]').click();
  await expect(page.locator(token('foreground'))).toHaveValue('#c0caf5');
});
test('custom themes save, reload, rename, apply, export, import and delete', async ({
  page,
}) => {
  await page.locator(token('primary')).fill('rgb(18 52 86)');
  await page.locator(token('primary')).blur();
  await page.locator('#ts-name').fill('My theme');
  await page.locator('[data-ts-action=save]').click();
  await expect(page.locator('#ts-saved option')).toHaveCount(2);
  await page.reload();
  await page.locator('#ts-saved').selectOption('0');
  await expect(page.locator(token('primary'))).toHaveValue('#123456');
  await page.locator('#ts-name').fill('Renamed');
  await page.locator('[data-ts-action=rename]').click();
  await expect(page.locator('#ts-saved option:checked')).toHaveText('Renamed');
  await page.locator('[data-ts-action=apply]').click();
  await expect(page.locator('#docs-theme')).toHaveValue('custom');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-ts-action=json]').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('vui-theme.json');
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const buffer = Buffer.concat(chunks);
  const parsed = JSON.parse(buffer.toString());
  expect(parsed.tokens.primary).toBe('#123456');
  expect(parsed.schemaVersion).toBe(1);
  const cssPromise = page.waitForEvent('download');
  await page.locator('[data-ts-action=css]').click();
  const cssDownload = await cssPromise;
  const cssStream = await cssDownload.createReadStream();
  let css = '';
  for await (const c of cssStream!) css += c.toString();
  expect(css).toContain('--vui-color-primary: #123456;');
  await page.locator('[data-ts-action=reset]').click();
  await page.locator('#ts-import').setInputFiles({
    name: 'theme.json',
    mimeType: 'application/json',
    buffer,
  });
  await expect(page.locator(token('primary'))).toHaveValue('#123456');
  await page.locator('#ts-import').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({ ...parsed, tokens: { background: 'url(evil)' } }),
    ),
  });
  await expect(page.locator('#ts-status')).toContainText('Invalid theme file');
  await page.locator('#ts-saved').selectOption('0');
  await page.locator('[data-ts-action=delete]').click();
  await expect(page.locator('#ts-saved option')).toHaveCount(1);
});
test('all interface templates use actual VUI and original comparison stays isolated', async ({
  page,
}) => {
  await page.locator(token('surface')).fill('#123456');
  await page.locator(token('surface')).blur();
  await page.locator('#ts-compare').check();
  await expect(page.locator('#ts-original-preview')).toBeVisible();
  for (const template of [
    'components',
    'dashboard',
    'settings',
    'login',
    'developer',
  ]) {
    await page.locator('#ts-template').selectOption(template);
    await expect(
      page.locator('#ts-live-preview vui-panel').first(),
    ).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('#ts-live-preview')
          .evaluate((el) =>
            getComputedStyle(el).getPropertyValue('--vui-color-surface').trim(),
          ),
      )
      .toBe('#123456');
    await expect
      .poll(() =>
        page
          .locator('#ts-original-preview')
          .evaluate((el) =>
            getComputedStyle(el).getPropertyValue('--vui-color-surface').trim(),
          ),
      )
      .toBe('#1a1b26');
  }
  await page.locator('#ts-template').selectOption('components');
  await page.locator('#ts-live-preview [data-preview-modal]').click();
  await expect(
    page.locator('#ts-live-preview [data-preview-dialog]'),
  ).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(
    page.locator('#ts-live-preview [data-preview-dialog]'),
  ).not.toHaveAttribute('open', '');
});
test('mobile standalone documentation and customize/preview tabs retain state without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.portal-menu')).toHaveCount(0);
  await page.locator(token('primary')).fill('#123456');
  await page.locator(token('primary')).blur();
  await page.locator('[data-view=preview]').click();
  await expect(page.locator('#ts-editor')).toBeHidden();
  await expect(page.locator('#ts-live-preview')).toBeVisible();
  await page.locator('[data-view=customize]').click();
  await expect(page.locator(token('primary'))).toHaveValue('#123456');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.locator('[data-view=customize]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-view=preview]')).toBeFocused();
});
test('system mode initializes defaults, explicit choice wins, and initial head boot runs before app', async ({
  page,
}) => {
  await page.evaluate(() => localStorage.clear());
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute(
    'data-vui-theme',
    'catppuccin-mocha',
  );
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute(
    'data-vui-theme',
    'catppuccin-latte',
  );
  await page.locator('#docs-theme').selectOption('dracula');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute(
    'data-vui-theme',
    'dracula',
  );
  await page.route('**/src/showcase/main.ts', (route) => route.abort());
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute(
    'data-vui-theme',
    'dracula',
  );
  expect(
    await page
      .locator('html')
      .evaluate((el) => el.style.getPropertyValue('--vui-color-background')),
  ).toBe('#21222c');
});
