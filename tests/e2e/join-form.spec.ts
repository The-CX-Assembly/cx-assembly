import { expect, test } from '@playwright/test';
import { openJoinForm } from './helpers';

test.describe('Join CTAs record where each lead came from @smoke', () => {
  const desktopCtas: [path: string, cta: string][] = [
    ['/', 'navbar'],
    ['/', 'hero'],
    ['/', 'for-leaders-tile'],
    ['/', 'footer'],
    ['/community-voices', 'community-voices'],
    ['/founding-50', 'navbar'],
  ];

  for (const [path, cta] of desktopCtas) {
    test(`"${cta}" on ${path}`, async ({ page }) => {
      await page.goto(path);
      const dialog = await openJoinForm(page, cta);
      await expect(dialog.locator('input[name="source_cta"]')).toHaveValue(cta);
      await expect(dialog.locator('input[name="source_page"]')).toHaveValue(path);
      await expect(dialog.locator('input[name="type"]')).toHaveValue('cx_leader');
    });
  }

  test('"mobile-menu" on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.click('button[aria-controls="mobile-menu"]');
    const dialog = await openJoinForm(page, 'mobile-menu');
    await expect(dialog.locator('input[name="source_cta"]')).toHaveValue('mobile-menu');
  });

  test('#join links open the form', async ({ page }) => {
    await page.goto('/#join');
    await expect(page.locator('dialog.join-dialog[open] input[name="source_cta"]')).toHaveValue('join-link');
  });
});

test('campaign tags survive browsing to another page @smoke', async ({ page }) => {
  await page.goto('/?utm_source=linkedin&utm_medium=social&utm_campaign=e2e-launch');
  await page.click('a[href="/founding-50"]');
  await page.waitForURL('**/founding-50');
  const dialog = await openJoinForm(page, 'navbar');
  await expect(dialog.locator('input[name="utm_source"]')).toHaveValue('linkedin');
  await expect(dialog.locator('input[name="utm_medium"]')).toHaveValue('social');
  await expect(dialog.locator('input[name="utm_campaign"]')).toHaveValue('e2e-launch');
  await expect(dialog.locator('input[name="source_landing_page"]')).toHaveValue('/');
  await expect(dialog.locator('input[name="source_page"]')).toHaveValue('/founding-50');
});

test('invalid submissions show errors and keep what was typed', async ({ page }) => {
  await page.goto('/');
  const dialog = await openJoinForm(page, 'hero');
  await dialog.locator('#fullName').fill('Test Lead');
  await dialog.locator('#email').fill('not-an-email');
  await dialog.locator('button[type="submit"]').click();

  await expect(dialog.getByText('Designation / Title is required')).toBeVisible();
  await expect(dialog.getByText('Please enter a valid email address')).toBeVisible();
  await expect(dialog.locator('#fullName')).toHaveValue('Test Lead');
  await expect(dialog.locator('#email')).toHaveValue('not-an-email');
});

test('a valid application is confirmed', async ({ page }) => {
  await page.goto('/');
  const dialog = await openJoinForm(page, 'hero');
  await dialog.locator('#fullName').fill('E2E Applicant');
  await dialog.locator('#designation').fill('QA Lead');
  await dialog.locator('#company').fill('E2E Test Co');
  await dialog.locator('#email').fill('e2e-applicant@example.com');
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog.getByRole('status')).toContainText('Application received');
});
