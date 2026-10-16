import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureAttribution, readAttribution } from '@/modules/leads/utils/attribution';

/** Minimal browser globals: the attribution helper only touches these. */
function visit(url: string, referrer = '') {
  const u = new URL(url);
  vi.stubGlobal('window', { location: { search: u.search, pathname: u.pathname, host: u.host } });
  vi.stubGlobal('document', { referrer });
}

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('campaign attribution', () => {
  it('remembers the campaign link the visit started on', () => {
    visit('https://cx.example/?utm_source=linkedin&utm_medium=social&utm_campaign=launch');
    captureAttribution();
    expect(readAttribution()).toMatchObject({
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'launch',
      landing_page: '/',
    });
  });

  it('keeps it while the visitor browses other pages', () => {
    visit('https://cx.example/?utm_campaign=launch');
    captureAttribution();
    visit('https://cx.example/founding-50', 'https://cx.example/');
    captureAttribution();
    expect(readAttribution()).toMatchObject({ utm_campaign: 'launch', landing_page: '/' });
  });

  it('lets a newer tagged link take the credit', () => {
    visit('https://cx.example/?utm_campaign=first');
    captureAttribution();
    visit('https://cx.example/founding-50?utm_campaign=second');
    captureAttribution();
    expect(readAttribution().utm_campaign).toBe('second');
  });

  it('records outside referrers but not our own pages', () => {
    visit('https://cx.example/', 'https://www.linkedin.com/feed/');
    captureAttribution();
    expect(readAttribution().referrer).toBe('https://www.linkedin.com/feed/');
  });

  it('does nothing when storage is blocked', () => {
    vi.stubGlobal('sessionStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    visit('https://cx.example/?utm_campaign=x');
    expect(() => captureAttribution()).not.toThrow();
    expect(readAttribution()).toEqual({});
  });
});
