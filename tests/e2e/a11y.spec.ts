import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/visual.html?theme=light&density=comfortable');
  await page.locator('#board').waitFor();
});

test('board exposes names, roles, and states in the accessibility tree', async ({ page }) => {
  const board = page.locator('#board');
  await expect(board.getByRole('heading', { name: 'VUI states', level: 1 })).toBeVisible();
  await expect(board.getByRole('button', { name: 'Save' })).toBeEnabled();
  await expect(board.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  await expect(board.getByRole('textbox', { name: 'Email' })).toHaveAccessibleDescription('Enter a valid email');
  await expect(board.getByRole('textbox', { name: 'Locked' })).toBeDisabled();
  await expect(board.getByRole('checkbox', { name: 'On' })).toBeChecked();
  await expect(board.getByRole('checkbox', { name: 'Disabled' })).toBeDisabled();
  await expect(board.getByRole('switch', { name: 'On' })).toBeChecked();
  await expect(board.getByRole('switch', { name: 'Disabled' })).toBeDisabled();
  await expect(board.getByRole('combobox', { name: 'Language' })).toBeVisible();
  await expect(board.getByRole('grid', { name: 'Components' })).toBeVisible();
  await expect(board.getByRole('button', { name: 'Close' })).toBeVisible();
});

test('button name, keyboard activation, and skipped disabled control', async ({ page }) => {
  const button = page.locator('#btn-primary');
  await expect(page.getByRole('button', { name: 'Save' })).toHaveAccessibleName('Save');
  await button.evaluate((element) => {
    element.addEventListener('click', () => {
      element.setAttribute('data-clicks', String(Number(element.getAttribute('data-clicks') ?? '0') + 1));
    });
  });
  await button.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('data-clicks', '2');

  for (let step = 0; step < 8; step += 1) {
    await page.keyboard.press('Tab');
    const id = await page.evaluate(() => document.activeElement?.id ?? '');
    expect(id).not.toBe('btn-disabled');
  }
});

test('checkbox and switch toggle with Space and expose their roles', async ({ page }) => {
  const checkbox = page.locator('#check-off');
  await checkbox.focus();
  await page.keyboard.press('Space');
  await expect(checkbox).toHaveAttribute('checked', '');

  const toggle = page.locator('#switch-off');
  await expect(toggle.locator('input')).toHaveAttribute('role', 'switch');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('checked', '');
});

test('input exposes invalid state and its hint', async ({ page }) => {
  const state = await page.locator('#input-invalid').evaluate((element) => {
    const field = element.shadowRoot?.querySelector('input');
    const hint = element.shadowRoot?.querySelector('.hint');
    return {
      invalid: field?.getAttribute('aria-invalid'),
      describedBy: field?.getAttribute('aria-describedby'),
      hintId: hint?.id ?? '',
      hint: hint?.textContent ?? '',
    };
  });
  expect(state.invalid).toBe('true');
  expect(state.hint).toBe('Enter a valid email');
  expect(state.describedBy).toBe(state.hintId);
});

test('select commits with the keyboard and closes on Escape', async ({ page }) => {
  const select = page.locator('#select');
  await select.focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(select).toHaveAttribute('value', 'ru');

  await select.focus();
  await page.keyboard.press('ArrowDown');
  await expect(select.locator('button')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(select.locator('button')).toHaveAttribute('aria-expanded', 'false');
});

test('dialog traps focus and restores it to the opener', async ({ page }) => {
  const opener = page.locator('#open-dialog');
  await opener.click();
  const dialog = page.locator('#focus-dialog');
  await expect(dialog).toHaveAttribute('open', '');
  await expect(opener).not.toBeFocused();

  const inside = await page.evaluate(() => {
    const host = document.querySelector('#focus-dialog');
    const active = document.activeElement;
    return active === host || Boolean(host?.contains(active)) || Boolean(host?.shadowRoot?.activeElement);
  });
  expect(inside).toBe(true);

  await page.keyboard.press('Tab');
  const tabbed = await page.evaluate(() => {
    const host = document.querySelector('#focus-dialog');
    if (!host) return false;
    const active = document.activeElement;
    return active === host || host.contains(active) || Boolean(host.shadowRoot?.activeElement);
  });
  expect(tabbed).toBe(true);
  await expect(page.locator('#before')).not.toBeFocused();
  await expect(page.locator('#key-next')).not.toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(opener).toBeFocused();
});

test('tabs move with arrows and a tooltip is described then dismissed', async ({ page }) => {
  const first = page.locator('vui-tab', { hasText: 'One' });
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('vui-tab', { hasText: 'Two' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(first).toHaveAttribute('aria-selected', 'true');

  await page.locator('#tip-target').focus();
  await expect
    .poll(async () =>
      page.locator('#tip-target').evaluate((element) => {
        const button = element.shadowRoot?.querySelector('button');
        return button?.getAttribute('aria-describedby') ?? '';
      }),
    )
    .not.toBe('');
  await page.keyboard.press('Escape');
  await expect
    .poll(async () =>
      page.locator('#tip').evaluate((element) => element.shadowRoot?.querySelector('.tip')?.hasAttribute('hidden') ?? false),
    )
    .toBe(true);
});
