import { expect, type Page, test } from '@playwright/test';

const modes = ['web', 'desktop', 'terminal'] as const;
const themes = ['catppuccin-latte', 'catppuccin-mocha'] as const;
const widths = [375, 768, 1280, 1920] as const;
const apps = ['dashboard', 'settings', 'workspace'] as const;

test.describe.configure({ timeout: 60_000 });

async function open(page: Page, app: string, ui: string, theme: string, width: number): Promise<void> {
  await page.setViewportSize({ width, height: 900 });
  // Domcontentloaded alone races the gallery module; wait until the template host mounts.
  await page.goto(`/layout.html?app=${app}&ui=${ui}&theme=${theme}&width=${width}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForFunction(
    (id) => {
      const frame = document.querySelector('#frame');
      return Boolean(frame?.querySelector(`[data-layout="${id}"]`) && frame.querySelector(`vui-template-${id}`));
    },
    app,
    { timeout: 20_000 },
  );
  await expect(page.locator(`#frame [data-layout="${app}"]`)).toBeVisible();
  await expect(page.locator(`#frame vui-template-${app}`)).toBeVisible();
}

async function assertStable(page: Page): Promise<void> {
  const report = await page.evaluate(() => {
    const frame = document.querySelector<HTMLElement>('#frame');
    if (!frame) return { overflow: 999, frameOverflow: 999, clipped: ['missing'] };
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    const frameOverflow = frame.scrollWidth - frame.clientWidth;
    const bounds = frame.getBoundingClientRect();
    const clipped: string[] = [];
    for (const el of frame.querySelectorAll<HTMLElement>('vui-button, vui-input, vui-select')) {
      if (el.closest('[hidden]')) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      let node: HTMLElement | null = el;
      let scrolled = false;
      while (node && node !== frame) {
        const parent: HTMLElement | null =
          node.parentElement ??
          (node.getRootNode() instanceof ShadowRoot ? (node.getRootNode() as ShadowRoot).host : null);
        if (!parent) break;
        const flow = getComputedStyle(parent);
        if (/(auto|scroll)/.test(`${flow.overflowX}${flow.overflowY}`)) {
          scrolled = true;
          break;
        }
        node = parent;
      }
      const outside =
        rect.left < bounds.left - 2 ||
        rect.right > bounds.right + 2 ||
        rect.top < bounds.top - 2 ||
        rect.bottom > bounds.bottom + 2;
      if (!scrolled && outside) clipped.push(el.localName);
    }
    return { overflow, frameOverflow, clipped: clipped.slice(0, 6) };
  });
  expect(report.overflow, 'page horizontal overflow').toBeLessThanOrEqual(1);
  expect(report.frameOverflow, 'frame horizontal overflow').toBeLessThanOrEqual(1);
  expect(report.clipped, 'clipped controls').toEqual([]);
}

async function geometry(page: Page): Promise<{ radius: string; bar: string; nav: string; font: string; bg: string }> {
  return page.evaluate(() => {
    const frame = document.querySelector('#frame');
    const template =
      frame?.querySelector('vui-template-dashboard, vui-template-settings, vui-template-workspace') ?? null;
    const shell = template?.shadowRoot?.querySelector('vui-shell') ?? frame?.querySelector('vui-shell');
    const section = frame?.querySelector('vui-panel')?.shadowRoot?.querySelector('section');
    const bar = frame?.querySelector('vui-toolbar')?.shadowRoot?.querySelector('.bar');
    const nav = shell?.shadowRoot?.querySelector('.rail');
    return {
      radius: section ? getComputedStyle(section).borderRadius : '',
      bar: bar ? getComputedStyle(bar).minHeight : '',
      nav: nav ? getComputedStyle(nav).width : '',
      font: getComputedStyle(document.body).fontFamily,
      bg: getComputedStyle(document.body).backgroundColor,
    };
  });
}

for (const ui of modes) {
  for (const theme of themes) {
    for (const width of widths) {
      test(`${ui} ${theme} ${width}`, async ({ page }) => {
        for (const app of apps) {
          await open(page, app, ui, theme, width);
          await assertStable(page);
        }
      });
    }
  }
}

test('theme switch keeps geometry', async ({ page }) => {
  await open(page, 'dashboard', 'web', 'catppuccin-latte', 1280);
  const light = await geometry(page);
  await open(page, 'dashboard', 'web', 'catppuccin-mocha', 1280);
  const dark = await geometry(page);
  expect(dark.radius).toBe(light.radius);
  expect(dark.bar).toBe(light.bar);
  expect(dark.nav).toBe(light.nav);
  expect(dark.bg).not.toBe(light.bg);
});

test('ui modes change structure', async ({ page }) => {
  await open(page, 'dashboard', 'web', 'catppuccin-latte', 1280);
  const web = await geometry(page);
  await open(page, 'dashboard', 'desktop', 'catppuccin-latte', 1280);
  const desktop = await geometry(page);
  await open(page, 'dashboard', 'terminal', 'catppuccin-latte', 1280);
  const terminal = await geometry(page);
  expect(web.radius).toBe('4px');
  expect(desktop.radius).toBe('8px');
  expect(terminal.radius).toBe('0px');
  expect(web.bar).toBe('44px');
  expect(desktop.bar).toBe('40px');
  expect(terminal.bar).toBe('28px');
  expect(terminal.nav).not.toBe(web.nav);
  expect(terminal.font.toLowerCase()).toMatch(/mono|consolas|courier/);
});

test('dashboard filter, nested scroll, and keyboard', async ({ page }) => {
  await open(page, 'dashboard', 'web', 'catppuccin-latte', 1280);
  await page.locator('#frame [data-filter] input').fill('zzzz-no-match');
  await expect(page.locator('#frame vui-data-grid')).toContainText('No matching orders');
  const scrolled = await page.locator('[data-nested-scroll]').evaluate((element) => {
    const view = element.shadowRoot?.querySelector('[part="viewport"]');
    if (!(view instanceof HTMLElement)) return false;
    view.scrollTop = 48;
    return view.scrollHeight > view.clientHeight + 4 && view.scrollTop > 0;
  });
  expect(scrolled).toBe(true);
  await page.locator('#frame vui-nav-item').first().locator('a').click();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('#frame vui-nav-item').nth(1)).toHaveAttribute('selected', '');
});

