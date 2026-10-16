import { describe, expect, it } from 'vitest';
import { notificationFeed, siteNamesFor } from '@/modules/leads/services/notifications.service';
import { hasUnseen } from '@/modules/leads/models/notification.model';
import type { Lead } from '@/modules/leads/models/lead.model';
import type { AdminUser } from '@/modules/users/models/user.model';

const NOW = Date.parse('2026-10-16T12:00:00Z');

const lead = (id: string, createdAt: string, extra: Partial<Lead> = {}): Lead => ({
  id,
  type: 'cx_leader',
  fullName: `Person ${id}`,
  designation: 'CXO',
  company: 'Acme',
  email: `${id}@example.com`,
  status: 'new',
  createdAt,
  ...extra,
});

const admin = (extra: Partial<AdminUser> = {}): AdminUser => ({
  email: 'admin@example.com',
  name: 'Admin',
  role: 'admin',
  sections: ['leads'],
  active: true,
  ...extra,
});

const newest = lead('c', '2026-10-16T11:00:00Z');
const middle = lead('b', '2026-10-16T09:00:00Z', { source: { cta: 'pdf-download' } });
const oldest = lead('a', '2026-10-15T09:00:00Z');

describe('notification feed', () => {
  it('lists the newest leads waiting for review and counts them all', () => {
    const many = Array.from({ length: 8 }, (_, i) => lead(`l${i}`, `2026-10-16T0${i}:00:00Z`)).reverse();
    const feed = notificationFeed(admin(), many, undefined, NOW);
    expect(feed.count).toBe(8);
    expect(feed.items).toHaveLength(5);
    expect(feed.items[0].id).toBe('l7');
  });

  it('says what each person did', () => {
    const feed = notificationFeed(admin(), [newest, middle], undefined, NOW);
    expect(feed.items.map((i) => i.kind)).toEqual(['application', 'pdf']);
  });

  it('names the website only when there is more than one', () => {
    expect(siteNamesFor([{ id: 'cx-assembly', name: 'The CX Assembly' }])).toBeUndefined();
    const names = siteNamesFor([
      { id: 'cx-assembly', name: 'The CX Assembly' },
      { id: 'partner', name: 'Partner Site' },
    ]);
    const feed = notificationFeed(admin(), [lead('p', '2026-10-16T10:00:00Z', { siteId: 'partner' })], names, NOW);
    expect(feed.items[0].meta).toMatch(/^Partner Site · /);
  });

  it('shows nothing to admins without access to the inbox', () => {
    const feed = notificationFeed(admin({ sections: ['content'] }), [newest], undefined, NOW);
    expect(feed).toEqual({ count: 0, items: [], seenAt: null });
  });
});

describe('red dot', () => {
  it('shows until the admin opens the bell', () => {
    expect(hasUnseen(notificationFeed(admin(), [newest, oldest], undefined, NOW))).toBe(true);
    const seen = admin({ notificationsSeenAt: '2026-10-16T11:30:00Z' });
    expect(hasUnseen(notificationFeed(seen, [newest, oldest], undefined, NOW))).toBe(false);
  });

  it('comes back when a newer lead arrives', () => {
    const seen = admin({ notificationsSeenAt: '2026-10-16T10:00:00Z' });
    expect(hasUnseen(notificationFeed(seen, [newest, oldest], undefined, NOW))).toBe(true);
  });

  it('is off when nothing is waiting', () => {
    expect(hasUnseen(notificationFeed(admin(), [], undefined, NOW))).toBe(false);
  });
});
