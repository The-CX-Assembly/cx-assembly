import { afterEach, describe, expect, it, vi } from 'vitest';

// env.ts reads NEXT_PUBLIC_APP_ENV when it loads, so each case re-imports.
async function load(appEnv?: string) {
  vi.resetModules();
  if (appEnv) vi.stubEnv('NEXT_PUBLIC_APP_ENV', appEnv);
  const [robots, seo] = await Promise.all([import('@/app/robots'), import('@/features/seo/metadata')]);
  return { robots: robots.default(), seo };
}

afterEach(() => vi.unstubAllEnvs());

describe('staging is hidden from search engines', () => {
  it('blocks every crawler in robots.txt', async () => {
    const { robots } = await load('staging');
    expect(robots.rules).toEqual([{ userAgent: '*', disallow: '/' }]);
    expect(robots.sitemap).toBeUndefined();
  });

  it('marks every page noindex', async () => {
    const { seo } = await load('staging');
    expect(seo.pageMetadata(seo.PAGES.founding50).robots).toEqual({ index: false, follow: false });
  });

  it('leaves production indexable', async () => {
    const { robots, seo } = await load('production');
    expect(robots.sitemap).toMatch(/\/sitemap\.xml$/);
    expect(seo.pageMetadata(seo.PAGES.founding50).robots).toEqual({ 'max-image-preview': 'large' });
  });
});
