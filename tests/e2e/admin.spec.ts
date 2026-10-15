import { expect, test } from '@playwright/test';
import { HAS_DB, openJoinForm, signInAsAdmin } from './helpers';

test.beforeEach(async ({ context, baseURL }) => {
  await signInAsAdmin(context, baseURL!);
});

test('every admin page renders', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  const pages: [path: string, heading: RegExp][] = [
    ['/admin', /Good (morning|afternoon|evening)/],
    ['/admin/leads', /Applications & Inquiries/],
    ['/admin/content', /Copy & Sections/],
    ['/admin/settings', /Settings/],
    ['/admin/speakers', /CMO Speakers/],
    ['/admin/sites', /Websites/],
    ['/admin/users', /Users|Access/],
  ];
  for (const [path, heading] of pages) {
    await page.goto(path);
    await expect(page).not.toHaveURL(/\/admin\/login/);
    await expect(page.locator('main h1').first()).toHaveText(heading);
  }
  expect(errors).toEqual([]);
});

test('the old Leaders address redirects to CMO Speakers', async ({ page }) => {
  await page.goto('/admin/leaders');
  await expect(page).toHaveURL(/\/admin\/speakers$/);
});

test('dashboard shows Lead Sources and the website switcher', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Lead Sources' })).toBeVisible();
  for (const tab of ['Channel', 'Button', 'Landing page', 'Campaign']) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
  }
  await page.click('button[aria-label^="Website:"]');
  await expect(page.getByRole('menuitemradio', { name: /The CX Assembly/ })).toBeVisible();
});

test('speakers list is paginated and uses the new naming', async ({ page }) => {
  await page.goto('/admin/speakers');
  await expect(page.getByRole('navigation', { name: 'speakers pages' })).toContainText(/Showing\s*1\s*–\s*\d+\s*of\s*\d+\s*speakers/);
  await page.getByRole('button', { name: '+ Add CMO Speaker' }).click();
  await expect(page.getByText('Add CMO Speaker', { exact: true })).toBeVisible();
});

test('a lead submitted from a campaign link reaches the inbox with its source', async ({ page }) => {
  test.skip(!HAS_DB, 'Needs a database (runs in CI against the Firestore emulator).');

  const name = `E2E Campaign ${Date.now()}`;
  await page.goto('/?utm_source=linkedin&utm_medium=social&utm_campaign=e2e-inbox');
  const dialog = await openJoinForm(page, 'hero');
  await dialog.locator('#fullName').fill(name);
  await dialog.locator('#designation').fill('Head of CX');
  await dialog.locator('#company').fill('E2E Co');
  await dialog.locator('#email').fill('e2e-inbox@example.com');
  await dialog.locator('button[type="submit"]').click();
  await expect(dialog.getByRole('status')).toContainText('Application received');

  await page.goto(`/admin/leads?q=${encodeURIComponent(name)}`);
  const row = page.locator('tr', { hasText: name });
  await expect(row).toContainText('e2e-inbox');
  await expect(row).toContainText('Hero');
  await expect(row).toContainText('linkedin');

  await page.goto('/admin');
  await expect(page.locator('section[aria-labelledby="lead-sources-title"]')).toContainText('e2e-inbox');
});
