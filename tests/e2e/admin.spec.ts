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
    ['/admin/leads', /Leads/],
    ['/admin/content', /Content/],
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
  await page.getByRole('button', { name: 'Add CMO Speaker' }).click();
  await expect(page.getByRole('dialog', { name: 'Add CMO Speaker' })).toBeVisible();
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

test('lead details open in a side panel and the status can be changed there', async ({ page }) => {
  test.skip(!HAS_DB, 'Needs a lead in the database (runs in CI against the Firestore emulator).');
  await page.goto('/admin/leads');
  await page.locator('tbody tr').first().click();
  const panel = page.getByRole('dialog');
  await expect(panel.getByText('Where they came from')).toBeVisible();
  await panel.getByRole('radio', { name: 'Reviewing' }).click();
  await expect(panel.getByRole('radio', { name: 'Reviewing' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('status').filter({ hasText: 'Marked as Reviewing' })).toBeVisible();
});

test('content editor shows every section and tracks unsaved changes', async ({ page }) => {
  await page.goto('/admin/content');
  for (const name of ['Hero', 'Why We Exist', 'Philosophy', 'For CX Leaders', 'For Partners', 'About Us', 'Founding 50', 'Privacy Policy']) {
    await expect(page.getByRole('navigation', { name: 'Page sections' }).getByRole('button', { name })).toBeVisible();
  }
  // Philosophy used to have no editor at all.
  await page.getByRole('navigation', { name: 'Page sections' }).getByRole('button', { name: 'Philosophy' }).click();
  await expect(page.getByLabel('Pillar 1 title')).toBeVisible();
  await page.getByLabel('Pillar 1 title').fill('Changed title');
  await expect(page.getByText('Unsaved changes')).toBeVisible();
  await page.getByRole('button', { name: 'Discard' }).click();
  await expect(page.getByText('Unsaved changes')).toHaveCount(0);
});
