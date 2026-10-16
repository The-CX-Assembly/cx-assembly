import { describe, expect, it } from 'vitest';
import { buildDashboard, timeAgo } from '@/modules/dashboard/services/dashboard.service';
import type { Lead, LeadSource } from '@/modules/leads/models/lead.model';

const NOW = new Date('2026-10-15T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

let seq = 0;
function lead(source: LeadSource | undefined, overrides: Partial<Lead> = {}): Lead {
  seq += 1;
  return {
    id: `l${seq}`,
    type: 'cx_leader',
    fullName: `Lead ${seq}`,
    designation: 'CX',
    company: 'Co',
    email: `l${seq}@x.com`,
    status: 'new',
    createdAt: daysAgo(1),
    source,
    ...overrides,
  };
}

const rows = (leads: Lead[], dimension: 'campaign' | 'channel' | 'button' | 'landing') =>
  Object.fromEntries(buildDashboard(leads, NOW).sources.all.rows[dimension].map((r) => [r.label, r.leads]));

describe('Lead Sources: channel detection', () => {
  it('uses utm_source first, then the referring site', () => {
    const leads = [
      lead({ cta: 'hero', utmSource: 'linkedin' }),
      lead({ cta: 'hero', referrer: 'https://www.google.com/search?q=cx' }),
      lead({ cta: 'hero', referrer: 'https://lnkd.in/abc' }),
      lead({ cta: 'hero', utmSource: 'fb' }),
      lead({ cta: 'hero', referrer: 'https://t.co/xyz' }),
      lead({ cta: 'hero', utmMedium: 'email', utmSource: 'mailchimp-weekly' }),
    ];
    expect(rows(leads, 'channel')).toEqual({
      LinkedIn: 2,
      Google: 1,
      'Meta (Facebook / Instagram)': 1,
      'X (Twitter)': 1,
      Email: 1,
    });
  });

  it('separates direct visits from leads that predate tracking', () => {
    const leads = [lead({ cta: 'navbar', page: '/' }), lead(undefined)];
    expect(rows(leads, 'channel')).toEqual({ 'Direct / unknown': 1, 'Not tracked': 1 });
  });

  it('title-cases unknown sources', () => {
    expect(rows([lead({ cta: 'hero', utmSource: 'partner-newsletter_q3' })], 'channel')).toEqual({ Email: 1 });
    expect(rows([lead({ cta: 'hero', utmSource: 'cmo-assembly' })], 'channel')).toEqual({ 'Cmo Assembly': 1 });
  });
});

describe('Lead Sources: other dimensions', () => {
  it('groups by campaign, button and landing page', () => {
    const leads = [
      lead({ cta: 'hero', utmCampaign: 'world-cx-day', landingPage: '/' }),
      lead({ cta: 'for-leaders-tile', utmCampaign: 'world-cx-day', landingPage: '/founding-50' }),
      lead({ cta: 'navbar', page: '/privacy-policy' }),
    ];
    expect(rows(leads, 'campaign')).toEqual({ 'world-cx-day': 2, 'No campaign tag': 1 });
    expect(rows(leads, 'button')).toEqual({ Hero: 1, 'For Leaders Tile': 1, Navbar: 1 });
    expect(rows(leads, 'landing')).toEqual({ '/': 1, '/founding-50': 1, '/privacy-policy': 1 });
  });

  it('counts approvals and folds the long tail into one row', () => {
    const leads = Array.from({ length: 8 }, (_, i) =>
      lead({ cta: 'hero', utmCampaign: `c${i}` }, { status: i === 0 ? 'approved' : 'new' }),
    );
    const campaign = buildDashboard(leads, NOW).sources.all.rows.campaign;
    expect(campaign).toHaveLength(6);
    expect(campaign.at(-1)).toMatchObject({ label: '3 others', leads: 3 });
    expect(campaign.reduce((n, r) => n + r.approved, 0)).toBe(1);
  });

  it('splits by time range and reports the tagged share', () => {
    const leads = [
      lead({ cta: 'hero', utmCampaign: 'a' }, { createdAt: daysAgo(2) }),
      lead({ cta: 'hero' }, { createdAt: daysAgo(20) }),
      lead({ cta: 'hero' }, { createdAt: daysAgo(90) }),
    ];
    const { sources } = buildDashboard(leads, NOW);
    expect([sources.week.total, sources.month.total, sources.all.total]).toEqual([1, 2, 3]);
    expect(sources.all.tagged).toBe(1);
  });
});

describe('timeAgo', () => {
  it('formats recent times', () => {
    const now = NOW.getTime();
    expect(timeAgo(new Date(now - 30_000).toISOString(), now)).toBe('Just now');
    expect(timeAgo(new Date(now - 5 * 60_000).toISOString(), now)).toBe('5 min ago');
    expect(timeAgo(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe('3 hrs ago');
    expect(timeAgo(undefined, now)).toBe('Recently');
  });
});
