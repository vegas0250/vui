import type { VMenu } from '../../src/components/overlay/menu';
import { expect, test } from '@playwright/test';

test.setTimeout(90_000);

for (const id of ['catppuccin-mocha', 'catppuccin-latte', 'tokyo-night', 'tokyo-night-day', 'dracula', 'nord']) {
  test(`${id}: the same dashboard, form, table, menu and dialog`, async ({ page }) => {
    await page.goto('/?lang=en&legacy=1');
    await page.locator(`[data-preset="${id}"]`).click();
    await page.locator('#ts-template').selectOption('components');
    const root = page.locator('#ts-live-preview');
    await expect(root).toHaveAttribute('data-vui-theme', id);
    await expect(root.locator('vui-data-grid')).toBeVisible();
    await root.evaluate(el => {
      // Isolate the real preview as one reviewable scene, retaining its events and theme.
      for (const property of Array.from((el as HTMLElement).style))
        document.documentElement.style.setProperty(property, (el as HTMLElement).style.getPropertyValue(property));
      document.body.replaceChildren(el);
      Object.assign((el as HTMLElement).style, { maxWidth: '1120px', margin: 'auto', padding: '24px' });
      el.insertAdjacentHTML('afterbegin', '<vui-panel heading="Project dashboard"><vui-hstack gap="lg"><strong>VUI · 12 active projects</strong><vui-badge tone="success" variant="soft">All systems operational</vui-badge></vui-hstack></vui-panel>');
      const variants = ['solid', 'soft', 'outline', 'ghost'];
      const tones = ['neutral', 'primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info'];
      const scene = document.createElement('div');
      scene.dataset.semanticScene = '';
      for (const tone of tones) for (const variant of variants) {
        const button = document.createElement('vui-button');
        button.setAttribute('tone', tone);
        button.setAttribute('variant', variant);
        button.textContent = `${tone} ${variant}`;
        scene.append(button);
      }
      scene.insertAdjacentHTML('beforeend', '<vui-button tone="accent" variant="ghost" disabled>Disabled</vui-button><vui-icon-button name="plus" label="Add" tone="accent" variant="soft"></vui-icon-button><vui-chip tone="accent" variant="soft">Design</vui-chip><vui-badge tone="success" variant="solid">Ready</vui-badge><vui-alert tone="warning" variant="soft">Review required</vui-alert><vui-input label="Project" value="VUI"></vui-input><vui-input label="Disabled" disabled></vui-input><vui-input label="Invalid" invalid></vui-input><vui-nav label="Projects"><vui-nav-item selected href="#">Overview</vui-nav-item><vui-nav-item disabled>Archived</vui-nav-item></vui-nav><vui-menu label="Actions"><vui-menu-item label="Rename"></vui-menu-item><vui-menu-item label="Delete" disabled></vui-menu-item></vui-menu>');
      el.append(scene);
    });
    const disabled = root.locator('vui-button[tone][disabled] button');
    await expect(disabled).toBeDisabled();
    const secondary = await root.evaluate(el => getComputedStyle(el).getPropertyValue('--vui-color-secondary').trim());
    expect(await disabled.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(await root.evaluate((el, color) => {
      const probe = document.createElement('span'); probe.style.color = color; el.append(probe);
      const value = getComputedStyle(probe).color; probe.remove(); return value;
    }, secondary));
    const failures = await root.evaluate(async el => {
      const path = '/src/theme/colors.ts';
      const { contrast } = await import(/* @vite-ignore */ path) as typeof import('../../src/theme/colors');
      const canvas = getComputedStyle(el).backgroundColor;
      const failures: string[] = [];
      for (const button of el.querySelectorAll('vui-button[tone]')) {
        const control = button.shadowRoot!.querySelector('button')!;
        if (control.disabled) continue;
        const style = getComputedStyle(control);
        const bg = style.backgroundColor === 'rgba(0, 0, 0, 0)' ? canvas : style.backgroundColor;
        if (contrast(style.color, bg) < 4.5) failures.push(`${button.textContent}: text`);
        if (button.getAttribute('variant') === 'outline' && contrast(style.borderTopColor, canvas) < 3)
          failures.push(`${button.textContent}: boundary`);
      }
      return failures;
    });
    expect(failures).toEqual([]);
    const action = root.locator('vui-button[tone="accent"][variant="soft"]');
    const base = action.locator('button');
    const background = await base.evaluate(el => getComputedStyle(el).backgroundColor);
    await action.hover();
    await expect(base).toHaveCSS('background-color', background);
    await base.focus();
    await expect(base).toBeFocused();
    await page.mouse.down();
    await expect(base).toHaveCSS('background-color', background);
    await page.mouse.up();
    await root.locator('vui-menu').evaluate(el => (el as VMenu).showAt(250, 200));
    await expect(root.locator('vui-menu-item').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await root.screenshot({ path: `.artifacts/theme-semantics/${id}-scene.png` });
    await root.locator('[data-preview-modal]').click();
    await expect(root.locator('vui-dialog dialog')).toBeVisible();
    await page.screenshot({ path: `.artifacts/theme-semantics/${id}-dialog.png`, fullPage: false });
    await root.locator('[data-preview-close]').click();
    await expect(root.locator('vui-dialog dialog')).not.toBeVisible();
  });
}
