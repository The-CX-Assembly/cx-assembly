import { expect, test } from '@playwright/test';

test('public pages have titles, canonical links and share previews @smoke', async ({ page }) => {
  const pages: [path: string, title: RegExp, ogType: string][] = [
    ['/', /The CX Assembly/, 'website'],
    ['/founding-50', /^The Founding 50 Leaders - The CX Assembly$/, 'article'],
    ['/community-voices', /^Community Voices - The CX Assembly$/, 'article'],
    ['/privacy-policy', /^Privacy Policy - The CX Assembly$/, 'article'],
  ];
  for (const [path, title, ogType] of pages) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path === '/' ? '' : path}$`));
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', ogType);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/brand\/og-image\.png$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    const graphs = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = graphs.flatMap((g) => (JSON.parse(g)['@graph'] ?? []).map((n: { '@type': string }) => n['@type']));
    expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'WebPage', 'BreadcrumbList']));
  }
});

test('robots.txt keeps admin and API out and links the sitemap', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /admin');
  expect(robots).toContain('Disallow: /api/');
  expect(robots).toMatch(/Sitemap: .+\/sitemap\.xml/);
});

test('admin pages are not indexable', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('the website API rejects requests without a valid key @smoke', async ({ request }) => {
  const noKey = await request.post('/api/v1/leads', { data: { fullName: 'x', email: 'x@y.com' } });
  expect(noKey.status()).toBe(401);
  const badKey = await request.get('/api/v1/content', { headers: { 'x-api-key': 'cxa_wrong' } });
  expect(badKey.status()).toBe(401);
});
