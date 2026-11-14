import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { exports: Record<string, string | { import: string }> };
test.setTimeout(120000);

test('bilingual catalog has a direct, complete page for every visual component', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?lang=en#/components');
  await expect(page.locator('.docs-cards > a')).toHaveCount(63);
  const tags = await page.locator('.docs-cards code').allTextContents();
  for (const tag of tags) {
    await page.evaluate((tag) => { location.hash = '#/components/' + tag.slice(4); }, tag);
    await expect(page.locator('.docs-import')).toContainText('import');
    await expect(page.locator('.docs-live').first().locator(tag).first()).toBeAttached();
    await expect(page.getByRole('heading', { name: 'Keyboard and accessibility', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Purpose and guidance', exact: true })).toBeVisible();
  }
  expect(errors).toEqual([]);
  await page.reload();
  await expect(page.locator('.docs-import')).toBeVisible();
  await page.locator('#component-search').getByRole('searchbox').fill('кнопка');
  expect(await page.locator('#docs-component-menu vui-menu-item[href]').count()).toBeGreaterThan(0);
  await page.locator('#docs-lang button').click();
  await page.getByRole('option', { name: 'RU', exact: true }).click();
  await expect(page.locator('#component-search').getByRole('searchbox')).toBeVisible();
  await expect(page.locator('#docs-sidebar .docs-section-menu > vui-menu-item')).toHaveCount(7);
  await expect(page).toHaveURL(/lang=ru.*#\/components\//);
});

test('settings, filters, dialog and shell are working compositions', async ({ page }) => {
  await page.goto('/?lang=en#/examples/settings');
  await expect(page).toHaveURL(/#\/(compositions|layouts)\/settings/);
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Grace');
  await page.locator('#docs-page').getByRole('button', { name: 'Save', exact: true }).click({ force: true });
  await expect(page.locator('[data-result]')).toHaveText('Saved: Grace');
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('');
  await page.locator('#docs-page').getByRole('button', { name: 'Save', exact: true }).click({ force: true });
  await expect(page.locator('#docs-page vui-input[label="Name"]')).toHaveAttribute('invalid', '');
  await page.evaluate(() => { location.hash = '#/examples/table'; });
  await expect(page).toHaveURL(/#\/(compositions|patterns)\/table/);
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

test('full standalone example runs independently with its declared imports', async ({ page, context, baseURL }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/?lang=en#/layouts/settings');
  await page.locator('#docs-page').getByRole('button', { name: 'Full example', exact: true }).first().click();
  const code = (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');
  expect(code).toContain("import '");
  expect(code).toContain('<script type="module">');
  expect(code).not.toContain('applyTheme');
  expect(code).not.toContain('wireExample');
  const imports = Object.fromEntries(Object.entries(pkg.exports).flatMap(([name, entry]) =>
    typeof entry === 'object' ? [[`vui${name.slice(1)}`, `${baseURL}/${entry.import.replace('./dist/', 'src/').replace(/\.js$/, '.ts')}`]] : [],
  ));
  await page.evaluate(({ code, imports }) => {
    const frame = document.createElement('iframe');
    frame.title = 'Copied example';
    // A default 300x150 iframe squeezes the template so its footer and nav overlap the form buttons.
    frame.style.cssText = 'display:block;width:100%;height:900px;border:0';
    frame.srcdoc = `<script type="importmap">${JSON.stringify({ imports })}</script>${code.replace(/^<!--[\s\S]*?-->\n?/, '')}`;
    document.querySelector('#docs-page')!.replaceChildren(frame);
  }, { code, imports });
  const frame = page.frameLocator('iframe[title="Copied example"]');
  await expect(frame.getByRole('textbox', { name: 'Name', exact: true })).toBeVisible();
  await frame.getByRole('textbox', { name: 'Name', exact: true }).fill('Independent');
  await frame.locator('vui-button[data-save]').click();
  await expect(frame.locator('[data-result]')).toHaveText('Saved: Independent', { timeout: 15000 });
});

test('standalone documentation persists preferences and fits a narrow viewport', async ({ page }) => {
  await page.goto('/?lang=en#/components/button');
  await page.locator('#docs-theme').evaluate((el) => {
    (el as HTMLElement & { value: string }).value = 'nord';
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'nord');
  await expect(page.locator('[data-example-code]').first()).not.toContainText('applyTheme');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('vui.theme.preference.v1')!))).toBe('nord');
  await page.locator('#ui-mode-select button').click();
  await page.getByRole('option', { name: 'Desktop', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-vui-ui', 'desktop');
  await expect(page.locator('[data-example-code]').first()).not.toContainText('setUIMode');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'nord');
  await expect(page.locator('html')).toHaveAttribute('data-vui-ui', 'desktop');
  await page.evaluate(() => { location.hash = '#/themes'; });
  await page.locator('[data-value="primary"]').fill('#123456');
  await expect(page.locator('html')).toHaveAttribute('data-vui-theme', 'nord');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
