import { expect, test } from '@playwright/test';

// Nothing is public until switched on in the admin (Videos & PDFs → Where they appear).
test('the Videos and Resources pages are hidden while switched off @smoke', async ({ request }) => {
  expect((await request.get('/videos')).status()).toBe(404);
  expect((await request.get('/resources')).status()).toBe(404);
});

test('the home page has no video section while switched off', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('section#videos')).toHaveCount(0);
});

test('PDF downloads need a valid, unexpired link @smoke', async ({ request }) => {
  const forged = await request.get('/api/resources/anything/download?t=forged.token');
  expect(forged.status()).toBe(403);
  const missing = await request.get('/api/resources/anything/download');
  expect(missing.status()).toBe(403);
});
