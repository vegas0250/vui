import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { exports: Record<string, string | { import: string }> };
test.setTimeout(120000);

test('bilingual catalog has a direct, complete page for every visual component', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?lang=en#/components');
  await expect(page.locator('.docs-cards > a')).toHaveCount(69);
  const tags = await page.locator('.docs-cards code').allTextContents();
  for (const tag of tags) {
    await page.evaluate((tag) => { location.hash = '#/components/' + tag.slice(4); }, tag);
    await expect(page.locator('.docs-import')).toContainText('import');
    await expect(page.locator('.docs-live').first().locator(tag).first()).toBeAttached();
    await expect(page.getByRole('heading', { name: 'Accessibility', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Events', exact: true })).toBeAttached();
  }
  expect(errors).toEqual([]);
  await page.reload();
  await expect(page.locator('.docs-import')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Find a component' }).fill('кнопка');
  expect(await page.locator('#docs-component-menu a').count()).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'Русский', exact: true }).click();
  await expect(page.getByRole('searchbox', { name: 'Найти компонент' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Разделы документации' }).getByRole('link')).toHaveCount(4);
  await expect(page).toHaveURL(/lang=ru.*#\/components\//);
});

test('settings, filters, dialog and shell are working compositions', async ({ page }) => {
  await page.goto('/?lang=en#/examples/settings');
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Grace');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('[data-result]')).toHaveText('Saved: Grace');
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('#docs-page vui-input')).toHaveAttribute('invalid', '');
  await page.evaluate(() => { location.hash = '#/examples/table'; });
  await page.getByRole('textbox', { name: 'Find projects' }).fill('Nova');
  await expect(page.getByRole('gridcell', { name: 'Nova', exact: true })).toBeVisible();
  await expect(page.getByRole('gridcell', { name: 'Atlas', exact: true })).toHaveCount(0);
  await page.evaluate(() => { location.hash = '#/examples/dialog'; });
  await page.getByRole('button', { name: 'Open', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open', exact: true })).toBeFocused();
  await page.evaluate(() => { location.hash = '#/examples/shell'; });
  await page.getByRole('button', { name: 'Navigation', exact: true }).click();
  await expect(page.locator('#docs-page vui-shell')).toHaveAttribute('collapsed', '');
});

test('copied example runs independently with its declared imports', async ({ page, context, baseURL }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?lang=en#/examples/settings');
  const code = await page.locator('[data-example-code]').textContent();
  await page.getByRole('button', { name: 'Copy example', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
  const imports = Object.fromEntries(Object.entries(pkg.exports).flatMap(([name, entry]) =>
    typeof entry === 'object' ? [[`vui${name.slice(1)}`, `${baseURL}/${entry.import.replace('./dist/', 'src/').replace(/\.js$/, '.ts')}`]] : [],
  ));
  await page.evaluate(({ code, imports }) => {
    const frame = document.createElement('iframe');
    frame.title = 'Copied example';
    frame.srcdoc = `<script type="importmap">${JSON.stringify({ imports })}</script>${code}`;
    document.querySelector('#docs-page')!.replaceChildren(frame);
  }, { code, imports });
  const frame = page.frameLocator('iframe[title="Copied example"]');
  await frame.getByRole('textbox', { name: 'Name', exact: true }).fill('Independent');
  await frame.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(frame.locator('[data-result]')).toHaveText('Saved: Independent');
});

test('standalone documentation persists preferences and fits a narrow viewport', async ({ page }) => {
  await page.goto('/?lang=en#/components/button');
  await page.locator('#docs-theme').selectOption('nord');
  await expect(page.locator('[data-example-code]').first()).toContainText('applyTheme("nord")');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vui.theme.preference.v1')!))).toBe('nord');
  await page.locator('#density-select button').click();
  await page.getByRole('option', { name: 'Compact', exact: true }).click();
  await expect(page.locator('[data-example-code]').first()).toContainText("setDensity('compact')");
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'nord');
  await expect(page.locator('html')).toHaveAttribute('data-vui-density', 'compact');
  await page.evaluate(() => { location.hash = '#/themes'; });
  await page.locator('[data-value="primary"]').fill('#123456');
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'nord');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
