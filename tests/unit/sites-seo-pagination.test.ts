import { describe, expect, it } from 'vitest';
import { DEFAULT_SITE_ID, SITE_ID_PATTERN, siteIdOf, slugifySiteId } from '@/modules/sites/models/site.constants';
import { PAGES, SITE_URL, fullTitle, pageGraph, pageMetadata } from '@/modules/seo/utils/metadata';
import { pageList } from '@/components/admin/Pagination';

describe('site ids', () => {
  it('slugifies website names', () => {
    expect(slugifySiteId('The CMO Assembly')).toBe('cmo-assembly');
    expect(slugifySiteId('  CX & Growth Summit 2026! ')).toBe('cx-growth-summit-2026');
  });

  it('accepts only simple lowercase ids', () => {
    expect(SITE_ID_PATTERN.test('cmo-assembly')).toBe(true);
    expect(SITE_ID_PATTERN.test('CMO')).toBe(false);
    expect(SITE_ID_PATTERN.test('-cmo')).toBe(false);
    expect(SITE_ID_PATTERN.test('cmo/assembly')).toBe(false);
  });

  it('credits leads without a siteId to the original site', () => {
    expect(siteIdOf({})).toBe(DEFAULT_SITE_ID);
    expect(siteIdOf({ siteId: 'cmo-assembly' })).toBe('cmo-assembly');
  });
});

describe('SEO metadata', () => {
  it('builds titles like "Page - The CX Assembly"', () => {
    expect(fullTitle('Privacy Policy')).toBe('Privacy Policy - The CX Assembly');
    expect(fullTitle()).toBe('The CX Assembly');
  });

  it('gives subpages article previews, a canonical URL and a large image', () => {
    const meta = pageMetadata(PAGES.communityVoices);
    expect(meta.alternates?.canonical).toBe('/community-voices');
    expect(meta.robots).toEqual({ 'max-image-preview': 'large' });
    expect(meta.openGraph).toMatchObject({ type: 'article', title: 'Community Voices - The CX Assembly' });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('marks the home page as a website', () => {
    expect(pageMetadata({ description: 'd', path: '/' }).openGraph).toMatchObject({ type: 'website' });
  });

  it('links page structured data to the site graph', () => {
    const graph = pageGraph(PAGES.founding50)['@graph'];
    const crumbs = graph.find((n) => n['@type'] === 'BreadcrumbList');
    const page = graph.find((n) => n['@type'] === 'WebPage');
    expect(crumbs?.itemListElement?.map((c) => c.name)).toEqual(['Home', 'The Founding 50 Leaders']);
    expect(page).toMatchObject({ url: `${SITE_URL}/founding-50`, isPartOf: { '@id': `${SITE_URL}/#website` } });
  });
});

describe('pagination page numbers', () => {
  it('shows every page when there are few', () => {
    expect(pageList(1, 3)).toEqual([1, 2, 3]);
  });

  it('collapses long ranges around the current page', () => {
    expect(pageList(5, 13)).toEqual([1, 'gap', 4, 5, 6, 'gap', 13]);
    expect(pageList(1, 13)).toEqual([1, 2, 'gap', 13]);
    expect(pageList(13, 13)).toEqual([1, 'gap', 12, 13]);
  });
});
