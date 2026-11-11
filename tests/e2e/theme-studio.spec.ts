import { expect, type Page, test } from '@playwright/test';
test.setTimeout(90_000);
const studio = '#theme-studio';
const token = (name: string) => `[data-value="${name}"]`;

async function setSelect(page: Page, selector: string, value: string) {
  await page.locator(selector).evaluate((el, next) => {
    (el as HTMLElement & { value: string }).value = next;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function setChecked(page: Page, selector: string, checked = true) {
  await page.locator(selector).evaluate((el, next) => {
    (el as HTMLElement & { checked: boolean }).checked = next;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, checked);
}

async function fillName(page: Page, value: string) {
  await page.locator('#ts-name').evaluate((el, next) => {
    (el as HTMLElement & { value: string }).value = next;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

async function appearanceValue(page: Page, key: string) {
  return page.locator(`[data-appearance=${key}]`).evaluate(
    (el) => (el as HTMLElement & { value: string }).value,
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto('/?lang=en&legacy=1');
  await expect(page.locator(studio)).toBeVisible();
});
test('nineteen palettes switch instantly; documentation preference is independent and persistent', async ({
  page,
}) => {
  await expect(page.locator('.ts-preset')).toHaveCount(19);
  await setSelect(page, '#docs-theme', 'nord');
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
    'retro',
    'fluent-light',
    'fluent-dark',
    'radix-light',
    'radix-dark',
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
  await fillName(page, 'My theme');
  await page.locator('[data-ts-action=save]').click();
  await expect(page.locator('#ts-saved vui-option')).toHaveCount(2);
  await page.reload();
  await setSelect(page, '#ts-saved', '0');
  await expect(page.locator(token('primary'))).toHaveValue('#123456');
  await fillName(page, 'Renamed');
  await page.locator('[data-ts-action=rename]').click();
  await expect
    .poll(() =>
      page.locator('#ts-saved').evaluate((el) => {
        const value = (el as HTMLElement & { value: string }).value;
        return (
          el.querySelector(`vui-option[value="${value}"]`)?.textContent ?? ''
        );
      }),
    )
    .toBe('Renamed');
  await page.locator('[data-ts-action=apply]').click();
  await expect
    .poll(() =>
      page.locator('#docs-theme').evaluate((el) => (el as HTMLElement & { value: string }).value),
    )
    .toBe('custom');
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
  await setSelect(page, '#ts-saved', '0');
  await page.locator('[data-ts-action=delete]').click();
  await expect(page.locator('#ts-saved vui-option')).toHaveCount(1);
});
test('all interface templates use actual VUI and original comparison stays isolated', async ({
  page,
}) => {
  await page.locator(token('surface')).fill('#123456');
  await page.locator(token('surface')).blur();
  await setChecked(page, '#ts-compare');
  await expect(page.locator('#ts-original-preview')).toBeVisible();
  for (const template of [
    'components',
    'dashboard',
    'settings',
    'login',
    'developer',
    'tabs',
  ]) {
    await setSelect(page, '#ts-template', template);
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
  await setSelect(page, '#ts-template', 'components');
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
  await setSelect(page, '#docs-theme', 'dracula');
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

test('developer preview has spaced controls and a textarea resizer at the control edge', async ({ page }) => {
  await page.locator('[data-preset="retro"]').click();
  await setSelect(page, '#ts-template', 'developer');
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    if (width === 390) await page.locator('[data-view=preview]').click();
    const preview = page.locator('#ts-live-preview');
    const boxes = await preview.locator('vui-vstack').evaluate(stack => Array.from(stack.children).map(el => {
      const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom };
    }));
    expect(boxes).toHaveLength(4);
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].top - boxes[i - 1].bottom).toBeGreaterThanOrEqual(12);
    const area = preview.locator('vui-textarea textarea');
    const geometry = await area.evaluate(el => {
      const outer = el.parentElement!.getBoundingClientRect(), inner = el.getBoundingClientRect();
      return { right: outer.right - inner.right, bottom: outer.bottom - inner.bottom, resize: getComputedStyle(el).resize };
    });
    expect(geometry.right).toBeLessThanOrEqual(2);
    expect(geometry.bottom).toBeLessThanOrEqual(2);
    expect(geometry.resize).toBe('vertical');
    expect(await preview.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  }
  await page.setViewportSize({ width: 1280, height: 844 });
  const area = page.locator('#ts-live-preview vui-textarea textarea');
  await area.scrollIntoViewIfNeeded();
  const before = (await area.boundingBox())!;
  await page.mouse.move(before.x + before.width - 5, before.y + before.height - 5);
  await page.mouse.down();
  await page.mouse.move(before.x + before.width - 5, before.y + before.height + 45, { steps: 5 });
  await page.mouse.up();
  expect((await area.boundingBox())!.height).toBeGreaterThan(before.height + 20);
});

test('shape families style real tabs, boxes and selectors independently', async ({ page }) => {
  await page.locator('[data-preset="retro"]').click();
  await setSelect(page, '#ts-template', 'tabs');
  expect(await appearanceValue(page, 'radiusBox')).toBe('8');
  expect(await appearanceValue(page, 'radiusField')).toBe('4');
  expect(await appearanceValue(page, 'radiusSelector')).toBe('4');
  await setChecked(page, '#ts-compare');
  for (const [key, value] of [['radiusBox', '20'], ['radiusField', '12'], ['radiusSelector', '2'], ['borderWidth', '2']]) {
    await page.locator(`[data-appearance=${key}]`).evaluate((el, next) => {
      (el as HTMLElement & { value: string }).value = next;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, value);
  }
  const root = page.locator('#ts-live-preview');
  await expect(root.locator('vui-panel section').first()).toHaveCSS('border-radius', '20px');
  await expect(root.locator('vui-panel section').first()).toHaveCSS('border-top-width', '2px');
  await expect(root.locator('vui-button button').first()).toHaveCSS('border-radius', '12px');
  await expect(root.locator('vui-badge [part=badge]').first()).toHaveCSS('border-radius', '2px');
  await expect(page.locator('#ts-original-preview vui-panel section').first()).toHaveCSS('border-radius', '8px');
  await expect(root.locator('vui-tab[selected]')).toHaveCSS('box-shadow', 'none');
  expect(await root.locator('vui-tabs').evaluate(el => getComputedStyle(el.shadowRoot!.querySelector('.tabs')!).boxShadow)).toBe('none');
  await root.locator('vui-tab[selected]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.locator('vui-tab[panel=details]')).toHaveAttribute('selected', '');
  await expect(root.locator('vui-tab-panel[name=details]')).toBeVisible();
  await expect(root.locator('vui-textarea textarea')).toHaveCSS('border-radius', '12px');
  await page.keyboard.press('End');
  await expect(root.locator('vui-tab[panel=settings]')).toHaveAttribute('selected', '');
  await setSelect(page, '#ts-template', 'components');
  await expect(root.locator('vui-pagination button').first()).toHaveCSS('border-radius', '12px');
  await expect(root.locator('vui-input .control').first()).toHaveCSS('border-radius', '12px');
  await expect(root.locator('vui-checkbox .box').first()).toHaveCSS('border-radius', '2px');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-view=preview]').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});