test('template forwards collapse and exposes shell skip link', async ({ page }) => {
  await open(page, 'dashboard', 'desktop', 'catppuccin-latte', 1280);
  const host = page.locator('#frame vui-template-dashboard');
  await expect(host).not.toHaveAttribute('collapsed');
  await page.locator('#frame [data-collapse]').click();
  await expect(host).toHaveAttribute('collapsed', '');
  const skip = await host.evaluate((node) => {
    const shell = node.shadowRoot?.querySelector('vui-shell');
    const link = shell?.shadowRoot?.querySelector<HTMLAnchorElement>('a.skip');
    return {
      text: link?.textContent ?? '',
      href: link?.getAttribute('href') ?? '',
    };
  });
  expect(skip.text.toLowerCase()).toContain('skip');
  expect(skip.href).toContain('#');
});

test('workspace split resizes and scrolls', async ({ page }) => {
  await open(page, 'workspace', 'desktop', 'catppuccin-mocha', 1280);
  const separator = page.locator('#frame vui-split-panel [part="separator"]');
  await separator.focus();
  const before = Number(await separator.getAttribute('aria-valuenow'));
  await page.keyboard.press('ArrowRight');
  expect(Number(await separator.getAttribute('aria-valuenow'))).toBeGreaterThan(before);
  const scrolled = await page.locator('[data-editor-scroll]').evaluate((element) => {
    const view = element.shadowRoot?.querySelector('[part="viewport"]');
    if (!(view instanceof HTMLElement)) return false;
    view.scrollTop = 80;
    return view.scrollHeight > view.clientHeight + 4 && view.scrollTop > 0;
  });
  expect(scrolled).toBe(true);
});

for (const ui of modes) {
  for (const theme of themes) {
    test(`snapshot dashboard ${ui} ${theme}`, async ({ page }) => {
      await open(page, 'dashboard', ui, theme, 1280);
      await expect(page.locator('#frame vui-data-grid')).toBeVisible();
      await expect(page.locator('#frame')).toHaveScreenshot(`dashboard-${ui}-${theme}.png`);
    });
  }
}

test('snapshot workspace and narrow settings', async ({ page }) => {
  await open(page, 'workspace', 'desktop', 'catppuccin-latte', 1280);
  await expect(page.locator('#frame vui-split-panel')).toBeVisible();
  await expect(page.locator('#frame')).toHaveScreenshot('workspace-desktop-light.png');
  await open(page, 'settings', 'terminal', 'catppuccin-mocha', 375);
  await expect(page.locator('#frame vui-input[invalid]')).toBeVisible();
  await expect(page.locator('#frame')).toHaveScreenshot('settings-terminal-dark-375.png');
});
